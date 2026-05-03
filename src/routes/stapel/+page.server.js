import db from '$lib/db.js';
import { fail, redirect } from '@sveltejs/kit';

export async function load({ url }) {
	const decks = await db.getDecks();

	return {
		decks,
		deckDeleted: url.searchParams.get('deckDeleted') === '1'
	};
}

export const actions = {
	createDeck: async ({ request }) => {
		const data = await request.formData();
		const deckTitle = data.get('deckTitle')?.toString().trim();
		const semester = data.get('semester')?.toString().trim();

		if (!deckTitle || !semester) {
			return fail(400, {
				error: 'Bitte gib einen Titel und ein Semester für den neuen Stapel ein.',
				deckTitle,
				semester
			});
		}

		const deckSlug = await db.createDeck({
			deckTitle,
			semester
		});

		if (!deckSlug) {
			return fail(500, {
				error: 'Der Stapel konnte nicht in MongoDB gespeichert werden.',
				deckTitle,
				semester
			});
		}

		redirect(303, '/stapel');
	}
};
