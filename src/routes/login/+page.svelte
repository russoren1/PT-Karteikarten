<script>
	let { form } = $props();
</script>

<svelte:head>
	<title>Login | PT Karteikarten</title>
</svelte:head>

<div class="container py-5" style="max-width: 440px;">
	<div class="text-center mb-5">
		<h1 class="display-6 fw-bold">// Login</h1>
		<p class="text-secondary">Melde dich an, um deine Karteikarten zu lernen.</p>
	</div>

	<div class="card bg-light text-dark shadow-sm">
		<div class="card-body p-4">
			{#if form?.error}
				<div class="alert alert-danger" role="alert">{form.error}</div>
			{/if}

			<form method="POST" action="?/signIn">
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
				<div class="mb-4">
					<label class="form-label fw-semibold" for="password">Passwort</label>
					<input
						id="password"
						type="password"
						name="password"
						class="form-control"
						placeholder="••••••••"
						required
					/>
				</div>
				<button type="submit" class="btn btn-dark fw-semibold w-100">Anmelden</button>
			</form>
		</div>
	</div>

	<p class="text-center text-secondary mt-4 small">
		Noch kein Konto?
		<a href="/registrieren" class="text-light">Jetzt registrieren</a>
	</p>
</div>
