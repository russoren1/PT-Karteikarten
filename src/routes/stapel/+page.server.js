import db from '$lib/db.js';

export async function load() {
	const decks = await db.getDecks();

	return {
		decks
	};
}
