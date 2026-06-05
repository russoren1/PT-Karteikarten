import db from '$lib/db.js';
import { fail, redirect } from '@sveltejs/kit';

const requiredCsvHeaders = ['question', 'answer', 'week', 'slide'];

function detectCsvDelimiter(headerLine) {
	const commaCount = headerLine.split(',').length;
	const semicolonCount = headerLine.split(';').length;

	return semicolonCount > commaCount ? ';' : ',';
}

function splitCsvLine(line, delimiter) {
	const values = [];
	let value = '';
	let isQuoted = false;

	for (let index = 0; index < line.length; index += 1) {
		const character = line[index];
		const nextCharacter = line[index + 1];

		if (character === '"' && isQuoted && nextCharacter === '"') {
			value += '"';
			index += 1;
		} else if (character === '"') {
			isQuoted = !isQuoted;
		} else if (character === delimiter && !isQuoted) {
			values.push(value.trim());
			value = '';
		} else {
			value += character;
		}
	}

	if (isQuoted) {
		return {
			error: 'Anführungszeichen wurden nicht korrekt geschlossen.'
		};
	}

	values.push(value.trim());

	return {
		values
	};
}

function parseCsvContent(csvContent) {
	const errors = [];
	const cards = [];
	const lines = csvContent
		.replace(/^\uFEFF/, '')
		.split(/\r?\n/)
		.map((line, index) => ({
			content: line,
			lineNumber: index + 1
		}))
		.filter((line) => line.content.trim());

	if (lines.length < 2) {
		return {
			errors: ['Die CSV-Datei muss eine Header-Zeile und mindestens eine Karten-Zeile enthalten.'],
			cards: [],
			delimiter: ',',
			deckCount: 0
		};
	}

	const delimiter = detectCsvDelimiter(lines[0].content);
	const headerResult = splitCsvLine(lines[0].content, delimiter);

	if (headerResult.error) {
		return {
			errors: [`Header: ${headerResult.error}`],
			cards: [],
			delimiter,
			deckCount: 0
		};
	}

	const headers = headerResult.values;
	const missingHeaders = requiredCsvHeaders.filter((header) => !headers.includes(header));

	if (missingHeaders.length) {
		return {
			errors: [`Fehlende Pflichtspalten: ${missingHeaders.join(', ')}.`],
			cards: [],
			delimiter,
			deckCount: 0
		};
	}

	lines.slice(1).forEach((line) => {
		const rowResult = splitCsvLine(line.content, delimiter);

		if (rowResult.error) {
			errors.push(`Zeile ${line.lineNumber}: ${rowResult.error}`);
			return;
		}

		if (rowResult.values.length > headers.length) {
			errors.push(`Zeile ${line.lineNumber}: Die Zeile enthält mehr Werte als die Header-Zeile.`);
			return;
		}

		const row = {};
		headers.forEach((header, index) => {
			row[header] = rowResult.values[index]?.trim() ?? '';
		});

		requiredCsvHeaders.forEach((header) => {
			if (!row[header]) {
				errors.push(`Zeile ${line.lineNumber}: ${header} darf nicht leer sein.`);
			}
		});

		const week = Number(row.week);
		const slide = Number(row.slide);

		if (!Number.isInteger(week) || week < 1) {
			errors.push(`Zeile ${line.lineNumber}: Woche muss eine positive ganze Zahl sein.`);
		}

		if (!Number.isInteger(slide) || slide < 1) {
			errors.push(`Zeile ${line.lineNumber}: Folie/Seite muss eine positive ganze Zahl sein.`);
		}

		if (errors.length === 0 || !errors.at(-1)?.startsWith(`Zeile ${line.lineNumber}:`)) {
			cards.push({
				deckTitle: row.deckTitle ?? '',
				semester: row.semester ?? '',
				question: row.question,
				answer: row.answer,
				week,
				slide,
				sourceName: row.sourceName ?? '',
				lineNumber: line.lineNumber
			});
		}
	});

	return {
		errors,
		cards,
		delimiter,
		deckCount: 1
	};
}

function getCsvTargetFields(formData) {
	return {
		csvTargetMode: formData.get('csvTargetMode')?.toString() === 'new' ? 'new' : 'existing',
		targetDeckSlug: formData.get('targetDeckSlug')?.toString().trim() ?? '',
		targetDeckTitle: formData.get('targetDeckTitle')?.toString().trim() ?? '',
		targetSemester: formData.get('targetSemester')?.toString().trim() ?? ''
	};
}

function resolveCsvTarget(formData, decks) {
	const target = getCsvTargetFields(formData);

	if (target.csvTargetMode === 'existing') {
		const deck = decks.find((item) => item.slug === target.targetDeckSlug);

		if (!deck) {
			return {
				error: 'Bitte wähle einen bestehenden Zielstapel für den CSV-Import aus.',
				target
			};
		}

		return {
			target: {
				...target,
				deckSlug: deck.slug,
				deckTitle: deck.title,
				semester: deck.semester,
				isNewDeck: false
			}
		};
	}

	if (!target.targetDeckTitle || !target.targetSemester) {
		return {
			error: 'Bitte gib Titel und Semester für den neuen Zielstapel ein.',
			target
		};
	}

	return {
		target: {
			...target,
			deckTitle: target.targetDeckTitle,
			semester: target.targetSemester,
			isNewDeck: true
		}
	};
}

