<script>
	import Breadcrumbs from '$lib/components/Breadcrumbs.svelte';

	let { data } = $props();
	let stats = $derived(data.stats);

	// --- Stapel-Filter ---
	let deckStatusFilter = $state('all');
	let deckSort = $state('due-desc');

	// --- Lernstand-Filter ---
	let snapshotDeck = $state('all');

	let overallProgress = $derived(
		stats.totalCards > 0
			? Math.round(stats.decks.reduce((s, d) => s + d.knownCount, 0) / stats.totalCards * 100)
			: 0
	);

	// --- Gefilterte Stapel ---
	let filteredDecks = $derived(
		stats.decks
			.filter(d => {
				if (deckStatusFilter === 'due') return d.dueCount > 0;
				if (deckStatusFilter === 'done') return d.dueCount === 0;
				return true;
			})
			.toSorted((a, b) => {
				if (deckSort === 'due-desc') return b.dueCount - a.dueCount;
				if (deckSort === 'alpha') return a.title.localeCompare(b.title, 'de');
				if (deckSort === 'progress-asc') {
					const pA = a.cardCount > 0 ? a.knownCount / a.cardCount : 0;
					const pB = b.cardCount > 0 ? b.knownCount / b.cardCount : 0;
					return pA - pB;
				}
				return 0;
			})
	);

	let hasDeckFiltersActive = $derived(deckStatusFilter !== 'all');

	// --- Lernstand-Snapshot ---
	let snapshotData = $derived.by(() => {
		const decks = snapshotDeck === 'all'
			? stats.decks
			: stats.decks.filter(d => d.slug === snapshotDeck);
		const total = decks.reduce((s, d) => s + d.cardCount, 0);
		const known = decks.reduce((s, d) => s + d.knownCount, 0);
		const due = decks.reduce((s, d) => s + d.dueCount, 0);
		const other = Math.max(0, total - known - due);
		const pct = (n) => total > 0 ? Math.round(n / total * 100) : 0;
		return { total, known, due, other, knownPct: pct(known), duePct: pct(due), otherPct: pct(other) };
	});

	let knownProgressStyle = $derived(`--progress-width: ${snapshotData.knownPct}%`);
	let dueProgressStyle = $derived(`--progress-width: ${snapshotData.duePct}%`);
	let otherProgressStyle = $derived(`--progress-width: ${snapshotData.otherPct}%`);

	function resetDeckFilters() {
		deckStatusFilter = 'all';
		deckSort = 'due-desc';
	}
</script>

<svelte:head>
	<title>Dashboard | PT Karteikarten</title>
</svelte:head>

