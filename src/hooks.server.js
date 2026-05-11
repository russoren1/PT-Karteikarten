import { createSupabaseServerClient } from '$lib/supabase.js';
import { redirect } from '@sveltejs/kit';

const protectedRoutes = ['/stapel', '/dashboard'];

export async function handle({ event, resolve }) {
	event.locals.supabase = createSupabaseServerClient(event.cookies);

	event.locals.getSession = async () => {
		const { data: { session } } = await event.locals.supabase.auth.getSession();
		return session;
	};

	const session = await event.locals.getSession();
	event.locals.session = session;
	event.locals.user = session?.user ?? null;

	const isProtected = protectedRoutes.some((route) =>
		event.url.pathname.startsWith(route)
	);

	if (isProtected && !session) {
		redirect(303, '/login');
	}

	return resolve(event, {
		filterSerializedResponseHeaders: (name) =>
			name === 'content-range' || name === 'x-supabase-api-version'
	});
}
