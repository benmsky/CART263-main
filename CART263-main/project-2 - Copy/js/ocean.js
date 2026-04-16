import * as THREE from 'three';
import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { ImprovedNoise } from 'three/addons/math/ImprovedNoise.js';
import { Sky } from 'three/addons/objects/Sky.js';
import { Butterfly } from './Butterfly.js';
import { Fish } from './Fish.js';

// --- Core Setup ---
const scene = new THREE.Scene();
// for Ocean variation
// scene.background = new THREE.Color("rgb(0, 0, 155)"); // Blue, hexadecimal - water backdrop 

// Skybox setup for Sky variation
const sky = new Sky();
sky.scale.setScalar( 450000 );
scene.add( sky );
const skyUniforms = sky.material.uniforms;
skyUniforms[ 'turbidity' ].value = 20; // Increased for hazier, less saturated sky
skyUniforms[ 'rayleigh' ].value = 1; // Reduced for less blue, more muted
skyUniforms[ 'mieCoefficient' ].value = 0.001; // Low for subtle clouds
skyUniforms[ 'mieDirectionalG' ].value = 0.8;
const sun = new THREE.Vector3();
const phi = THREE.MathUtils.degToRad( 90 - 5 ); // Sun position for light
const theta = THREE.MathUtils.degToRad( 180 );
sun.setFromSphericalCoords( 1, phi, theta );
skyUniforms[ 'sunPosition' ].value.copy( sun );

const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 2000);
camera.position.set(0, 0, 0);
camera.lookAt(0, 0, 0);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);

// Controls
// const controls = new OrbitControls(camera, renderer.domElement);
// controls.enableDamping = true;
// controls.dampingFactor = 0.05;
// controls.maxDistance = 150;
// controls.minDistance = 20;
let controls;
controls = new PointerLockControls( camera, renderer.domElement );

// FPS movement variables
let moveForward = false;
let moveBackward = false;
let moveLeft = false;
let moveRight = false;
let moveUp = false; // Flag for upward movement
let moveDown = false; // Flag for downward movement
const speed = 500; // Controls speed of movement
const velocity = new THREE.Vector3(); // For smooth movement

// Key event handlers for FPS movement
function onKeyDown(event) { // Sets movement flags on key press
    switch (event.code) {
        case 'ArrowUp':
        case 'KeyW':
            moveForward = true;
            break;
        case 'ArrowLeft':
        case 'KeyA':
            moveLeft = true;
            break;
        case 'ArrowDown':
        case 'KeyS':
            moveBackward = true;
            break;
        case 'ArrowRight':
        case 'KeyD':
            moveRight = true;
            break;
        case 'Space': // Spacebar for upward movement
            moveUp = true;
            break;
        case 'KeyC': // C key for downward movement
            moveDown = true;
            break;
    }
}

function onKeyUp(event) { // Resets movement flags on key release
    switch (event.code) {
        case 'ArrowUp':
        case 'KeyW':
            moveForward = false;
            break;
        case 'ArrowLeft':
        case 'KeyA':
            moveLeft = false;
            break;
        case 'ArrowDown':
        case 'KeyS':
            moveBackward = false;
            break;
        case 'ArrowRight':
        case 'KeyD':
            moveRight = false;
            break;
        case 'Space': // Reset upward movement
            moveUp = false;
            break;
        case 'KeyC': // Reset downward movement
            moveDown = false;
            break;
    }
}

document.addEventListener('keydown', onKeyDown);
document.addEventListener('keyup', onKeyUp);
document.addEventListener('click', () => controls.lock()); // Locks mouse pointer for FPS look

// --- Lighting ---
const ambientLight = new THREE.AmbientLight(0xffffff, 0.3); // Soft overall illumination
scene.add(ambientLight);

const light = new THREE.DirectionalLight( 0xFFFFFF, 0.5 ); // Main directional light source
scene.add(light);


// Our fish in the Ocean variation
// let ocean = {
//     numFish: 100,
//     school: [],
// };

// Our butterflies in the Sky
let butterflies = {
    numButterflies: 100, // Number of butterflies to create
    swarm: [], // Array to hold butterfly objects
};

