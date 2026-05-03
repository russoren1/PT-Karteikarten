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
	deleteDeck: async ({ params }) => {
		const deck = await db.getDeckBySlug(params.slug);

		if (!deck) {
			return fail(404, {
				error: 'Der Stapel wurde nicht gefunden.'
			});
		}

		const deletedDeckSlug = await db.deleteDeck(params.slug);

		if (!deletedDeckSlug) {
			return fail(500, {
				error: 'Der Stapel konnte nicht aus MongoDB gelöscht werden.'
			});
		}

		redirect(303, '/stapel?deckDeleted=1');
	}
};
