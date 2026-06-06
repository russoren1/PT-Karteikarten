import db from '$lib/db.js';
import { fail, redirect } from '@sveltejs/kit';

function getLearningQueue(url) {
	const queue = url.searchParams
		.get('queue')
		?.split(',')
		.map((id) => id.trim())
		.filter(Boolean);

	return queue?.length ? queue : null;
}

function getLearningTotal(url, queue) {
	const total = Number(url.searchParams.get('total'));
	const uniqueSize = new Set(queue).size;

	if (!Number.isInteger(total) || total < uniqueSize) {
		return uniqueSize;
	}

	return total;
}

function getProgressCurrent(total, queue) {
	const uniqueCurrentSize = new Set(queue).size;

	return total > 0 && uniqueCurrentSize > 0 ? total - uniqueCurrentSize + 1 : 0;
}

function getDisplayProgressCurrent(url, total, queue, displayTotal) {
	const current = Number(url.searchParams.get('current'));
	const fallbackCurrent = getProgressCurrent(total, queue);

	if (displayTotal <= 0) return 0;

	if (!Number.isInteger(current) || current < 1) {
		return Math.min(fallbackCurrent, displayTotal);
	}

	return Math.min(current, displayTotal);
}

function removeCurrentCardFromQueue(queue, cardId, status) {
	const remainingQueue = queue.slice(1);

	if (status === 'known') {
		return remainingQueue.filter((queuedCardId) => queuedCardId !== cardId);
	}

	return remainingQueue;
}

export async function load({ params, url, locals }) {
	const userId = locals.user?.id ?? null;
	const deck = await db.getDeckBySlug(params.slug, userId);

	if (!deck) {
		return {
			deck: null,
			card: null,
			hasCards: false,
			queue: [],
			progressCurrent: 0,
			progressTotal: 0,
			done: false,
			slug: params.slug
		};
	}

	const done = url.searchParams.get('done') === '1';
	const all = url.searchParams.get('all') === '1';
	const rawQueueFromUrl = getLearningQueue(url);
	const queue = done ? [] : rawQueueFromUrl ?? (all
		? await db.getAllCardsQueueByDeckSlug(params.slug)
		: await db.getLearningQueueByDeckSlug(params.slug));
	const total = rawQueueFromUrl
		? getLearningTotal(url, queue)
		: new Set(queue).size;
	const card = queue[0] ? await db.getCard(queue[0]) : null;
	const activeCard = card && card.deckSlug === params.slug ? card : null;

	return {
		deck,
		card: activeCard,
		hasCards: deck.cardCount > 0,
		queue,
		progressCurrent: getDisplayProgressCurrent(url, total, queue, deck.cardCount),
		progressTotal: total,
		progressDisplayTotal: deck.cardCount,
		done: done || queue.length === 0 || !activeCard,
		slug: params.slug
	};
}

export const actions = {
	rateCard: async ({ request, params }) => {
		const formData = await request.formData();
		const cardId = formData.get('cardId')?.toString();
		const status = formData.get('status')?.toString();
		const queue = formData
			.get('queue')
			?.toString()
			.split(',')
			.map((id) => id.trim())
			.filter(Boolean);
		const total = Number(formData.get('total')?.toString());
		const current = Number(formData.get('current')?.toString());
		const card = cardId ? await db.getCard(cardId) : null;

		if (!card || card.deckSlug !== params.slug) {
			return fail(404, {
				error: 'Die Karte wurde nicht gefunden oder gehört nicht zum geöffneten Stapel.'
			});
		}

		const savedCardId = await db.updateCardStatus(cardId, status);

		if (!savedCardId) {
			return fail(400, {
				error: 'Der Lernstatus konnte nicht gespeichert werden.'
			});
		}

		const remainingQueue = removeCurrentCardFromQueue(queue ?? [cardId], cardId, status);

		if (remainingQueue.length === 0) {
			redirect(303, `/stapel/${params.slug}/lernen?done=1`);
		}

		const uniqueRemainingSize = new Set(remainingQueue).size;
		const learningTotal = Number.isInteger(total) && total >= uniqueRemainingSize ? total : uniqueRemainingSize;
		const nextCurrent = Number.isInteger(current) && current > 0 ? current + 1 : 1;

		redirect(
			303,
			`/stapel/${params.slug}/lernen?queue=${remainingQueue.join(',')}&total=${learningTotal}&current=${nextCurrent}`
		);
	}
};
