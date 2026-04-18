import * as THREE from 'three';
import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { ImprovedNoise } from 'three/addons/math/ImprovedNoise.js';
import { Sky } from 'three/addons/objects/Sky.js';
import { GPUComputationRenderer } from 'three/addons/misc/GPUComputationRenderer.js';
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

const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 10000);
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

// Terrain generation
let mesh, texture;
const worldWidth = 256, worldDepth = 256; // Dimensions of terrain grid

scene.fog = new THREE.FogExp2( 0x87CEEB, 0.0005 ); // Atmospheric fog effect

const data = generateHeight( worldWidth, worldDepth ); // Generate height map

// Upload terrain heights as a texture so the GPU bird shader can do collision
const terrainTex = new THREE.DataTexture( data, worldWidth, worldDepth, THREE.LuminanceFormat, THREE.UnsignedByteType );
terrainTex.needsUpdate = true;

// Function to get terrain height at world position (bilinear interpolation)
// Z uses 253 to match the terrain geometry's actual segment count (worldDepth - 3)
function getTerrainHeight(x, z) {
    const xNorm = (x + 3750) / 7500 * 255;  // 256 X vertices, 255 segments
    const zNorm = (z + 3750) / 7500 * 253;  // 254 Z vertices, 253 segments (worldDepth-3)
    const ix = Math.floor(Math.max(0, Math.min(254, xNorm)));
    const iz = Math.floor(Math.max(0, Math.min(252, zNorm)));
    const fx = xNorm - ix;
    const fz = zNorm - iz;
    const h00 = data[ iz       * 256 + ix     ];
    const h10 = data[ iz       * 256 + ix + 1 ];
    const h01 = data[ (iz + 1) * 256 + ix     ];
    const h11 = data[ (iz + 1) * 256 + ix + 1 ];
    const h = h00*(1-fx)*(1-fz) + h10*fx*(1-fz) + h01*(1-fx)*fz + h11*fx*fz;
    return -1000 + h * 15;
}

const geometry = new THREE.PlaneGeometry( 7500, 7500, worldWidth - 1, worldDepth - 3 ); // Terrain plane geometry
geometry.rotateX( - Math.PI / 2 );

const vertices = geometry.attributes.position.array;

for ( let i = 0, j = 0, l = vertices.length; i < l; i ++, j += 3 ) {
    vertices[ j + 1 ] = data[ i ] * 15; // Apply height to vertices
}

// Height-based vertex colors for natural terrain biomes
const numVertices = worldWidth * worldDepth;
const colors = new Float32Array( numVertices * 3 );
for ( let i = 0; i < numVertices; i++ ) {
    const h = data[ i ];
    let r, g, b;
    if ( h < 20 ) {
        r = 0.76; g = 0.70; b = 0.50; // Sandy / beach
    } else if ( h < 65 ) {
        r = 0.30; g = 0.58; b = 0.18; // Bright grass
    } else if ( h < 130 ) {
        r = 0.18; g = 0.42; b = 0.12; // Dark forest green
    } else if ( h < 185 ) {
        r = 0.50; g = 0.45; b = 0.38; // Rocky gray-brown
    } else {
        r = 0.88; g = 0.88; b = 0.85; // light rock peaks
    }
    const v = ( Math.random() - 0.5 ) * 0.04;
    colors[ i * 3 ]     = Math.max( 0, Math.min( 1, r + v ) );
    colors[ i * 3 + 1 ] = Math.max( 0, Math.min( 1, g + v ) );
    colors[ i * 3 + 2 ] = Math.max( 0, Math.min( 1, b + v ) );
}
geometry.setAttribute( 'color', new THREE.BufferAttribute( colors, 3 ) );

const loader = new THREE.TextureLoader();
const grassTexture = loader.load('models/animated_low_poly_fish_gltf/textures/grasstextures.jpg'); // Load terrain texture

grassTexture.wrapS = THREE.RepeatWrapping;
grassTexture.wrapT = THREE.RepeatWrapping;
grassTexture.repeat.set(64, 64); // Texture tiling
grassTexture.colorSpace = THREE.SRGBColorSpace;

mesh = new THREE.Mesh( // Create terrain mesh
    geometry,
    new THREE.MeshStandardMaterial({
        map: grassTexture,
        vertexColors: true,
        roughness: 1.0,
        metalness: 0.0,
    })
);

mesh.position.set(0, -1000, 0); // Position terrain below camera
scene.add( mesh );

