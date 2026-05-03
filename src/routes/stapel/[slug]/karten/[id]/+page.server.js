import db from '$lib/db.js';

export async function load({ params, url }) {
	const deck = await db.getDeckBySlug(params.slug);
	const card = await db.getCard(params.id);
	const belongsToDeck = card?.deckSlug === params.slug;

	return {
		deck,
		card: belongsToDeck ? card : null,
		slug: params.slug,
		id: params.id,
		created: url.searchParams.get('created') === '1',
		updated: url.searchParams.get('updated') === '1'
	};
}
