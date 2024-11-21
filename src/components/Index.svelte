<script>
	import { getContext } from "svelte";
	import Game from "$components/Game.svelte";
	import CMS from "$components/helpers/CMS.svelte";
	const copy = getContext("copy");

	const { body } = copy;
	const components = { Game };
</script>

<div class="c">
	<CMS {body} {components}></CMS>
</div>

<style>
	.c {
		padding: 0 16px;
	}

	:global(.c p) {
		max-width: 640px;
		margin: 32px auto;
	}
</style>