// Terrain generation
let mesh, texture;
const worldWidth = 256, worldDepth = 256; // Dimensions of terrain grid

scene.fog = new THREE.FogExp2( 0x87CEEB, 0.0005 ); // Atmospheric fog effect

const data = generateHeight( worldWidth, worldDepth ); // Generate height map

// Function to get terrain height at world position
function getTerrainHeight(x, z) {
    const xNorm = (x + 3750) / 7500 * 255;
    const zNorm = (z + 3750) / 7500 * 255;
    const ix = Math.floor(Math.max(0, Math.min(255, xNorm)));
    const iz = Math.floor(Math.max(0, Math.min(255, zNorm)));
    const index = iz * 256 + ix;
    return -1000 + data[index] * 10; // Terrain base y + height
}

const geometry = new THREE.PlaneGeometry( 7500, 7500, worldWidth - 1, worldDepth - 1 ); // Terrain plane geometry
geometry.rotateX( - Math.PI / 2 );

const vertices = geometry.attributes.position.array;

for ( let i = 0, j = 0, l = vertices.length; i < l; i ++, j += 3 ) {
    vertices[ j + 1 ] = data[ i ] * 10; // Apply height to vertices
}

const loader = new THREE.TextureLoader();
const grassTexture = loader.load('models/animated_low_poly_fish_gltf/textures/grasstextures.jpg'); // Load terrain texture

grassTexture.wrapS = THREE.RepeatWrapping;
grassTexture.wrapT = THREE.RepeatWrapping;
grassTexture.repeat.set(64, 64); // Texture tiling
grassTexture.colorSpace = THREE.SRGBColorSpace;

mesh = new THREE.Mesh( // Create terrain mesh
    geometry,
    new THREE.MeshStandardMaterial({
        map: grassTexture
    })
);

mesh.position.set(0, -1000, 0); // Position terrain below camera
scene.add( mesh );

function generateHeight( width, height ) { // Generates height map using Perlin noise

	let seed = Math.PI / 4;
	window.Math.random = function () {

		const x = Math.sin( seed ++ ) * 10000;
		return x - Math.floor( x );

	};

	const size = width * height, data = new Uint8Array( size );
	const perlin = new ImprovedNoise(), z = Math.random() * 100;

	let quality = 1;

	for ( let j = 0; j < 4; j ++ ) {

		for ( let i = 0; i < size; i ++ ) {

			const x = i % width, y = ~ ~ ( i / width );
			data[ i ] += Math.abs( perlin.noise( x / quality, y / quality, z ) * quality * 1.75 );

		}

		quality *= 5;

	}

	return data;

}

function generateTexture( data, width, height ) { // Creates shading texture from height data

	let context, image, imageData, shade;

	const vector3 = new THREE.Vector3( 0, 0, 0 );

	const sun = new THREE.Vector3( 1, 1, 1 );
	sun.normalize();

	const canvas = document.createElement( 'canvas' );
	canvas.width = width;
	canvas.height = height;

	context = canvas.getContext( '2d' );
	context.fillStyle = '#000';
	context.fillRect( 0, 0, width, height );

	image = context.getImageData( 0, 0, canvas.width, canvas.height );
	imageData = image.data;

	for ( let i = 0, j = 0, l = imageData.length; i < l; i += 4, j ++ ) {

		vector3.x = data[ j - 2 ] - data[ j + 2 ];
		vector3.y = 2;
		vector3.z = data[ j - width * 2 ] - data[ j + width * 2 ];
		vector3.normalize();

		shade = vector3.dot( sun );

		imageData[ i ] = ( 96 + shade * 128 ) * ( 0.5 + data[ j ] * 0.007 );
		imageData[ i + 1 ] = ( 32 + shade * 96 ) * ( 0.5 + data[ j ] * 0.007 );
		imageData[ i + 2 ] = ( shade * 96 ) * ( 0.5 + data[ j ] * 0.007 );

	}

	context.putImageData( image, 0, 0 );

	// Scaled 4x

	const canvasScaled = document.createElement( 'canvas' );
	canvasScaled.width = width * 4;
	canvasScaled.height = height * 4;

	context = canvasScaled.getContext( '2d' );
	context.scale( 4, 4 );
	context.drawImage( canvas, 0, 0 );

	image = context.getImageData( 0, 0, canvasScaled.width, canvasScaled.height );
	imageData = image.data;

	for ( let i = 0, l = imageData.length; i < l; i += 4 ) {

		const v = ~ ~ ( Math.random() * 5 );

		imageData[ i ] += v;
		imageData[ i + 1 ] += v;
		imageData[ i + 2 ] += v;

	}

	context.putImageData( image, 0, 0 );

	return canvasScaled;

}

