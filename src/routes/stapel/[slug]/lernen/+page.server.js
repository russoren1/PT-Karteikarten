import db from '$lib/db.js';
import { fail, redirect } from '@sveltejs/kit';

function getLearningIndex(url, cardCount) {
	const index = Number(url.searchParams.get('index') ?? 0);

	if (!Number.isInteger(index) || index < 0) {
		return 0;
	}

	if (cardCount === 0) {
		return 0;
	}

	return Math.min(index, cardCount - 1);
}

export async function load({ params, url }) {
	const deck = await db.getDeckBySlug(params.slug);

	if (!deck) {
		return {
			deck: null,
			cards: [],
			card: null,
			index: 0,
			done: false,
			slug: params.slug
		};
	}

	const cards = await db.getCardsByDeckSlug(params.slug);
	const done = url.searchParams.get('done') === '1';
	const index = getLearningIndex(url, cards.length);

	return {
		deck,
		cards,
		card: done ? null : cards[index],
		index,
		done,
		slug: params.slug
	};
}

export const actions = {
	rateCard: async ({ request, params }) => {
		const formData = await request.formData();
		const cardId = formData.get('cardId')?.toString();
		const status = formData.get('status')?.toString();
		const nextIndex = Number(formData.get('nextIndex')?.toString());
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

		const cards = await db.getCardsByDeckSlug(params.slug);

		if (!Number.isInteger(nextIndex) || nextIndex >= cards.length) {
			redirect(303, `/stapel/${params.slug}/lernen?done=1`);
		}

		redirect(303, `/stapel/${params.slug}/lernen?index=${nextIndex}`);
	}
};
