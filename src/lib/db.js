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

async function getDecks() {
	let decks = [];

	try {
		const deckDocuments = await collection.find({ type: 'deck' }).sort({ deckTitle: 1 }).toArray();

		decks = await Promise.all(
			deckDocuments.map(async (deck) => {
				const cardCount = await collection.countDocuments({
					type: 'card',
					deckSlug: deck.deckSlug
				});

				return {
					slug: deck.deckSlug,
					title: deck.deckTitle,
					semester: deck.semester,
					cardCount,
					isNew: isNewDocument(deck.createdAt)
				};
			})
		);
	} catch (error) {
		console.log(error.message);
	}

	return decks;
}

async function getDeckBySlug(deckSlug) {
	let deck = null;

	try {
		const deckDocument = await collection.findOne({
			type: 'deck',
			deckSlug
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
		console.log(error.message);
	}

	return deck;
}

async function getCardsByDeckSlug(deckSlug, filters = {}) {
	let cards = [];
	const query = {
		type: 'card',
		deckSlug
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
		console.log(error.message);
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
		console.log(error.message);
	}

	return createLearningQueue(cards);
}

function isDueCard(card, now) {
	if (!card.nextReviewAt) {
		return true;
	}

	const nextReviewAt = card.nextReviewAt instanceof Date ? card.nextReviewAt : new Date(card.nextReviewAt);

	return !Number.isNaN(nextReviewAt.getTime()) && nextReviewAt <= now;
}

function getAverageLeitnerBox(cards) {
	if (!cards.length) {
		return 0;
	}

	const total = cards.reduce((sum, card) => sum + card.leitnerBox, 0);

	return Math.round((total / cards.length) * 10) / 10;
}

async function getDashboardStats() {
	const now = new Date();
	const decks = await getDecks();
	let cards = [];

	try {
		cards = await collection.find({ type: 'card' }).toArray();
		cards = cards.map((card) => normalizeCard(card));
	} catch (error) {
		console.log(error.message);
	}

	const dueCards = cards
		.filter((card) => isDueCard(card, now))
		.sort((a, b) => {
			const firstDate = a.nextReviewAt ? new Date(a.nextReviewAt).getTime() : 0;
			const secondDate = b.nextReviewAt ? new Date(b.nextReviewAt).getTime() : 0;
			return firstDate - secondDate;
		});
	const repeatedCards = [...cards]
		.filter((card) => card.repeatCount > 0)
		.sort((a, b) => b.repeatCount - a.repeatCount || a.leitnerBox - b.leitnerBox);
	const lowLeitnerCards = [...cards]
		.filter((card) => card.leitnerBox <= 2)
		.sort((a, b) => a.leitnerBox - b.leitnerBox || b.repeatCount - a.repeatCount);
	const deckStats = decks.map((deck) => {
		const deckCards = cards.filter((card) => card.deckSlug === deck.slug);

		return {
			...deck,
			dueCount: deckCards.filter((card) => isDueCard(card, now)).length,
			repeatCount: deckCards.filter((card) => card.status === 'repeat').length,
			knownCount: deckCards.filter((card) => card.status === 'known').length,
			averageLeitnerBox: getAverageLeitnerBox(deckCards)
		};
	});

	return {
		totalDecks: decks.length,
		totalCards: cards.length,
		dueCount: dueCards.length,
		repeatCount: cards.filter((card) => card.status === 'repeat').length,
		decks: deckStats,
		dueCards: dueCards.slice(0, 8),
		repeatedCards: repeatedCards.slice(0, 8),
		lowLeitnerCards: lowLeitnerCards.slice(0, 8)
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
		console.log(error.message);
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
		console.log(error.message);
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
		console.log(error.message);
	}

	return null;
}

async function createDeck(deck) {
	const deckSlug = createDeckSlug(deck.deckTitle);

	try {
		const existingDeck = await collection.findOne({
			type: 'deck',
			deckSlug
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

		await collection.insertOne(newDeck);
		return deckSlug;
	} catch (error) {
		console.log(error.message);
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
		console.log(error.message);
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
		console.log(error.message);
	}

	return null;
}

async function updateCard(card) {
	try {
		const id = card._id;
		delete card._id;
		card.updatedAt = new Date();

		const result = await collection.updateOne({ _id: new ObjectId(id), type: 'card' }, { $set: card });

		if (result.matchedCount === 1) {
			return id;
		}
	} catch (error) {
		console.log(error.message);
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
		console.log(error.message);
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
		console.log(error.message);
	}

	return null;
}

export default {
	getDecks,
	getDeckBySlug,
	getCardsByDeckSlug,
	getLearningQueueByDeckSlug,
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
