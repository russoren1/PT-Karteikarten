<script>
	let { data } = $props();
</script>

<svelte:head>
	<title>PT Karteikarten</title>
</svelte:head>

<div class="container py-5">

	<!-- HERO -->
	<div class="py-5 mb-5">
		<div class="col-lg-8">
			<h1 class="display-2 fw-bold lh-1 mb-4">
				Karteikarten mit <span class="text-accent">Vorlesungskontext</span>.
			</h1>
			<p class="lead mb-5">
				Erstelle Karteikarten mit direktem Bezug zu Semesterwoche, Folie und Seite –
				damit du bei Unsicherheiten sofort weisst, wo du nachschauen musst.
			</p>
			{#if data.user}
				<a class="btn btn-light btn-lg px-4 py-3 fw-semibold shadow" href="/stapel">
					Meine Stapel →
				</a>
			{:else}
				<a class="btn btn-light btn-lg px-4 py-3 fw-semibold shadow" href="/login">
					Login →
				</a>
			{/if}
		</div>
	</div>

	<!-- FEATURES -->
	<h2 class="h5 fw-semibold text-uppercase text-accent mb-3">Wie es funktioniert</h2>

	<div class="row g-4 mb-5">
		<div class="col-lg-4">
			<div class="card border-0 rounded-4 bg-light text-dark h-100 shadow-sm">
				<div class="card-body p-4 d-flex flex-column h-100">
					<span class="badge text-bg-dark fs-6 px-3 py-2 rounded-pill mb-4 align-self-start">01</span>
					<h3 class="h4 fw-bold mb-2">Mit Vorlesungskontext</h3>
					<p class="mb-0">
						Jede Karte ist mit Semesterwoche, Folie und Seite verknüpft –
						du findest den Stoff sofort wieder.
					</p>
				</div>
			</div>
		</div>

		<div class="col-lg-4">
			<div class="card border-0 rounded-4 bg-light text-dark h-100 shadow-sm">
				<div class="card-body p-4 d-flex flex-column h-100">
					<span class="badge text-bg-dark fs-6 px-3 py-2 rounded-pill mb-4 align-self-start">02</span>
					<h3 class="h4 fw-bold mb-2">Lernfortschritt tracken</h3>
					<p class="mb-0">
						Das Leitner-System priorisiert schwierige Karten automatisch
						und bringt dich systematisch ans Ziel.
					</p>
				</div>
			</div>
		</div>

		<div class="col-lg-4">
			<div class="card border-0 rounded-4 bg-light text-dark h-100 shadow-sm">
				<div class="card-body p-4 d-flex flex-column h-100">
					<span class="badge text-bg-dark fs-6 px-3 py-2 rounded-pill mb-4 align-self-start">03</span>
					<h3 class="h4 fw-bold mb-2">Fokussiert üben</h3>
					<p class="mb-0">
						Im Lernmodus arbeitest du dich konzentriert durch deine Stapel
						ohne Ablenkung.
					</p>
				</div>
			</div>
		</div>
	</div>

	<!-- WIE ES FUNKTIONIERT -->
	<h2 class="h5 fw-semibold text-uppercase text-accent mb-3">Wie es funktioniert</h2>

	<div class="card border-0 rounded-4 bg-light text-dark shadow-sm mb-5">
		<div class="card-body p-4 p-lg-5">
			<div class="row g-5 align-items-start">
				<div class="col-lg-4">
					<h3 class="h4 fw-bold mb-3">Spaced Repetition</h3>
					<p class="text-secondary mb-4">
						Karten werden dir genau dann wieder gezeigt, wenn du sie fast vergessen hättest.
						Bekannte Karten erscheinen seltener, schwierige öfter —
						so lernst du effizienter als mit reinem Wiederholen.
					</p>
					<p class="fw-semibold mb-1">Das Leitner-System</p>
					<p class="text-secondary small mb-4">
						Jede Karte befindet sich in einer Lernstufe. Gewusst → steigt eine Stufe, wird seltener gezeigt.
						Nicht gewusst → fällt zurück auf Stufe 1.
					</p>
					<a
						class="btn btn-sm btn-outline-dark"
						href="https://de.wikipedia.org/wiki/Lernkartei"
						target="_blank"
						rel="noopener noreferrer"
					>
						Mehr zur Methode →
					</a>
				</div>
				<div class="col-lg-8">
					<div class="vstack gap-3">
						<div class="d-flex gap-3 align-items-start">
							<span class="badge text-bg-dark rounded-pill px-3 py-2 flex-shrink-0">1</span>
							<div>
								<p class="fw-bold mb-1">Stapel erstellen</p>
								<p class="text-secondary small mb-0">Lege für jedes Fach einen eigenen Stapel an.</p>
							</div>
						</div>
						<div class="d-flex gap-3 align-items-start">
							<span class="badge text-bg-dark rounded-pill px-3 py-2 flex-shrink-0">2</span>
							<div>
								<p class="fw-bold mb-1">Karten hinzufügen</p>
								<p class="text-secondary small mb-0">Erstelle Karteikarten mit Frage, Antwort und Vorlesungskontext.</p>
							</div>
						</div>
						<div class="d-flex gap-3 align-items-start">
							<span class="badge text-bg-dark rounded-pill px-3 py-2 flex-shrink-0">3</span>
							<div>
								<p class="fw-bold mb-1">Lernen starten</p>
								<p class="text-secondary small mb-0">Das System wählt, welche Karten du heute siehst.</p>
							</div>
						</div>
						<div class="d-flex gap-3 align-items-start">
							<span class="badge text-bg-dark rounded-pill px-3 py-2 flex-shrink-0">4</span>
							<div>
								<p class="fw-bold mb-1">Fortschritt verfolgen</p>
								<p class="text-secondary small mb-0">Das Dashboard zeigt deinen Lernstand im Überblick.</p>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>

	<!-- TIPPS FÜR DEN START -->
	<h2 class="h5 fw-semibold text-uppercase text-accent mb-3">Tipps für den Start</h2>

	<div class="card border-0 rounded-4 bg-light text-dark shadow-sm">
		<div class="accordion accordion-flush rounded-4" id="tipsAccordion">

			<!-- CSV IMPORT -->
			<div class="accordion-item bg-transparent">
				<h3 class="accordion-header">
					<button
						class="accordion-button collapsed bg-transparent text-dark fw-semibold shadow-none"
						type="button"
						data-bs-toggle="collapse"
						data-bs-target="#tipCsv"
						aria-expanded="false"
						aria-controls="tipCsv"
					>
						Karten per CSV importieren
					</button>
				</h3>
				<div id="tipCsv" class="accordion-collapse collapse">
					<div class="accordion-body pt-0">
						<p class="text-secondary mb-4">
							Unter <strong>Stapel</strong> kannst du eine CSV-Datei hochladen oder CSV-Text direkt einfügen,
							um viele Karten auf einmal zu importieren – praktisch wenn du Vorlesungsnotizen hast.
						</p>

						<p class="fw-semibold mb-2">Pflichtfelder</p>
						<div class="border rounded-3 p-3 mb-1 font-monospace">
							deckTitle, semester, question, answer, week, slide
						</div>
						<p class="text-secondary mb-4">
							Optionales Feld: <code>sourceName</code> (z.B. «Vorlesung_10.pdf»).
							<code>week</code> und <code>slide</code> müssen positive ganze Zahlen sein.
						</p>

						<p class="fw-semibold mb-2">Prompt-Vorlage für das Erstellen von Karteikarten als CSV für eine KI deiner Wahl</p>
						<div class="border rounded-3 p-3">
							<p class="mb-2">Erstelle aus dem folgenden Vorlesungsskript eine CSV-Datei für Karteikarten.</p>
							<p class="mb-1">Pflichtfelder als Header (in dieser Reihenfolge):</p>
							<p class="font-monospace mb-3">deckTitle,semester,question,answer,week,slide,sourceName</p>
							<p class="mb-1">Regeln:</p>
							<ul class="mb-3">
								<li><code>deckTitle</code>: Name des Fachs (z.B. «Strategisches Management»)</li>
								<li><code>semester</code>: Semester (z.B. «FS25»)</li>
								<li><code>question</code>: Präzise, eigenständig verständliche Frage</li>
								<li><code>answer</code>: Vollständige, kompakte Antwort</li>
								<li><code>week</code>: Semesterwoche als positive ganze Zahl</li>
								<li><code>slide</code>: Foliennummer als positive ganze Zahl</li>
								<li><code>sourceName</code>: Dateiname (z.B. «Vorlesung_10.pdf»)</li>
								<li>Trennzeichen: Komma; Felder mit Komma in Anführungszeichen</li>
							</ul>
							<p class="text-secondary mb-0">[Vorlesungstext hier einfügen]</p>
						</div>
					</div>
				</div>
			</div>

			<!-- TASTATURKÜRZEL -->
			<div class="accordion-item bg-transparent">
				<h3 class="accordion-header">
					<button
						class="accordion-button bg-transparent text-dark fw-semibold shadow-none"
						type="button"
						data-bs-toggle="collapse"
						data-bs-target="#tipKurzel"
						aria-expanded="true"
						aria-controls="tipKurzel"
					>
						Tastaturkürzel (Desktop)
					</button>
				</h3>
				<div id="tipKurzel" class="accordion-collapse collapse show">
					<div class="accordion-body pt-0">
						<p class="text-secondary mb-3">
							Im Browser auf dem Desktop stehen Tastaturkürzel zur Verfügung –
							auf mobilen Geräten sind sie nicht verfügbar.
						</p>
						<div class="vstack gap-2">
							<div class="d-flex align-items-center gap-3">
								<kbd>Leertaste</kbd>
								<span>Antwort zur aktuellen Karte anzeigen (Lernmodus)</span>
							</div>
							<div class="d-flex align-items-center gap-3">
								<kbd>1</kbd>
								<span>Karte als gewusst markieren (Lernmodus)</span>
							</div>
							<div class="d-flex align-items-center gap-3">
								<kbd>2</kbd>
								<span>Karte zum Wiederholen markieren (Lernmodus)</span>
							</div>
							<div class="d-flex align-items-center gap-3">
								<kbd>Enter</kbd>
								<span>Einzeilige Formularfelder speichern</span>
							</div>
						</div>
					</div>
				</div>
			</div>

		</div>
	</div>

</div>
