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
				<button class="btn btn-success btn-lg fw-semibold" type="button" disabled>
					+ Neue Karte
				</button>
				<button class="btn btn-light btn-lg fw-semibold" type="button" disabled>
					Bearbeiten
				</button>
				<button class="btn btn-danger btn-lg fw-semibold" type="button" disabled>
					Löschen
				</button>
			</div>
		</div>

		<div class="mb-5">
			<button class="btn btn-dark btn-lg border border-light shadow-sm w-100 py-4 fw-bold" type="button" disabled>
				⚡ JETZT LERNEN
			</button>
		</div>

		{#if data.cards.length === 0}
			<div class="alert alert-light" role="alert">
				Dieser Stapel enthält noch keine Karten. Später kannst du sie über „Neue Karte“ erfassen.
			</div>
		{:else}
			<div class="table-responsive shadow-sm">
				<table class="table table-light table-bordered table-hover align-middle mb-0">
					<thead class="table-secondary">
						<tr>
							<th scope="col">Frage</th>
							<th class="text-center" scope="col">Woche</th>
							<th class="text-center" scope="col">Folie/Seite</th>
						</tr>
					</thead>
					<tbody>
						{#each data.cards as card (card._id)}
							<tr>
								<td>{card.question || 'Ohne Frage'}</td>
								<td class="text-center">{card.week ?? '-'}</td>
								<td class="text-center">{card.slide ?? '-'}</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		{/if}
	{/if}
</div>