// --- Water plane at beach level ---
const waterGeo = new THREE.PlaneGeometry( 7500, 7500, 1, 1 );
waterGeo.rotateX( -Math.PI / 2 );
const waterMat = new THREE.MeshStandardMaterial({
    color: 0x006994,
    transparent: true,
    opacity: 0.78,
    roughness: 0.1,
    metalness: 0.1,
    envMapIntensity: 1.0,
});
const waterMesh = new THREE.Mesh( waterGeo, waterMat );
waterMesh.position.y = -705; // just below sandy beach threshold (-1000 + 20*15 = -700)
scene.add( waterMesh );

// --- Flowers (fully instanced) ---
function createFlowers( count ) {
    const flowerColors = [ 0xff3355, 0xffcc00, 0xff88dd, 0xbb44ff, 0xffffff, 0xff6600 ];
    const perColor = Math.floor( count / flowerColors.length );

    // --- Shared geometries ---
    const stemGeo = new THREE.CylinderGeometry( 0.3, 0.6, 18, 6 );
    const stemMat = new THREE.MeshStandardMaterial({ color: 0x2e7d32, roughness: 1.0 });

    const leafShape = new THREE.Shape();
    leafShape.moveTo( 0, 0 );
    leafShape.quadraticCurveTo(  3, 2.5, 0, 7 );
    leafShape.quadraticCurveTo( -3, 2.5, 0, 0 );
    const leafGeo = new THREE.ShapeGeometry( leafShape, 6 );
    const leafMat = new THREE.MeshStandardMaterial({ color: 0x388e3c, side: THREE.DoubleSide, roughness: 1.0 });

    const petalShape = new THREE.Shape();
    petalShape.moveTo( 0, 0 );
    petalShape.quadraticCurveTo(  2.0, 1.8, 0, 5.5 );
    petalShape.quadraticCurveTo( -2.0, 1.8, 0, 0 );
    const petalGeo = new THREE.ShapeGeometry( petalShape, 10 );

    const centreGeo = new THREE.SphereGeometry( 2.0, 8, 5, 0, Math.PI * 2, 0, Math.PI * 0.6 );
    const centreMat = new THREE.MeshStandardMaterial({ color: 0xf9c828, roughness: 0.5 });

    const numPetals = 6;

    // Pre-compute part-local matrices (same for every flower instance)
    const identQuat = new THREE.Quaternion();
    const unitScale = new THREE.Vector3( 1, 1, 1 );
    // leaf: lives in XY plane → rotate -90°+droop around X, shift base forward
    const mLeafLocal = new THREE.Matrix4().compose(
        new THREE.Vector3( 0, 0, 0.6 ),
        new THREE.Quaternion().setFromEuler( new THREE.Euler( -Math.PI / 2 + 0.4, 0, 0 ) ),
        unitScale
    );
    // petal: same idea, fans handled by pivot Y rotation per petal
    const mPetalLocal = new THREE.Matrix4().compose(
        new THREE.Vector3( 0, 0, 1.0 ),
        new THREE.Quaternion().setFromEuler( new THREE.Euler( -Math.PI / 2 + 0.25, 0, 0 ) ),
        unitScale
    );

    // Reusable matrix/vector objects to avoid GC churn
    const mFlower = new THREE.Matrix4();
    const mPivot  = new THREE.Matrix4();
    const mWorld  = new THREE.Matrix4();
    const flowerPos  = new THREE.Vector3();
    const flowerQuat = new THREE.Quaternion();
    const scaleVec   = new THREE.Vector3();
    const pivotQuat  = new THREE.Quaternion();

    flowerColors.forEach( color => {
        const petalMat = new THREE.MeshStandardMaterial({ color, side: THREE.DoubleSide, roughness: 0.7 });

        const stemInst   = new THREE.InstancedMesh( stemGeo,   stemMat,   perColor );
        const leaf0Inst  = new THREE.InstancedMesh( leafGeo,   leafMat,   perColor );
        const leaf1Inst  = new THREE.InstancedMesh( leafGeo,   leafMat,   perColor );
        const centreInst = new THREE.InstancedMesh( centreGeo, centreMat, perColor );
        const petalInsts = Array.from( { length: numPetals },
            () => new THREE.InstancedMesh( petalGeo, petalMat, perColor ) );

        for ( let i = 0; i < perColor; i++ ) {
            let wx, wz, h, attempts = 0;
            do {
                wx = Math.random() * 7400 - 3700;
                wz = Math.random() * 7400 - 3700;
                const ix = Math.floor( Math.max( 0, Math.min( 255, ( wx + 3750 ) / 7500 * 255 ) ) );
                const iz = Math.floor( Math.max( 0, Math.min( 255, ( wz + 3750 ) / 7500 * 255 ) ) );
                h = data[ iz * 256 + ix ];
                attempts++;
            } while ( ( h < 20 || h > 130 ) && attempts < 30 );

            const wy = getTerrainHeight( wx, wz );

            const s  = 0.8 + Math.random() * 0.6;
            const ry = Math.random() * Math.PI * 2;

            // Sink flower origin 5 units below surface so stem base is always in ground
            flowerPos.set( wx, wy - 5, wz );
            flowerQuat.setFromEuler( new THREE.Euler( 0, ry, 0 ) );
            scaleVec.setScalar( s );
            mFlower.compose( flowerPos, flowerQuat, scaleVec );

            // Stem — centre of cylinder is at y=9 in flower space
            mPivot.compose( new THREE.Vector3( 0, 9, 0 ), identQuat, unitScale );
            stemInst.setMatrixAt( i, mWorld.multiplyMatrices( mFlower, mPivot ) );

            // Centre dome — at y=18
            mPivot.compose( new THREE.Vector3( 0, 18, 0 ), identQuat, unitScale );
            centreInst.setMatrixAt( i, mWorld.multiplyMatrices( mFlower, mPivot ) );

            // Two leaves — pivot at y=8, rotated 180° apart
            [ 0, 1 ].forEach( ( side, li ) => {
                pivotQuat.setFromEuler( new THREE.Euler( 0, side * Math.PI, 0 ) );
                mPivot.compose( new THREE.Vector3( 0, 8, 0 ), pivotQuat, unitScale );
                mWorld.multiplyMatrices( mFlower, mPivot ).multiply( mLeafLocal );
                ( li === 0 ? leaf0Inst : leaf1Inst ).setMatrixAt( i, mWorld );
            } );

            // Petals — fan around y=18
            for ( let p = 0; p < numPetals; p++ ) {
                const angle = ( p / numPetals ) * Math.PI * 2;
                pivotQuat.setFromEuler( new THREE.Euler( 0, angle, 0 ) );
                mPivot.compose( new THREE.Vector3( 0, 18, 0 ), pivotQuat, unitScale );
                mWorld.multiplyMatrices( mFlower, mPivot ).multiply( mPetalLocal );
                petalInsts[ p ].setMatrixAt( i, mWorld );
            }
        }

        scene.add( stemInst, leaf0Inst, leaf1Inst, centreInst, ...petalInsts );
    } );
}

