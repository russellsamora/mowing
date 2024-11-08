<script>
	import Grid from "$components/Grid.svelte";

	const size = 10;
	let position = $state({ x: 0, y: 0 });
	let path = $state([{ x: 0, y: 0 }]);

	function onKeydown(e) {
		let dir;

		if (e.key === "ArrowUp") dir = { x: 0, y: -1 };
		else if (e.key === "ArrowDown") dir = { x: 0, y: 1 };
		else if (e.key === "ArrowLeft") dir = { x: -1, y: 0 };
		else if (e.key === "ArrowRight") dir = { x: 1, y: 0 };

		position.x += dir.x;
		position.y += dir.y;

		position.x = Math.max(0, Math.min(size - 1, position.x));
		position.y = Math.max(0, Math.min(size - 1, position.y));
		path.push({ x: position.x, y: position.y });
	}
</script>

<Grid {size} {path}></Grid>
<svelte:window onkeydown={onKeydown} />
