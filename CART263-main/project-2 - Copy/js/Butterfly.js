import * as THREE from 'three';

export class Butterfly {
    constructor(scene, x, y, z, size) {
        this.scene = scene;
        this.x = x;
        this.y = y;
        this.z = z;
        this.position = new THREE.Vector3(this.x, this.y, this.z);
        this.size = size;
        this.vx = Math.random() * 2 + 1;
        this.vx = map_range(this.vx, 1, 2, -1, 1)
        this.vy = Math.random() * 2 + 1;
        this.vy = map_range(this.vy, 1, 2, -1, 1)
        this.vz = Math.random() * 2 + 1;
        this.vz = map_range(this.vz, 1, 2, -1, 1)
        this.velocity = new THREE.Vector3(this.vx, this.vy, this.vz);
        this.acceleration = new THREE.Vector3(0,0,0);
        this.topSpeed = 0.5;
        this.maxForce = 0.2;

        // Create butterfly geometry
        this.body = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 1), new THREE.MeshLambertMaterial({color: 0x8B4513}));
        this.wing1 = new THREE.Mesh(new THREE.PlaneGeometry(1, 0.5), new THREE.MeshLambertMaterial({color: 0xFF69B4, side: THREE.DoubleSide}));
        this.wing2 = new THREE.Mesh(new THREE.PlaneGeometry(1, 0.5), new THREE.MeshLambertMaterial({color: 0xFF69B4, side: THREE.DoubleSide}));
        this.wing1.position.set(0.5, 0, 0);
        this.wing2.position.set(-0.5, 0, 0);
        this.butterfly = new THREE.Group();
        this.butterfly.add(this.body, this.wing1, this.wing2);
            this.butterfly.castShadow = true;
            this.butterfly.receiveShadow = true;
        this.butterfly.scale.set(size, size, size);
        this.butterfly.position.x = this.position.x;
        this.butterfly.position.y = this.position.y;
        this.butterfly.position.z = this.position.z;

        this.scene.add(this.butterfly);
    }
    
    // Move the butterfly according to its velocity
    /*
    * Adapted from The Nature of Code, chapter 5, example 5.1 "Seeking a Target"
    */
    update(delta) {
        this.velocity.add(this.acceleration);
        this.velocity.clampLength(0, this.topSpeed);
        this.position.add(this.velocity * delta);
        // this.butterfly.position.x = this.position.x
        // this.butterfly.position.y = this.position.y
        // this.butterfly.position.z = this.position.z
        this.angleY = Math.atan2(this.velocity.x, this.velocity.y);
        this.butterfly.rotation.x = 0;
        // this.butterfly.rotation.y = Math.PI/2 + this.angleY;
        this.butterfly.rotation.z = 0;
        this.acceleration.multiplyScalar(0);

        // Animate wings
        this.wing1.rotation.z = Math.sin(Date.now() * 0.01) * 0.5;
        this.wing2.rotation.z = -Math.sin(Date.now() * 0.01) * 0.5;
    }

    /*
    * Adapted from The Nature of Code, chapter 2, example 2.1 "Forces"
    * https://natureofcode.com/forces/#creating-forces 
    */
    applyForce(force) {
        this.acceleration.add(force);
    }

    /*
    * "Seek" and "steer" behaviour adapted from The Nature of Code, chapter 5, example 5.1 "Seeking a Target"
    */
    seek(mouse) {
        // console.log(mouse)
        let dir = new THREE.Vector3();
        dir.subVectors(mouse, this.position);
        dir.setLength(this.topSpeed);

        let steer = new THREE.Vector3();
        steer.subVectors(dir, this.velocity);
        steer.clampLength(0, this.maxForce);
        this.applyForce(steer);

        this.angleX = Math.acos(dir.x/dir.lengthSq);
        this.angleY = Math.acos(dir.y/dir.lengthSq);
        this.angleZ = Math.acos(dir.z/dir.lengthSq);
    }

    /*
    * "Separate" behaviour adapted from The Nature of Code, chapter 5, "Complex Systems"
    */
    separate(swarm) {
        // This variable specifies how close is too close.
        let desiredSeparation = 5;
        let sum = new THREE.Vector3(0,0,0);
        let count = 0;
        for (let other of swarm) {
            //{!1 .offset} What is the distance between this vehicle and the other vehicle?
            let d = this.position.distanceTo(other.position);
            if (this !== other && d < desiredSeparation) {
            //{!1} Any code here will be executed if the vehicle is within 20 pixels.
            let diff = new THREE.Vector3()
            diff.subVectors(this.position, other.position);
            diff.setLength(1/d);
            sum.add(diff);
            count++;
            }
        }
        if (count > 0) {
            sum.setLength(this.topSpeed);
            let steer = new THREE.Vector3()
            steer.subVectors(sum, this.velocity);
            steer.clampLength(0, this.maxForce);
            this.applyForce(steer);
        }
    }

} // class Fish

// Source - https://stackoverflow.com/a/5650012
// Posted by Alnitak, modified by community. See post 'Timeline' for change history
// Retrieved 2026-04-06, License - CC BY-SA 3.0
function map_range(value, low1, high1, low2, high2) {
    return low2 + (high2 - low2) * (value - low1) / (high1 - low1);
}

// class Boid {
//   constructor(x, y) {
//     this.acceleration = createVector(0, 0);
//     this.velocity = createVector(random(-1, 1), random(-1, 1));
//     this.position = createVector(x, y);
//     this.size = 3.0;

