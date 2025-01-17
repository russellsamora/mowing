<script>
	import Grid from "$components/Grid.svelte";
	import obstacles from "$data/obstacles.json";
	import solution from "$data/solution.json";
	import { game } from "$runes/misc.svelte.js";
	import inView from "$actions/inview.js";

	const size = 10;
	let visible = $state(false);
	let gridUser = $state();
	let gridSolution = $state();

	$effect(() => {
		if (visible) {
			if (gridUser) gridUser.animate();
			gridSolution.animate();
		}
	});
</script>

<div class="c" use:inView onenter={() => (visible = true)}>
	<div class="inner">
		{#if game.path.length}
			<div class="g">
				<Grid
					bind:this={gridUser}
					{size}
					perspective={false}
					{obstacles}
					path={game.path}
					game={false}
					color="user"
				></Grid>
			</div>
		{/if}
		<div class="g">
			<Grid
				bind:this={gridSolution}
				{size}
				perspective={false}
				{obstacles}
				path={solution}
				game={false}
				color="solution"
			></Grid>
		</div>
	</div>
</div>

<style>
	.inner {
		display: flex;
		justify-content: center;
		max-width: 800px;
		margin: 0 auto;
	}

	.g {
		padding: 0 8px;
		width: 50%;
	}
</style>
