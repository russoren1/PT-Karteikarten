import db from '$lib/db.js';
import { fail, redirect } from '@sveltejs/kit';

export async function load({ params, locals }) {
	const userId = locals.user?.id ?? null;
	const deck = await db.getDeckBySlug(params.slug, userId);

	return {
		deck,
		slug: params.slug
	};
}

export const actions = {
	deleteDeck: async ({ params, locals }) => {
		const userId = locals.user?.id ?? null;
		const deck = await db.getDeckBySlug(params.slug, userId);

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
