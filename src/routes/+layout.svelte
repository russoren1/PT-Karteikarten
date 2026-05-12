<script>
	import '../style.css';
	import { afterNavigate } from '$app/navigation';

	let { children, data } = $props();

	afterNavigate(() => {
		document.querySelector('#navbarNavAltMarkup')?.classList.remove('show');
	});
</script>

<svelte:head>
	<link rel="icon" href="/logo.png" type="image/png" />
</svelte:head>

<nav class="navbar navbar-expand-lg bg-black py-3 fw-bold app-navbar" data-bs-theme="dark">
	<div class="container">
		<a class="navbar-brand me-4" href="/">
			<img class="navbar-logo" src="/logo.png" alt="PT Karteikarten" />
		</a>
		<button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNavAltMarkup" aria-controls="navbarNavAltMarkup" aria-expanded="false" aria-label="Toggle navigation">
			<span class="navbar-toggler-icon"></span>
		</button>
		<div class="collapse navbar-collapse" id="navbarNavAltMarkup">
			<div class="navbar-nav me-auto gap-lg-2">
				<a class="nav-link px-lg-3" href="/">Home</a>
				<a class="nav-link px-lg-3" href="/stapel">Stapel</a>
				<a class="nav-link px-lg-3" href="/dashboard">Dashboard</a>
			</div>
			<div class="navbar-nav ms-auto">
				{#if data.user}
					<span class="nav-link text-secondary small d-none d-lg-inline">{data.user.email}</span>
					<form method="POST" action="/logout" class="d-flex">
						<button type="submit" class="btn btn-outline-light btn-sm fw-semibold">Abmelden</button>
					</form>
				{:else}
					<a class="nav-link" href="/login">Anmelden</a>
				{/if}
			</div>
		</div>
	</div>
</nav>

<div class="app-shell">
	{@render children()}
</div>
