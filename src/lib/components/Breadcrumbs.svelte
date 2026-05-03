<script>
	let { items = [] } = $props();
</script>

{#if items.length}
	<nav aria-label="Breadcrumb" data-bs-theme="dark">
		<ol class="breadcrumb mb-4">
			{#each items as item, index}
				<li
					class="breadcrumb-item text-light"
					class:active={index === items.length - 1}
					aria-current={index === items.length - 1 ? 'page' : undefined}
				>
					{#if item.href && index !== items.length - 1}
						<a
							class="link-light link-offset-2 link-underline-opacity-0 link-underline-opacity-100-hover"
							href={item.href}
						>
							{item.label}
						</a>
					{:else}
						<span class="badge rounded-pill text-bg-light text-dark">{item.label}</span>
					{/if}
				</li>
			{/each}
		</ol>
	</nav>
{/if}
