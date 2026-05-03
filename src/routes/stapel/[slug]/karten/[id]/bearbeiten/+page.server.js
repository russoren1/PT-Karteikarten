import db from '$lib/db.js';
import { fail, redirect } from '@sveltejs/kit';

function readCardForm(formData) {
	const question = formData.get('question')?.toString().trim();
	const answer = formData.get('answer')?.toString().trim();
	const weekValue = formData.get('week')?.toString().trim();
	const sourceName = formData.get('sourceName')?.toString().trim();
	const slideValue = formData.get('slide')?.toString().trim();
	const week = Number(weekValue);
	const slide = Number(slideValue);

	return {
		question,
		answer,
		weekValue,
		sourceName,
		slideValue,
		week,
		slide
	};
}

function validateCardForm(cardForm) {
	if (!cardForm.question || !cardForm.answer) {
		return 'Bitte fülle Frage und Antwort aus.';
	}

	if (!Number.isInteger(cardForm.week) || cardForm.week < 1) {
		return 'Bitte gib eine gültige Semesterwoche ein.';
	}

	if (!Number.isInteger(cardForm.slide) || cardForm.slide < 1) {
		return 'Bitte gib eine gültige Folien- oder Seitennummer ein.';
	}

	return '';
}

function formValues(cardForm) {
	return {
		question: cardForm.question,
		answer: cardForm.answer,
		week: cardForm.weekValue,
		sourceName: cardForm.sourceName,
		slide: cardForm.slideValue
	};
}

export async function load({ params }) {
	const deck = await db.getDeckBySlug(params.slug);
	const card = await db.getCard(params.id);
	const belongsToDeck = card?.deckSlug === params.slug;
	const sourceNames = deck ? await db.getSourceNamesByDeckSlug(params.slug) : [];

	return {
		deck,
		card: belongsToDeck ? card : null,
		slug: params.slug,
		id: params.id,
		sourceNames
	};
}

export const actions = {
	updateCard: async ({ request, params }) => {
		const card = await db.getCard(params.id);

		if (!card || card.deckSlug !== params.slug) {
			return fail(404, {
				error: 'Die Karte wurde nicht gefunden oder gehört nicht zum geöffneten Stapel.',
				values: {}
			});
		}

		const cardForm = readCardForm(await request.formData());
		const error = validateCardForm(cardForm);

		if (error) {
			return fail(400, {
				error,
				values: formValues(cardForm)
			});
		}

		const id = await db.updateCard({
			_id: card._id,
			question: cardForm.question,
			answer: cardForm.answer,
			week: cardForm.week,
			sourceName: cardForm.sourceName,
			slide: cardForm.slide
		});

		if (!id) {
			return fail(500, {
				error: 'Die Karte konnte nicht in MongoDB gespeichert werden.',
				values: formValues(cardForm)
			});
		}

		redirect(303, `/stapel/${params.slug}/karten/${id}?updated=1`);
	}
};
