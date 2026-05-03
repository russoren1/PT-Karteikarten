<script>
	import FlashcardForm from '$lib/components/FlashcardForm.svelte';

	let { data, form } = $props();
</script>

<svelte:head>
	<title>{data.card ? `Karte bearbeiten | ${data.card.question}` : 'Karte nicht gefunden | PT Karteikarten'}</title>
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
			<h1 class="display-5 fw-bold mb-3">// Karte bearbeiten</h1>
			<div class="d-flex flex-wrap gap-2">
				<span class="badge text-bg-light">{data.card.deckTitle}</span>
				<span class="badge text-bg-light">{data.card.semester}</span>
			</div>
		</div>

		<FlashcardForm
			values={form?.values ?? data.card}
			error={form?.error ?? ''}
			submitLabel="Speichern"
			formAction="?/updateCard"
			cancelHref={`/stapel/${data.card.deckSlug}/karten/${data.card._id}`}
			cancelLabel="Zurück zur Vorschau"
			sourceNames={data.sourceNames}
		/>
	{/if}
</div>
