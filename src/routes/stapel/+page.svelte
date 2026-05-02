<script>
	import DeckCard from '$lib/components/DeckCard.svelte';

	const decks = [
		{
			id: 'strategisches-management',
			title: 'Strategisches Management',
			semester: 'FS 26',
			cardCount: 112
		},
		{
			id: 'prototyping',
			title: 'Prototyping',
			semester: 'FS 26',
			cardCount: 221
		},
		{
			id: 'data-management',
			title: 'Data Management',
			semester: 'FS 26',
			cardCount: 188
		},
		{
			id: 'it-project-management',
			title: 'IT Project Management',
			semester: 'FS 26',
			cardCount: 112
		},
		{
			id: 'statistik',
			title: 'Statistik',
			semester: 'HS 25',
			cardCount: 290
		},
		{
			id: 'financial-management',
			title: 'Financial Management',
			semester: 'HS 25',
			cardCount: 248
		}
	];
</script>

<section class="container stack-overview">
	<div class="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3 mb-5">
		<div>
			<h1 class="display-6 fw-bold page-title mb-0">// Meine Stapel</h1>
		</div>

		<div class="d-flex flex-wrap align-items-start gap-3">
			<button class="btn app-action-button fw-semibold" type="button">Neuer Stapel</button>
			<button class="btn app-action-button fw-semibold" type="button">CSV Import</button>
		</div>
	</div>

	<div class="row g-4 g-xl-5">
		{#each decks as deck (deck.id)}
			<div class="col-md-6 col-lg-4">
				<DeckCard {deck} />
			</div>
		{/each}
	</div>
</section>
