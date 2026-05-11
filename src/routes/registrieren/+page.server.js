import { fail, redirect } from '@sveltejs/kit';

export async function load({ locals }) {
	if (locals.session) {
		redirect(303, '/stapel');
	}
	return {};
}

export const actions = {
	register: async ({ request, locals }) => {
		const formData = await request.formData();
		const email = formData.get('email')?.toString().trim();
		const password = formData.get('password')?.toString();
		const passwordConfirm = formData.get('passwordConfirm')?.toString();

		if (!email || !password || !passwordConfirm) {
			return fail(400, { error: 'Alle Felder sind erforderlich.', email });
		}

		if (password !== passwordConfirm) {
			return fail(400, { error: 'Die Passwörter stimmen nicht überein.', email });
		}

		if (password.length < 6) {
			return fail(400, { error: 'Das Passwort muss mindestens 6 Zeichen lang sein.', email });
		}

		const { error } = await locals.supabase.auth.signUp({ email, password });

		if (error) {
			return fail(400, { error: error.message, email });
		}

		redirect(303, '/stapel');
	}
};
