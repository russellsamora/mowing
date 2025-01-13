<script>
	import Grid from "$components/Grid.svelte";
	import Keypad from "$components/Keypad.svelte";
	import { mode } from "$runes/misc.svelte.js";

	const size = 10;
	let position = $state({ x: 0, y: 0 });
	let path = $state([{ x: 0, y: 0 }]);

	// TODO on complete mode.game = false;

	function onreveal() {
		mode.game = false;
		document.getElementById("more").classList.add("visible");
	}

	function onmove(key) {
		let dir;

		if (key === "ArrowUp") dir = { x: 0, y: -1 };
		else if (key === "ArrowDown") dir = { x: 0, y: 1 };
		else if (key === "ArrowLeft") dir = { x: -1, y: 0 };
		else if (key === "ArrowRight") dir = { x: 1, y: 0 };

		position.x += dir.x;
		position.y += dir.y;

		position.x = Math.max(0, Math.min(size - 1, position.x));
		position.y = Math.max(0, Math.min(size - 1, position.y));
		path.push({ x: position.x, y: position.y });
	}
</script>

<p class="skip">
	<small>
		<a href="#more" onclick={onreveal}>just skip to results please</a>
	</small>
</p>

<Grid {size} {path} perspective={true}></Grid>
<Keypad {onmove} {mode}></Keypad>

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
