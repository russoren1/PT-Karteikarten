import { MongoClient, ObjectId } from 'mongodb';
import { DB_URI } from '$env/static/private';

const client = new MongoClient(DB_URI);

await client.connect();
const db = client.db('Karteikarten');
const collection = db.collection('Karteikarten');
const newDocumentThreshold = 2 * 24 * 60 * 60 * 1000;
const minLeitnerBox = 1;
const maxLeitnerBox = 5;
const leitnerIntervalsByBox = {
	1: 0,
	2: 1,
	3: 3,
	4: 7,
	5: 14
};

// Stapel-Dokument:
// {
//   type, deckSlug, deckTitle, semester, createdAt, updatedAt
// }
//
// Karteikarten-Dokument:
// {
//   type, question, answer, deckSlug, deckTitle, semester,
//   week, slide, status, sourceName, leitnerBox, repeatCount,
//   knownCount, lastReviewedAt, nextReviewAt, createdAt, updatedAt
// }

function createDeckSlug(title) {
	return title
		.toLowerCase()
		.trim()
		.replaceAll('ä', 'ae')
		.replaceAll('ö', 'oe')
		.replaceAll('ü', 'ue')
		.replaceAll('ß', 'ss')
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '');
}

function escapeRegex(value) {
	return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function isNewDocument(createdAt) {
	if (!createdAt) {
		return false;
	}

	const createdAtDate = createdAt instanceof Date ? createdAt : new Date(createdAt);
	const age = Date.now() - createdAtDate.getTime();

	return !Number.isNaN(age) && age >= 0 && age <= newDocumentThreshold;
}

function addDays(date, days) {
	const nextDate = new Date(date);
	nextDate.setDate(nextDate.getDate() + days);
	return nextDate;
}

function getLeitnerBox(card) {
	const leitnerBox = Number(card.leitnerBox ?? minLeitnerBox);

	if (!Number.isInteger(leitnerBox)) {
		return minLeitnerBox;
	}

	return Math.min(Math.max(leitnerBox, minLeitnerBox), maxLeitnerBox);
}

function getReviewCount(value) {
	const count = Number(value ?? 0);

	if (!Number.isInteger(count) || count < 0) {
		return 0;
	}

	return count;
}

function getNextReviewAt(leitnerBox, status, reviewedAt) {
	if (status === 'repeat') {
		return reviewedAt;
	}

	return addDays(reviewedAt, leitnerIntervalsByBox[leitnerBox] ?? 1);
}

function getLearningWeight(card) {
	const leitnerPriority = maxLeitnerBox - getLeitnerBox(card) + 1;
	const repeatPriority = Math.min(getReviewCount(card.repeatCount), 4);
	const statusPriority = card.status === 'repeat' ? 3 : 0;

	return Math.min(Math.max(leitnerPriority + repeatPriority + statusPriority, 1), 8);
}

function shuffleValues(values) {
	return values
		.map((value) => ({
			value,
			sort: Math.random()
		}))
		.sort((a, b) => a.sort - b.sort)
		.map((item) => item.value);
}

function createLearningQueue(cards) {
	const queue = [];

	cards.forEach((card) => {
		const weight = getLearningWeight(card);

		for (let index = 0; index < weight; index += 1) {
			queue.push(card._id);
		}
	});

	return shuffleValues(queue);
}

function normalizeCard(card) {
	card._id = card._id.toString();
	card.isNew = isNewDocument(card.createdAt);
	card.leitnerBox = getLeitnerBox(card);
	card.repeatCount = getReviewCount(card.repeatCount);
	card.knownCount = getReviewCount(card.knownCount);
	card.lastReviewedAt = card.lastReviewedAt ?? null;
	card.nextReviewAt = card.nextReviewAt ?? null;

	return card;
}

function getCardSort(sort) {
	switch (sort) {
		case 'week-desc':
			return { week: -1, slide: 1 };
		case 'sourceName':
			return { sourceName: 1, week: 1, slide: 1 };
		case 'slide':
			return { slide: 1, week: 1 };
		case 'status':
			return { status: 1, week: 1, slide: 1 };
		default:
			return { week: 1, slide: 1 };
	}
}

function userFilter(userId) {
	if (!userId) return {};
	return { $or: [{ userId }, { userId: { $exists: false } }] };
}

async function getDecks(userId = null) {
	let decks = [];

	try {
		const deckDocuments = await collection
			.find({ type: 'deck', ...userFilter(userId) })
			.sort({ deckTitle: 1 })
			.toArray();

		if (!deckDocuments.length) return decks;

		const deckSlugs = deckDocuments.map((d) => d.deckSlug);
		const cardCountsRaw = await collection
			.aggregate([
				{ $match: { type: 'card', deckSlug: { $in: deckSlugs } } },
				{ $group: { _id: '$deckSlug', count: { $sum: 1 } } }
			])
			.toArray();
		const countBySlug = Object.fromEntries(cardCountsRaw.map(({ _id, count }) => [_id, count]));

		decks = deckDocuments.map((deck) => ({
			slug: deck.deckSlug,
			title: deck.deckTitle,
			semester: deck.semester,
			cardCount: countBySlug[deck.deckSlug] ?? 0,
			isNew: isNewDocument(deck.createdAt)
		}));
	} catch (error) {
		console.error('[db]', error);
	}

	return decks;
}

async function getDeckBySlug(deckSlug, userId = null) {
	let deck = null;

	try {
		const deckDocument = await collection.findOne({
			type: 'deck',
			deckSlug,
			...userFilter(userId)
		});

		if (deckDocument) {
			const cardCount = await collection.countDocuments({
				type: 'card',
				deckSlug
			});

			deck = {
				slug: deckDocument.deckSlug,
				title: deckDocument.deckTitle,
				semester: deckDocument.semester,
				cardCount,
				isNew: isNewDocument(deckDocument.createdAt)
			};
		}
	} catch (error) {
		console.error('[db]', error);
	}

	return deck;
}

async function getCardsByDeckSlug(deckSlug, filters = {}, userId = null) {
	let cards = [];
	const query = {
		type: 'card',
		deckSlug,
		...userFilter(userId)
	};
	const conditions = [];

	if (filters.q) {
		const searchRegex = new RegExp(escapeRegex(filters.q), 'i');
		conditions.push({
			$or: [{ question: searchRegex }, { answer: searchRegex }]
		});
	}

	if (filters.week) {
		query.week = Number(filters.week);
	}

	if (filters.sourceName) {
		query.sourceName = new RegExp(escapeRegex(filters.sourceName), 'i');
	}

	if (filters.status === 'new') {
		conditions.push({
			$or: [{ status: 'new' }, { status: { $exists: false } }, { status: null }]
		});
	} else if (['known', 'repeat'].includes(filters.status)) {
		query.status = filters.status;
	}

	if (conditions.length) {
		query.$and = conditions;
	}

	try {
		cards = await collection.find(query).sort(getCardSort(filters.sort)).toArray();
		cards = cards.map((card) => normalizeCard(card));
	} catch (error) {
		console.error('[db]', error);
	}

	return cards;
}

async function getLearningQueueByDeckSlug(deckSlug) {
	let cards = [];
	const now = new Date();

	try {
		cards = await collection
			.find({
				type: 'card',
				deckSlug,
				$or: [
					{ nextReviewAt: { $exists: false } },
					{ nextReviewAt: null },
					{ nextReviewAt: { $lte: now } }
				]
			})
			.toArray();
		cards = cards.map((card) => normalizeCard(card));
	} catch (error) {
		console.error('[db]', error);
	}

	return createLearningQueue(cards);
}

async function getAllCardsQueueByDeckSlug(deckSlug) {
	let cards = [];

	try {
		cards = await collection.find({ type: 'card', deckSlug }).toArray();
		cards = cards.map((card) => normalizeCard(card));
	} catch (error) {
		console.error('[db]', error);
	}

	return createLearningQueue(cards);
}

async function getDashboardStats(userId = null) {
	const now = new Date();
	const epoch = new Date(0);
	const decks = await getDecks(userId);

	const dueCond = { $lte: [{ $ifNull: ['$nextReviewAt', epoch] }, now] };

	try {
		const deckSlugs = decks.map((d) => d.slug);

		const [globalStats, deckStatsRaw, dueCardsRaw, repeatedCardsRaw, lowLeitnerCardsRaw] =
			await Promise.all([
				collection
					.aggregate([
						{ $match: { type: 'card', ...userFilter(userId) } },
						{
							$group: {
								_id: null,
								totalCards: { $sum: 1 },
								repeatCount: { $sum: { $cond: [{ $eq: ['$status', 'repeat'] }, 1, 0] } },
								dueCount: { $sum: { $cond: [dueCond, 1, 0] } }
							}
						}
					])
					.toArray(),
				collection
					.aggregate([
						{ $match: { type: 'card', deckSlug: { $in: deckSlugs }, ...userFilter(userId) } },
						{
							$group: {
								_id: '$deckSlug',
								dueCount: { $sum: { $cond: [dueCond, 1, 0] } },
								repeatCount: { $sum: { $cond: [{ $eq: ['$status', 'repeat'] }, 1, 0] } },
								knownCount: { $sum: { $cond: [{ $eq: ['$status', 'known'] }, 1, 0] } },
								leitnerSum: { $sum: { $ifNull: ['$leitnerBox', 1] } },
								leitnerCount: { $sum: 1 }
							}
						}
					])
					.toArray(),
				collection
					.find({
						type: 'card',
						...userFilter(userId),
						$or: [
							{ nextReviewAt: { $exists: false } },
							{ nextReviewAt: null },
							{ nextReviewAt: { $lte: now } }
						]
					})
					.sort({ nextReviewAt: 1 })
					.limit(8)
					.toArray(),
				collection
					.find({ type: 'card', ...userFilter(userId), repeatCount: { $gt: 0 } })
					.sort({ repeatCount: -1, leitnerBox: 1 })
					.limit(8)
					.toArray(),
				collection
					.find({
						type: 'card',
						...userFilter(userId),
						$or: [
							{ leitnerBox: { $exists: false } },
							{ leitnerBox: null },
							{ leitnerBox: { $lte: 2 } }
						]
					})
					.sort({ leitnerBox: 1, repeatCount: -1 })
					.limit(8)
					.toArray()
			]);

		const stats = globalStats[0] ?? { totalCards: 0, repeatCount: 0, dueCount: 0 };
		const deckStatsMap = Object.fromEntries(
			deckStatsRaw.map((s) => [
				s._id,
				{
					dueCount: s.dueCount,
					repeatCount: s.repeatCount,
					knownCount: s.knownCount,
					averageLeitnerBox:
						s.leitnerCount > 0
							? Math.round((s.leitnerSum / s.leitnerCount) * 10) / 10
							: 0
				}
			])
		);
		const deckStats = decks.map((deck) => ({
			...deck,
			...(deckStatsMap[deck.slug] ?? {
				dueCount: 0,
				repeatCount: 0,
				knownCount: 0,
				averageLeitnerBox: 0
			})
		}));

		return {
			totalDecks: decks.length,
			totalCards: stats.totalCards,
			dueCount: stats.dueCount,
			repeatCount: stats.repeatCount,
			decks: deckStats,
			dueCards: dueCardsRaw.map(normalizeCard),
			repeatedCards: repeatedCardsRaw.map(normalizeCard),
			lowLeitnerCards: lowLeitnerCardsRaw.map(normalizeCard)
		};
	} catch (error) {
		console.error('[db]', error);
	}

	return {
		totalDecks: decks.length,
		totalCards: 0,
		dueCount: 0,
		repeatCount: 0,
		decks: [],
		dueCards: [],
		repeatedCards: [],
		lowLeitnerCards: []
	};
}

async function getSourceNamesByDeckSlug(deckSlug) {
	let sourceNames = [];

	try {
		const cards = await collection
			.find(
				{
					type: 'card',
					deckSlug,
					sourceName: {
						$type: 'string',
						$ne: ''
					}
				},
				{
					projection: {
						sourceName: 1
					}
				}
			)
			.toArray();

		sourceNames = [
			...new Set(cards.map((card) => card.sourceName.trim()).filter(Boolean))
		].sort((a, b) => a.localeCompare(b));
	} catch (error) {
		console.error('[db]', error);
	}

	return sourceNames;
}

async function getCard(id) {
	let card = null;

	try {
		card = await collection.findOne({ _id: new ObjectId(id), type: 'card' });

		if (card) {
			card = normalizeCard(card);
		}
	} catch (error) {
		console.error('[db]', error);
	}

	return card;
}

async function createCard(card) {
	const now = new Date();

	card.type = 'card';
	card.status = card.status ?? 'new';
	card.leitnerBox = card.leitnerBox ?? minLeitnerBox;
	card.repeatCount = card.repeatCount ?? 0;
	card.knownCount = card.knownCount ?? 0;
	card.lastReviewedAt = card.lastReviewedAt ?? null;
	card.nextReviewAt = card.nextReviewAt ?? now;
	card.createdAt = card.createdAt ?? now;
	card.updatedAt = now;

	try {
		const result = await collection.insertOne(card);
		return result.insertedId.toString();
	} catch (error) {
		console.error('[db]', error);
	}

	return null;
}

async function createDeck(deck) {
	const deckSlug = createDeckSlug(deck.deckTitle);
	const userId = deck.userId ?? null;

	try {
		const existingDeck = await collection.findOne({
			type: 'deck',
			deckSlug,
			...userFilter(userId)
		});

		if (existingDeck) {
			return existingDeck.deckSlug;
		}

		const newDeck = {
			type: 'deck',
			deckSlug,
			deckTitle: deck.deckTitle,
			semester: deck.semester,
			createdAt: new Date(),
			updatedAt: new Date()
		};

		if (userId) {
			newDeck.userId = userId;
		}

		await collection.insertOne(newDeck);
		return deckSlug;
	} catch (error) {
		console.error('[db]', error);
	}

	return null;
}

async function updateDeck(oldDeckSlug, deck) {
	const newDeckSlug = createDeckSlug(deck.deckTitle);

	try {
		const existingDeck = await collection.findOne({
			type: 'deck',
			deckSlug: newDeckSlug
		});

		if (existingDeck && newDeckSlug !== oldDeckSlug) {
			return {
				error: 'duplicate'
			};
		}

		const result = await collection.updateOne(
			{
				type: 'deck',
				deckSlug: oldDeckSlug
			},
			{
				$set: {
					deckSlug: newDeckSlug,
					deckTitle: deck.deckTitle,
					semester: deck.semester,
					updatedAt: new Date()
				}
			}
		);

		if (result.matchedCount !== 1) {
			return {
				error: 'not-found'
			};
		}

		await collection.updateMany(
			{
				type: 'card',
				deckSlug: oldDeckSlug
			},
			{
				$set: {
					deckSlug: newDeckSlug,
					deckTitle: deck.deckTitle,
					semester: deck.semester,
					updatedAt: new Date()
				}
			}
		);

		return {
			slug: newDeckSlug
		};
	} catch (error) {
		console.error('[db]', error);
	}

	return {
		error: 'failed'
	};
}

async function deleteDeck(deckSlug) {
	try {
		await collection.deleteMany({
			type: 'card',
			deckSlug
		});

		const result = await collection.deleteOne({
			type: 'deck',
			deckSlug
		});

		if (result.deletedCount === 1) {
			return deckSlug;
		}
	} catch (error) {
		console.error('[db]', error);
	}

	return null;
}

async function updateCard(card) {
	try {
		const { _id: id, ...cardData } = card;
		cardData.updatedAt = new Date();

		const result = await collection.updateOne(
			{ _id: new ObjectId(id), type: 'card' },
			{ $set: cardData }
		);

		if (result.matchedCount === 1) {
			return id;
		}
	} catch (error) {
		console.error('[db]', error);
	}

	return null;
}

async function updateCardStatus(id, status) {
	if (!['known', 'repeat'].includes(status)) {
		return null;
	}

	try {
		const card = await collection.findOne({
			_id: new ObjectId(id),
			type: 'card'
		});

		if (!card) {
			return null;
		}

		const reviewedAt = new Date();
		const currentLeitnerBox = getLeitnerBox(card);
		const nextLeitnerBox =
			status === 'known'
				? Math.min(currentLeitnerBox + 1, maxLeitnerBox)
				: minLeitnerBox;

		const result = await collection.updateOne(
			{
				_id: new ObjectId(id),
				type: 'card'
			},
			{
				$set: {
					status,
					leitnerBox: nextLeitnerBox,
					lastReviewedAt: reviewedAt,
					nextReviewAt: getNextReviewAt(nextLeitnerBox, status, reviewedAt),
					updatedAt: reviewedAt
				},
				$inc: {
					knownCount: status === 'known' ? 1 : 0,
					repeatCount: status === 'repeat' ? 1 : 0
				}
			}
		);

		if (result.matchedCount === 1) {
			return id;
		}
	} catch (error) {
		console.error('[db]', error);
	}

	return null;
}

async function deleteCard(id) {
	try {
		const result = await collection.deleteOne({ _id: new ObjectId(id), type: 'card' });

		if (result.deletedCount === 1) {
			return id;
		}
	} catch (error) {
		console.error('[db]', error);
	}

	return null;
}

export default {
	getDecks,
	getDeckBySlug,
	getCardsByDeckSlug,
	getLearningQueueByDeckSlug,
	getAllCardsQueueByDeckSlug,
	getDashboardStats,
	getSourceNamesByDeckSlug,
	getCard,
	createDeck,
	updateDeck,
	deleteDeck,
	createCard,
	updateCard,
	updateCardStatus,
	deleteCard
};
