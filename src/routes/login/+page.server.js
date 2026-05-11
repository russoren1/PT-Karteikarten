import { fail, redirect } from '@sveltejs/kit';

export async function load({ locals }) {
	if (locals.session) {
		redirect(303, '/stapel');
	}
	return {};
}

export const actions = {
	signIn: async ({ request, locals }) => {
		const formData = await request.formData();
		const email = formData.get('email')?.toString().trim();
		const password = formData.get('password')?.toString();

		if (!email || !password) {
			return fail(400, { error: 'E-Mail und Passwort sind erforderlich.', email });
		}

		const { error } = await locals.supabase.auth.signInWithPassword({ email, password });

		if (error) {
			return fail(400, { error: 'E-Mail oder Passwort ist falsch.', email });
		}

		redirect(303, '/stapel');
	}
};
