<script>
	import Grid from "$components/Grid.svelte";
	import Keypad from "$components/Keypad.svelte";
	import { game } from "$runes/misc.svelte.js";
	import localStore from "$runes/localStore.svelte.js";
	import server from "$utils/server.js";

	const MAX_LENGTH = 1000;
	const size = 10;
	const obstacles = [17, 27, 36, 37, 63, 64, 73, 74, 75, 84, 85, 91];
	const targetCount = size * size - obstacles.length;
	let storage = localStore("pudding_mowing", {});
	let position = $state([0, 0]);
	let path = $state([[0, 0]]);
	let visited = $state({});
	let visitedCount = $derived(Object.keys(visited).length + 1);
	let complete = $derived(visitedCount === targetCount);

	function reveal() {
		game.active = false;
		if (complete)
			document
				.querySelectorAll("span.you")
				.forEach((el) => el.classList.add("visible"));
		else
			document
				.querySelectorAll("span.skip")
				.forEach((el) => el.classList.add("visible"));

		document.getElementById("results").classList.add("visible");
	}

	function skip() {
		storage.value.skipped = true;
		reveal();
	}

	function onmove(key) {
		let dir;

		if (key === "ArrowUp") dir = [0, -1];
		else if (key === "ArrowDown") dir = [0, 1];
		else if (key === "ArrowLeft") dir = [-1, 0];
		else if (key === "ArrowRight") dir = [1, 0];

		let tempX = position[0] + dir[0];
		let tempY = position[1] + dir[1];

		// boundaries
		tempX = Math.max(0, Math.min(size - 1, tempX));
		tempY = Math.max(0, Math.min(size - 1, tempY));

		// don't allow movement over obstacles
		if (obstacles.includes(tempY * size + tempX)) return;

		position = [tempX, tempY];

		path.push([...position]);
		visited[position.join(",")] = true;
		// TODO get length of visited?
	}

	async function submit(alreadyCompleted) {
		const str = path.map((p) => p.join(",")).join("|");

		// TODO may need to refactor if we let them play again
		if (str.length < MAX_LENGTH) {
			if (!alreadyCompleted) {
				storage.value.path = path;
				// const response = await server("submit", str);
				// storage.value.heuristic = response?.heuristic;
			}
		}
	}

	$effect(() => {
		if (complete) {
			const alreadyCompleted = storage.value.completed;
			game.completed = true;
			storage.value.completed = true;
			submit(alreadyCompleted);
			reveal();
			setTimeout(() => {
				document.getElementById("results").scrollIntoView();
			}, 500);
		}
	});
</script>

<p class="skip">
	<small>
		<a href="#results" onclick={skip}>just skip to results please</a>
	</small>
</p>

<div class="c" class:disable={!game.active}>
	<div class="inner">
		<Grid {size} {path} perspective={true} {obstacles}></Grid>
		{#if game.active}<Keypad {onmove} active={game.active}></Keypad>{/if}
	</div>
	{#if complete}
		<p class="message"><strong>Good job!</strong></p>
	{/if}
</div>

<style>
	.skip {
		text-align: center;
		position: relative;
		z-index: var(--z-top);
		margin: 0 auto;
		margin-top: -24px;
	}

	a {
		color: var(--color-fg-light);
	}

	.c {
		position: relative;
	}

	.disable {
		pointer-events: none;
	}

	.disable .inner {
		opacity: 0.2;
	}

	.message {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
	}
</style>
