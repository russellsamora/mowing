<script>
	import { getContext } from "svelte";
	import Game from "$components/Game.svelte";
	const copy = getContext("copy");
</script>

<div class="c">
	<Game></Game>
</div>

<style>
	.c {
		display: flex;
		justify-content: center;
		padding: 8px;
	}
</style>
