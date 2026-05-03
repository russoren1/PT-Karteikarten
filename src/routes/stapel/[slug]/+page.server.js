import db from '$lib/db.js';

export async function load({ params, url }) {
	const deck = await db.getDeckBySlug(params.slug);

	if (!deck) {
		return {
			deck: null,
			cards: [],
			slug: params.slug,
			deleted: false
		};
	}

	const cards = await db.getCardsByDeckSlug(params.slug);

	return {
		deck,
		cards,
		deleted: url.searchParams.get('deleted') === '1',
		deckUpdated: url.searchParams.get('deckUpdated') === '1'
	};
}
