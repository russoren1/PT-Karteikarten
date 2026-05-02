import { env } from '$env/dynamic/private';

export function getMongoConfig() {
	return {
		uri: env.MONGODB_URI ?? '',
		database: env.MONGODB_DB ?? ''
	};
}

export function hasMongoConfig() {
	const { uri, database } = getMongoConfig();

	return Boolean(uri && database);
}
