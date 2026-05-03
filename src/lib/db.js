import { MongoClient, ObjectId } from 'mongodb';
import { DB_URI } from '$env/static/private';

const client = new MongoClient(DB_URI);

await client.connect();
const db = client.db('Karteikarten');
const collection = db.collection('Karteikarten');

// Karteikarten-Dokument:
// {
//   question, answer, deckSlug, deckTitle, semester,
//   week, slide, status, createdAt, updatedAt
// }

async function getDecks() {
	let decks = [];

	try {
		decks = await collection
			.aggregate([
				{
					$group: {
						_id: '$deckSlug',
						title: { $first: '$deckTitle' },
						semester: { $first: '$semester' },
						cardCount: { $sum: 1 }
					}
				},
				{
					$project: {
						_id: 0,
						slug: '$_id',
						title: 1,
						semester: 1,
						cardCount: 1
					}
				},
				{ $sort: { title: 1 } }
			])
			.toArray();
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
	createCard,
	updateCard,
	deleteCard
};
