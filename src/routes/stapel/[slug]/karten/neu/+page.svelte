<script>
	import Breadcrumbs from '$lib/components/Breadcrumbs.svelte';
	import FlashcardForm from '$lib/components/FlashcardForm.svelte';

	let { data, form } = $props();
</script>

<svelte:head>
	<title>Neue Karte | PT Karteikarten</title>
</svelte:head>

<div class="container py-5">
	{#if !data.deck}
		<div class="alert alert-warning" role="alert">
			<h1 class="h4 alert-heading">Stapel nicht gefunden</h1>
			<p class="mb-3">
				Für den Slug <strong>{data.slug}</strong> wurde kein Stapel in MongoDB gefunden.
			</p>
			<a class="btn btn-dark" href="/stapel">Zurück zur Stapelübersicht</a>
		</div>
	{:else}
		<Breadcrumbs
			items={[
				{ label: 'Home', href: '/' },
				{ label: 'Stapel', href: '/stapel' },
				{ label: data.deck.title, href: `/stapel/${data.deck.slug}` },
				{ label: 'Neue Karte' }
			]}
		/>

		<div class="mb-4">
			<p class="text-uppercase text-accent fw-semibold mb-2">Karte erstellen</p>
			<h1 class="display-5 fw-bold mb-3">Neue Karte</h1>
			<div class="d-flex flex-wrap gap-2">
				<span class="badge text-bg-light">{data.deck.title}</span>
				<span class="badge text-bg-light">{data.deck.semester}</span>
			</div>
		</div>

		<FlashcardForm
			values={form?.values ?? {}}
			error={form?.error ?? ''}
			submitLabel="Karte erstellen"
			formAction="?/createCard"
			cancelHref={`/stapel/${data.deck.slug}`}
			sourceNames={data.sourceNames}
		/>
	{/if}
</div>
