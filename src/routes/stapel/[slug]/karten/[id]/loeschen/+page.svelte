<script>
	let { data, form } = $props();
</script>

<svelte:head>
	<title>{data.card ? 'Karte löschen | PT Karteikarten' : 'Karte nicht gefunden | PT Karteikarten'}</title>
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
		<div class="mb-4">
			<h1 class="display-5 fw-bold mb-3">// Karte löschen</h1>
			<div class="d-flex flex-wrap gap-2">
				<span class="badge text-bg-light">{data.card.deckTitle}</span>
				<span class="badge text-bg-light">Woche {data.card.week}</span>
				<span class="badge text-bg-light">Folie {data.card.slide}</span>
			</div>
		</div>

		<div class="card bg-light text-dark shadow-sm">
			<div class="card-body p-4">
				{#if form?.error}
					<div class="alert alert-danger" role="alert">{form.error}</div>
				{/if}

				<div class="alert alert-danger" role="alert">
					Diese Karte wird dauerhaft gelöscht und kann nicht rückgängig gemacht werden!
				</div>

				<h2 class="h4 fw-bold mb-3">{data.card.question}</h2>
				<p class="mb-4">{data.card.answer}</p>

				<div class="d-flex flex-column flex-md-row gap-2">
					<form method="POST" action="?/deleteCard" class="flex-fill">
						<button class="btn btn-danger fw-semibold w-100" type="submit">
							Karte löschen
						</button>
					</form>
					<a class="btn btn-outline-secondary flex-fill" href={`/stapel/${data.card.deckSlug}`}>
						Abbrechen
					</a>
				</div>
			</div>
		</div>
	{/if}
</div>