//     // Maximum speed
//     this.maxSpeed = 3;

//     // Maximum steering force
//     this.maxForce = 0.05;
//     colorMode(HSB);
//     this.color = color(random(256), 255, 255);
//   }

//   run(boids) {
//     this.flock(boids);
//     this.update();
//     this.borders();
//     this.render();
//   }

//   applyForce(force) {
//     // We could add mass here if we want: A = F / M
//     this.acceleration.add(force);
//   }

//   // We accumulate a new acceleration each time based on three rules
//   flock(boids) {
//     let separation = this.separate(boids);
//     let alignment = this.align(boids);
//     let cohesion = this.cohesion(boids);

//     // Arbitrarily weight these forces
//     separation.mult(1.5);
//     alignment.mult(1.0);
//     cohesion.mult(1.0);

//     // Add the force vectors to acceleration
//     this.applyForce(separation);
//     this.applyForce(alignment);
//     this.applyForce(cohesion);
//   }

//   // Method to update location
//   update() {
//     // Update velocity
//     this.velocity.add(this.acceleration);

//     // Limit speed
//     this.velocity.limit(this.maxSpeed);
//     this.position.add(this.velocity);

//     // Reset acceleration to 0 each cycle
//     this.acceleration.mult(0);
//   }

//   // A method that calculates and applies a steering force towards a target
//   // STEER = DESIRED MINUS VELOCITY
//   seek(target) {
//     // A vector pointing from the location to the target
//     let desired = p5.Vector.sub(target, this.position);

//     // Normalize desired and scale to maximum speed
//     desired.normalize();
//     desired.mult(this.maxSpeed);

//     // Steering = Desired minus Velocity
//     let steer = p5.Vector.sub(desired, this.velocity);

//     // Limit to maximum steering force
//     steer.limit(this.maxForce);
//     return steer;
//   }

//   render() {
//     // Draw a triangle rotated in the direction of velocity
//     let theta = this.velocity.heading() + radians(90);
//     fill(this.color);
//     stroke(255);
//     push();
//     translate(this.position.x, this.position.y);
//     rotate(theta);
//     beginShape();
//     vertex(0, -this.size * 2);
//     vertex(-this.size, this.size * 2);
//     vertex(this.size, this.size * 2);
//     endShape(CLOSE);
//     pop();
//   }

//   // Wraparound
//   borders() {
//     if (this.position.x < -this.size) {
//       this.position.x = width + this.size;
//     }

//     if (this.position.y < -this.size) {
//       this.position.y = height + this.size;
//     }

//     if (this.position.x > width + this.size) {
//       this.position.x = -this.size;
//     }

//     if (this.position.y > height + this.size) {
//       this.position.y = -this.size;
//     }
//   }

//   // Separation
//   // Method checks for nearby boids and steers away
//   separate(boids) {
//     let desiredSeparation = 25.0;
//     let steer = createVector(0, 0);
//     let count = 0;

//     // For every boid in the system, check if it's too close
//     for (let boid of boids) {
//       let distanceToNeighbor = p5.Vector.dist(this.position, boid.position);

//       // If the distance is greater than 0 and less than an arbitrary amount (0 when you are yourself)
//       if (distanceToNeighbor > 0 && distanceToNeighbor < desiredSeparation) {
//         // Calculate vector pointing away from neighbor
//         let diff = p5.Vector.sub(this.position, boid.position);
//         diff.normalize();

//         // Scale by distance
//         diff.div(distanceToNeighbor);
//         steer.add(diff);

//         // Keep track of how many
//         count++;
//       }
//     }

//     // Average -- divide by how many
//     if (count > 0) {
//       steer.div(count);
//     }

//     // As long as the vector is greater than 0
//     if (steer.mag() > 0) {
//       // Implement Reynolds: Steering = Desired - Velocity
//       steer.normalize();
//       steer.mult(this.maxSpeed);
//       steer.sub(this.velocity);
//       steer.limit(this.maxForce);
//     }
//     return steer;
//   }

//   // Alignment
//   // For every nearby boid in the system, calculate the average velocity
//   align(boids) {
//     let neighborDistance = 50;
//     let sum = createVector(0, 0);
//     let count = 0;
//     for (let i = 0; i < boids.length; i++) {
//       let d = p5.Vector.dist(this.position, boids[i].position);
//       if (d > 0 && d < neighborDistance) {
//         sum.add(boids[i].velocity);
//         count++;
//       }
//     }
//     if (count > 0) {
//       sum.div(count);
//       sum.normalize();
//       sum.mult(this.maxSpeed);
//       let steer = p5.Vector.sub(sum, this.velocity);
//       steer.limit(this.maxForce);
//       return steer;
//     } else {
//       return createVector(0, 0);
//     }
//   }

//   // Cohesion
//   // For the average location (i.e., center) of all nearby boids, calculate steering vector towards that location
//   cohesion(boids) {
//     let neighborDistance = 50;
//     let sum = createVector(0, 0); // Start with empty vector to accumulate all locations
//     let count = 0;
//     for (let i = 0; i < boids.length; i++) {
//       let d = p5.Vector.dist(this.position, boids[i].position);
//       if (d > 0 && d < neighborDistance) {
//         sum.add(boids[i].position); // Add location
//         count++;
//       }
//     }
//     if (count > 0) {
//       sum.div(count);
//       return this.seek(sum); // Steer towards the location
//     } else {
//       return createVector(0, 0);
//     }
//   }
// } // class Boid