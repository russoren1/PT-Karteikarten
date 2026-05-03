import db from '$lib/db.js';
import { fail, redirect } from '@sveltejs/kit';

export async function load({ params }) {
	const deck = await db.getDeckBySlug(params.slug);
	const card = await db.getCard(params.id);
	const belongsToDeck = card?.deckSlug === params.slug;

	return {
		deck,
		card: belongsToDeck ? card : null,
		slug: params.slug,
		id: params.id
	};
}

export const actions = {
	deleteCard: async ({ params }) => {
		const card = await db.getCard(params.id);

		if (!card || card.deckSlug !== params.slug) {
			return fail(404, {
				error: 'Die Karte wurde nicht gefunden oder gehört nicht zum geöffneten Stapel.'
			});
		}

		const deletedCardId = await db.deleteCard(params.id);

		if (!deletedCardId) {
			return fail(500, {
				error: 'Die Karte konnte nicht aus MongoDB gelöscht werden.'
			});
		}

		redirect(303, `/stapel/${params.slug}?deleted=1`);
	}
};
