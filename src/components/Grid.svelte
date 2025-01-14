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
	let offsetWidth = $state(0);

	// let currentCell = $state({ left: 0, top: 0 });

	// $effect(() => {
	// 	const cell = document.querySelector(
	// 		`.cell[data-x="${latest.x}"][data-y="${latest.y}"]`
	// 	);

	// 	currentCell.left = `${cell.offsetLeft}px`;
	// 	currentCell.top = `${cell.offsetTop}px`;
	// });
</script>

<figure
	style="--size: {size}; --margin: {offsetWidth * -0.2}px;"
	class:perspective
	bind:offsetWidth
>
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
				<div class="grass"></div>
			</div>
		{/each}
	</div>
	<div class="grid mower">
		<div class="cube" style="--x: {latest.x}; --y: {latest.y};">
			<div class="face top"></div>
			<div class="face front"></div>
		</div>
	</div>
</figure>

<style>
	figure {
		width: var(--grid-width);
		max-width: var(--grid-max-width);
		margin: 0 auto;
		perspective: calc(var(--grid-width) * 2);
		transition: all 0.5s ease-in-out;
		position: relative;
	}

	figure.perspective {
		perspective-origin: 50% 100%;
		transform: scale(0.9);
		margin-top: var(--margin);
	}

	.grid {
		aspect-ratio: 1;
		display: grid;
		grid-template-columns: repeat(var(--size), 1fr);
		grid-template-rows: repeat(var(--size), 1fr);
		transition: all 0.5s ease-in-out;
	}

	.grid.mower {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
	}

	.perspective .grid {
		transform: rotateX(40deg);
	}

	.cell {
		background: linear-gradient(135deg, #008000, darkgreen);
		/* background: green; */
		position: relative;
	}

	.cell.visited {
		/* background: yellowgreen; */
		background: linear-gradient(135deg, yellowgreen, green);
	}

	.cell.active {
		/* background: darkmagenta; */
	}

	/* .cell.active:after,
	.cell.before:after {
		position: absolute;
		content: "";
		top: 50%;
		left: 50%;
		width: 90%;
		height: 90%;
		transform: translate(-50%, -50%);
		background: magenta;
		border-radius: 25%;
	} */

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

	.grass {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background: url("assets/images/grass.png");
		pointer-events: none;
		transform: scale(1) translateY(-10%);
		display: none;
	}

	.visited .grass {
		background: url("assets/images/grass-cut.png");
	}

	.obstacle {
		background: linear-gradient(135deg, darkred, red);
	}

	.cube {
		/* position: absolute; */
		/* width: var(--width);
		height: var(--width); */
		transform-style: preserve-3d;
		transform-origin: center bottom;
		transform: rotateX(30deg) rotateY(0deg) rotateZ(0deg) translateY(0)
			scale(1, 1.5);
		grid-row: calc(var(--y) + 1);
		grid-column: calc(var(--x) + 1);
		/* set position on grid with x,y */

		/* top: calc(var(--y) * var(--width)); */
		/* left: calc(var(--x) * var(--width)); */
		/* animation: infinite 5s spin linear; */
	}

	.face {
		position: absolute;
		width: 100%;
		height: 100%;
		backface-visibility: hidden;
	}

	.face.top {
		width: 100%;
		height: 100%;
		transform: translateZ(var(--face));
		background: darkmagenta;
		border-radius: 8px;
	}

	.face.front {
		width: 100%;
		height: 75%;
		transform: rotateX(-90deg) translateZ(var(--face)) translateY(-8px);
		border-radius: 8px;
		background: magenta;
	}

	@keyframes spin {
		from {
			transform: rotateX(45deg) rotateY(0deg) rotateZ(0deg);
		}
		to {
			transform: rotateX(45deg) rotateY(360deg) rotateZ(0deg);
		}
	}
</style>
