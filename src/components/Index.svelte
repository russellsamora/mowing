<script>
	import { getContext } from "svelte";
	import Game from "$components/Game.svelte";
	import CMS from "$components/helpers/CMS.svelte";
	const copy = getContext("copy");

	const { body } = copy;
	const components = { Game };
</script>

<div class="byline">
	<p>{@html copy.byline}</p>
</div>

<div class="c">
	<CMS {body} {components}></CMS>
</div>

<style>
	.byline {
		position: absolute;
		top: 0;
		right: 0;
		padding: 8px;
	}

	.byline p {
		margin: 0;
		max-width: 10em;
		text-align: right;
		font-size: var(--14px);
	}

	.c {
		padding: 0 16px;
	}

	:global(.c p, .c h1) {
		max-width: 640px;
		margin: 32px auto;
	}

	@media (min-width: 960px) {
		.byline p {
			font-size: var(--16px);
		}
	}
</style>
