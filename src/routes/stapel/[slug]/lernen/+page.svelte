<script>
	let { data, form } = $props();
	let showAnswer = $state(false);
</script>

<svelte:head>
	<title>{data.deck ? `Lernmodus | ${data.deck.title}` : 'Lernmodus | PT Karteikarten'}</title>
</svelte:head>

<div class="container py-4 py-lg-5">
	<h1 class="display-6 fw-bold mb-5">// Lernmodus</h1>

	{#if !data.deck}
		<div class="alert alert-warning" role="alert">
			<h2 class="h4 alert-heading">Stapel nicht gefunden</h2>
			<p class="mb-3">
				Für den Slug <strong>{data.slug}</strong> wurde kein Stapel in MongoDB gefunden.
			</p>
			<a class="btn btn-dark" href="/stapel">Zurück zur Stapelübersicht</a>
		</div>
	{:else if data.done}
		<div class="card bg-light text-dark shadow-sm">
			<div class="card-body p-4 p-lg-5 text-center">
				<h2 class="h3 fw-bold mb-3">Du hast alle Karten in diesem Stapel durchgearbeitet.</h2>
				<p class="text-secondary mb-4">{data.deck.title}</p>
				<div class="d-flex flex-column flex-md-row justify-content-center gap-2">
					<a class="btn btn-dark fw-semibold" href={`/stapel/${data.deck.slug}/lernen`}>
						Erneut lernen
					</a>
					<a class="btn btn-outline-secondary" href={`/stapel/${data.deck.slug}`}>
						Zurück zum Stapel
					</a>
				</div>
			</div>
		</div>
	{:else if data.cards.length === 0}
		<div class="alert alert-light" role="alert">
			<p class="mb-3">Dieser Stapel enthält noch keine Karten.</p>
			<a class="btn btn-dark" href={`/stapel/${data.deck.slug}/karten/neu`}>
				Erste Karte erstellen
			</a>
		</div>
	{:else if data.card}
		<div class="card bg-light text-dark shadow-sm">
			<div class="card-body p-4 p-lg-5">
				{#if form?.error}
					<div class="alert alert-danger" role="alert">{form.error}</div>
				{/if}

				<div class="mb-4">
					<span class="badge rounded-pill text-bg-dark px-4 py-2">
						Woche {data.card.week} · Folie {data.card.slide}
					</span>
				</div>

				<h2 class="h4 fw-bold mb-4">{data.card.question}</h2>

				{#if showAnswer}
					<div class="border-top pt-4 mb-5">
						{#each data.card.answer.split('\n') as answerLine}
							{#if answerLine}
								<p class="fw-semibold mb-1">{answerLine}</p>
							{/if}
						{/each}
					</div>

					<div class="row g-3 justify-content-center mb-4">
						<div class="col-md-5">
							<form method="POST" action="?/rateCard">
								<input type="hidden" name="cardId" value={data.card._id} />
								<input type="hidden" name="status" value="known" />
								<input type="hidden" name="nextIndex" value={data.index + 1} />
								<button class="btn btn-success fw-semibold w-100" type="submit">Gewusst</button>
							</form>
						</div>
						<div class="col-md-5">
							<form method="POST" action="?/rateCard">
								<input type="hidden" name="cardId" value={data.card._id} />
								<input type="hidden" name="status" value="repeat" />
								<input type="hidden" name="nextIndex" value={data.index + 1} />
								<button class="btn btn-danger fw-semibold w-100" type="submit">Repetieren</button>
							</form>
						</div>
					</div>
				{:else}
					<div class="my-5">
						<button class="btn btn-dark fw-semibold w-100" type="button" onclick={() => (showAnswer = true)}>
							Antwort anzeigen
						</button>
					</div>
				{/if}

				<p class="fw-semibold text-center mb-4">
					Frage {data.index + 1} / {data.cards.length}
				</p>

				<div class="text-center">
					<a class="btn btn-outline-secondary" href={`/stapel/${data.deck.slug}`}>Zurück zum Stapel</a>
				</div>
			</div>
		</div>
	{/if}
</div>