createFlowers( 6000 );

// Fast terrain Y lookup for flora placement — direct heightmap bilinear sample
function floraRayY( wx, wz ) {
    return getTerrainHeight( wx, wz );
}

// --- Bushes (multi-sphere clusters, grass/forest biome) ---
(function createBushes() {
    const NUM = 500;
    const sphereGeo = new THREE.SphereGeometry( 1, 8, 6 );
    const clusterColors = [
        new THREE.MeshStandardMaterial({ color: 0x2e7d32, roughness: 1.0 }),
        new THREE.MeshStandardMaterial({ color: 0x388e3c, roughness: 1.0 }),
        new THREE.MeshStandardMaterial({ color: 0x1b5e20, roughness: 1.0 }),
        new THREE.MeshStandardMaterial({ color: 0x33691e, roughness: 1.0 }),
        new THREE.MeshStandardMaterial({ color: 0x558b2f, roughness: 1.0 }),
    ];
    // Each bush = 5 overlapping spheres with randomised offsets
    const clusterOffsets = [
        { r: 1.0, ox: 0,    oy: 0,   oz: 0   },
        { r: 0.7, ox: 0.6,  oy: 0.3, oz: 0.3 },
        { r: 0.65,ox: -0.5, oy: 0.4, oz: 0.2 },
        { r: 0.6, ox: 0.2,  oy: 0.6, oz:-0.5 },
        { r: 0.55,ox: -0.3, oy: 0.7, oz: 0.4 },
    ];
    const insts = clusterColors.map( ( m, i ) =>
        new THREE.InstancedMesh( sphereGeo, m, NUM ) );
    const dummy = new THREE.Object3D();
    let placed = 0, attempts = 0;

    while ( placed < NUM && attempts < NUM * 12 ) {
        attempts++;
        const wx = ( Math.random() - 0.5 ) * 7000;
        const wz = ( Math.random() - 0.5 ) * 7000;
        const ix = Math.floor( Math.max( 0, Math.min( 255, ( wx + 3750 ) / 7500 * 255 ) ) );
        const iz = Math.floor( Math.max( 0, Math.min( 255, ( wz + 3750 ) / 7500 * 255 ) ) );
        const h = data[ iz * 256 + ix ];
        if ( h < 25 || h > 150 ) continue;

        const wy  = floraRayY( wx, wz );
        const radius = 7 + Math.random() * 6;  // world-space base radius 7–13
        const ry  = Math.random() * Math.PI * 2;
        const cos = Math.cos( ry ), sin = Math.sin( ry );

        clusterOffsets.forEach( ( o, li ) => {
            const oxr = o.ox * cos - o.oz * sin;
            const ozr = o.ox * sin + o.oz * cos;
            const sphereWX = wx + oxr * radius;
            const sphereWZ = wz + ozr * radius;
            // Raycast each satellite sphere's XZ for exact surface
            const sphereGndY = li === 0 ? wy : floraRayY( sphereWX, sphereWZ );
            const sphereR = o.r * radius;
            // Sink sphere centre to 25% of radius above terrain — clips into slope, never floats
            dummy.position.set( sphereWX, sphereGndY + sphereR * 0.25 + o.oy * radius, sphereWZ );
            dummy.rotation.y = ry;
            dummy.scale.setScalar( sphereR );
            dummy.updateMatrix();
            insts[ li ].setMatrixAt( placed, dummy.matrix );
        } );
        placed++;
    }
    insts.forEach( inst => { inst.instanceMatrix.needsUpdate = true; } );
    scene.add( ...insts );
}());

