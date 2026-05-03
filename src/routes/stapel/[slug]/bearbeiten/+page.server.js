import db from '$lib/db.js';
import { fail, redirect } from '@sveltejs/kit';

export async function load({ params }) {
	const deck = await db.getDeckBySlug(params.slug);

	return {
		deck,
		slug: params.slug
	};
}

export const actions = {
	updateDeck: async ({ request, params }) => {
		const data = await request.formData();
		const deckTitle = data.get('deckTitle')?.toString().trim();
		const semester = data.get('semester')?.toString().trim();

		if (!deckTitle || !semester) {
			return fail(400, {
				error: 'Bitte gib einen Titel und ein Semester ein.',
				deckTitle,
				semester
			});
		}

		const result = await db.updateDeck(params.slug, {
			deckTitle,
			semester
		});

		if (result?.error === 'duplicate') {
			return fail(400, {
				error: 'Ein Stapel mit diesem Titel existiert bereits.',
				deckTitle,
				semester
			});
		}

		if (!result?.slug) {
			return fail(500, {
				error: 'Der Stapel konnte nicht in MongoDB gespeichert werden.',
				deckTitle,
				semester
			});
		}

		redirect(303, `/stapel/${result.slug}?deckUpdated=1`);
	}
};
