import { MongoClient, ObjectId } from 'mongodb';
import { DB_URI } from '$env/static/private';

const client = new MongoClient(DB_URI);

await client.connect();
const db = client.db('Karteikarten');
const collection = db.collection('Karteikarten');

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
					cardCount
				};
			})
		);
	} catch (error) {
		console.log(error.message);
	}

	return decks;
}

async function getCardsByDeckSlug(deckSlug) {
	let cards = [];

	try {
		cards = await collection.find({ deckSlug }).sort({ week: 1, slide: 1 }).toArray();
		cards.forEach((card) => {
			card._id = card._id.toString();
		});
	} catch (error) {
		console.log(error.message);
	}

	return cards;
}

async function getCard(id) {
	let card = null;

	try {
		card = await collection.findOne({ _id: new ObjectId(id) });

		if (card) {
			card._id = card._id.toString();
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

async function updateCard(card) {
	try {
		const id = card._id;
		delete card._id;
		card.updatedAt = new Date();

		const result = await collection.updateOne({ _id: new ObjectId(id) }, { $set: card });

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
		const result = await collection.deleteOne({ _id: new ObjectId(id) });

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
	getCardsByDeckSlug,
	getCard,
	createDeck,
	createCard,
	updateCard,
	deleteCard
};