// --- Ferns (forest biome) ---
(function createFerns() {
    const NUM = 400;
    const frondShape = new THREE.Shape();
    frondShape.moveTo( 0, 0 );
    frondShape.quadraticCurveTo(  4, 5,  1, 16 );
    frondShape.quadraticCurveTo( -4, 5, -1,  0 );
    const frondGeo = new THREE.ShapeGeometry( frondShape, 6 );
    const fernMats = [
        new THREE.MeshStandardMaterial({ color: 0x1b5e20, side: THREE.DoubleSide, roughness: 1.0 }),
        new THREE.MeshStandardMaterial({ color: 0x2e7d32, side: THREE.DoubleSide, roughness: 1.0 }),
    ];
    const FRONDS = 7;
    const insts = fernMats.map( m => new THREE.InstancedMesh( frondGeo, m, NUM * FRONDS ) );
    const counts = [ 0, 0 ];
    const dummy = new THREE.Object3D();
    let placed = 0, attempts = 0;

    while ( placed < NUM && attempts < NUM * 12 ) {
        attempts++;
        const wx = ( Math.random() - 0.5 ) * 7000;
        const wz = ( Math.random() - 0.5 ) * 7000;
        const ix = Math.floor( Math.max( 0, Math.min( 255, ( wx + 3750 ) / 7500 * 255 ) ) );
        const iz = Math.floor( Math.max( 0, Math.min( 255, ( wz + 3750 ) / 7500 * 255 ) ) );
        const h = data[ iz * 256 + ix ];
        if ( h < 40 || h > 130 ) continue;

        const wy = floraRayY( wx, wz );
        const s  = 0.6 + Math.random() * 0.7;
        const mi = Math.floor( Math.random() * fernMats.length );

        for ( let f = 0; f < FRONDS; f++ ) {
            const angle = ( f / FRONDS ) * Math.PI * 2;
            dummy.position.set( wx, wy - 6, wz );  // sink 6 units into terrain
            dummy.rotation.set( Math.PI * 0.12, angle, 0 );
            dummy.scale.setScalar( s );
            dummy.updateMatrix();
            insts[ mi ].setMatrixAt( counts[ mi ], dummy.matrix );
            counts[ mi ]++;
        }
        placed++;
    }
    insts.forEach( ( inst, i ) => { inst.count = counts[ i ]; inst.instanceMatrix.needsUpdate = true; } );
    scene.add( ...insts );
}());

