import db from '$lib/db.js';

export async function load() {
	const stats = await db.getDashboardStats();

	return {
		stats
	};
}
