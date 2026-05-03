<script>
	import DeckCard from '$lib/components/DeckCard.svelte';

	let { data } = $props();
</script>

<div class="container">
	<div class="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3 m-4">
		<div>
			<h1 class="display-6 fw-bold m-4">// Meine Stapel</h1>
		</div>

		<div class="d-flex flex-wrap align-items-start gap-3">
			<button class="btn btn-success fw-semibold" type="button">Neuer Stapel</button>
			<button class="btn btn-success fw-semibold" type="button">CSV Import</button>
		</div>
	</div>

	{#if data.decks.length === 0}
		<div class="alert alert-light" role="alert">
			Noch keine Karteikarten gefunden. Lege zuerst Dokumente in MongoDB Atlas an.
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
