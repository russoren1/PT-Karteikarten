<script>
	let { data } = $props();
</script>

<svelte:head>
	<title>{data.card ? `${data.card.question} | PT Karteikarten` : 'Karte nicht gefunden | PT Karteikarten'}</title>
</svelte:head>

<div class="container py-4 py-lg-5">
	{#if !data.card}
		<div class="alert alert-warning" role="alert">
			<h1 class="h4 alert-heading">Karte nicht gefunden</h1>
			<p class="mb-3">
				Die Karte wurde nicht gefunden oder gehört nicht zum geöffneten Stapel.
			</p>
			<a class="btn btn-dark" href={`/stapel/${data.slug}`}>Zurück zum Stapel</a>
		</div>
	{:else}
		<h1 class="display-5 fw-bold mb-5">
			{data.created ? '// Neue Karte wurde erstellt!' : '// Vorschau der Karte'}
		</h1>

		{#if data.updated}
			<div class="alert alert-success" role="alert">Karte wurde gespeichert.</div>
		{/if}

		<div class="card bg-light text-dark shadow-sm">
			<div class="card-header bg-white p-4">
				<h2 class="h2 fw-bold text-uppercase mb-0">Vorschau der Karte</h2>
			</div>
			<div class="card-body p-4 p-lg-5">
				<div class="mb-4">
					<span class="badge rounded-pill text-bg-dark px-4 py-2">
						Woche {data.card.week}{#if data.card.sourceName} · {data.card.sourceName}{/if} · Folie {data.card.slide}
					</span>
				</div>

				<h3 class="h3 fw-bold mb-4">{data.card.question}</h3>

				<div class="border-top pt-4 mb-5">
					{#each data.card.answer.split('\n') as answerLine}
						{#if answerLine}
							<p class="fw-semibold mb-1">{answerLine}</p>
						{/if}
					{/each}
				</div>

				<div class="d-flex flex-column flex-lg-row align-items-lg-center gap-3">
					<a class="btn btn-dark flex-fill" href={`/stapel/${data.card.deckSlug}/karten/neu`}>
						Weitere Karte hinzufügen
					</a>
					<a
						class="btn btn-dark flex-fill"
						href={`/stapel/${data.card.deckSlug}/karten/${data.card._id}/bearbeiten`}
					>
						Bearbeiten
					</a>
					<a
						class="btn btn-danger"
						href={`/stapel/${data.card.deckSlug}/karten/${data.card._id}/loeschen`}
					>
						Löschen
					</a>
					<a class="btn btn-outline-secondary flex-fill" href={`/stapel/${data.card.deckSlug}`}>
						Zurück zum Stapel
					</a>
				</div>
			</div>
			<div class="card-footer bg-white text-center fw-semibold">
				{data.deck?.cardCount ?? 0} Karten im Stapel
			</div>
		</div>
	{/if}
</div>
