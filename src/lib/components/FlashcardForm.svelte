<script>
	let {
		values = {},
		error = '',
		submitLabel = 'Karte erstellen',
		formAction = '?/createCard',
		cancelHref = '',
		cancelLabel = 'Zurück zum Stapel'
	} = $props();
</script>

<form class="card bg-light text-dark shadow-sm" method="POST" action={formAction}>
	<div class="card-body p-4">
		{#if error}
			<div class="alert alert-danger" role="alert">{error}</div>
		{/if}

		<div class="mb-4">
			<label class="form-label fw-semibold" for="question">Frage</label>
			<input
				class="form-control"
				id="question"
				name="question"
				placeholder="Was sind Nachteile von Diversifikationen?"
				value={values.question ?? ''}
				required
			/>
		</div>

		<div class="mb-4">
			<label class="form-label fw-semibold" for="answer">Antwort</label>
			<textarea
				class="form-control"
				id="answer"
				name="answer"
				placeholder="Probleme und Kosten der Synergieerschliessung"
				rows="5"
				value={values.answer ?? ''}
				required
			></textarea>
		</div>

		<div class="mb-4">
			<label class="form-label fw-semibold" for="week">Woche</label>
			<input
				class="form-control"
				id="week"
				name="week"
				type="number"
				min="1"
				step="1"
				placeholder="10"
				value={values.week ?? ''}
				required
			/>
		</div>

		<div class="mb-4">
			<label class="form-label fw-semibold" for="slide">Folien-Nr. oder Seiten-Nr.</label>
			<input
				class="form-control"
				id="slide"
				name="slide"
				type="number"
				min="1"
				step="1"
				placeholder="74"
				value={values.slide ?? ''}
				required
			/>
		</div>

		<div class="d-flex flex-column flex-md-row gap-2">
			<button class="btn btn-dark fw-semibold flex-fill" type="submit">{submitLabel}</button>
			{#if cancelHref}
				<a class="btn btn-outline-secondary flex-fill" href={cancelHref}>{cancelLabel}</a>
			{/if}
		</div>
	</div>
</form>