// --- Mushrooms (dark forest biome) ---
(function createMushrooms() {
    const NUM = 300;
    const stemGeo = new THREE.CylinderGeometry( 0.8, 1.2, 6, 7 );
    const capGeo  = new THREE.SphereGeometry( 1, 8, 6, 0, Math.PI * 2, 0, Math.PI * 0.55 );
    const stemColors = [
        new THREE.MeshStandardMaterial({ color: 0xd7ccc8, roughness: 1.0 }),
        new THREE.MeshStandardMaterial({ color: 0xbcaaa4, roughness: 1.0 }),
    ];
    const capColors = [
        new THREE.MeshStandardMaterial({ color: 0xb71c1c, roughness: 0.8 }),
        new THREE.MeshStandardMaterial({ color: 0xe65100, roughness: 0.8 }),
        new THREE.MeshStandardMaterial({ color: 0x4a148c, roughness: 0.8 }),
    ];
    const stemInsts = stemColors.map( m => new THREE.InstancedMesh( stemGeo, m, NUM ) );
    const capInsts  = capColors.map(  m => new THREE.InstancedMesh( capGeo,  m, NUM ) );
    const sCounts = stemColors.map( () => 0 );
    const cCounts = capColors.map(  () => 0 );
    const dummy = new THREE.Object3D();
    let placed = 0, attempts = 0;

    while ( placed < NUM && attempts < NUM * 12 ) {
        attempts++;
        const wx = ( Math.random() - 0.5 ) * 7000;
        const wz = ( Math.random() - 0.5 ) * 7000;
        const ix = Math.floor( Math.max( 0, Math.min( 255, ( wx + 3750 ) / 7500 * 255 ) ) );
        const iz = Math.floor( Math.max( 0, Math.min( 255, ( wz + 3750 ) / 7500 * 255 ) ) );
        const h = data[ iz * 256 + ix ];
        if ( h < 60 || h > 140 ) continue;

        const wy = floraRayY( wx, wz );
        const s  = 0.5 + Math.random() * 1.0;
        const ry = Math.random() * Math.PI * 2;
        const si = Math.floor( Math.random() * stemColors.length );
        const ci = Math.floor( Math.random() * capColors.length );

        // Stem: half-height = 3*s, sink base 5 units into terrain
        dummy.position.set( wx, wy + 3 * s - 5, wz );
        dummy.rotation.y = ry;
        dummy.scale.setScalar( s );
        dummy.updateMatrix();
        stemInsts[ si ].setMatrixAt( sCounts[ si ], dummy.matrix );
        sCounts[ si ]++;

        // Cap: sits on top of stem (offset matches stem sink)
        dummy.position.set( wx, wy + 6.2 * s - 5, wz );
        dummy.scale.set( s * 2.8, s * 1.8, s * 2.8 );
        dummy.updateMatrix();
        capInsts[ ci ].setMatrixAt( cCounts[ ci ], dummy.matrix );
        cCounts[ ci ]++;

        placed++;
    }
    stemInsts.forEach( ( inst, i ) => { inst.count = sCounts[ i ]; inst.instanceMatrix.needsUpdate = true; } );
    capInsts.forEach(  ( inst, i ) => { inst.count = cCounts[ i ]; inst.instanceMatrix.needsUpdate = true; } );
    scene.add( ...stemInsts, ...capInsts );
}());

// --- Tall Grass Tufts (beach/low grass biome) ---
(function createGrassTufts() {
    const NUM_TUFTS = 800;
    const BLADES = 7;
    const bladeShape = new THREE.Shape();
    bladeShape.moveTo( 0, 0 );
    bladeShape.quadraticCurveTo( 1.8, 7, 0.4, 16 );
    bladeShape.quadraticCurveTo( -0.6, 7, -1.0, 0 );
    const bladeGeo = new THREE.ShapeGeometry( bladeShape, 4 );
    const bladeMats = [
        new THREE.MeshStandardMaterial({ color: 0x8bc34a, side: THREE.DoubleSide, roughness: 1.0 }),
        new THREE.MeshStandardMaterial({ color: 0xaed581, side: THREE.DoubleSide, roughness: 1.0 }),
    ];
    const insts = bladeMats.map( m => new THREE.InstancedMesh( bladeGeo, m, NUM_TUFTS * BLADES ) );
    const counts = [ 0, 0 ];
    const dummy = new THREE.Object3D();
    let tufts = 0, attempts = 0;

    while ( tufts < NUM_TUFTS && attempts < NUM_TUFTS * 12 ) {
        attempts++;
        const wx = ( Math.random() - 0.5 ) * 7000;
        const wz = ( Math.random() - 0.5 ) * 7000;
        const ix = Math.floor( Math.max( 0, Math.min( 255, ( wx + 3750 ) / 7500 * 255 ) ) );
        const iz = Math.floor( Math.max( 0, Math.min( 255, ( wz + 3750 ) / 7500 * 255 ) ) );
        const h = data[ iz * 256 + ix ];
        if ( h < 18 || h > 80 ) continue;

        const s  = 0.8 + Math.random() * 0.7;
        const mi = Math.floor( Math.random() * bladeMats.length );

        for ( let b = 0; b < BLADES; b++ ) {
            const bx = wx + ( Math.random() - 0.5 ) * 7;
            const bz = wz + ( Math.random() - 0.5 ) * 7;
            // Raycast each blade's exact XZ for perfect surface contact
            const by = floraRayY( bx, bz );
            // Sink blade base 5 units into terrain
            dummy.position.set( bx, by - 5, bz );
            dummy.rotation.set( 0, ( b / BLADES ) * Math.PI * 2, ( Math.random() - 0.5 ) * 0.35 );
            dummy.scale.setScalar( s );
            dummy.updateMatrix();
            insts[ mi ].setMatrixAt( counts[ mi ], dummy.matrix );
            counts[ mi ]++;
        }
        tufts++;
    }
    insts.forEach( ( inst, i ) => { inst.count = counts[ i ]; inst.instanceMatrix.needsUpdate = true; } );
    scene.add( ...insts );
}());

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

}
let elapsedTime = 0;
function animate(timer) { // Main animation loop
    requestAnimationFrame(animate);
    
    const delta = 0.001*(timer - elapsedTime) ; // Time since last frame
    elapsedTime = timer;
   

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

    // Update GPU bird simulation
    if ( gpuCompute ) {
        const now = performance.now();
        let bd = ( now - birdLast ) / 1000;
        if ( bd > 1 ) bd = 1;
        birdLast = now;
        birdPosUniforms[ 'time' ].value  = now;
        birdPosUniforms[ 'delta' ].value = bd;
        birdVelUniforms[ 'time' ].value  = now;
        birdVelUniforms[ 'delta' ].value = bd;
        if ( materialShader ) {
            materialShader.uniforms[ 'time' ].value  = now / 1000;
            materialShader.uniforms[ 'delta' ].value = bd;
        }
        gpuCompute.compute();
        if ( materialShader ) {
            materialShader.uniforms[ 'texturePosition' ].value = gpuCompute.getCurrentRenderTarget( birdPositionVar ).texture;
            materialShader.uniforms[ 'textureVelocity' ].value = gpuCompute.getCurrentRenderTarget( birdVelocityVar ).texture;
        }
    }

    // Animate water shimmer
    const wt = timer * 0.0005;
    waterMat.opacity = 0.72 + Math.sin( wt ) * 0.06;
    waterMesh.position.y = -705 + Math.sin( wt * 0.7 ) * 2.5; // gentle rise/fall

    renderer.render(scene, camera);
}
// Removed pointermove listener for FPS controls
// window.addEventListener("pointermove", assign); // when the mouse moves, the seek behaviour is activated (seek state)
    // document.querySelector(".water").addEventListener("touchmove", assignTouch); // when the touch moves, the seek behaviour is activated (seek state)

