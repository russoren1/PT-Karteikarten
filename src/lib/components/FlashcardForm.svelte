<script>
	let {
		values = {},
		error = '',
		submitLabel = 'Karte erstellen',
		formAction = '?/createCard',
		cancelHref = '',
		cancelLabel = 'Zurück zum Stapel',
		sourceNames = [],
		existingImageUrl = ''
	} = $props();
</script>

<form class="card bg-light text-dark shadow-sm" method="POST" action={formAction} enctype="multipart/form-data">
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
				placeholder="z.B. Was sind Nachteile von Diversifikationen?"
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
				placeholder="z.B. Probleme und Kosten der Synergieerschliessung"
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

		<div class="mb-4">
			<label class="form-label fw-semibold" for="sourceName">
				Dateiname bzw. Vorlesungs-Skript (optional)
			</label>
			<input
				class="form-control"
				id="sourceName"
				name="sourceName"
				list="sourceNameOptions"
				placeholder="z.B. Vorlesung 10.pdf"
				value={values.sourceName ?? ''}
			/>
			{#if sourceNames.length}
				<datalist id="sourceNameOptions">
					{#each sourceNames as sourceName}
						<option value={sourceName}></option>
					{/each}
				</datalist>
			{/if}
		</div>

		<div class="mb-4">
			<label class="form-label fw-semibold" for="image">
				Screenshot / Vorlesungsbild (optional)
			</label>
			{#if existingImageUrl}
				<div class="mb-2">
					<img src={existingImageUrl} class="img-fluid rounded shadow-sm" alt="Aktuelles Bild" style="max-height: 200px;" />
				</div>
				<div class="form-check mb-2">
					<input class="form-check-input" type="checkbox" name="removeImage" id="removeImage" value="1" />
					<label class="form-check-label text-secondary small" for="removeImage">Bild entfernen</label>
				</div>
			{/if}
			<input
				class="form-control"
				id="image"
				name="image"
				type="file"
				accept="image/jpeg,image/png,image/webp"
			/>
			<div class="form-text">JPG, PNG oder WebP. Wird im Lernmodus zur Karte angezeigt.</div>
		</div>

		<div class="d-flex flex-column flex-md-row gap-2">
			<button class="btn btn-dark fw-semibold flex-fill" type="submit">{submitLabel}</button>
			{#if cancelHref}
				<a class="btn btn-outline-secondary flex-fill" href={cancelHref}>{cancelLabel}</a>
			{/if}
		</div>
	</div>
</form>
