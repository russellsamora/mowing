<script>
	import { browser } from "$app/environment";
	let { size = 10, path = [], perspective, obstacles = [] } = $props();

	const defaultCells = Array(size ** 2)
		.fill()
		.map((_, i) => ({
			pos: [i % size, Math.floor(i / size)],
			obstacle: obstacles.includes(i),
			visited: false
		}));

	let cells = $derived.by(() => {
		const all = defaultCells.map((c) => ({ ...c }));

		path.forEach((p, i) => {
			const c = all.find((c) => c.pos[0] === p[0] && c.pos[1] === p[1]);
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
	style="--size: {size}; --margin: {offsetWidth * -0.25}px;"
	class:perspective
	bind:offsetWidth
>
	<div class="grid">
		{#each cells as { obstacle, visited, pos }}
			{@const x = pos[0]}
			{@const y = pos[1]}
			{@const active = x === latest[0] && y === latest[1]}
			<div
				class="cell"
				class:obstacle
				class:visited
				class:active
				data-x={x}
				data-y={y}
			>
				<div class="texture"></div>
				<div class="fg"></div>
			</div>
		{/each}
	</div>
	<div class="grid mower">
		<div class="cube" style="--x: {latest[0]}; --y: {latest[1]};">
			<div class="face top"></div>
			<div class="face front"></div>
			<div class="face above"></div>
			<div class="face above-side"></div>
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
		position: relative;
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
		position: relative;
		background: linear-gradient(
			135deg,
			var(--color-green-medium),
			var(--color-green-dark)
		);
	}

	.cell.visited {
		background: linear-gradient(
			135deg,
			var(--color-green-light),
			var(--color-green-medium)
		);
	}

	.cell.obstacle {
		background: linear-gradient(
			135deg,
			var(--color-brown-medium),
			var(--color-brown-dark)
		);
	}

	.texture {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background-image: url("assets/images/texture.png");
		background-size: cover;
		background-repeat: no-repeat;
		box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.2);
		pointer-events: none;
		opacity: 0.75;
	}

	.fg {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background-image: url("assets/images/grass.png");
		background-size: cover;
		background-repeat: no-repeat;
		pointer-events: none;
		transform: translateY(-10%);
	}

	.visited .fg {
		background-image: url("assets/images/grass-cut.png");
	}

	.obstacle .fg {
		background-image: url("assets/images/rock.png");
		transform: translateY(0%);
	}

	.obstacle.visited .fg {
		background-image: url("assets/images/rock.png");
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
		width: 90%;
		height: 90%;
		backface-visibility: hidden;
		top: 0%;
		left: 5%;
	}

	.face.top {
		width: 90%;
		height: 90%;
		transform: translateZ(var(--face));
		background: var(--color-orange-dark);
		border-radius: 8px;
	}

	.face.front {
		width: 90%;
		height: 65%;
		transform: rotateX(-90deg) translateZ(var(--face));
		border-radius: 8px;
		background: var(--color-orange-medium);
	}

	.face.above {
		width: 40%;
		height: 40%;
		top: 20%;
		left: 30%;
		transform: rotateX(-90deg) translateZ(var(--face));
		border-radius: 50%;
		background: var(--color-orange-dark);
	}

	.face.above-side {
		width: 40%;
		height: 40%;
		top: 10%;
		left: 30%;
		transform: rotateX(-90deg) translateZ(var(--face));
		border-radius: 33%;
		border: 1px solid var(--color-orange-dark);
		background: var(--color-orange-medium);
	}
</style>
