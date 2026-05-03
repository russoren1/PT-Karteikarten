<script>
	import '../style.css';
	import { afterNavigate } from '$app/navigation';

	let { children } = $props();

	afterNavigate(() => {
		document.querySelector('#navbarNavAltMarkup')?.classList.remove('show');
	});
</script>

<svelte:head>
	<link rel="icon" href="/favicon.svg" />
</svelte:head>

<nav class="navbar navbar-expand-lg bg-black fw-bold" data-bs-theme="dark">
  <div class="container-fluid">
    <a class="navbar-brand" href="/">
      <img class="navbar-logo" src="/logo.png" alt="PT Karteikarten" />
    </a>
    <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNavAltMarkup" aria-controls="navbarNavAltMarkup" aria-expanded="false" aria-label="Toggle navigation">
      <span class="navbar-toggler-icon"></span>
    </button>
    <div class="collapse navbar-collapse" id="navbarNavAltMarkup">
      <div class="navbar-nav">
        <a class="nav-link" href="/">Home</a>
        <a class="nav-link" href="/stapel">Stapel</a>
        <a class="nav-link" href="/dashboard">Dashboard</a>
      </div>
    </div>
  </div>
</nav>


<div>
	{@render children()}
</div>
