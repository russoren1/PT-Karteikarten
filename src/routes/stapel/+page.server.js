import db from '$lib/db.js';
import { fail, redirect } from '@sveltejs/kit';

const requiredCsvHeaders = ['deckTitle', 'semester', 'question', 'answer', 'week', 'slide'];

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
				deckTitle: row.deckTitle,
				semester: row.semester,
				question: row.question,
				answer: row.answer,
				week,
				slide,
				sourceName: row.sourceName ?? '',
				lineNumber: line.lineNumber
			});
		}
	});

	const deckCount = new Set(cards.map((card) => `${card.deckTitle}__${card.semester}`)).size;

	return {
		errors,
		cards,
		delimiter,
		deckCount
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

export async function load({ url }) {
	const decks = await db.getDecks();

	return {
		decks,
		deckDeleted: url.searchParams.get('deckDeleted') === '1'
	};
}

export const actions = {
	previewCsv: async ({ request }) => {
		const formData = await request.formData();
		const csvInput = await readCsvInput(formData);

		if (!csvInput.content) {
			return fail(400, {
				csvError: 'Bitte lade eine CSV-Datei hoch oder füge CSV-Text ein.',
				csvText: formData.get('csvText')?.toString() ?? ''
			});
		}

		const csvPreview = parseCsvContent(csvInput.content);

		if (csvPreview.errors.length) {
			return fail(400, {
				csvError: 'Die CSV-Datei konnte nicht importiert werden.',
				csvErrors: csvPreview.errors,
				csvText: csvInput.content
			});
		}

		return {
			csvPreview: {
				cardCount: csvPreview.cards.length,
				deckCount: csvPreview.deckCount,
				delimiter: csvPreview.delimiter,
				sourceLabel: csvInput.sourceLabel,
				previewRows: csvPreview.cards.slice(0, 5),
				csvPayload: JSON.stringify(csvPreview.cards)
			}
		};
	},
	createDeck: async ({ request }) => {
		const data = await request.formData();
		const deckTitle = data.get('deckTitle')?.toString().trim();
		const semester = data.get('semester')?.toString().trim();

		if (!deckTitle || !semester) {
			return fail(400, {
				error: 'Bitte gib einen Titel und ein Semester für den neuen Stapel ein.',
				deckTitle,
				semester
			});
		}

		const deckSlug = await db.createDeck({
			deckTitle,
			semester
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
