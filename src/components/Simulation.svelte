<script>
	import S from "$utils/simulator.js";
	import loadImage from "$utils/loadImage.js";

	let { size } = $props();
	let element = $state(undefined);
	let ready = $state(false);
	let keys = $state({});

	let img;
	let canvasMowed;
	let ctxMowed;
	let canvas;
	let ctx;
	let transform = $state("none");

	const sim = S();

	function onKeydown(e) {
		if (e.key === "ArrowUp") keys.up = true;
		else if (e.key === "ArrowDown") keys.down = true;
		else if (e.key === "ArrowLeft") keys.left = true;
		else if (e.key === "ArrowRight") keys.right = true;
	}

	function onKeyup(e) {
		if (e.key === "ArrowUp") keys.up = false;
		else if (e.key === "ArrowDown") keys.down = false;
		else if (e.key === "ArrowLeft") keys.left = false;
		else if (e.key === "ArrowRight") keys.right = false;
	}

	function resize() {
		if (ready) sim.resize(size);
	}

	function tick() {
		const arr = Object.keys(keys).filter((d) => keys[d]);
		if (arr.length) sim.steer(arr);
		requestAnimationFrame(tick);
	}

	function paintPixels(pixels) {
		ctxMowed.fillStyle = "#0c0";
		pixels.forEach((p) => ctxMowed.fillRect(p.x, p.y, 1, 1));
	}

	function update(bounds) {
		const boundsWidth = bounds.max.x - bounds.min.x;
		const boundsHeight = bounds.max.y - bounds.min.y;

		// Calculate the scale factors based on the bounds and canvas size
		const boundsScaleX = 1000 / boundsWidth;
		const boundsScaleY = 1000 / boundsHeight;

		// Reset the transform before applying new ones
		ctx.setTransform(1, 0, 0, 1, 0, 0); // Identity matrix
		ctx.clearRect(0, 0, 1000, 1000); // Clear the canvas

		// Apply scaling first, then translation to ensure the order is correct
		ctx.scale(boundsScaleX, boundsScaleY);
		ctx.translate(-bounds.min.x, -bounds.min.y);

		// Draw the image (scaled and translated correctly)
		ctx.drawImage(canvasMowed, 0, 0);
		// draw image from a png
		// ctx.drawImage(img, 0, 0);
	}

	async function init() {
		ctx = canvas.getContext("2d");
		ctxMowed = canvasMowed.getContext("2d");
		sim.on("ready", () => (ready = true));
		sim.on("pixels", paintPixels);
		sim.on("update", update);
		sim.init(element);
		requestAnimationFrame(tick);
		img = await loadImage("assets/images/keanu.jpg");
	}

	$effect(init);

	$effect(resize);
</script>

<!-- TODO replace with buttons -->
<svelte:window onkeydown={onKeydown} onkeyup={onKeyup} />
<div class="c">
	<div class="bg">
		<!-- <img src="assets/images/keanu.jpg" alt="keanu face" /> -->
		<canvas class="mowed" width="1000" height="1000" bind:this={canvasMowed}
		></canvas>
		<canvas width="1000" height="1000" bind:this={canvas}></canvas>
		<img class="border" src="assets/sprites/border.png" alt="border" />
	</div>
	<div
		class="fg"
		bind:this={element}
		style:width="{size}px"
		style:height="{size}px"
	></div>
</div>

<style>
	.c {
		display: flex;
		justify-content: center;
		position: relative;
	}

	.bg {
		width: 100%;
		height: 100%;
		position: absolute;
		top: 0;
		left: 0;
		background: #0a0;
		overflow: hidden;
	}

	canvas {
		width: 100%;
		height: 100%;
		position: absolute;
		top: 0;
		left: 0;
		display: block;
	}

	canvas.mowed {
		visibility: hidden;
	}

	img {
		width: 100%;
		height: 100%;
		position: absolute;
		top: 0;
		left: 0;
	}

	.fg {
		position: relative;
	}
</style>