// --- GPU Flocking Birds ---
const BIRD_WIDTH = 32;           // 32×32 = 1024 birds
const BIRDS = BIRD_WIDTH * BIRD_WIDTH;
const BIRD_BOUNDS = 6000, BIRD_BOUNDS_HALF = BIRD_BOUNDS / 2;
const BirdGeometry = new THREE.BufferGeometry();
let textureAnimation, durationAnimation, birdMesh, materialShader, indicesPerBird;
let gpuCompute, birdVelocityVar, birdPositionVar, birdPosUniforms, birdVelUniforms;
let birdLast = performance.now();

function nextPowerOf2( n ) {
    return Math.pow( 2, Math.ceil( Math.log( n ) / Math.log( 2 ) ) );
}

function initBirdComputeRenderer() {
    gpuCompute = new GPUComputationRenderer( BIRD_WIDTH, BIRD_WIDTH, renderer );
    const dtPos = gpuCompute.createTexture();
    const dtVel = gpuCompute.createTexture();

    // Fill initial positions
    for ( let k = 0; k < dtPos.image.data.length; k += 4 ) {
        dtPos.image.data[ k ]     = Math.random() * BIRD_BOUNDS - BIRD_BOUNDS_HALF;
        dtPos.image.data[ k + 1 ] = Math.random() * BIRD_BOUNDS - BIRD_BOUNDS_HALF;
        dtPos.image.data[ k + 2 ] = Math.random() * BIRD_BOUNDS - BIRD_BOUNDS_HALF;
        dtPos.image.data[ k + 3 ] = 1;
    }
    // Fill initial velocities
    for ( let k = 0; k < dtVel.image.data.length; k += 4 ) {
        dtVel.image.data[ k ]     = ( Math.random() - 0.5 ) * 10;
        dtVel.image.data[ k + 1 ] = ( Math.random() - 0.5 ) * 10;
        dtVel.image.data[ k + 2 ] = ( Math.random() - 0.5 ) * 10;
        dtVel.image.data[ k + 3 ] = 1;
    }

    birdVelocityVar = gpuCompute.addVariable( 'textureVelocity', document.getElementById( 'fragmentShaderVelocity' ).textContent, dtVel );
    birdPositionVar = gpuCompute.addVariable( 'texturePosition', document.getElementById( 'fragmentShaderPosition' ).textContent, dtPos );

    gpuCompute.setVariableDependencies( birdVelocityVar, [ birdPositionVar, birdVelocityVar ] );
    gpuCompute.setVariableDependencies( birdPositionVar, [ birdPositionVar, birdVelocityVar ] );

    birdPosUniforms = birdPositionVar.material.uniforms;
    birdVelUniforms = birdVelocityVar.material.uniforms;

    birdPosUniforms[ 'time' ]  = { value: 0.0 };
    birdPosUniforms[ 'delta' ] = { value: 0.0 };
    birdVelUniforms[ 'time' ]              = { value: 1.0 };
    birdVelUniforms[ 'delta' ]             = { value: 0.0 };
    birdVelUniforms[ 'testing' ]           = { value: 1.0 };
    birdVelUniforms[ 'separationDistance' ]= { value: 80.0 };
    birdVelUniforms[ 'alignmentDistance' ] = { value: 120.0 };
    birdVelUniforms[ 'cohesionDistance' ]  = { value: 80.0 };
    birdVelUniforms[ 'freedomFactor' ]     = { value: 0.75 };
    birdVelUniforms[ 'predator' ]          = { value: new THREE.Vector3( 10000, 10000, 0 ) };
    // Terrain collision uniforms
    birdVelUniforms[ 'terrainMap' ]        = { value: terrainTex };
    birdVelUniforms[ 'terrainOffset' ]     = { value: -1000.0 };  // mesh.position.y
    birdVelUniforms[ 'terrainScale' ]      = { value: 255.0 * 15.0 }; // data * 15, values 0-255
    birdVelUniforms[ 'birdMeshOffsetY' ]   = { value: 200.0 };    // birdMesh.position.y

    birdVelocityVar.material.defines.BOUNDS = BIRD_BOUNDS.toFixed( 2 );
    birdVelocityVar.wrapS = birdVelocityVar.wrapT = THREE.RepeatWrapping;
    birdPositionVar.wrapS = birdPositionVar.wrapT = THREE.RepeatWrapping;

    const error = gpuCompute.init();
    if ( error !== null ) console.error( 'GPUComputationRenderer error:', error );
}

