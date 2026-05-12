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

	let isDragging = $state(false);
	let previewUrl = $state(null);
	let hasSelectedImage = $state(false);
	let removeImageFlag = $state(false);
	let fileInputEl = $state(null);

	$effect(() => {
		if (!hasSelectedImage && !removeImageFlag) {
			previewUrl = existingImageUrl || null;
		}
	});

	function handleDragOver(e) {
		e.preventDefault();
		isDragging = true;
	}

	function handleDragLeave() {
		isDragging = false;
	}

	function handleDrop(e) {
		e.preventDefault();
		isDragging = false;
		const file = e.dataTransfer?.files[0];
		if (file && file.type.startsWith('image/')) {
			previewUrl = URL.createObjectURL(file);
			hasSelectedImage = true;
			removeImageFlag = false;
			const dt = new DataTransfer();
			dt.items.add(file);
			if (fileInputEl) fileInputEl.files = dt.files;
		}
	}

	function handleFileChange(e) {
		const file = e.target.files[0];
		if (file) {
			previewUrl = URL.createObjectURL(file);
			hasSelectedImage = true;
			removeImageFlag = false;
		}
	}

	function handleRemoveImage() {
		previewUrl = null;
		hasSelectedImage = false;
		removeImageFlag = true;
		if (fileInputEl) fileInputEl.value = '';
	}

	function openFilePicker() {
		fileInputEl?.click();
	}
</script>

<form class="card bg-light text-dark border-0 rounded-4 shadow-sm" method="POST" action={formAction} enctype="multipart/form-data">
	<div class="card-body p-4 p-lg-5">
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

		<div class="mb-3">
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
			<label class="form-label fw-semibold small text-secondary mb-1" for="image">
				Screenshot zur Antwort <span class="fw-normal">(optional)</span>
			</label>
			{@render imageDropZone()}
		</div>

		<input type="hidden" name="imagePosition" value="answer" />

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

		<input type="hidden" name="removeImage" value={removeImageFlag ? '1' : '0'} />

		<div class="d-flex flex-column flex-md-row gap-2 pt-2">
			<button class="btn btn-dark fw-semibold flex-fill" type="submit">{submitLabel}</button>
			{#if cancelHref}
				<a class="btn btn-outline-secondary flex-fill" href={cancelHref}>{cancelLabel}</a>
			{/if}
		</div>
	</div>
</form>

{#snippet imageDropZone()}
	<input
		bind:this={fileInputEl}
		id="image"
		type="file"
		name="image"
		accept="image/jpeg,image/png,image/webp"
		class="d-none"
		onchange={handleFileChange}
	/>

	{#if previewUrl}
		<div class="image-preview-wrapper position-relative rounded overflow-hidden">
			<img src={previewUrl} class="img-fluid rounded w-100 flashcard-form-media" alt="Vorschau" />
			<div class="image-preview-actions d-flex gap-2 mt-2">
				<button type="button" class="btn btn-sm btn-outline-secondary" onclick={openFilePicker}>
					Ersetzen
				</button>
				<button type="button" class="btn btn-sm btn-outline-danger" onclick={handleRemoveImage}>
					Entfernen
				</button>
			</div>
		</div>
	{:else}
		<div
			class="rounded p-4 text-center border border-2 border-secondary-subtle bg-body-tertiary"
			class:border-primary={isDragging}
			class:bg-primary-subtle={isDragging}
			role="button"
			tabindex="0"
			ondragover={handleDragOver}
			ondragleave={handleDragLeave}
			ondrop={handleDrop}
			onclick={openFilePicker}
			onkeydown={(e) => e.key === 'Enter' && openFilePicker()}
		>
			<span class="badge text-bg-dark mb-2">Bild</span>
			<p class="mb-1 fw-semibold small">Screenshot hier ablegen</p>
			<p class="text-secondary small mb-0">oder klicken zum Auswählen · JPG, PNG, WebP</p>
		</div>
	{/if}
{/snippet}
