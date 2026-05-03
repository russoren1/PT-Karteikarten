import { MongoClient, ObjectId } from 'mongodb';
import { DB_URI } from '$env/static/private';

const client = new MongoClient(DB_URI);

await client.connect();
const db = client.db('Karteikarten');
const collection = db.collection('Karteikarten');
const newDocumentThreshold = 2 * 24 * 60 * 60 * 1000;

// Stapel-Dokument:
// {
//   type, deckSlug, deckTitle, semester, createdAt, updatedAt
// }
//
// Karteikarten-Dokument:
// {
//   type, question, answer, deckSlug, deckTitle, semester,
//   week, slide, status, createdAt, updatedAt
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

	if (filters.q) {
		const searchRegex = new RegExp(escapeRegex(filters.q), 'i');
		query.$or = [{ question: searchRegex }, { answer: searchRegex }];
	}

	if (filters.week) {
		query.week = Number(filters.week);
	}

	if (filters.sourceName) {
		query.sourceName = new RegExp(escapeRegex(filters.sourceName), 'i');
	}

	if (['new', 'known', 'repeat'].includes(filters.status)) {
		query.status = filters.status;
	}

	try {
		cards = await collection.find(query).sort({ week: 1, slide: 1 }).toArray();
		cards.forEach((card) => {
			card._id = card._id.toString();
			card.isNew = isNewDocument(card.createdAt);
		});
	} catch (error) {
		console.log(error.message);
	}

	return cards;
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
			card._id = card._id.toString();
			card.isNew = isNewDocument(card.createdAt);
		}
	} catch (error) {
		console.log(error.message);
	}

	return card;
}

async function createCard(card) {
	card.type = 'card';
	card.status = card.status ?? 'new';
	card.createdAt = card.createdAt ?? new Date();
	card.updatedAt = new Date();

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
		const result = await collection.updateOne(
			{
				_id: new ObjectId(id),
				type: 'card'
			},
			{
				$set: {
					status,
					updatedAt: new Date()
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
