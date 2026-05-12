<script>
	import Breadcrumbs from '$lib/components/Breadcrumbs.svelte';

	let { data } = $props();
</script>

<svelte:head>
	<title>{data.card ? `${data.card.question} | PT Karteikarten` : 'Karte nicht gefunden | PT Karteikarten'}</title>
</svelte:head>

<div class="container py-5">
	{#if !data.card}
		<div class="alert alert-warning" role="alert">
			<h1 class="h4 alert-heading">Karte nicht gefunden</h1>
			<p class="mb-3">
				Die Karte wurde nicht gefunden oder gehört nicht zum geöffneten Stapel.
			</p>
			<a class="btn btn-dark" href={`/stapel/${data.slug}`}>Zurück zum Stapel</a>
		</div>
	{:else}
		<Breadcrumbs
			items={[
				{ label: 'Home', href: '/' },
				{ label: 'Stapel', href: '/stapel' },
				{ label: data.card.deckTitle, href: `/stapel/${data.card.deckSlug}` },
				{ label: 'Karte' }
			]}
		/>

		<p class="text-uppercase text-accent fw-semibold mb-2">Kartenansicht</p>
		<h1 class="display-5 fw-bold mb-5">
			{data.created ? 'Neue Karte wurde erstellt!' : 'Vorschau der Karte'}
		</h1>

		{#if data.updated}
			<div class="alert alert-success" role="alert">Karte wurde gespeichert.</div>
		{/if}

		<div class="card bg-light text-dark border-0 rounded-4 shadow-sm overflow-hidden">
			<div class="card-body p-4 p-lg-5">
				<h2 class="display-6 fw-bold mb-5">{data.card.question}</h2>

				<div class="border-top border-2 pt-4 mb-4">
					{#each data.card.answer.split('\n') as answerLine}
						{#if answerLine}
							<p class="fs-3 lh-base mb-3">{answerLine}</p>
						{/if}
					{/each}

					{#if data.card.imageUrl}
						<div class="mt-4 text-center">
							<img
								src={data.card.imageUrl}
								class="img-fluid rounded shadow-sm flashcard-media"
								alt="Vorlesungsbild"
							/>
						</div>
					{/if}
				</div>

				<div class="border-start border-4 border-accent rounded-4 bg-white p-4 mt-4 mb-5">
					<p class="text-uppercase text-accent fw-semibold small mb-3">Vorlesungskontext</p>
					<div class="d-flex flex-wrap gap-2">
						<span class="badge rounded-pill text-bg-dark fs-6 px-3 py-2">Woche {data.card.week}</span>
						{#if data.card.sourceName}
							<span class="badge rounded-pill text-bg-dark fs-6 px-3 py-2">{data.card.sourceName}</span>
						{/if}
						<span class="badge rounded-pill text-bg-dark fs-6 px-3 py-2">Folie/Seite {data.card.slide}</span>
						{#if data.card.isNew}
							<span class="badge rounded-pill text-bg-success fs-6 px-3 py-2">Neu</span>
						{/if}
					</div>
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
