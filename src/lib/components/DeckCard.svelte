<script>
	let { deck } = $props();
</script>

<div class="card deck-card h-100 bg-light text-dark shadow-sm m-4">
	<div class="card-body d-flex flex-column">
		<h2 class="h4 card-title fw-bold mb-0">{deck.title}</h2>

		<div class="mt-auto mb-4">
			<p class="fw-semibold text-secondary mb-1">{deck.semester}</p>
			<p class="text-body-tertiary mb-0">{deck.cardCount} Karten</p>
		</div>

		<a class="btn btn-dark w-100" href={`/stapel/${deck.id}`}>⚡ Öffnen</a>
	</div>
</div>

<style>

</style>