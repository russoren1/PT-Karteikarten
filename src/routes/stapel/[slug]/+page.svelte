<script>
	let { data } = $props();
</script>

<svelte:head>
	<title>
		{data.deck ? `${data.deck.title} | PT Karteikarten` : 'Stapel nicht gefunden | PT Karteikarten'}
	</title>
</svelte:head>

<div class="container py-4 py-lg-5">
	{#if !data.deck}
		<div class="alert alert-warning" role="alert">
			<h1 class="h4 alert-heading">Stapel nicht gefunden</h1>
			<p class="mb-3">
				Für den Slug <strong>{data.slug}</strong> wurde kein Stapel in MongoDB gefunden.
			</p>
			<a class="btn btn-dark" href="/stapel">Zurück zur Stapelübersicht</a>
		</div>
	{:else}
		<div class="d-flex flex-column flex-lg-row justify-content-between align-items-lg-start gap-3 mb-4">
			<div>
				<h1 class="display-5 fw-bold mb-3">// {data.deck.title}</h1>
				<div class="d-flex flex-wrap gap-2">
					<span class="badge text-bg-light">{data.deck.semester}</span>
					<span class="badge text-bg-light">{data.deck.cardCount} Karten</span>
				</div>
			</div>

			<div class="d-flex flex-wrap gap-2">
				<a class="btn btn-success btn-lg fw-semibold" href={`/stapel/${data.deck.slug}/karten/neu`}>
					+ Neue Karte
				</a>
				<a class="btn btn-light btn-lg fw-semibold" href={`/stapel/${data.deck.slug}/bearbeiten`}>
					Bearbeiten
				</a>
				<a class="btn btn-danger btn-lg fw-semibold" href={`/stapel/${data.deck.slug}/loeschen`}>
					Löschen
				</a>
			</div>
		</div>

		<div class="mb-5">
			<a class="btn btn-dark btn-lg border border-light shadow-sm w-100 py-4 fw-bold" href={`/stapel/${data.deck.slug}/lernen`}>
				⚡ JETZT LERNEN
			</a>
		</div>

		{#if data.deleted}
			<div class="alert alert-success" role="alert">Karte wurde gelöscht.</div>
		{/if}

		{#if data.deckUpdated}
			<div class="alert alert-success" role="alert">Stapel wurde gespeichert.</div>
		{/if}

		<form class="card bg-light text-dark shadow-sm mb-4" method="GET">
			<div class="card-body">
				<h2 class="h5 fw-bold mb-3">Karten filtern</h2>

				<div class="row g-3">
					<div class="col-lg-4">
						<label class="form-label" for="q">Frage oder Antwort suchen</label>
						<input
							class="form-control"
							id="q"
							name="q"
							placeholder="Suchbegriff"
							value={data.filters.q}
						/>
					</div>

					<div class="col-sm-6 col-lg-2">
						<label class="form-label" for="week">Woche</label>
						<input
							class="form-control"
							id="week"
							name="week"
							type="number"
							min="1"
							step="1"
							placeholder="10"
							value={data.filters.week}
						/>
					</div>

					<div class="col-sm-6 col-lg-2">
						<label class="form-label" for="slide">Folie/Seite</label>
						<input
							class="form-control"
							id="slide"
							name="slide"
							type="number"
							min="1"
							step="1"
							placeholder="74"
							value={data.filters.slide}
						/>
					</div>

					<div class="col-lg-4">
						<label class="form-label" for="status">Status</label>
						<select class="form-select" id="status" name="status" value={data.filters.status}>
							<option value="">Alle</option>
							<option value="new">Neu</option>
							<option value="known">Gewusst</option>
							<option value="repeat">Repetieren</option>
						</select>
					</div>
				</div>

				<div class="d-flex flex-column flex-md-row gap-2 mt-4">
					<button class="btn btn-dark fw-semibold" type="submit">Filtern</button>
					<a class="btn btn-outline-secondary" href={`/stapel/${data.deck.slug}`}>Zurücksetzen</a>
				</div>
			</div>
		</form>

		{#if data.cards.length === 0}
			{#if data.hasActiveFilters}
				<div class="alert alert-light" role="alert">Keine Karten für diese Filter gefunden.</div>
			{:else}
				<div class="alert alert-light" role="alert">
					<p class="mb-3">Dieser Stapel enthält noch keine Karten.</p>
					<a class="btn btn-dark" href={`/stapel/${data.deck.slug}/karten/neu`}>
						Erste Karte erstellen
					</a>
				</div>
			{/if}
		{:else}
			{#if data.hasActiveFilters}
				<p class="text-light fw-semibold mb-3">
					{data.cards.length} von {data.totalCardCount} Karten angezeigt
				</p>
			{/if}

			<div class="table-responsive shadow-sm">
				<table class="table table-light table-bordered table-hover align-middle mb-0">
					<thead class="table-secondary">
						<tr>
							<th scope="col">Frage</th>
							<th class="text-center" scope="col">Woche</th>
							<th class="text-center" scope="col">Folie/Seite</th>
							<th class="text-center" scope="col">Aktion</th>
						</tr>
					</thead>
					<tbody>
						{#each data.cards as card (card._id)}
							<tr>
								<td>{card.question || 'Ohne Frage'}</td>
								<td class="text-center">{card.week ?? '-'}</td>
								<td class="text-center">{card.slide ?? '-'}</td>
								<td>
									<div class="d-flex flex-column flex-lg-row justify-content-center gap-2">
										<a class="btn btn-sm btn-dark" href={`/stapel/${data.deck.slug}/karten/${card._id}`}>
											Öffnen
										</a>
										<a
											class="btn btn-sm btn-outline-dark"
											href={`/stapel/${data.deck.slug}/karten/${card._id}/bearbeiten`}
										>
											Bearbeiten
										</a>
										<a
											class="btn btn-sm btn-danger"
											href={`/stapel/${data.deck.slug}/karten/${card._id}/loeschen`}
										>
											Löschen
										</a>
									</div>
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		{/if}
	{/if}
</div>