function initBirdMesh() {
    const m = new THREE.MeshStandardMaterial({ vertexColors: true, flatShading: true, roughness: 1, metalness: 0 });
    m.onBeforeCompile = ( shader ) => {
        shader.uniforms.texturePosition  = { value: null };
        shader.uniforms.textureVelocity  = { value: null };
        shader.uniforms.textureAnimation = { value: textureAnimation };
        shader.uniforms.time  = { value: 1.0 };
        shader.uniforms.size  = { value: 0.4 };
        shader.uniforms.delta = { value: 0.0 };

        shader.vertexShader = shader.vertexShader.replace( '#define STANDARD',
            `#define STANDARD
            attribute vec4 reference;
            attribute vec4 seeds;
            attribute vec3 birdColor;
            uniform sampler2D texturePosition;
            uniform sampler2D textureVelocity;
            uniform sampler2D textureAnimation;
            uniform float size;
            uniform float time;`
        );
        shader.vertexShader = shader.vertexShader.replace( '#include <begin_vertex>', `
            vec4 tmpPos = texture2D( texturePosition, reference.xy );
            vec3 pos = tmpPos.xyz;
            vec3 velocity = normalize( texture2D( textureVelocity, reference.xy ).xyz );
            vec3 aniPos = texture2D( textureAnimation, vec2( reference.z,
                mod( time + seeds.x * ( 0.0004 + seeds.y / 10000.0 ) + length( velocity ) / 20000.0, reference.w )
            ) ).xyz;
            vec3 newPosition = position;
            newPosition = mat3( modelMatrix ) * ( newPosition + aniPos );
            newPosition *= size + seeds.y * size * 0.2;
            velocity.z *= -1.;
            float xz = length( velocity.xz );
            float xyz = 1.;
            float x = sqrt( 1. - velocity.y * velocity.y );
            float cosry = velocity.x / xz;
            float sinry = velocity.z / xz;
            float cosrz = x / xyz;
            float sinrz = velocity.y / xyz;
            mat3 maty = mat3( cosry, 0, -sinry, 0, 1, 0, sinry, 0, cosry );
            mat3 matz = mat3( cosrz, sinrz, 0, -sinrz, cosrz, 0, 0, 0, 1 );
            newPosition = maty * matz * newPosition;
            newPosition += pos;
            vec3 transformed = vec3( newPosition );`
        );
        materialShader = shader;
    };

    birdMesh = new THREE.Mesh( BirdGeometry, m );
    birdMesh.rotation.y = Math.PI / 2;
    birdMesh.position.y = 200; // fly above terrain
    birdMesh.frustumCulled = false; // instances move beyond mesh origin bounding sphere
    scene.add( birdMesh );
    BirdGeometry.setDrawRange( 0, indicesPerBird * BIRDS );
}

