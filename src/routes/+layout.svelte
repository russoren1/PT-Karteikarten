<script>
	import Navbar from '$lib/components/Navbar.svelte';
	import favicon from '$lib/assets/favicon.svg';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<Navbar />

<main class="app-shell py-5">
	{@render children()}
</main>

<style>
	:global(body) {
		min-height: 100vh;
		margin: 0;
		background: #10131a;
		color: #f8f9fa;
	}

	:global(a) {
		color: inherit;
	}

	.app-shell {
		min-height: 100vh;
	}
</style>
