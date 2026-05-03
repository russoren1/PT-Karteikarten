<script>
	import Breadcrumbs from '$lib/components/Breadcrumbs.svelte';

	let { data, form } = $props();
</script>

<svelte:head>
	<title>{data.deck ? `Stapel bearbeiten | ${data.deck.title}` : 'Stapel nicht gefunden | PT Karteikarten'}</title>
</svelte:head>

<div class="container py-4 py-lg-5">
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
				{ label: 'Bearbeiten' }
			]}
		/>

		<div class="mb-4">
			<h1 class="display-5 fw-bold mb-3">// Stapel bearbeiten</h1>
			<div class="d-flex flex-wrap gap-2">
				<span class="badge text-bg-light">{data.deck.title}</span>
				<span class="badge text-bg-light">{data.deck.cardCount} Karten</span>
			</div>
		</div>

		<form class="card bg-light text-dark shadow-sm" method="POST" action="?/updateDeck">
			<div class="card-body p-4">
				{#if form?.error}
					<div class="alert alert-danger" role="alert">{form.error}</div>
				{/if}

				<div class="mb-4">
					<label class="form-label fw-semibold" for="deckTitle">Titel des Stapels</label>
					<input
						class="form-control"
						id="deckTitle"
						name="deckTitle"
						placeholder="z.B. Strategisches Management"
						value={form?.deckTitle ?? data.deck.title}
						required
					/>
				</div>

				<div class="mb-4">
					<label class="form-label fw-semibold" for="semester">Semester</label>
					<input
						class="form-control"
						id="semester"
						name="semester"
						placeholder="z.B. FS 26"
						value={form?.semester ?? data.deck.semester}
						required
					/>
				</div>

				<div class="d-flex flex-column flex-md-row gap-2">
					<button class="btn btn-dark fw-semibold flex-fill" type="submit">Speichern</button>
					<a class="btn btn-outline-secondary flex-fill" href={`/stapel/${data.deck.slug}`}>
						Abbrechen
					</a>
				</div>
			</div>
		</form>
	{/if}
</div>
