import db from '$lib/db.js';

export async function load({ params }) {
	const deck = await db.getDeckBySlug(params.slug);

	if (!deck) {
		return {
			deck: null,
			cards: [],
			slug: params.slug
		};
	}

	const cards = await db.getCardsByDeckSlug(params.slug);

	return {
		deck,
		cards
	};
}
