<script>
	let { deck } = $props();
</script>

<article class="card h-100 bg-light text-dark border-0 shadow-sm">
	<div class="card-body d-flex flex-column gap-3">
		<div>
			<span class="badge text-bg-secondary mb-3">{deck.module}</span>
			<h2 class="h4 card-title mb-2">{deck.title}</h2>
			<p class="card-text text-body-secondary mb-0">{deck.description}</p>
		</div>

		<div class="d-flex justify-content-between align-items-center mt-auto">
			<span class="badge text-bg-primary">{deck.cardCount} Karten</span>
			<a class="btn btn-primary" href={`/stapel/${deck.id}`}>Öffnen</a>
		</div>
	</div>
</article>
