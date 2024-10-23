import Matter from "matter-js";
import * as S from "$data/specs.js";

const SIZE = 1000;
const TURN_ANGLE = 0.01;
const MAX_SPEED = 5;
const FORCE_MAGNITUDE = 0.005;
const FRICTION = 0.1;

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

	function createMower() {
		const frictionAir = FRICTION;

		const x = SIZE / 2;
		const y = SIZE / 2;
		const w = S.mowerW;
		const h = S.mowerH;

		mower = Matter.Bodies.rectangle(x, y, w, h, {
			frictionAir,
			render: {
				fillStyle: "black"
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
		// const a = Matter.Bodies.circle(
		// 	S.center,
		// 	S.center,
		// 	S.boardR,
		// 	{
		// 		isStatic: true,
		// 		isSensor: true,
		// 		render: {
		// 			visible,
		// 			fillStyle: "rgba(0,0,0,0)",
		// 			lineWidth: 1
		// 		},
		// 		label: "surface"
		// 	},
		// 	64
		// );
		// Matter.Composite.add(world, [
		// ]);
	}

	function afterRender() {
		const ctx = render.context;
	}

	function beforeUpdate() {
		// todo updates steering
	}

	function trackPixels() {
		const { x, y } = mower.position;

		const pixelX = Math.round(x);
		const pixelY = Math.round(y);

		// find all pixels within a radius of S.mowerR
		const newPixels = [];
		const r = S.mowerR / 2 - 1;
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
		const totalPixels = SIZE * SIZE;
		const mowedPixels = pixels.flat().filter((p) => p).length;
		emitter.emit("pixels", newPixels);
	}

	function afterUpdate() {
		// todo track mowing
		trackPixels();
		console.log("a");
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
		if (keys.includes("left")) {
			Matter.Body.rotate(mower, -TURN_ANGLE);
		} else if (keys.includes("right")) {
			Matter.Body.rotate(mower, TURN_ANGLE);
		}

		// Apply forward or reverse force based on input
		if (keys.includes("up")) {
			applyForceInDirection("forward");
		} else if (keys.includes("down")) {
			applyForceInDirection("reverse");
		}

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

		// Matter.Events.on(render, "afterRender", afterRender);
		// Matter.Events.on(engine, "collisionActive", collisionActive);
		// Matter.Events.on(engine, "collisionStart", collisionStart);
		Matter.Events.on(engine, "afterUpdate", afterUpdate);
		createMower();
		// createObstacles();
		emitter.emit("ready");
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