function readCsvPayload(payload) {
	let cards = [];

	try {
		cards = JSON.parse(payload);
	} catch {
		return {
			error: 'Die CSV-Vorschau konnte nicht gelesen werden.',
			cards: []
		};
	}

	if (!Array.isArray(cards) || cards.length === 0) {
		return {
			error: 'Die CSV-Vorschau enthält keine importierbaren Karten.',
			cards: []
		};
	}

	for (const card of cards) {
		if (
			!card.question ||
			!card.answer ||
			!Number.isInteger(card.week) ||
			!Number.isInteger(card.slide)
		) {
			return {
				error: 'Die CSV-Vorschau enthält ungültige Kartendaten. Bitte prüfe die CSV erneut.',
				cards: []
			};
		}
	}

	return {
		error: '',
		cards
	};
}

async function readCsvInput(formData) {
	const csvFile = formData.get('csvFile');
	const csvText = formData.get('csvText')?.toString().trim() ?? '';

	if (csvFile && typeof csvFile === 'object' && 'size' in csvFile && csvFile.size > 0) {
		return {
			content: await csvFile.text(),
			sourceLabel: csvFile.name || 'CSV-Datei'
		};
	}

	return {
		content: csvText,
		sourceLabel: 'eingefügter CSV-Text'
	};
}

export async function load({ url, locals }) {
	const userId = locals.user?.id ?? null;
	const decks = await db.getDecks(userId);

	return {
		decks,
		deckDeleted: url.searchParams.get('deckDeleted') === '1',
		importedCards: Number(url.searchParams.get('importedCards') ?? 0),
		importedDecks: Number(url.searchParams.get('importedDecks') ?? 0),
		importedDeckTitle: url.searchParams.get('importedDeck') ?? ''
	};
}

export const actions = {
	previewCsv: async ({ request, locals }) => {
		const formData = await request.formData();
		const userId = locals.user?.id ?? null;
		const decks = await db.getDecks(userId);
		const csvTarget = resolveCsvTarget(formData, decks);
		const csvInput = await readCsvInput(formData);

		if (csvTarget.error) {
			return fail(400, {
				csvError: csvTarget.error,
				csvText: formData.get('csvText')?.toString() ?? '',
				...csvTarget.target
			});
		}

		if (!csvInput.content) {
			return fail(400, {
				csvError: 'Bitte lade eine CSV-Datei hoch oder füge CSV-Text ein.',
				csvText: formData.get('csvText')?.toString() ?? '',
				...csvTarget.target
			});
		}

		const csvPreview = parseCsvContent(csvInput.content);

		if (csvPreview.errors.length) {
			return fail(400, {
				csvError: 'Die CSV-Datei konnte nicht importiert werden.',
				csvErrors: csvPreview.errors,
				csvText: csvInput.content,
				...csvTarget.target
			});
		}

		return {
			csvPreview: {
				cardCount: csvPreview.cards.length,
				deckCount: csvPreview.deckCount,
				delimiter: csvPreview.delimiter,
				sourceLabel: csvInput.sourceLabel,
				previewRows: csvPreview.cards.slice(0, 5),
				targetDeckTitle: csvTarget.target.deckTitle,
				targetSemester: csvTarget.target.semester,
				targetDeckLabel: `${csvTarget.target.deckTitle} (${csvTarget.target.semester})`,
				targetMode: csvTarget.target.csvTargetMode,
				csvPayload: JSON.stringify(csvPreview.cards)
			},
			...csvTarget.target
		};
	},
	importCsv: async ({ request, locals }) => {
		const formData = await request.formData();
		const csvPayload = formData.get('csvPayload')?.toString() ?? '';
		const csvImport = readCsvPayload(csvPayload);
		const userId = locals.user?.id ?? null;
		const decks = await db.getDecks(userId);
		const csvTarget = resolveCsvTarget(formData, decks);

		if (csvImport.error) {
			return fail(400, {
				csvError: csvImport.error
			});
		}

		if (csvTarget.error) {
			return fail(400, {
				csvError: csvTarget.error,
				...csvTarget.target
			});
		}

		const deckSlug = csvTarget.target.isNewDeck
			? await db.createDeck({
					deckTitle: csvTarget.target.deckTitle,
					semester: csvTarget.target.semester,
					...(userId ? { userId } : {})
				})
			: csvTarget.target.deckSlug;

		if (!deckSlug) {
			return fail(500, {
				csvError: `Der Stapel "${csvTarget.target.deckTitle}" konnte nicht gespeichert werden.`
			});
		}

		let importedCards = 0;

		for (const card of csvImport.cards) {
			const cardId = await db.createCard({
				question: card.question,
				answer: card.answer,
				week: card.week,
				sourceName: card.sourceName ?? '',
				slide: card.slide,
				deckSlug,
				deckTitle: csvTarget.target.deckTitle,
				semester: csvTarget.target.semester,
				status: 'new',
				...(userId ? { userId } : {})
			});

			if (!cardId) {
				return fail(500, {
					csvError: `Eine Karte aus Zeile ${card.lineNumber ?? '?'} konnte nicht gespeichert werden.`
				});
			}

			importedCards += 1;
		}

		redirect(
			303,
			`/stapel?importedCards=${importedCards}&importedDecks=1&importedDeck=${encodeURIComponent(csvTarget.target.deckTitle)}`
		);
	},
	createDeck: async ({ request, locals }) => {
		const data = await request.formData();
		const deckTitle = data.get('deckTitle')?.toString().trim();
		const semester = data.get('semester')?.toString().trim();
		const userId = locals.user?.id ?? null;

		if (!deckTitle || !semester) {
			return fail(400, {
				error: 'Bitte gib einen Titel und ein Semester für den neuen Stapel ein.',
				deckTitle,
				semester
			});
		}

		const deckSlug = await db.createDeck({
			deckTitle,
			semester,
			...(userId ? { userId } : {})
		});

		if (!deckSlug) {
			return fail(500, {
				error: 'Der Stapel konnte nicht in MongoDB gespeichert werden.',
				deckTitle,
				semester
			});
		}

		redirect(303, '/stapel');
	}
};
