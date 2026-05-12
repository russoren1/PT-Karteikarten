<script>
	import DeckCard from '$lib/components/DeckCard.svelte';

	let { data, form } = $props();
	let showCreateDeckForm = $state(false);
	let showCsvImportForm = $state(false);
	let csvImportDismissed = $state(false);
	let csvFileInput = $state();
	let selectedCsvFileName = $state('');
	let isCsvDragging = $state(false);
	let promptCopied = $state(false);
	let showCsvImportPanel = $derived(
		showCsvImportForm || ((form?.csvPreview || form?.csvError) && !csvImportDismissed)
	);
	const csvPrompt = `Erstelle aus den hochgeladenen Vorlesungsunterlagen Karteikarten im CSV-Format.

Gib ausschließlich CSV aus, keine Erklärung und keine Markdown-Tabelle.

Verwende exakt diese Header-Zeile:
deckTitle,semester,question,answer,week,slide,sourceName

Regeln:
- deckTitle: Name des Moduls oder Stapels
- semester: Semesterangabe, z.B. FS 26 oder HS 25
- question: kurze, prüfungsnahe Frage
- answer: präzise Antwort
- week: Semesterwoche als Zahl
- slide: Foliennummer oder Seitennummer als Zahl
- sourceName: optionaler Datei- oder Skriptname, z.B. Vorlesung 10.pdf
- Erstelle eine Zeile pro Karte.
- Wenn ein Wert Kommas, Anführungszeichen oder Zeilenumbrüche enthält, setze ihn in doppelte Anführungszeichen.
- Wenn sourceName unbekannt ist, lasse das Feld leer.`;

	async function copyCsvPrompt() {
		await navigator.clipboard.writeText(csvPrompt);
		promptCopied = true;

		setTimeout(() => {
			promptCopied = false;
		}, 2000);
	}

	function handleCsvDrop(event) {
		event.preventDefault();
		isCsvDragging = false;
		const csvFile = event.dataTransfer?.files?.[0];

		if (csvFile && csvFileInput) {
			const dataTransfer = new DataTransfer();
			dataTransfer.items.add(csvFile);
			csvFileInput.files = dataTransfer.files;
			selectedCsvFileName = csvFile.name;
		}
	}

	function handleCsvDragOver(event) {
		event.preventDefault();
		isCsvDragging = true;
	}

	function handleCsvDragLeave() {
		isCsvDragging = false;
	}

	function openCsvFilePicker() {
		csvFileInput?.click();
	}

	function toggleCsvImportForm() {
		csvImportDismissed = false;
		showCsvImportForm = !showCsvImportForm;
	}

	function closeCsvImportForm() {
		showCsvImportForm = false;
		csvImportDismissed = true;
		selectedCsvFileName = '';

		if (csvFileInput) {
			csvFileInput.value = '';
		}
	}
</script>