// Load bird GLTF from CDN and build instanced geometry
new GLTFLoader().load(
    'https://threejs.org/examples/models/gltf/Flamingo.glb',
    function ( gltf ) {
        const animations = gltf.animations;
        durationAnimation = Math.round( animations[ 0 ].duration * 60 );
        const birdGeo = gltf.scene.children[ 0 ].geometry;
        const morphAttributes = birdGeo.morphAttributes.position;
        const tHeight = nextPowerOf2( durationAnimation );
        const tWidth  = nextPowerOf2( birdGeo.getAttribute( 'position' ).count );
        indicesPerBird = birdGeo.index.count;

        const tData = new Float32Array( 4 * tWidth * tHeight );
        for ( let i = 0; i < tWidth; i++ ) {
            for ( let j = 0; j < tHeight; j++ ) {
                const offset = j * tWidth * 4;
                const curMorph  = Math.floor( j / durationAnimation * morphAttributes.length );
                const nextMorph = ( curMorph + 1 ) % morphAttributes.length;
                const lerp      = j / durationAnimation * morphAttributes.length % 1;
                if ( j < durationAnimation ) {
                    let d0, d1;
                    d0 = morphAttributes[ curMorph ].array[ i * 3 ];     d1 = morphAttributes[ nextMorph ].array[ i * 3 ];
                    if ( d0 !== undefined && d1 !== undefined ) tData[ offset + i * 4 ]     = THREE.MathUtils.lerp( d0, d1, lerp );
                    d0 = morphAttributes[ curMorph ].array[ i * 3 + 1 ]; d1 = morphAttributes[ nextMorph ].array[ i * 3 + 1 ];
                    if ( d0 !== undefined && d1 !== undefined ) tData[ offset + i * 4 + 1 ] = THREE.MathUtils.lerp( d0, d1, lerp );
                    d0 = morphAttributes[ curMorph ].array[ i * 3 + 2 ]; d1 = morphAttributes[ nextMorph ].array[ i * 3 + 2 ];
                    if ( d0 !== undefined && d1 !== undefined ) tData[ offset + i * 4 + 2 ] = THREE.MathUtils.lerp( d0, d1, lerp );
                    tData[ offset + i * 4 + 3 ] = 1;
                }
            }
        }
        textureAnimation = new THREE.DataTexture( tData, tWidth, tHeight, THREE.RGBAFormat, THREE.FloatType );
        textureAnimation.needsUpdate = true;

        const vertices = [], color = [], reference = [], seeds = [], indices = [];
        const posCount = birdGeo.getAttribute( 'position' ).count;
        const colorAttr = birdGeo.getAttribute( 'color' );
        for ( let i = 0; i < posCount * 3 * BIRDS; i++ ) {
            const bIndex = i % ( posCount * 3 );
            vertices.push( birdGeo.getAttribute( 'position' ).array[ bIndex ] );
            // Flamingo.glb may not have vertex colors — fall back to white
            color.push( colorAttr ? colorAttr.array[ bIndex ] : 1.0 );
        }
        let r = Math.random();
        for ( let i = 0; i < posCount * BIRDS; i++ ) {
            const bIndex = i % posCount;
            const bird = Math.floor( i / posCount );
            if ( bIndex === 0 ) r = Math.random();
            const j = ~~bird;
            reference.push( ( j % BIRD_WIDTH ) / BIRD_WIDTH, ~~( j / BIRD_WIDTH ) / BIRD_WIDTH, bIndex / tWidth, durationAnimation / tHeight );
            seeds.push( bird, r, Math.random(), Math.random() );
        }
        for ( let i = 0; i < birdGeo.index.array.length * BIRDS; i++ ) {
            const offset = Math.floor( i / birdGeo.index.array.length ) * posCount;
            indices.push( birdGeo.index.array[ i % birdGeo.index.array.length ] + offset );
        }

        BirdGeometry.setAttribute( 'position',  new THREE.BufferAttribute( new Float32Array( vertices ), 3 ) );
        BirdGeometry.setAttribute( 'birdColor', new THREE.BufferAttribute( new Float32Array( color ), 3 ) );
        BirdGeometry.setAttribute( 'color',     new THREE.BufferAttribute( new Float32Array( color ), 3 ) );
        BirdGeometry.setAttribute( 'reference', new THREE.BufferAttribute( new Float32Array( reference ), 4 ) );
        BirdGeometry.setAttribute( 'seeds',     new THREE.BufferAttribute( new Float32Array( seeds ), 4 ) );
        BirdGeometry.setIndex( indices );

        initBirdComputeRenderer();
        initBirdMesh();
    }
);

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