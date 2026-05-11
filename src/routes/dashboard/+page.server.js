import db from '$lib/db.js';

export async function load({ locals }) {
	const userId = locals.user?.id ?? null;
	const stats = await db.getDashboardStats(userId);

	return {
		stats
	};
}