<div class="container py-5">
	<Breadcrumbs
		items={[
			{ label: 'Home', href: '/' },
			{ label: 'Dashboard' }
		]}
	/>

	<p class="text-uppercase text-accent fw-semibold mb-2">Lernstatistik</p>
	<h1 class="display-5 fw-bold mb-4">Dashboard</h1>

	<!-- SEKUNDÄR-STATS -->
	<div class="row g-3 mb-4">
		<div class="col-md-3">
			<div class="card bg-light text-dark border-0 rounded-4 h-100 shadow-sm">
				<div class="card-body p-4">
					<p class="text-uppercase text-secondary fw-semibold small mb-2">Stapel</p>
					<p class="display-6 fw-bold mb-0">{stats.totalDecks}</p>
				</div>
			</div>
		</div>
		<div class="col-md-3">
			<div class="card bg-light text-dark border-0 rounded-4 h-100 shadow-sm">
				<div class="card-body p-4">
					<p class="text-uppercase text-secondary fw-semibold small mb-2">Karten</p>
					<p class="display-6 fw-bold mb-0">{stats.totalCards}</p>
				</div>
			</div>
		</div>
		<div class="col-md-3">
			<div class="card bg-light text-dark border-0 rounded-4 h-100 shadow-sm">
				<div class="card-body p-4">
					<p class="text-uppercase text-secondary fw-semibold small mb-2">Gelernt</p>
					<p class="display-6 fw-bold mb-0">{overallProgress}%</p>
				</div>
			</div>
		</div>
		<div class="col-md-3">
			<div class="card bg-light text-dark border-0 rounded-4 h-100 shadow-sm">
				<div class="card-body p-4">
					<p class="text-uppercase text-secondary fw-semibold small mb-2">Fällig</p>
					<p class="display-6 fw-bold mb-0 {stats.dueCount > 0 ? 'text-danger' : 'text-success'}">
						{stats.dueCount}
					</p>
				</div>
			</div>
		</div>
	</div>

	<!-- DEINE STAPEL -->
	<div class="card bg-light text-dark border-0 rounded-4 shadow-sm mb-4">
		<div class="card-body p-4">
			<p class="text-uppercase text-accent fw-semibold small mb-1">Training</p>
			<h2 class="h4 fw-bold mb-3">Deine Stapel</h2>

			{#if stats.decks.length > 0}
				<div class="p-3 rounded border bg-white mb-3">
					<div class="row g-2 align-items-end">
						<div class="col-sm-6 col-lg-4">
							<label class="form-label small fw-semibold" for="deckStatusFilter">Anzeigen</label>
							<select class="form-select" id="deckStatusFilter" bind:value={deckStatusFilter}>
								<option value="all">Alle Stapel</option>
								<option value="due">Hat fällige Karten</option>
								<option value="done">Vollständig gelernt</option>
							</select>
						</div>
						<div class="col-sm-6 col-lg-4">
							<label class="form-label small fw-semibold" for="deckSort">Sortieren</label>
							<select class="form-select" id="deckSort" bind:value={deckSort}>
								<option value="due-desc">Fällig (absteigend)</option>
								<option value="alpha">Alphabetisch</option>
								<option value="progress-asc">Fortschritt (aufsteigend)</option>
							</select>
						</div>
						<div class="col-auto">
							<button class="btn btn-outline-secondary" onclick={resetDeckFilters}>
								Zurücksetzen
							</button>
						</div>
					</div>
				</div>
			{/if}

			{#if stats.decks.length === 0}
				<div class="alert alert-secondary mb-0" role="alert">Noch keine Stapel vorhanden.</div>
			{:else if filteredDecks.length === 0}
				<div class="alert alert-light mb-0" role="alert">Keine Stapel für diesen Filter gefunden.</div>
			{:else}
				{#if hasDeckFiltersActive}
					<p class="text-secondary fw-semibold small mb-2">
						{filteredDecks.length} von {stats.decks.length} Stapeln angezeigt
					</p>
				{/if}
				<div class="table-responsive">
					<table class="table table-hover align-middle mb-0">
						<thead>
							<tr>
								<th scope="col">Stapel</th>
								<th scope="col">Karten</th>
								<th scope="col">Fortschritt</th>
								<th scope="col">Fällig</th>
								<th scope="col">Aktion</th>
							</tr>
						</thead>
						<tbody>
							{#each filteredDecks as deck}
								{@const pct = deck.cardCount > 0
									? Math.round((deck.knownCount / deck.cardCount) * 100)
									: 0}
								<tr>
									<th scope="row">{deck.title}</th>
									<td>{deck.cardCount}</td>
									<td>
										<span class="badge rounded-pill text-bg-success">{pct}% gelernt</span>
									</td>
									<td>
										{#if deck.dueCount > 0}
											<span class="text-danger fw-bold">{deck.dueCount}</span>
										{:else}
											<span class="text-success fw-semibold">✓</span>
										{/if}
									</td>
									<td>
										{#if deck.dueCount > 0}
											<a class="btn btn-sm btn-accent" href="/stapel/{deck.slug}/lernen">
												Lernen →
											</a>
										{:else}
											<a class="btn btn-sm btn-outline-secondary" href="/stapel/{deck.slug}">
												Ansehen
											</a>
										{/if}
									</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			{/if}
		</div>
	</div>

	<!-- SCHWÄCHSTE KARTEN + NOCH NICHT GELERNT -->
	<div class="row g-4 mb-4">
		<div class="col-lg-6">
			<div class="card bg-light text-dark border-0 rounded-4 h-100 shadow-sm">
				<div class="card-body p-4">
					<p class="text-uppercase text-accent fw-semibold small mb-1">Fokus</p>
					<h2 class="h4 fw-bold mb-1">Schwächste Karten</h2>
					<p class="text-secondary small mb-3">Karten, die du oft als nicht gewusst markiert hast</p>
					{#if stats.repeatedCards.length === 0}
						<p class="text-secondary mb-0">Noch keine Daten vorhanden.</p>
					{:else}
						<div class="list-group list-group-flush">
							{#each stats.repeatedCards as card}
								<a
									class="list-group-item list-group-item-action"
									href="/stapel/{card.deckSlug}/karten/{card._id}"
								>
									<div class="d-flex justify-content-between align-items-start gap-3">
										<span class="fw-semibold">{card.question}</span>
										<span class="badge text-bg-danger rounded-pill flex-shrink-0">{card.repeatCount}×</span>
									</div>
									<small class="text-secondary">
										{card.deckTitle} · Woche {card.week} · Folie/Seite {card.slide}
									</small>
								</a>
							{/each}
						</div>
					{/if}
				</div>
			</div>
		</div>

		<div class="col-lg-6">
			<div class="card bg-light text-dark border-0 rounded-4 h-100 shadow-sm">
				<div class="card-body p-4">
					<p class="text-uppercase text-accent fw-semibold small mb-1">Grundlagen</p>
					<h2 class="h4 fw-bold mb-1">Noch nicht gelernt</h2>
					<p class="text-secondary small mb-3">
						Karten in der frühesten Lernstufe – hier besteht noch Nachholbedarf
					</p>
					{#if stats.lowLeitnerCards.length === 0}
						<p class="text-secondary mb-0">Alle Karten sind gut gelernt.</p>
					{:else}
						<div class="list-group list-group-flush">
							{#each stats.lowLeitnerCards as card}
								<a
									class="list-group-item list-group-item-action"
									href="/stapel/{card.deckSlug}/karten/{card._id}"
								>
									<div class="d-flex justify-content-between align-items-start gap-3">
										<span class="fw-semibold">{card.question}</span>
										<span class="badge text-bg-secondary rounded-pill flex-shrink-0">
											Stufe {card.leitnerBox}
										</span>
									</div>
									<small class="text-secondary">
										{card.deckTitle} · Woche {card.week} · Folie/Seite {card.slide}
									</small>
								</a>
							{/each}
						</div>
					{/if}
				</div>
			</div>
		</div>
	</div>

	<!-- LERNSTAND -->
	<div class="card bg-light text-dark border-0 rounded-4 shadow-sm">
		<div class="card-body p-4">
			<p class="text-uppercase text-accent fw-semibold small mb-1">Überblick</p>
			<h2 class="h4 fw-bold mb-3">Lernstand</h2>

			<div class="p-3 rounded border bg-white mb-4">
				<div class="row g-2 align-items-end">
					<div class="col-sm-6 col-lg-4">
						<label class="form-label small fw-semibold" for="snapshotDeck">Stapel</label>
						<select class="form-select" id="snapshotDeck" bind:value={snapshotDeck}>
							<option value="all">Alle Stapel</option>
							{#each stats.decks as deck}
								<option value={deck.slug}>{deck.title}</option>
							{/each}
						</select>
					</div>
					<div class="col-auto">
						<button class="btn btn-outline-secondary" onclick={() => snapshotDeck = 'all'}>
							Zurücksetzen
						</button>
					</div>
				</div>
			</div>

			{#if snapshotData.total === 0}
				<p class="text-secondary mb-0">Keine Karten vorhanden.</p>
			{:else}
				<div class="row g-3">
					<div class="col-md-4">
						<div class="border rounded-4 bg-white p-3 h-100">
							<p class="fw-semibold text-success mb-1">Bekannt</p>
							<div class="d-flex justify-content-between align-items-baseline gap-3 mb-2">
								<p class="h4 fw-bold mb-0">{snapshotData.known}</p>
								<span class="badge rounded-pill text-bg-success">{snapshotData.knownPct}%</span>
							</div>
							<div class="progress app-progress" role="progressbar" aria-valuenow={snapshotData.knownPct} aria-valuemin="0" aria-valuemax="100">
								<div class="progress-bar bg-success app-progress-bar" style={knownProgressStyle}></div>
							</div>
						</div>
					</div>

					<div class="col-md-4">
						<div class="border rounded-4 bg-white p-3 h-100">
							<p class="fw-semibold text-danger mb-1">Zu wiederholen</p>
							<div class="d-flex justify-content-between align-items-baseline gap-3 mb-2">
								<p class="h4 fw-bold mb-0">{snapshotData.due}</p>
								<span class="badge rounded-pill text-bg-danger">{snapshotData.duePct}%</span>
							</div>
							<div class="progress app-progress" role="progressbar" aria-valuenow={snapshotData.duePct} aria-valuemin="0" aria-valuemax="100">
								<div class="progress-bar bg-danger app-progress-bar" style={dueProgressStyle}></div>
							</div>
						</div>
					</div>

					<div class="col-md-4">
						<div class="border rounded-4 bg-white p-3 h-100">
							<p class="fw-semibold text-secondary mb-1">Noch nicht gestartet</p>
							<div class="d-flex justify-content-between align-items-baseline gap-3 mb-2">
								<p class="h4 fw-bold mb-0">{snapshotData.other}</p>
								<span class="badge rounded-pill text-bg-secondary">{snapshotData.otherPct}%</span>
							</div>
							<div class="progress app-progress" role="progressbar" aria-valuenow={snapshotData.otherPct} aria-valuemin="0" aria-valuemax="100">
								<div class="progress-bar bg-secondary app-progress-bar" style={otherProgressStyle}></div>
							</div>
						</div>
					</div>
				</div>
			{/if}
		</div>
	</div>
</div>
