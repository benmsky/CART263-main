import * as THREE from 'three';
import { FirstPersonControls } from 'three/addons/controls/FirstPersonControls.js';
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { ImprovedNoise } from 'three/addons/math/ImprovedNoise.js';
import { Sky } from 'three/addons/objects/Sky.js';
import { Butterfly } from '/js/Butterfly.js';

// --- Core Setup ---
const scene = new THREE.Scene();

// Skybox setup
const sky = new Sky();
sky.scale.setScalar( 450000 );
scene.add( sky );

const skyUniforms = sky.material.uniforms;
skyUniforms[ 'turbidity' ].value = 5; // Low for clear, cartoonish sky
skyUniforms[ 'rayleigh' ].value = 5; // High for light blue
skyUniforms[ 'mieCoefficient' ].value = 0.001; // Low for subtle clouds
skyUniforms[ 'mieDirectionalG' ].value = 0.8;

const sun = new THREE.Vector3();
const phi = THREE.MathUtils.degToRad( 90 - 5 ); // Sun position for light
const theta = THREE.MathUtils.degToRad( 180 );
sun.setFromSphericalCoords( 1, phi, theta );
skyUniforms[ 'sunPosition' ].value.copy( sun );

const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 2000);
camera.position.set(0, 0, 2000);
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
controls = new FirstPersonControls( camera, renderer.domElement );
controls.movementSpeed = 150;
controls.lookSpeed = 0.1;

// --- Lighting ---
const ambientLight = new THREE.AmbientLight(0xffffff); // Bright ambient to see fish
scene.add(ambientLight);

const spotRay1 = new THREE.SpotLight( 0xffffff );
spotRay1.position.set(-30, 1000, 100 ); // placed above the water
spotRay1.angle = Math.PI/100;
spotRay1.penumbra = 0.5;
// const spotRay1TargetPlane = new THREE.PlaneGeometry(100, 100);
// const spotRayTargetMaterial = new THREE.MeshBasicMaterial({wireframe: true})
// const spotRay1Target = new THREE.Mesh(spotRay1TargetPlane, spotRayTargetMaterial);
// scene.add(spotRay1Target)
// spotRay1Target.position.set(-30, -1000, 0);
// spotRay1.target = spotRay1Target;
scene.add(spotRay1);
// const spotLightHelper1 = new THREE.SpotLightHelper( spotRay1 );
// scene.add(spotLightHelper1);

// const spotRay2 = new THREE.SpotLight( 0xffffff );
// spotRay2.position.set(100, 1000, 100 ); // placed above the water
// spotRay2.angle = Math.PI/100;
// spotRay2.penumbra = 0.5;
// // const spotRay2TargetPlane = new THREE.PlaneGeometry(100, 100);
// // const spotRay2Target = new THREE.Mesh(spotRay2TargetPlane, spotRayTargetMaterial);
// // scene.add(spotRay2Target)
// // spotRay2Target.position.set(400, -1000, 0);
// // spotRay2.target = spotRay2Target;
// scene.add(spotRay2);
// const spotLightHelper2 = new THREE.SpotLightHelper(spotRay2);
// scene.add(spotLightHelper2);

const light = new THREE.DirectionalLight( 0xFFFFFF ); // Sunlight
scene.add(light);


// Our butterflies
let butterflies = {
    numButterflies: 100,
    swarm: [],
};

// From THREE.js "geometry / terrain" example
//  https://github.com/mrdoob/three.js/blob/master/examples/webgl_geometry_terrain.html
let mesh, texture;
const worldWidth = 256, worldDepth = 256;

scene.fog = new THREE.FogExp2( 0x87CEEB, 0.0005 );

const data = generateHeight( worldWidth, worldDepth );

const geometry = new THREE.PlaneGeometry( 7500, 7500, worldWidth - 1, worldDepth - 1 );
geometry.rotateX( - Math.PI / 2 );

const vertices = geometry.attributes.position.array;

for ( let i = 0, j = 0, l = vertices.length; i < l; i ++, j += 3 ) {
    vertices[ j + 1 ] = data[ i ] * 10;
}

texture = new THREE.CanvasTexture( generateTexture( data, worldWidth, worldDepth ) );
texture.wrapS = THREE.ClampToEdgeWrapping;
texture.wrapT = THREE.ClampToEdgeWrapping;
texture.colorSpace = THREE.SRGBColorSpace;

mesh = new THREE.Mesh( geometry, new THREE.MeshBasicMaterial( { map: texture } ) );
mesh.position.set(0, -1000, 0);
scene.add( mesh );

function generateHeight( width, height ) {

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

function generateTexture( data, width, height ) {

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

		imageData[ i ] = ( shade * 30 ) * ( 0.5 + data[ j ] * 0.007 );
		imageData[ i + 1 ] = ( 150 + shade * 100 ) * ( 0.5 + data[ j ] * 0.007 );
		imageData[ i + 2 ] = ( shade * 30 ) * ( 0.5 + data[ j ] * 0.007 );

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

// Populate the world with butterflies
for (let i = 0; i < butterflies.numButterflies; i++) {
    let x = Math.random() * 7500 - 3750;
    let y = Math.random() * 400 - 200;
    let z = Math.random() * 7500 - 3750;
    let size = Math.random() * 5 + 8;
    let butterfly = new Butterfly(scene, x, y, z, size);
    butterflies.swarm.push(butterfly);
}

/*
* Assigns the mouse X and mouse Y position as the target for the butterflies to follow, activates seek behaviour
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
    butterflies.swarm.forEach(Butterfly => Butterfly.seek(mouse));
}

let elapsedTime = 0;
function animate(timer) {
    requestAnimationFrame(animate);
    
    const delta = 0.001*(timer - elapsedTime) ;
    // console.log(delta)
    elapsedTime = timer;
    
    // Update all butterflies (this handles butterfly movement and animation)
    butterflies.swarm.forEach(Butterfly => Butterfly.update(delta));
    // butterflies.swarm.forEach(Butterfly => Butterfly.checkEdges());
    butterflies.swarm.forEach(Butterfly => Butterfly.separate(butterflies.swarm));
    window.addEventListener("pointermove", assign); // when the mouse moves, the seek behaviour is activated (seek state)
    // document.querySelector(".water").addEventListener("touchmove", assignTouch); // when the touch moves, the seek behaviour is activated (seek state)
    
    controls.update(delta);
    renderer.render(scene, camera);
}

animate(0);

// Handle window resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
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
//         for (let fish of aquarium.school) {
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