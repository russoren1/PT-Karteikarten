<script>
	import Breadcrumbs from '$lib/components/Breadcrumbs.svelte';

	let { data } = $props();
	let stats = $derived(data.stats);
</script>

<svelte:head>
	<title>Dashboard | PT Karteikarten</title>
</svelte:head>

<div class="container py-4 py-lg-5">
	<Breadcrumbs
		items={[
			{ label: 'Home', href: '/' },
			{ label: 'Dashboard' }
		]}
	/>

	<h1 class="display-6 fw-bold mb-4">// Dashboard</h1>

	<div class="row g-3 mb-4">
		<div class="col-6 col-lg-3">
			<div class="card bg-light text-dark h-100 shadow-sm">
				<div class="card-body">
					<p class="text-secondary fw-semibold mb-1">Stapel</p>
					<p class="display-6 fw-bold mb-0">{stats.totalDecks}</p>
				</div>
			</div>
		</div>
		<div class="col-6 col-lg-3">
			<div class="card bg-light text-dark h-100 shadow-sm">
				<div class="card-body">
					<p class="text-secondary fw-semibold mb-1">Karten</p>
					<p class="display-6 fw-bold mb-0">{stats.totalCards}</p>
				</div>
			</div>
		</div>
		<div class="col-6 col-lg-3">
			<div class="card bg-light text-dark h-100 shadow-sm">
				<div class="card-body">
					<p class="text-secondary fw-semibold mb-1">Fällig</p>
					<p class="display-6 fw-bold mb-0">{stats.dueCount}</p>
				</div>
			</div>
		</div>
		<div class="col-6 col-lg-3">
			<div class="card bg-light text-dark h-100 shadow-sm">
				<div class="card-body">
					<p class="text-secondary fw-semibold mb-1">Repetieren</p>
					<p class="display-6 fw-bold mb-0">{stats.repeatCount}</p>
				</div>
			</div>
		</div>
	</div>

	<div class="card bg-light text-dark shadow-sm mb-4">
		<div class="card-body p-4">
			<h2 class="h4 fw-bold mb-3">Stapelübersicht</h2>

			{#if stats.decks.length === 0}
				<div class="alert alert-secondary mb-0" role="alert">
					Noch keine Stapel vorhanden.
				</div>
			{:else}
				<div class="table-responsive">
					<table class="table table-hover align-middle mb-0">
						<thead>
							<tr>
								<th scope="col">Stapel</th>
								<th scope="col">Karten</th>
								<th scope="col">Fällig</th>
								<th scope="col">Gewusst</th>
								<th scope="col">Repetieren</th>
								<th scope="col">Leitner Ø</th>
								<th scope="col">Aktion</th>
							</tr>
						</thead>
						<tbody>
							{#each stats.decks as deck}
								<tr>
									<th scope="row">{deck.title}</th>
									<td>{deck.cardCount}</td>
									<td>{deck.dueCount}</td>
									<td>{deck.knownCount}</td>
									<td>{deck.repeatCount}</td>
									<td>{deck.averageLeitnerBox || '-'}</td>
									<td>
										<a class="btn btn-sm btn-outline-dark" href={`/stapel/${deck.slug}`}>Öffnen</a>
									</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			{/if}
		</div>
	</div>

	<div class="row g-4">
		<div class="col-lg-6">
			<div class="card bg-light text-dark h-100 shadow-sm">
				<div class="card-body p-4">
					<h2 class="h4 fw-bold mb-3">Häufig wiederholt</h2>
					{#if stats.repeatedCards.length === 0}
						<p class="text-secondary mb-0">Noch keine wiederholten Karten vorhanden.</p>
					{:else}
						<div class="list-group list-group-flush">
							{#each stats.repeatedCards as card}
								<a
									class="list-group-item list-group-item-action"
									href={`/stapel/${card.deckSlug}/karten/${card._id}`}
								>
									<div class="d-flex justify-content-between gap-3">
										<span class="fw-semibold">{card.question}</span>
										<span class="badge text-bg-danger rounded-pill">{card.repeatCount}</span>
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
			<div class="card bg-light text-dark h-100 shadow-sm">
				<div class="card-body p-4">
					<h2 class="h4 fw-bold mb-3">Gezielt trainieren</h2>
					{#if stats.lowLeitnerCards.length === 0}
						<p class="text-secondary mb-0">Aktuell keine Karten in niedrigen Leitner-Fächern.</p>
					{:else}
						<div class="list-group list-group-flush">
							{#each stats.lowLeitnerCards as card}
								<a
									class="list-group-item list-group-item-action"
									href={`/stapel/${card.deckSlug}/karten/${card._id}`}
								>
									<div class="d-flex justify-content-between gap-3">
										<span class="fw-semibold">{card.question}</span>
										<span class="badge text-bg-dark rounded-pill">Fach {card.leitnerBox}</span>
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

		<div class="col-12">
			<div class="card bg-light text-dark shadow-sm">
				<div class="card-body p-4">
					<h2 class="h4 fw-bold mb-3">Nächste fällige Karten</h2>
					{#if stats.dueCards.length === 0}
						<p class="text-secondary mb-0">Aktuell sind keine Karten fällig.</p>
					{:else}
						<div class="table-responsive">
							<table class="table table-hover align-middle mb-0">
								<thead>
									<tr>
										<th scope="col">Frage</th>
										<th scope="col">Stapel</th>
										<th scope="col">Woche</th>
										<th scope="col">Folie/Seite</th>
										<th scope="col">Status</th>
									</tr>
								</thead>
								<tbody>
									{#each stats.dueCards as card}
										<tr>
											<th scope="row">
												<a class="link-dark" href={`/stapel/${card.deckSlug}/karten/${card._id}`}>
													{card.question}
												</a>
											</th>
											<td>{card.deckTitle}</td>
											<td>{card.week}</td>
											<td>{card.slide}</td>
											<td>
												<span class="badge rounded-pill text-bg-secondary">
													{card.status ?? 'new'}
												</span>
											</td>
										</tr>
									{/each}
								</tbody>
							</table>
						</div>
					{/if}
				</div>
			</div>
		</div>
	</div>
</div>