<div class="container py-5">
	<div class="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3 mb-4">
		<div>
			<p class="text-uppercase text-accent fw-semibold mb-2">Stapelübersicht</p>
			<h1 class="display-5 fw-bold mb-0">Meine Stapel</h1>
		</div>

		<div class="d-flex flex-wrap align-items-start gap-3">
			<button
				class="btn btn-success fw-semibold"
				type="button"
				onclick={() => (showCreateDeckForm = !showCreateDeckForm)}
			>
				Neuer Stapel
			</button>
			<button
				class="btn btn-success fw-semibold"
				type="button"
				onclick={toggleCsvImportForm}
			>
				CSV Import
			</button>
		</div>
	</div>

	{#if showCreateDeckForm || form?.error}
		<form class="card bg-light text-dark border-0 rounded-4 shadow-sm mb-4" method="POST" action="?/createDeck">
			<div class="card-body p-4">
				<h2 class="h5 card-title mb-3">Neuen Stapel erstellen</h2>

				{#if form?.error}
					<div class="alert alert-danger" role="alert">{form.error}</div>
				{/if}

				<div class="row g-3">
					<div class="col-md-8">
						<label class="form-label" for="deckTitle">Titel des Stapels</label>
						<input
							class="form-control"
							id="deckTitle"
							name="deckTitle"
							placeholder="z.B. Strategisches Management"
							value={form?.deckTitle ?? ''}
							required
						/>
					</div>

					<div class="col-md-4">
						<label class="form-label" for="semester">Semester</label>
						<input
							class="form-control"
							id="semester"
							name="semester"
							placeholder="z.B. FS 26"
							value={form?.semester ?? ''}
							required
						/>
					</div>
				</div>

				<div class="d-flex flex-wrap gap-2 mt-4">
					<button class="btn btn-success fw-semibold" type="submit">Stapel erstellen</button>
					<button
						class="btn btn-outline-secondary"
						type="button"
						onclick={() => (showCreateDeckForm = false)}
					>
						Abbrechen
					</button>
				</div>
			</div>
		</form>
	{:else if form?.error}
		<div class="alert alert-danger" role="alert">{form.error}</div>
	{/if}

	{#if data.deckDeleted}
		<div class="alert alert-success" role="alert">Stapel wurde gelöscht.</div>
	{/if}

	{#if data.importedCards > 0}
		<div class="alert alert-success" role="alert">
			CSV Import abgeschlossen: {data.importedCards} Karten wurden gespeichert,
			{data.importedDecks} Stapel betroffen.
		</div>
	{/if}

	{#if showCsvImportPanel}
		<div class="card bg-light text-dark border-0 rounded-4 shadow-sm mb-5">
			<div class="card-body p-4">
				<div class="d-flex flex-column flex-lg-row justify-content-between gap-3 mb-3">
					<div>
						<h2 class="h4 fw-bold mb-1">CSV Import</h2>
						<p class="text-secondary mb-0">CSV-Datei ablegen oder CSV-Text einfügen.</p>
					</div>
					<button
						class="btn btn-outline-secondary align-self-start"
						type="button"
						onclick={closeCsvImportForm}
					>
						Schließen
					</button>
				</div>

				{#if form?.csvError}
					<div class="alert alert-danger" role="alert">
						<p class="fw-semibold mb-2">CSV konnte nicht geprüft werden.</p>
						<p class="mb-3">{form.csvError}</p>
						{#if form.csvErrors?.length}
							<p class="fw-semibold mb-2">Bitte korrigiere diese Punkte:</p>
							<ul class="mb-0">
								{#each form.csvErrors as csvError}
									<li>{csvError}</li>
								{/each}
							</ul>
						{/if}
						<hr />
						<p class="mb-0">
							Die erste Zeile muss die Header
							<code>deckTitle,semester,question,answer,week,slide,sourceName</code>
							enthalten. Pflichtfelder dürfen nicht leer sein; <code>week</code> und
							<code>slide</code> müssen positive ganze Zahlen sein.
						</p>
					</div>
				{/if}

				<form method="POST" action="?/previewCsv" enctype="multipart/form-data">
					<div class="accordion mb-3" id="csvImportHelpAccordion">
						<div class="accordion-item">
							<h3 class="accordion-header">
								<button
									class="accordion-button collapsed fw-semibold"
									type="button"
									data-bs-toggle="collapse"
									data-bs-target="#csvPromptCollapse"
									aria-expanded="false"
									aria-controls="csvPromptCollapse"
								>
									Prompt-Vorlage für KI-Tool
								</button>
							</h3>
							<div
								class="accordion-collapse collapse"
								id="csvPromptCollapse"
								data-bs-parent="#csvImportHelpAccordion"
							>
								<div class="accordion-body">
									<p class="text-secondary">
										Lade deine Vorlesungsfolien in ein LLM deiner Wahl hoch, kopiere diesen
										Prompt und importiere das Ergebnis anschließend als CSV.
									</p>
									<textarea class="form-control font-monospace mb-3" rows="12" readonly>{csvPrompt}</textarea>
									<button
										class="btn btn-outline-dark btn-sm fw-semibold"
										type="button"
										onclick={copyCsvPrompt}
									>
										{promptCopied ? 'Kopiert' : 'Prompt kopieren'}
									</button>
								</div>
							</div>
						</div>
						<div class="accordion-item">
							<h3 class="accordion-header">
								<button
									class="accordion-button collapsed fw-semibold"
									type="button"
									data-bs-toggle="collapse"
									data-bs-target="#csvFormatCollapse"
									aria-expanded="false"
									aria-controls="csvFormatCollapse"
								>
									CSV-Format anzeigen
								</button>
							</h3>
							<div
								class="accordion-collapse collapse"
								id="csvFormatCollapse"
								data-bs-parent="#csvImportHelpAccordion"
							>
								<div class="accordion-body">
									<p class="fw-semibold mb-2">Erwartete Spalten</p>
									<code>deckTitle,semester,question,answer,week,slide,sourceName</code>
									<p class="small text-secondary mb-3 mt-2">
										Pflichtfelder: deckTitle, semester, question, answer, week und slide.
										sourceName ist optional.
									</p>
									<div class="table-responsive">
										<table class="table table-sm table-bordered align-middle mb-0">
											<thead>
												<tr>
													<th scope="col">deckTitle</th>
													<th scope="col">semester</th>
													<th scope="col">question</th>
													<th scope="col">answer</th>
													<th scope="col">week</th>
													<th scope="col">slide</th>
													<th scope="col">sourceName</th>
												</tr>
											</thead>
											<tbody>
												<tr>
													<td>Strategisches Management</td>
													<td>FS 26</td>
													<td>Was ist VRINO?</td>
													<td>Ein Framework zur Ressourcenanalyse.</td>
													<td>10</td>
													<td>55</td>
													<td>Vorlesung 10.pdf</td>
												</tr>
											</tbody>
										</table>
									</div>
								</div>
							</div>
						</div>
					</div>

					<div class="row g-3">
						<div class="col-lg-6">
							<label class="form-label fw-semibold" for="csvFile">CSV-Datei</label>
							<input
								bind:this={csvFileInput}
								class="d-none"
								id="csvFile"
								name="csvFile"
								type="file"
								accept=".csv,text/csv"
								onchange={(event) => (selectedCsvFileName = event.currentTarget.files?.[0]?.name ?? '')}
							/>
							<div
								class="border border-2 rounded p-4 text-center bg-body-tertiary"
								class:border-primary={isCsvDragging}
								class:bg-primary-subtle={isCsvDragging}
								role="button"
								tabindex="0"
								aria-label="CSV-Datei per Drag and Drop hochladen oder auswählen"
								ondragover={handleCsvDragOver}
								ondragleave={handleCsvDragLeave}
								ondrop={handleCsvDrop}
								onclick={openCsvFilePicker}
								onkeydown={(event) => event.key === 'Enter' && openCsvFilePicker()}
							>
								<span class="badge text-bg-dark mb-2">CSV</span>
								<p class="fw-semibold mb-1">
									{selectedCsvFileName || 'CSV-Datei hier ablegen'}
								</p>
								<p class="text-secondary small mb-0">oder klicken zum Auswählen</p>
								{#if selectedCsvFileName}
									<p class="small text-secondary mt-2 mb-0">Datei ist für die Vorschau bereit.</p>
								{/if}
							</div>
						</div>

						<div class="col-lg-6">
							<label class="form-label fw-semibold" for="csvText">CSV-Text</label>
							<textarea
								class="form-control"
								id="csvText"
								name="csvText"
								rows="5"
								placeholder="deckTitle,semester,question,answer,week,slide,sourceName"
							>{form?.csvText ?? ''}</textarea>
							<p class="form-text mb-0">
								Wenn Datei und Text vorhanden sind, wird die Datei verwendet.
							</p>
						</div>
					</div>

					<div class="d-flex flex-wrap align-items-center gap-3 mt-3">
						<button class="btn btn-dark fw-semibold" type="submit">CSV Vorschau prüfen</button>
						<p class="small text-secondary mb-0">
							Die Vorschau speichert noch nichts.
						</p>
					</div>
				</form>

				{#if form?.csvPreview}
					<hr class="my-4" />

					<div class="alert alert-success" role="status">
						<p class="fw-semibold mb-1">CSV wurde erfolgreich geprüft.</p>
						<p class="mb-0">
							{form.csvPreview.cardCount} Karten erkannt,
							{form.csvPreview.deckCount} Stapel betroffen.
						</p>
					</div>

					<div class="alert alert-info" role="note">
						Die Vorschau zeigt nur die ersten 5 Karten. Beim Import werden alle gültigen CSV-Zeilen gespeichert.
					</div>

					<div class="table-responsive mb-4">
						<table class="table table-hover align-middle mb-0">
							<thead>
								<tr>
									<th scope="col">Stapel</th>
									<th scope="col">Semester</th>
									<th scope="col">Frage</th>
									<th scope="col">Woche</th>
									<th scope="col">Folie/Seite</th>
									<th scope="col">Dateiname</th>
								</tr>
							</thead>
							<tbody>
								{#each form.csvPreview.previewRows as card}
									<tr>
										<td>{card.deckTitle}</td>
										<td>{card.semester}</td>
										<td>{card.question}</td>
										<td>{card.week}</td>
										<td>{card.slide}</td>
										<td>{card.sourceName || '-'}</td>
									</tr>
								{/each}
							</tbody>
						</table>
					</div>

					<form method="POST" action="?/importCsv">
						<input type="hidden" name="csvPayload" value={form.csvPreview.csvPayload} />
						<button class="btn btn-success fw-semibold" type="submit">CSV importieren</button>
					</form>
				{/if}
			</div>
		</div>
	{/if}

	{#if data.decks.length === 0}
		<div class="alert alert-light rounded-4" role="alert">
			Noch keine Stapel vorhanden. Erstelle deinen ersten Stapel über den Button "Neuer Stapel".
		</div>
	{:else}
		<div class="row g-4">
			{#each data.decks as deck (deck.slug)}
				<div class="col-md-6 col-lg-4">
					<DeckCard {deck} />
				</div>
			{/each}
		</div>
	{/if}
</div>
