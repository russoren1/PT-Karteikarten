import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';
import { SUPABASE_SERVICE_ROLE_KEY } from '$env/static/private';

export function createSupabaseServerClient(cookies) {
	return createServerClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, {
		cookies: {
			getAll: () => cookies.getAll(),
			setAll: (cookiesToSet) => {
				cookiesToSet.forEach(({ name, value, options }) =>
					cookies.set(name, value, { ...options, path: '/' })
				);
			}
		}
	});
}

export function createSupabaseAdminClient() {
	return createClient(PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
}

export async function uploadCardImage(file, deckSlug, uniqueId) {
	const admin = createSupabaseAdminClient();
	const ext = file.type === 'image/png' ? 'png' : file.type === 'image/webp' ? 'webp' : 'jpg';
	const path = `${deckSlug}/${uniqueId}-${Date.now()}.${ext}`;
	const arrayBuffer = await file.arrayBuffer();
	const buffer = Buffer.from(arrayBuffer);

	const { error } = await admin.storage.from('card-images').upload(path, buffer, {
		contentType: file.type,
		upsert: false
	});

	if (error) {
		console.log('Storage upload error:', error.message);
		return null;
	}

	const { data } = admin.storage.from('card-images').getPublicUrl(path);
	return data.publicUrl;
}

export async function deleteCardImage(imageUrl) {
	if (!imageUrl) return;

	const admin = createSupabaseAdminClient();
	const url = new URL(imageUrl);
	const pathParts = url.pathname.split('/object/public/card-images/');

	if (pathParts.length < 2) return;

	const filePath = pathParts[1];
	const { error } = await admin.storage.from('card-images').remove([filePath]);

	if (error) {
		console.log('Storage delete error:', error.message);
	}
}
