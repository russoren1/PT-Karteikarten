<script>
	let { deck } = $props();
</script>

<div class="card deck-card h-100 bg-light text-dark border-0 rounded-4 shadow-sm">
	<div class="card-body d-flex flex-column p-4">
		<div class="d-flex align-items-start justify-content-between gap-3 mb-4">
			<h2 class="h4 card-title fw-bold mb-0">{deck.title}</h2>
			{#if deck.isNew}
				<span class="badge rounded-pill text-bg-success">Neu</span>
			{/if}
		</div>

		<div class="mt-auto mb-4 pt-4">
			<p class="fw-bold text-secondary mb-1">{deck.semester}</p>
			<p class="text-body-tertiary mb-0">{deck.cardCount} Karten</p>
		</div>

		<a class="btn btn-dark fw-semibold w-100" href={`/stapel/${deck.slug}`}>Öffnen →</a>
	</div>
</div>

<style>

</style>
