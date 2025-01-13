<script>
	import { MediaQuery } from "svelte/reactivity";

	let { onmove, mode } = $props();

	const hover = new MediaQuery("hover: hover");
	const pointer = new MediaQuery("pointer: fine");
	let desktop = $derived(hover && pointer);

	function onKeydown(e) {
		if (!mode.game) return;
		const keys = ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"];
		if (!keys.includes(e.key)) return;
		onmove(e.key);

		// TODO only do this if game is being played
		e.preventDefault();
	}
</script>

<svelte:window onkeydown={onKeydown} />

<div class="c">
	<div class="keypad">
		<div class="row">
			<button>&uarr;</button>
		</div>
		<div class="row">
			<button>&larr;</button>
			<div class="spacer"></div>
			<button>&rarr;</button>
		</div>
		<div class="row">
			<button>&darr;</button>
		</div>
	</div>

	<div class="keyboard">
		<p><small>use the arrow keys to move</small></p>
	</div>
</div>

<style>
	.c {
		margin-top: -128px;
	}

	.keypad {
		display: flex;
		flex-direction: column;
	}

	.keyboard {
		display: none;
		text-align: center;
		color: var(--color-fg-light);
	}

	.row {
		display: flex;
		justify-content: center;
	}

	button,
	.spacer {
		width: 2em;
		aspect-ratio: 1;
	}

	@media (hover: hover) and (pointer: fine) {
		.keyboard {
			display: block;
		}

		.keypad {
			display: none;
		}
	}
</style>
