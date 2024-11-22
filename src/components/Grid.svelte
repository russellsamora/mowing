<script>
	let { size = 10, path = [] } = $props();

	const defaultCells = Array(size ** 2)
		.fill()
		.map((_, i) => ({
			x: i % size,
			y: Math.floor(i / size),
			obstacle: false,
			visited: false
		}));

	let cells = $derived.by(() => {
		const all = defaultCells.map((c) => ({ ...c }));

		path.forEach((p, i) => {
			// todo should we just be smart and use arrays?
			const c = all.find((c) => c.x === p.x && c.y === p.y);
			c.visited = true;
		});
		return all;
	});
</script>

<figure style="--size: {size};">
	{#each cells as { obstacle, visited }}
		<div class="cell" class:obstacle class:visited></div>
	{/each}
</figure>

<style>
	figure {
		width: min(80svw, 80svh);
		max-width: 640px;
		margin: 0 auto;
		aspect-ratio: 1;
		display: grid;
		grid-template-columns: repeat(var(--size), 1fr);
		grid-template-rows: repeat(var(--size), 1fr);
	}

	.cell {
		border: 0.5px solid var(--color-bg);
		background: green;
		position: relative;
	}

	.obstacle {
		background: #f00;
	}

	.visited {
		background: yellowgreen;
	}
</style>
