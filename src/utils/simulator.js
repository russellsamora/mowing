import Matter from "matter-js";
import * as S from "$data/specs.js";
import { scaleLinear } from "d3";
import loadImage from "$utils/loadImage.js";

const SIZE = 1000;
const TURN_ANGLE = 0.01;
const MAX_SPEED = 5;
const FORCE_MAGNITUDE = 0.005;
const FRICTION = 0.1;
const SCALE = scaleLinear()
	.domain([0.1, MAX_SPEED / 2])
	.clamp(true)
	.range([1, 1.5]);

// import { Howl } from "howler";
// import { muted } from "$stores/misc.js";
// import { base } from "$app/paths";

// let globalMuted;

// Create a new sound
// const DISC_SOUND = new Howl({
// 	src: [`${base}/assets/audio/disc.mp3`]
// });

// muted.subscribe((value) => {
// 	globalMuted = value;
// });

// Define a simple event emitter class
class EventEmitter {
	constructor() {
		this.events = {};
	}

	// Register an event listener
	on(event, listener) {
		if (!this.events[event]) {
			this.events[event] = [];
		}
		this.events[event].push(listener);
	}

	// Emit an event
	emit(event, data) {
		if (this.events[event]) {
			this.events[event].forEach((listener) => listener(data));
		}
	}
}