// Populate the ocean
// for (let i = 0; i < ocean.numFish; i++) {
//     let x = Math.random() * 100;
//     x = map_range(x, 0, 100, -100, 100);
//     let y = Math.random() * 100;
//     y = map_range(y, 0, 100, -100, 100);
//     let z = Math.random() * 100;
//     z = map_range(z, 0, 100, -100, 100);
//     // console.log([x,y,z])
//     let size = Math.random() * 5 + 8;
//         // let color = {
//         //     r: Math.random() * 255,
//         //     g: Math.random() * 200,
//         //     b: Math.random() * 255,
//         // }
//     const gltfLoader = new GLTFLoader();
//     let fishModel = await gltfLoader.loadAsync("models/animated_low_poly_fish_gltf/scene.gltf");
//     let oceanModels = []
//     oceanModels.push(fishModel)
//     let fish = new Fish(scene, x, y, z, size, oceanModels);
//     ocean.school.push(fish);
// }

// Populate the world with butterflies
for (let i = 0; i < butterflies.numButterflies; i++) { // Create each butterfly with random position and size
    let x = Math.random() * 7500 - 3750;
    let y = Math.random() * 400 - 200;
    let z = Math.random() * 7500 - 3750;
    let size = Math.random() * 5 + 8;
    let butterfly = new Butterfly(scene, x, y, z, size);
    butterflies.swarm.push(butterfly);
}

/*
* Assigns the mouse X and mouse Y position as the target for the fish to follow, activates seek behaviour
*/
function assign(e) {
    // imitates p5's mouseX and mouseY
    let touch = {
        pageX: e.pageX,
        pageY: e.pageY,  
    }
    let mouseX = touch.pageX;
    mouseX = map_range(mouseX, 0, innerWidth, -innerWidth/2, innerWidth/2)
    // console.log(mouseX)
    let mouseY = touch.pageY;
    mouseY = map_range(mouseY, 0, innerHeight, innerHeight/2, -innerHeight/2)
    /*
    * Optimized by following the method of taking the mouse Vector out of the loop, The Nature of Code, ch 5, "Algorithmic Efficiency"
    https://natureofcode.com/autonomous-agents/#algorithmic-efficiency-or-why-does-my-sketch-run-so-slowly
    */
    let mouse = new THREE.Vector3(mouseX, mouseY, 0);
	// Ocean variation
    // ocean.school.forEach(Fish => Fish.seek(mouse));
	// Sky variation
	butterflies.swarm.forEach(Butterfly => Butterfly.seek(mouse));
}
let elapsedTime = 0;
function animate(timer) { // Main animation loop
    requestAnimationFrame(animate);
    
    const delta = 0.001*(timer - elapsedTime) ; // Time since last frame
    elapsedTime = timer;
   
	// Update all butterflies (this handles butterfly movement and animation)
    butterflies.swarm.forEach(Butterfly => Butterfly.update(delta));
    // butterflies.swarm.forEach(Butterfly => Butterfly.checkEdges());
    butterflies.swarm.forEach(Butterfly => Butterfly.separate(butterflies.swarm));
	
    // FPS movement in camera direction
    const moveVector = new THREE.Vector3(); // Accumulates desired movement direction
    if (moveForward) {
        const forward = new THREE.Vector3();
        camera.getWorldDirection(forward); // Get camera's forward vector
        moveVector.add(forward);
    }
    if (moveBackward) {
        const backward = new THREE.Vector3();
        camera.getWorldDirection(backward);
        moveVector.add(backward.negate()); // Opposite of forward
    }
    if (moveLeft) {
        const left = new THREE.Vector3();
        camera.getWorldDirection(left).cross(camera.up); // Calculate left vector
        moveVector.add(left.negate());
    }
    if (moveRight) {
        const right = new THREE.Vector3();
        camera.getWorldDirection(right).cross(camera.up); // Calculate right vector
        moveVector.add(right);
    }
    if (moveUp) {
        moveVector.add(camera.up); // Move upward along camera's up vector
    }
    if (moveDown) {
        moveVector.add(camera.up.clone().negate()); // Move downward
    }
    if (moveVector.length() > 0) {
        moveVector.normalize().multiplyScalar(speed); // Normalize and scale by speed
    }
    
    // Smooth movement with velocity interpolation
    velocity.lerp(moveVector, 0.1); // Gradually approach target velocity
    camera.position.add(velocity.clone().multiplyScalar(delta)); // Apply movement
    
    // Collision detection with terrain - smooth adjustment
    const terrainY = getTerrainHeight(camera.position.x, camera.position.z); // Get height at current position
    const targetY = terrainY + 20; // Desired minimum height above terrain
    if (camera.position.y < targetY) {
        camera.position.y = THREE.MathUtils.lerp(camera.position.y, targetY, 0.1); // Smoothly adjust height
    }
    
    // Prevent camera from going beyond terrain bounds
    camera.position.x = THREE.MathUtils.clamp(camera.position.x, -3750, 3750); // Clamp X position
    camera.position.z = THREE.MathUtils.clamp(camera.position.z, -3750, 3750); // Clamp Z position
    
    renderer.render(scene, camera);
}
// Removed pointermove listener for FPS controls
// window.addEventListener("pointermove", assign); // when the mouse moves, the seek behaviour is activated (seek state)
    // document.querySelector(".water").addEventListener("touchmove", assignTouch); // when the touch moves, the seek behaviour is activated (seek state)
    
