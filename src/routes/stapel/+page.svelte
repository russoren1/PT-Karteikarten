<script>
	import DeckCard from '$lib/components/DeckCard.svelte';

	const decks = [
		{
			id: 'strategisches-management',
			title: 'Strategisches Management',
			module: 'Modul',
			description: 'Karten zu Diversifikation, Wettbewerbsvorteilen und Unternehmensstrategie.',
			cardCount: 18
		},
		{
			id: 'statistik',
			title: 'Statistik',
			module: 'Modul',
			description: 'Grundlagen zu Verteilungen, Hypothesentests und Kennzahlen.',
			cardCount: 12
		},
		{
			id: 'mathematik',
			title: 'Mathematik',
			module: 'Modul',
			description: 'Wichtige Begriffe, Formeln und Rechenschritte aus den Vorlesungen.',
			cardCount: 9
		}
	];
</script>

<section class="container">
	<div class="d-flex flex-column flex-lg-row justify-content-between gap-3 mb-4">
		<div>
			<span class="badge text-bg-primary mb-3">Dashboard</span>
			<h1 class="display-6 fw-bold mb-2">Meine Stapel</h1>
			<p class="text-light-emphasis mb-0">
				Wähle einen Lernstapel und arbeite mit Karteikarten, die ihren Vorlesungskontext
				behalten.
			</p>
		</div>

		<div class="d-flex flex-wrap align-items-start gap-2">
			<button class="btn btn-outline-light" type="button">Neuer Stapel</button>
			<button class="btn btn-secondary" type="button">CSV importieren</button>
		</div>
	</div>

	<div class="row g-4">
		{#each decks as deck (deck.id)}
			<div class="col-md-6 col-xl-4">
				<DeckCard {deck} />
			</div>
		{/each}
	</div>
</section>
