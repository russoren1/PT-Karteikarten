<script>
	import Breadcrumbs from '$lib/components/Breadcrumbs.svelte';

	let { data, form } = $props();
</script>

<svelte:head>
	<title>{data.deck ? 'Stapel löschen | PT Karteikarten' : 'Stapel nicht gefunden | PT Karteikarten'}</title>
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
				{ label: 'Löschen' }
			]}
		/>

		<div class="mb-4">
			<p class="text-uppercase text-accent fw-semibold mb-2">Stapel löschen</p>
			<h1 class="display-5 fw-bold mb-3">Stapel löschen</h1>
			<div class="d-flex flex-wrap gap-2">
				<span class="badge text-bg-light">{data.deck.title}</span>
				<span class="badge text-bg-light">{data.deck.semester}</span>
				<span class="badge text-bg-light">{data.deck.cardCount} Karten</span>
			</div>
		</div>

		<div class="card bg-light text-dark border-0 rounded-4 shadow-sm">
			<div class="card-body p-4 p-lg-5">
				{#if form?.error}
					<div class="alert alert-danger" role="alert">{form.error}</div>
				{/if}

				<div class="alert alert-danger" role="alert">
					Dieser Stapel und alle enthaltenen Karten werden dauerhaft gelöscht und können nicht rückgängig gemacht werden!
				</div>

				<h2 class="h4 fw-bold mb-3">{data.deck.title}</h2>
				<p class="mb-4">
					Dieser Stapel enthält aktuell {data.deck.cardCount} Karten.
				</p>

				<div class="d-flex flex-column flex-md-row gap-2">
					<form method="POST" action="?/deleteDeck" class="flex-fill">
						<button class="btn btn-danger fw-semibold w-100" type="submit">
							Stapel löschen
						</button>
					</form>
					<a class="btn btn-outline-secondary flex-fill" href={`/stapel/${data.deck.slug}`}>
						Abbrechen
					</a>
				</div>
			</div>
		</div>
	{/if}
</div>
