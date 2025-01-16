<script>
	import Grid from "$components/Grid.svelte";
	import obstacles from "$data/obstacles.json";
	import solution from "$data/solution.json";
	const size = 10;
	const user = [
		[0, 0],
		[1, 0],
		[2, 0]
	];
</script>

<div class="c">
	<div class="inner">
		<div class="g">
			<Grid
				{size}
				perspective={false}
				{obstacles}
				path={user}
				game={false}
				--path="var(--color-green-medium)"
			></Grid>
		</div>
		<div class="g">
			<Grid
				{size}
				perspective={false}
				{obstacles}
				path={solution}
				game={false}
				--path="var(--color-orange-medium)"
			></Grid>
		</div>
	</div>
</div>

<style>
	.inner {
		display: flex;
		justify-content: center;
		max-width: 640px;
		margin: 0 auto;
	}

	.g {
		padding: 0 8px;
		width: 50%;
	}
</style>
