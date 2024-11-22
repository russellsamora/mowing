<script>
	import { browser } from "$app/environment";
	let { size = 10, path = [], perspective } = $props();

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

	let latest = $derived(path[path.length - 1]);

	// let currentCell = $state({ left: 0, top: 0 });

	// $effect(() => {
	// 	const cell = document.querySelector(
	// 		`.cell[data-x="${latest.x}"][data-y="${latest.y}"]`
	// 	);

	// 	currentCell.left = `${cell.offsetLeft}px`;
	// 	currentCell.top = `${cell.offsetTop}px`;
	// });
</script>

<figure style="--size: {size};" class:perspective>
	<div class="grid">
		{#each cells as { obstacle, visited, x, y }}
			{@const active = x === latest.x && y === latest.y}
			<div
				class="cell"
				class:obstacle
				class:visited
				class:active
				data-x={x}
				data-y={y}
			>
				<div class="texture"></div>
			</div>
		{/each}
	</div>
</figure>

<style>
	figure {
		width: min(80svw, 80svh);
		max-width: 640px;
		margin: 0 auto;
		perspective: calc(min(80svw, 80svh) * 2);
		transition: all 0.5s ease-in-out;
		position: relative;
	}

	figure.perspective {
		perspective-origin: 50% 100%;
		transform: scale(0.85);
	}

	.grid {
		aspect-ratio: 1;
		display: grid;
		grid-template-columns: repeat(var(--size), 1fr);
		grid-template-rows: repeat(var(--size), 1fr);
		transition: all 0.5s ease-in-out;
	}

	.perspective .grid {
		transform: rotateX(45deg);
	}

	.cell {
		background: linear-gradient(135deg, #008000, darkgreen);
		position: relative;
	}

	.cell.visited {
		background: linear-gradient(135deg, yellowgreen, green);
	}

	.cell.active {
		background: darkmagenta;
	}

	.texture {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background: url("assets/images/texture.png");
		box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.2);
		pointer-events: none;
		opacity: 0.75;
	}

	.obstacle {
		background: linear-gradient(135deg, darkred, red);
		transform: translateZ(-20px);
	}
</style>
