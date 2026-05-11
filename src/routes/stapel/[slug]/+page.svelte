<script>
	import { goto } from '$app/navigation';
	import Breadcrumbs from '$lib/components/Breadcrumbs.svelte';

	let { data } = $props();
	let filterForm = $state();
	let filterSubmitTimeout;

	function openCard(event, href) {
		if (event.target instanceof HTMLElement && event.target.closest('a, button')) {
			return;
		}

		window.location.href = href;
	}

	function openCardWithKeyboard(event, href) {
		if (event.key !== 'Enter' && event.key !== ' ') {
			return;
		}

		event.preventDefault();
		openCard(event, href);
	}

	function submitFilters() {
		const params = new URLSearchParams(new FormData(filterForm));
		for (const [key, value] of [...params]) {
			if (!value) params.delete(key);
		}
		goto(`?${params.toString()}`, { replaceState: true, noScroll: true, keepFocus: true });
	}

	function submitFiltersDebounced() {
		clearTimeout(filterSubmitTimeout);
		filterSubmitTimeout = setTimeout(submitFilters, 450);
	}
</script>

<svelte:head>
	<title>
		{data.deck ? `${data.deck.title} | PT Karteikarten` : 'Stapel nicht gefunden | PT Karteikarten'}
	</title>
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
				{ label: data.deck.title }
			]}
		/>

		<div class="d-flex flex-column flex-lg-row justify-content-between align-items-lg-start gap-3 mb-4">
			<div>
				<h1 class="display-5 fw-bold mb-3">// {data.deck.title}</h1>
				<div class="d-flex flex-wrap gap-2">
					<span class="badge text-bg-light">{data.deck.semester}</span>
					<span class="badge text-bg-light">{data.deck.cardCount} Karten</span>
					{#if data.deck.isNew}
						<span class="badge rounded-pill text-bg-success">Neu</span>
					{/if}
				</div>
			</div>

			<div class="d-flex flex-wrap gap-2">
				<a class="btn btn-success btn-lg fw-semibold" href={`/stapel/${data.deck.slug}/karten/neu`}>
					+ Neue Karte
				</a>
				<a class="btn btn-light btn-lg fw-semibold" href={`/stapel/${data.deck.slug}/bearbeiten`}>
					Bearbeiten
				</a>
				<a class="btn btn-danger btn-lg fw-semibold" href={`/stapel/${data.deck.slug}/loeschen`}>
					Löschen
				</a>
			</div>
		</div>

		<div class="mb-5">
			<a class="btn btn-dark btn-lg border border-light shadow-sm w-100 py-4 fw-bold" href={`/stapel/${data.deck.slug}/lernen`}>
				⚡ JETZT LERNEN
			</a>
		</div>

		{#if data.deleted}
			<div class="alert alert-success" role="alert">Karte wurde gelöscht.</div>
		{/if}

		{#if data.deckUpdated}
			<div class="alert alert-success" role="alert">Stapel wurde gespeichert.</div>
		{/if}

		<form class="card bg-light text-dark shadow-sm mb-4" method="GET" bind:this={filterForm}>
			<div class="card-body">
				<h2 class="h5 fw-bold mb-3">Karten filtern</h2>

				<div class="row g-3">
					<div class="col-lg-4">
						<label class="form-label" for="q">Frage oder Antwort suchen</label>
						<input
							class="form-control"
							id="q"
							name="q"
							placeholder="z.B. Diversifikation"
							value={data.filters.q}
							oninput={submitFiltersDebounced}
						/>
					</div>

					<div class="col-sm-6 col-lg-2">
						<label class="form-label" for="week">Woche</label>
						<input
							class="form-control"
							id="week"
							name="week"
							type="number"
							min="1"
							step="1"
							placeholder="10"
							value={data.filters.week}
							oninput={submitFiltersDebounced}
						/>
					</div>

					<div class="col-sm-6 col-lg-2">
						<label class="form-label" for="sourceName">Dateiname</label>
						<input
							class="form-control"
							id="sourceName"
							name="sourceName"
							placeholder="z.B. Vorlesung 10.pdf"
							value={data.filters.sourceName}
							oninput={submitFiltersDebounced}
						/>
					</div>

					<div class="col-sm-6 col-lg-2">
						<label class="form-label" for="status">Status</label>
						<select
							class="form-select"
							id="status"
							name="status"
							value={data.filters.status}
							onchange={submitFilters}
						>
							<option value="">Alle</option>
							<option value="new">Neu</option>
							<option value="known">Gewusst</option>
							<option value="repeat">Repetieren</option>
						</select>
					</div>

					<div class="col-sm-6 col-lg-2">
						<label class="form-label" for="sort">Sortieren</label>
						<select
							class="form-select"
							id="sort"
							name="sort"
							value={data.filters.sort}
							onchange={submitFilters}
						>
							<option value="week-asc">Woche aufsteigend</option>
							<option value="week-desc">Woche absteigend</option>
							<option value="sourceName">Dateiname</option>
							<option value="slide">Folie/Seite</option>
							<option value="status">Status</option>
						</select>
					</div>
				</div>

				<div class="d-flex flex-column flex-md-row gap-2 mt-4">
					<a class="btn btn-outline-secondary" href={`/stapel/${data.deck.slug}`}>Zurücksetzen</a>
				</div>
			</div>
		</form>

		{#if data.cards.length === 0}
			{#if data.hasActiveFilters}
				<div class="alert alert-light" role="alert">Keine Karten für diese Filter gefunden.</div>
			{:else}
				<div class="alert alert-light" role="alert">
					<p class="mb-3">Dieser Stapel enthält noch keine Karten.</p>
					<a class="btn btn-dark" href={`/stapel/${data.deck.slug}/karten/neu`}>
						Erste Karte erstellen
					</a>
				</div>
			{/if}
		{:else}
			{#if data.hasActiveFilters}
				<p class="text-light fw-semibold mb-3">
					{data.cards.length} von {data.totalCardCount} Karten angezeigt
				</p>
			{/if}

			<div class="table-responsive shadow-sm">
				<table class="table table-light table-bordered table-hover align-middle mb-0">
					<thead class="table-secondary">
						<tr>
							<th scope="col">Frage</th>
							<th class="text-center" scope="col">Woche</th>
							<th class="text-center" scope="col">Folie/Seite</th>
							<th class="text-center" scope="col">Aktion</th>
						</tr>
					</thead>
					<tbody>
						{#each data.cards as card (card._id)}
							<tr
								tabindex="0"
								role="link"
								onclick={(event) => openCard(event, `/stapel/${data.deck.slug}/karten/${card._id}`)}
								onkeydown={(event) =>
									openCardWithKeyboard(event, `/stapel/${data.deck.slug}/karten/${card._id}`)}
							>
								<td>
									<a
										class="link-dark link-offset-2 link-underline-opacity-0 link-underline-opacity-100-hover d-flex flex-wrap align-items-center gap-2"
										href={`/stapel/${data.deck.slug}/karten/${card._id}`}
									>
										<span>{card.question || 'Ohne Frage'}</span>
										{#if card.isNew}
											<span class="badge rounded-pill text-bg-success">Neu</span>
										{/if}
										{#if card.imageUrl}
											<span class="badge rounded-pill text-bg-secondary">🖼</span>
										{/if}
									</a>
								</td>
								<td class="text-center">{card.week ?? '-'}</td>
								<td class="text-center">{card.slide ?? '-'}</td>
								<td>
									<div class="d-flex flex-column flex-lg-row justify-content-center gap-2">
										<a
											class="btn btn-sm btn-outline-dark"
											href={`/stapel/${data.deck.slug}/karten/${card._id}/bearbeiten`}
										>
											Bearbeiten
										</a>
										<a
											class="btn btn-sm btn-danger"
											href={`/stapel/${data.deck.slug}/karten/${card._id}/loeschen`}
										>
											Löschen
										</a>
									</div>
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		{/if}
	{/if}
</div>