export default function simulator() {
	const emitter = new EventEmitter();

	let engine;
	let world;
	let runner;
	let render;
	let muteOverride;
	let mower;
	let pixels;
	let state;
	let mowerImage;
	let ready;

	function createMower() {
		const frictionAir = FRICTION;

		const x = S.mowerW;
		const y = S.mowerH;
		const w = S.mowerW;
		const h = S.mowerH;

		mower = Matter.Bodies.rectangle(x, y, w, h, {
			frictionAir,
			render: {
				fillStyle: "#a0a",
				visible: false
			},
			label: "mower",
			sleepThreshold: Infinity,
			isSleeping: false,
			isStatic: false
		});

		// Matter.Body.setCentre(mower, { x: 0, y: 0 }, true);
		Matter.Events.on(mower, "sleepStart", sleepStart);
		Matter.Composite.add(world, mower);
	}

	function createObstacles() {
		const a = Matter.Bodies.rectangle(300, 300, 200, 100, {
			isStatic: true,
			isSleeping: true,
			render: {
				fillStyle: "#000",
				opacity: 1
			},
			label: "obstacle"
		});

		const b = Matter.Bodies.circle(700, 600, 150, {
			isStatic: true,
			isSleeping: true,
			render: {
				fillStyle: "#000"
			},
			label: "obstacle"
		});
		Matter.Composite.add(world, [a, b]);
	}

	function createFence() {
		// 4 thin rectangles to form at edge of boundary
		const fences = [];
		for (let i = 0; i < 4; i++) {
			const w = i % 2 === 0 ? SIZE : 10;
			const h = i % 2 === 1 ? SIZE : 10;
			const x = i % 2 === 0 ? SIZE / 2 : i === 1 ? SIZE : 0;
			const y = i % 2 === 1 ? SIZE / 2 : i === 2 ? SIZE : 0;

			const f = Matter.Bodies.rectangle(x, y, w, h, {
				isStatic: true,
				isSleeping: true,
				label: "fence",
				render: {
					fillStyle: "#000"
				}
			});
			fences.push(f);
		}
		Matter.Composite.add(world, fences);
	}

	function beforeUpdate() {
		// todo updates steering
	}

	function trackPixels() {
		// let { x, y } = mower.position;

		// the mower width is 150, the height is 100
		// i want to tracked pixels to be in the right third of that 150x100 rectangle
		// include angle

		const angle = mower.angle;
		let x = mower.position.x;
		let y = mower.position.y;

		x = x + (Math.cos(angle) * S.mowerW) / 6;
		y = y + (Math.sin(angle) * S.mowerW) / 6;

		const pixelX = Math.round(x);
		const pixelY = Math.round(y);

		const newPixels = [];
		const r = S.mowerR - 1;
		const r2 = r * r;
		for (let i = -r; i < r; i++) {
			for (let j = -r; j < r; j++) {
				const d2 = i * i + j * j;
				if (d2 <= r2) {
					const px = pixelX + i;
					const py = pixelY + j;
					if (px >= 0 && px < SIZE && py >= 0 && py < SIZE) {
						pixels[px][py] = true;
						newPixels.push({ x: px, y: py });
					}
				}
			}
		}

		// if (pixelX >= 0 && pixelX < SIZE && pixelY >= 0 && pixelY < SIZE)
		// 	pixels[pixelX][pixelY] = true;

		// log percent of pixels mowed
		// const totalPixels = SIZE * SIZE;
		// const mowedPixels = pixels.flat().filter((p) => p).length;
		emitter.emit("pixels", newPixels);
	}

	function panCamera() {
		render.bounds.min.x = mower.position.x - SIZE / 2;
		render.bounds.min.y = mower.position.y - SIZE / 2;
		render.bounds.max.x = mower.position.x + SIZE / 2;
		render.bounds.max.y = mower.position.y + SIZE / 2;
	}

	function zoomCamera(scale) {
		const centerX = (render.bounds.min.x + render.bounds.max.x) / 2;
		const centerY = (render.bounds.min.y + render.bounds.max.y) / 2;

		const newWidth = SIZE / scale;
		const newHeight = SIZE / scale;

		render.bounds.min.x = centerX - newWidth / 2;
		render.bounds.min.y = centerY - newHeight / 2;
		render.bounds.max.x = centerX + newWidth / 2;
		render.bounds.max.y = centerY + newHeight / 2;
	}

	function afterUpdate() {
		// todo track mowing
		trackPixels();

		const scale = 1;
		// const scale = mower.speed > 0.01 ? 1.5 : 1;
		// const scale =  SCALE(mower.speed);

		// panCamera();
		// zoomCamera(scale);

		emitter.emit("update", render.bounds);
	}

	function afterRender() {
		if (!ready) return;

		// Apply Matter.js view transform (for pan/zoom)
		Matter.Render.startViewTransform(render);

		// Render the mower with the correct scale and transformations
		renderMower();

		// Reset the transform to avoid affecting other draws

		Matter.Render.endViewTransform(render);
	}

	function renderMower() {
		const ctx = render.context;

		const { x, y } = mower.position;
		const w = S.mowerW;
		const h = S.mowerH;

		const frame = Math.floor((Date.now() / 200) % 1); // Alternate frames
		const frameX = frame * S.mowerW; // X offset on spritesheet

		// ctx.save();

		// Translate and rotate based on the mower's world position and angle
		ctx.translate(x, y);
		ctx.rotate(mower.angle);

		// Draw the appropriate frame of the mower sprite
		ctx.drawImage(
			mowerImage,
			frameX,
			0,
			mowerImage.width,
			mowerImage.height,
			-w / 2,
			-h / 2,
			w,
			h
		);

		// ctx.restore();
	}

	function collisionActive(event) {
		// twenty hole
		event.pairs.forEach(({ bodyA, bodyB }) => {
			const disc =
				bodyA.label === "disc" ? bodyA : bodyB.label === "disc" ? bodyB : null;
			const zone20 =
				bodyA.label === "20" ? bodyA : bodyB.label === "20" ? bodyB : null;

			if (disc && zone20 && !disc.in20) {
				const dist = Matter.Vector.magnitude(
					Matter.Vector.sub(disc.position, zone20.position)
				);

				const discRadius = disc.circleRadius;

				const distThreshold = discRadius * 0.75;
				const speedThreshold = 10;

				const isClose = dist < distThreshold;
				const isSlow = disc.speed < speedThreshold;

				const enableTrap = isClose && isSlow;

				if (enableTrap) {
					if (!globalMuted && !muteOverride) {
						const v = Math.min(1, disc.speed * 0.03);

						HOLE_SOUND.volume(v);
						HOLE_SOUND.play();
					}
					disc.in20 = true;
					disc.collisionFilter.mask =
						DISC_CATEGORY | PEG_CATEGORY | RIM_CATEGORY | TRAP_CATEGORY;
					disc.restitution = 0.4;
				}
			}
		});
	}

	function collisionStart(event) {
		event.pairs.forEach(({ bodyA, bodyB }) => {
			const disc =
				bodyA.label === "disc" ? bodyA : bodyB.label === "disc" ? bodyB : null;

			const otherDisc =
				bodyA.label === "disc" && bodyA.id !== disc.id
					? bodyA
					: bodyB.label === "disc" && bodyB.id !== disc.id
						? bodyB
						: null;

			const rim =
				bodyA.label === "trap rim"
					? bodyA
					: bodyB.label === "trap rim"
						? bodyB
						: null;

			if (disc && rim) {
				if (!globalMuted && !muteOverride) {
					const v = Math.min(1, disc.speed * 0.05);
					RIM_SOUND.volume(v);
					RIM_SOUND.play();
				}
				disc.frictionAir = 0.3;
				disc.collisionFilter.mask =
					DISC_CATEGORY | PEG_CATEGORY | RIM_CATEGORY | SURFACE_CATEGORY;
			} else if (disc && otherDisc) {
				if (!globalMuted && !muteOverride) {
					const v = Math.min(1, disc.speed * 0.05);
					RIM_SOUND.volume(v);
					DISC_SOUND.play();
				}
				disc.collided = true;
				otherDisc.collided = true;
				const opp = disc.player !== otherDisc.player;
				disc.collidedOpp = opp;
				otherDisc.collidedOpp = opp;
			}
		});
	}

	function sleepStart(event) {}

	function steer(keys) {
		// Handle rotation
		// if (keys.includes("up") || keys.includes("down")) {
		// make point of transform the right middle of the mower
		// const p = {
		// 	x: mower.position.x + S.mowerW / 2,
		// 	y: mower.position.y
		// };
		if (keys.includes("left")) Matter.Body.rotate(mower, -TURN_ANGLE);
		else if (keys.includes("right")) Matter.Body.rotate(mower, TURN_ANGLE);
		// }

		// Apply forward or reverse force based on input
		if (keys.includes("up")) applyForceInDirection("forward");
		else if (keys.includes("down")) applyForceInDirection("reverse");

		// Cap the speed to prevent the mower from going too fast
		capSpeed(MAX_SPEED);
	}

	function applyForceInDirection(direction) {
		const angle = mower.angle;

		// Calculate the force direction: forward or reverse
		const force = {
			x:
				Math.cos(direction === "forward" ? angle : angle + Math.PI) *
				FORCE_MAGNITUDE,
			y:
				Math.sin(direction === "forward" ? angle : angle + Math.PI) *
				FORCE_MAGNITUDE
		};

		// Apply the force to the mower at its current position
		Matter.Body.applyForce(mower, mower.position, force);
	}

	function capSpeed(maxSpeed) {
		const speed = mower.speed;

		if (speed > maxSpeed) {
			const scalingFactor = maxSpeed / speed;

			// Scale the velocity to maintain the direction but reduce the magnitude
			Matter.Body.setVelocity(mower, {
				x: mower.velocity.x * scalingFactor,
				y: mower.velocity.y * scalingFactor
			});
		}
	}

	// function accelerate(dir) {
	// 	// dir can be "left", "right", undefined

	// 	// Get the current angle of the mower in radians
	// 	const angle = mower.angle;
	// 	const speed = mower.speed;
	// 	// Get the current speed and increment it, capping at MAX_SPEED
	// 	const newSpeed = Math.min(2, speed + 0.2);

	// 	// Matter.Body.set(mower, "isSleeping", false);
	// 	// set velocity
	// 	if (speed < 0.01) {
	// 		const force = { x: 0, y: newSpeed };
	// 		Matter.Body.setVelocity(mower, force);
	// 	} else {
	// 		Matter.Body.setSpeed(mower, newSpeed);
	// 	}
	// 	// console.log(newSpeed.toFixed(1));
	// 	// Calculate the new velocity components based on the new speed
	// 	// const newVelocity = {
	// 	// 	x: Math.cos(angle) * newSpeed,
	// 	// 	y: Math.sin(angle) * newSpeed
	// 	// };

	// 	// Set the new velocity to the mower
	// 	// Matter.Body.setVelocity(mower, newVelocity);
	// 	// Matter.Body.setSpeed(mower, newSpeed);
	// }

	function setState(v) {
		state = v;
	}

	function autoMute(v) {
		muteOverride = v;
	}

	function resize(w) {
		if (render) {
			let mower;
			render.canvas.width = w;
			render.canvas.height = w;

			Matter.Render.setSize(render, w, w);
			Matter.Render;

			Matter.Render.lookAt(render, {
				min: { x: 0, y: 0 },
				max: { x: SIZE, y: SIZE }
			});
		}
	}

	async function loadSprites() {
		mowerImage = await loadImage("assets/sprites/mower.png");
		ready = true;
		emitter.emit("ready");
	}

	function init(element) {
		pixels = Array.from({ length: SIZE }, () => Array(SIZE).fill(false));

		engine = Matter.Engine.create({
			enableSleeping: true
		});

		world = engine.world;

		engine.gravity.y = 0;

		runner = Matter.Runner.create();

		render = Matter.Render.create({
			element,
			engine,
			options: {
				width: SIZE,
				height: SIZE,
				wireframes: false,
				pixelRatio: "auto",
				background: "transparent",
				hasBounds: true
			}
		});

		Matter.Runner.run(runner, engine);
		Matter.Render.run(render);

		// Matter.Events.on(engine, "collisionActive", collisionActive);
		// Matter.Events.on(engine, "collisionStart", collisionStart);
		Matter.Events.on(render, "afterRender", afterRender);
		Matter.Events.on(engine, "afterUpdate", afterUpdate);
		createMower();
		createFence();
		createObstacles();
		loadSprites();
	}

	return {
		setState,
		autoMute,
		resize,
		init,
		steer,
		on: (event, listener) => emitter.on(event, listener)
	};
}
