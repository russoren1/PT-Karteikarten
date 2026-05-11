<script>
	import DeckCard from '$lib/components/DeckCard.svelte';

	let { data, form } = $props();
	let showCreateDeckForm = $state(false);
	let showCsvImportForm = $state(false);
	let csvFileInput = $state();
	let selectedCsvFileName = $state('');

	function handleCsvDrop(event) {
		event.preventDefault();
		const csvFile = event.dataTransfer?.files?.[0];

		if (csvFile && csvFileInput) {
			const dataTransfer = new DataTransfer();
			dataTransfer.items.add(csvFile);
			csvFileInput.files = dataTransfer.files;
			selectedCsvFileName = csvFile.name;
		}
	}
</script>

<div class="container py-4 py-lg-5">
	<div class="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3 mb-4">
		<div>
			<h1 class="display-6 fw-bold mb-0">// Meine Stapel</h1>
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
				onclick={() => (showCsvImportForm = !showCsvImportForm)}
			>
				CSV Import
			</button>
		</div>
	</div>

	{#if showCreateDeckForm || form?.error}
		<form class="card bg-light text-dark shadow-sm mb-4" method="POST" action="?/createDeck">
			<div class="card-body">
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

	{#if showCsvImportForm || form?.csvPreview || form?.csvError}
		<div class="card bg-light text-dark shadow-sm mb-4">
			<div class="card-body p-4">
				<div class="d-flex flex-column flex-lg-row justify-content-between gap-3 mb-4">
					<div>
						<h2 class="h4 fw-bold mb-2">CSV Import</h2>
						<p class="text-secondary mb-0">
							Lade eine CSV-Datei hoch oder füge CSV-formatierten Text direkt ein.
						</p>
					</div>
					<button
						class="btn btn-outline-secondary align-self-start"
						type="button"
						onclick={() => (showCsvImportForm = false)}
					>
						Schließen
					</button>
				</div>

				{#if form?.csvError}
					<div class="alert alert-danger" role="alert">
						<p class="fw-semibold mb-2">{form.csvError}</p>
						{#if form.csvErrors?.length}
							<ul class="mb-0">
								{#each form.csvErrors as csvError}
									<li>{csvError}</li>
								{/each}
							</ul>
						{/if}
					</div>
				{/if}

				<form method="POST" action="?/previewCsv" enctype="multipart/form-data">
					<div class="row g-4">
						<div class="col-lg-6">
							<label class="form-label fw-semibold" for="csvFile">CSV-Datei hochladen</label>
							<div
								class="border border-2 border-secondary rounded p-4 text-center bg-body-tertiary"
								role="group"
								aria-label="CSV-Datei per Drag and Drop hochladen"
								ondragover={(event) => event.preventDefault()}
								ondrop={handleCsvDrop}
							>
								<p class="fw-semibold mb-2">CSV-Datei hier ablegen</p>
								<p class="text-secondary mb-3">oder Datei auswählen</p>
								<input
									bind:this={csvFileInput}
									class="form-control"
									id="csvFile"
									name="csvFile"
									type="file"
									accept=".csv,text/csv"
									onchange={(event) => (selectedCsvFileName = event.currentTarget.files?.[0]?.name ?? '')}
								/>
								{#if selectedCsvFileName}
									<p class="small text-secondary mt-2 mb-0">Ausgewählt: {selectedCsvFileName}</p>
								{/if}
							</div>
						</div>

						<div class="col-lg-6">
							<label class="form-label fw-semibold" for="csvText">CSV-Text einfügen</label>
							<textarea
								class="form-control"
								id="csvText"
								name="csvText"
								rows="8"
								placeholder="deckTitle,semester,question,answer,week,slide,sourceName"
							>{form?.csvText ?? ''}</textarea>
							<p class="form-text mb-0">
								Wenn Datei und Text vorhanden sind, wird die Datei verwendet.
							</p>
						</div>
					</div>

					<div class="alert alert-secondary mt-4" role="note">
						<p class="fw-semibold mb-2">Erwartete Spalten</p>
						<code>deckTitle,semester,question,answer,week,slide,sourceName</code>
						<p class="mb-0 mt-2">
							Pflichtfelder: deckTitle, semester, question, answer, week und slide. sourceName ist optional.
						</p>
					</div>

					<div class="table-responsive mb-4">
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

					<button class="btn btn-dark fw-semibold" type="submit">CSV Vorschau prüfen</button>
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
		<div class="alert alert-light" role="alert">
			Noch keine Stapel vorhanden. Erstelle deinen ersten Stapel über den Button "Neuer Stapel".
		</div>
	{:else}
		<div class="row g-4 g-xl-5">
			{#each data.decks as deck (deck.slug)}
				<div class="col-md-6 col-lg-4">
					<DeckCard {deck} />
				</div>
			{/each}
		</div>
	{/if}
</div>
