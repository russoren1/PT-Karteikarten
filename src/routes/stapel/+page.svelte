<script>
	import DeckCard from '$lib/components/DeckCard.svelte';

	let { data, form } = $props();
	let showCreateDeckForm = $state(false);
</script>

<div class="container">
	<div class="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3 m-4">
		<div>
			<h1 class="display-6 fw-bold m-4">// Meine Stapel</h1>
		</div>

		<div class="d-flex flex-wrap align-items-start gap-3">
			<button
				class="btn btn-success fw-semibold"
				type="button"
				onclick={() => (showCreateDeckForm = !showCreateDeckForm)}
			>
				Neuer Stapel
			</button>
			<button class="btn btn-success fw-semibold" type="button">CSV Import</button>
		</div>
	</div>

	{#if showCreateDeckForm || form?.error}
		<form class="card bg-light text-dark shadow-sm mb-4" method="POST" action="?/createDeck">
			<div class="card-body">
				<h2 class="h5 card-title mb-3">Neuen Stapel erstellen</h2>

				{#if form?.error}
					<div class="alert alert-danger" role="alert">{form.error}</div>
				{/if}

				<div class="row g-3">
					<div class="col-md-8">
						<label class="form-label" for="deckTitle">Titel des Stapels</label>
						<input
							class="form-control"
							id="deckTitle"
							name="deckTitle"
							placeholder="Strategisches Management"
							value={form?.deckTitle ?? ''}
							required
						/>
					</div>

					<div class="col-md-4">
						<label class="form-label" for="semester">Semester</label>
						<input
							class="form-control"
							id="semester"
							name="semester"
							placeholder="FS 26"
							value={form?.semester ?? ''}
							required
						/>
					</div>
				</div>

				<div class="d-flex flex-wrap gap-2 mt-4">
					<button class="btn btn-success fw-semibold" type="submit">Stapel erstellen</button>
					<button
						class="btn btn-outline-secondary"
						type="button"
						onclick={() => (showCreateDeckForm = false)}
					>
						Abbrechen
					</button>
				</div>
			</div>
		</form>
	{:else if form?.error}
		<div class="alert alert-danger" role="alert">{form.error}</div>
	{/if}

	{#if data.deckDeleted}
		<div class="alert alert-success" role="alert">Stapel wurde gelöscht.</div>
	{/if}

	{#if data.decks.length === 0}
		<div class="alert alert-light" role="alert">
			Noch keine Stapel vorhanden. Erstelle deinen ersten Stapel über den Button "Neuer Stapel".
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
