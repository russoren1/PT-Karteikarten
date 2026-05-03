import db from '$lib/db.js';

function readFilters(url) {
	const q = url.searchParams.get('q')?.trim() ?? '';
	const week = url.searchParams.get('week')?.trim() ?? '';
	const sourceName = url.searchParams.get('sourceName')?.trim() ?? '';
	const status = url.searchParams.get('status')?.trim() ?? '';

	return {
		q,
		week: Number.isInteger(Number(week)) && Number(week) > 0 ? week : '',
		sourceName,
		status: ['new', 'known', 'repeat'].includes(status) ? status : ''
	};
}

function hasActiveFilters(filters) {
	return Boolean(filters.q || filters.week || filters.sourceName || filters.status);
}

export async function load({ params, url }) {
	const filters = readFilters(url);
	const deck = await db.getDeckBySlug(params.slug);

	if (!deck) {
		return {
			deck: null,
			cards: [],
			totalCardCount: 0,
			slug: params.slug,
			deleted: false,
			filters,
			hasActiveFilters: hasActiveFilters(filters)
		};
	}

	const cards = await db.getCardsByDeckSlug(params.slug, filters);

	return {
		deck,
		cards,
		totalCardCount: deck.cardCount,
		filters,
		hasActiveFilters: hasActiveFilters(filters),
		deleted: url.searchParams.get('deleted') === '1',
		deckUpdated: url.searchParams.get('deckUpdated') === '1'
	};
}
