import * as THREE from 'three';

// Team A — Theme: Alien Mushroom Forest Planet
// A mysterious purple world blanketed in glowing mushrooms and roaming bug critters.
export class PlanetA {
    constructor(scene, orbitRadius, orbitSpeed) {
        this.scene = scene;
        this.orbitRadius = orbitRadius;
        this.orbitSpeed = orbitSpeed;
        this.angle = Math.random() * Math.PI * 2;

        this.group = new THREE.Group();

        // ── STEP 1: Planet ──────────────────────────────────────────────────────
        const planetGeo = new THREE.SphereGeometry(2, 32, 32);
        const planetMat = new THREE.MeshStandardMaterial({
            color: 0x3a1060,
            roughness: 0.85,
            metalness: 0.05,
            emissive: 0x120828,
            emissiveIntensity: 0.5,
        });
        this.planetMesh = new THREE.Mesh(planetGeo, planetMat);
        this.planetMesh.castShadow = true;
        this.planetMesh.receiveShadow = true;
        this.group.add(this.planetMesh);

        // ── STEP 2: Moons ───────────────────────────────────────────────────────
        // Each moon uses a pivot Group centred at the planet so rotating the pivot
        // creates a circular orbit — exactly like the planet group orbiting the Sun.
        this.moonPivots = [];

        const addMoon = (radius, distance, color, speed, tiltZ) => {
            const pivot = new THREE.Group();
            pivot.rotation.z = tiltZ;
            const mesh = new THREE.Mesh(
                new THREE.SphereGeometry(radius, 16, 16),
                new THREE.MeshStandardMaterial({ color, roughness: 0.88 })
            );
            mesh.castShadow = true;
            mesh.receiveShadow = true;
            mesh.position.set(distance, 0, 0);
            pivot.add(mesh);
            this.group.add(pivot);
            this.moonPivots.push({ pivot, speed });
        };

        addMoon(0.35, 3.4, 0xaa99cc, 0.9,  0.25);   // moon 1 — lavender
        addMoon(0.22, 4.7, 0xddcc88, -0.55, -0.4);  // moon 2 — sandy

        // ── STEP 3: Mushroom props & bug critters ───────────────────────────────
        // All geometry is built procedurally from Three.js primitives because no
        // external Blender models are loaded here yet — drop GLTFs into /models/
        // and swap the calls below when ready.

        this.clickables = [];       // meshes tested by raycaster
        this.mushrooms  = [];       // groups repositioned during bounce anim
        this.mushroomBouncing = false;
        this.bounceTime = 0;

        // Surface spawn positions (unit vectors × planet radius later)
        const surfaceSeeds = [
            new THREE.Vector3( 0.0,  1.0,  0.0),
            new THREE.Vector3( 0.8,  0.6,  0.4),
            new THREE.Vector3(-0.7,  0.5,  0.6),
            new THREE.Vector3( 0.5, -0.75, 0.6),
            new THREE.Vector3(-0.9,  0.25,-0.45),
            new THREE.Vector3( 0.25, 0.9, -0.6),
        ];

        for (const seed of surfaceSeeds) {
            const normal  = seed.clone().normalize();
            const mush    = this._makeMushroom();
            mush.position.copy(normal.clone().multiplyScalar(2.0));
            // Orient mushroom's +Y toward the outward surface normal
            mush.quaternion.copy(
                new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), normal)
            );
            this.group.add(mush);
            this.mushrooms.push(mush);
            mush.traverse(c => { if (c.isMesh) this.clickables.push(c); });
        }

        // Critters
        this.critters = [];
        const critterSeeds = [
            new THREE.Vector3( 0.6,  0.7,  0.5),
            new THREE.Vector3(-0.5,  0.9, -0.3),
            new THREE.Vector3( 0.4, -0.8,  0.5),
        ];

        for (const seed of critterSeeds) {
            const normal  = seed.clone().normalize();
            const critter = this._makeCritter();
            const basePos = normal.clone().multiplyScalar(2.1);
            critter.position.copy(basePos);
            critter.quaternion.copy(
                new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), normal)
            );
            this.group.add(critter);
            this.critters.push({
                mesh: critter,
                basePos: basePos.clone(),
                normal: normal.clone(),
                hopAngle: Math.random() * Math.PI * 2,
            });
            critter.traverse(c => { if (c.isMesh) this.clickables.push(c); });
        }

        this.scene.add(this.group);
    }

    // ── Mushroom: stalk (cylinder) + domed cap (partial sphere) ────────────────
    _makeMushroom() {
        const g = new THREE.Group();

        const stalk = new THREE.Mesh(
            new THREE.CylinderGeometry(0.07, 0.1, 0.35, 8),
            new THREE.MeshStandardMaterial({ color: 0xeeddcc, roughness: 0.8 })
        );
        stalk.castShadow = true;
        stalk.receiveShadow = true;
        stalk.position.y = 0.175;
        g.add(stalk);

        // phiLength < π gives a dome; rotation.x = π flips it so the dome faces +Y
        const cap = new THREE.Mesh(
            new THREE.SphereGeometry(0.23, 12, 8, 0, Math.PI * 2, 0, Math.PI * 0.55),
            new THREE.MeshStandardMaterial({
                color: 0xff1155,
                emissive: 0x550022,
                emissiveIntensity: 0.6,
                roughness: 0.5,
            })
        );
        cap.castShadow = true;
        cap.receiveShadow = true;
        cap.position.y = 0.37;
        cap.rotation.x = Math.PI;
        g.add(cap);

        return g;
    }

    // ── Critter: oval body + round head + glowing eyes ──────────────────────────
    _makeCritter() {
        const g = new THREE.Group();

        const body = new THREE.Mesh(
            new THREE.SphereGeometry(0.13, 8, 8),
            new THREE.MeshStandardMaterial({ color: 0x33ff88, roughness: 0.4 })
        );
        body.scale.set(1, 0.7, 1.4);
        body.castShadow = true;
        body.receiveShadow = true;
        g.add(body);

        const head = new THREE.Mesh(
            new THREE.SphereGeometry(0.1, 8, 8),
            new THREE.MeshStandardMaterial({ color: 0x22cc66, roughness: 0.4 })
        );
        head.castShadow = true;
        head.receiveShadow = true;
        head.position.y = 0.21;
        g.add(head);

        const eyeMat = new THREE.MeshStandardMaterial({
            color: 0xffffff,
            emissive: 0xff2200,
            emissiveIntensity: 1.2,
        });
        for (const xOff of [-0.04, 0.04]) {
            const eye = new THREE.Mesh(new THREE.SphereGeometry(0.03, 6, 6), eyeMat);
            eye.castShadow = true;
            eye.receiveShadow = true;
            eye.position.set(xOff, 0.27, 0.08);
            g.add(eye);
        }

        return g;
    }

    // ── Update (called every frame from main) ───────────────────────────────────
    update(delta) {
        // Planet orbits the Sun
        this.angle += this.orbitSpeed * delta * 30;
        this.group.position.x = Math.cos(this.angle) * this.orbitRadius;
        this.group.position.z = Math.sin(this.angle) * this.orbitRadius;

        // Planet self-rotation
        this.group.rotation.y += delta * 0.5;

        // Moon orbits: rotate each pivot around the planet group's local origin
        for (const m of this.moonPivots) {
            m.pivot.rotation.y += m.speed * delta;
        }

        // Mushroom bounce animation (triggered by click)
        if (this.mushroomBouncing) {
            this.bounceTime += delta * 5;
            for (let i = 0; i < this.mushrooms.length; i++) {
                const m      = this.mushrooms[i];
                const bounce = Math.abs(Math.sin(this.bounceTime + i * 1.1)) * 0.35;
                const dir    = m.position.clone().normalize();
                m.position.copy(dir.multiplyScalar(2.0 + bounce));
            }
            if (this.bounceTime > Math.PI * 4) {
                this.mushroomBouncing = false;
                this.bounceTime = 0;
                for (const m of this.mushrooms) {
                    m.position.copy(m.position.clone().normalize().multiplyScalar(2.0));
                }
            }
        }

        // Critters hop gently on the surface
        for (const c of this.critters) {
            c.hopAngle += delta * 2.2;
            const hop = Math.abs(Math.sin(c.hopAngle)) * 0.12;
            c.mesh.position.copy(c.normal.clone().multiplyScalar(2.1 + hop));
        }
    }

    // ── Click (raycasting) ──────────────────────────────────────────────────────
    click(mouse, scene, camera) {
        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(mouse, camera);

        // Test planet surface and all props/critters
        const targets    = [this.planetMesh, ...this.clickables];
        const intersects = raycaster.intersectObjects(targets, true);

        if (intersects.length > 0) {
            // Launch mushroom bounce
            this.mushroomBouncing = true;
            this.bounceTime = 0;

            // Flash planet to bright magenta then fade back
            this.planetMesh.material.emissive.setHex(0xcc00ff);
            setTimeout(() => {
                if (this.planetMesh) this.planetMesh.material.emissive.setHex(0x120828);
            }, 500);

            // Make critter eyes flare briefly
            for (const c of this.critters) {
                c.mesh.traverse(child => {
                    if (child.isMesh && child.material.emissive) {
                        const orig = child.material.emissive.getHex();
                        child.material.emissive.setHex(0xffff00);
                        setTimeout(() => {
                            if (child.material) child.material.emissive.setHex(orig);
                        }, 400);
                    }
                });
            }
        }
    }
}

