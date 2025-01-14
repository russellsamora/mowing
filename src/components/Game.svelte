<script>
	import Grid from "$components/Grid.svelte";
	import Keypad from "$components/Keypad.svelte";
	import { game } from "$runes/misc.svelte.js";

	const size = 10;
	const targetCount = 100;
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

	function submit() {
		const str = path.map((p) => p.join(",")).join("|");
		console.log(str);
	}

	function onmove(key) {
		let dir;

		if (key === "ArrowUp") dir = [0, -1];
		else if (key === "ArrowDown") dir = [0, 1];
		else if (key === "ArrowLeft") dir = [-1, 0];
		else if (key === "ArrowRight") dir = [1, 0];

		position[0] += dir[0];
		position[1] += dir[1];

		position[0] = Math.max(0, Math.min(size - 1, position[0]));
		position[1] = Math.max(0, Math.min(size - 1, position[1]));
		path.push([...position]);
		visited[position.join(",")] = true;
		// TODO get length of visited?
	}

	$effect(() => {
		if (complete) {
			game.completed = true;
			submit();
			reveal();
		}
	});
</script>

<p class="skip">
	<small>
		<a href="#results" onclick={reveal}>just skip to results please</a>
	</small>
</p>

<Grid {size} {path} perspective={true}></Grid>
<Keypad {onmove} active={game.active}></Keypad>

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
</style>