animate(0);

// Handle window resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight; // Update camera aspect ratio
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight); // Resize renderer
	controls.handleResize();
});

// Source - https://stackoverflow.com/a/5650012
// Posted by Alnitak, modified by community. See post 'Timeline' for change history
// Retrieved 2026-04-06, License - CC BY-SA 3.0
function map_range(value, low1, high1, low2, high2) {
    return low2 + (high2 - low2) * (value - low1) / (high1 - low1);
}


// function assignTouch(e) {
//     e.preventDefault();

//     for (const changedTouch of e.changedTouches) {
//         console.log(e.changedTouches)
//         const touch = ongoingTouches.get(changedTouch.identifier);
//         ongoingTouches.set(changedTouch.identifier, newTouch);
    
//     //     if (!touch) {
//     //         console.error(`Move: Could not find touch ${changedTouch.identifier}`);
//     //         continue;
//     //     }

//         const newTouch = {
//             pageX: changedTouch.pageX,
//             pageY: changedTouch.pageY,
//         };

//         let touchX = changedTouch.pageX
//         let touchY = changedTouch.pageY
//         let finger = new Vector(touchX, touchY);
//         for (let fish of ocean.school) {
//             fish.seek(finger);
//         }        
//     }
// }

// let flock;

// function setup() {
//   createCanvas(640, 360);
//   createP('Drag the mouse to generate new boids.');

//   flock = new Flock();

//   // Add an initial set of boids into the system
//   for (let i = 0; i < 100; i++) {
//     let b = new Boid(width / 2, height / 2);
//     flock.addBoid(b);
//   }

//   describe(
//     'A group of bird-like objects, represented by triangles, moving across the canvas, modeling flocking behavior.'
//   );
// }

// function draw() {
//   background(0);
//   flock.run();
// }

// // On mouse drag, add a new boid to the flock
// function mouseDragged() {
//   flock.addBoid(new Boid(mouseX, mouseY));
// }

// // Flock class to manage the array of all the boids
// class Flock {
//   constructor() {
//     // Initialize the array of boids
//     this.boids = [];
//   }

//   run() {
//     for (let boid of this.boids) {
//       // Pass the entire list of boids to each boid individually
//       boid.run(this.boids);
//     }
//   }

//   addBoid(b) {
//     this.boids.push(b);
//   }
// }