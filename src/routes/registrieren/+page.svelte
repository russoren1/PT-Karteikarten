<script>
	let { form } = $props();
</script>

<svelte:head>
	<title>Registrieren | PT Karteikarten</title>
</svelte:head>

<div class="container py-5">
	<div class="row justify-content-center">
		<div class="col-sm-10 col-md-7 col-lg-5">
			<div class="text-center mb-5">
				<h1 class="display-6 fw-bold">// Registrieren</h1>
				<p class="text-light">Erstelle ein Konto, um deine Karteikarten zu verwalten.</p>
			</div>

			<div class="card bg-light text-dark shadow-sm">
				<div class="card-body p-4">
					{#if form?.error}
						<div class="alert alert-danger" role="alert">{form.error}</div>
					{/if}

					<form method="POST" action="?/register">
						<div class="mb-3">
							<label class="form-label fw-semibold" for="email">E-Mail</label>
							<input
								id="email"
								type="email"
								name="email"
								class="form-control"
								value={form?.email ?? ''}
								placeholder="deine@email.ch"
								required
							/>
						</div>
						<div class="mb-3">
							<label class="form-label fw-semibold" for="password">Passwort</label>
							<input
								id="password"
								type="password"
								name="password"
								class="form-control"
								placeholder="Mindestens 6 Zeichen"
								required
							/>
						</div>
						<div class="mb-4">
							<label class="form-label fw-semibold" for="passwordConfirm">Passwort bestätigen</label>
							<input
								id="passwordConfirm"
								type="password"
								name="passwordConfirm"
								class="form-control"
								placeholder="••••••••"
								required
							/>
						</div>
						<button type="submit" class="btn btn-dark fw-semibold w-100">Konto erstellen</button>
					</form>
				</div>
			</div>

			<p class="text-center text-secondary mt-4 small">
				Bereits ein Konto?
				<a href="/login" class="text-accent fw-semibold">Jetzt anmelden</a>
			</p>
		</div>
	</div>
</div>
