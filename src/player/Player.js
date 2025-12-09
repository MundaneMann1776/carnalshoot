// Player.js - First-person player controller with flashlight
import * as THREE from 'three';

export class Player {
    constructor(game) {
        this.game = game;
        this.camera = game.camera;

        // Position and rotation
        this.position = new THREE.Vector3(0, 1.7, 0);
        this.velocity = new THREE.Vector3(0, 0, 0);
        this.rotation = new THREE.Euler(0, 0, 0, 'YXZ');

        // Movement settings
        this.walkSpeed = 8;
        this.sprintSpeed = 12;
        this.jumpForce = 8;
        this.gravity = 20;
        this.friction = 10;

        // State
        this.health = 100;
        this.maxHealth = 100;
        this.isGrounded = true;
        this.isJumping = false;
        this.isSprinting = false;

        // Camera bob
        this.bobTime = 0;
        this.bobAmount = 0.05;
        this.bobSpeed = 10;

        // Collision
        this.radius = 0.4;
        this.height = 1.7;

        // Flashlight
        this.flashlightOn = false;
        this.flashlight = null;
        this.flashlightTarget = null;
        this.createFlashlight();

        // Set initial camera position
        this.camera.position.copy(this.position);
        this.camera.rotation.copy(this.rotation);
    }

    createFlashlight() {
        // Create spotlight for flashlight
        this.flashlight = new THREE.SpotLight(0xffffee, 0, 28, Math.PI / 8, 0.3, 1);
        this.flashlight.castShadow = false; // Disable for performance
        this.camera.add(this.flashlight);

        // Position at camera
        this.flashlight.position.set(0, 0, 0);

        // Target in front of camera
        this.flashlightTarget = new THREE.Object3D();
        this.flashlightTarget.position.set(0, 0, -1);
        this.camera.add(this.flashlightTarget);
        this.flashlight.target = this.flashlightTarget;
    }

    toggleFlashlight() {
        this.flashlightOn = !this.flashlightOn;
        this.flashlight.intensity = this.flashlightOn ? 2.6 : 0;

        // Play click sound
        if (this.game.audioManager) {
            this.game.audioManager.playTone(this.flashlightOn ? 800 : 600, 0.05, 0.2);
        }
    }

    update(deltaTime) {
        const input = this.game.inputManager;

        // Get movement direction
        const moveDir = input.getMovementDirection();
        this.isSprinting = input.keys.sprint && moveDir.z > 0;

        // Calculate target velocity
        const speed = this.isSprinting ? this.sprintSpeed : this.walkSpeed;
        const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(this.camera.quaternion);
        const right = new THREE.Vector3(1, 0, 0).applyQuaternion(this.camera.quaternion);

        // Keep movement horizontal
        forward.y = 0;
        forward.normalize();
        right.y = 0;
        right.normalize();

        // Calculate movement vector
        const movement = new THREE.Vector3();
        movement.addScaledVector(forward, moveDir.z);
        movement.addScaledVector(right, moveDir.x);

        if (movement.length() > 0) {
            movement.normalize();
            movement.multiplyScalar(speed);
        }

        // Apply horizontal movement with smoothing
        this.velocity.x = THREE.MathUtils.lerp(this.velocity.x, movement.x, deltaTime * this.friction);
        this.velocity.z = THREE.MathUtils.lerp(this.velocity.z, movement.z, deltaTime * this.friction);

        // Jumping
        if (input.keys.jump && this.isGrounded) {
            this.velocity.y = this.jumpForce;
            this.isGrounded = false;
            this.isJumping = true;
        }

        // Apply gravity
        if (!this.isGrounded) {
            this.velocity.y -= this.gravity * deltaTime;
        }

        // Update position
        this.position.x += this.velocity.x * deltaTime;
        this.position.y += this.velocity.y * deltaTime;
        this.position.z += this.velocity.z * deltaTime;

        // Ground collision (simple floor at y=1.7)
        if (this.position.y <= this.height) {
            this.position.y = this.height;
            this.velocity.y = 0;
            this.isGrounded = true;
            this.isJumping = false;
        }

        // Wall collision with map
        this.checkMapCollision();

        // Camera bob when walking
        if (input.isMoving() && this.isGrounded) {
            this.bobTime += deltaTime * this.bobSpeed * (this.isSprinting ? 1.5 : 1);
            const bobOffset = Math.sin(this.bobTime) * this.bobAmount;
            this.camera.position.y = this.position.y + bobOffset;
        } else {
            this.bobTime = 0;
            this.camera.position.y = THREE.MathUtils.lerp(
                this.camera.position.y,
                this.position.y,
                deltaTime * 10
            );
        }

        // Update camera position
        this.camera.position.x = this.position.x;
        this.camera.position.z = this.position.z;
    }

    checkMapCollision() {
        // Check collision with map boundaries
        if (this.game.currentMap) {
            const bounds = this.game.currentMap.bounds;

            // Keep player within map bounds
            this.position.x = THREE.MathUtils.clamp(
                this.position.x,
                bounds.minX + this.radius,
                bounds.maxX - this.radius
            );
            this.position.z = THREE.MathUtils.clamp(
                this.position.z,
                bounds.minZ + this.radius,
                bounds.maxZ - this.radius
            );

            // Check collision with walls
            const walls = this.game.currentMap.walls || [];
            for (const wall of walls) {
                this.resolveWallCollision(wall);
            }
        }
    }

    resolveWallCollision(wall) {
        // Simple AABB collision with walls
        const playerMin = {
            x: this.position.x - this.radius,
            z: this.position.z - this.radius
        };
        const playerMax = {
            x: this.position.x + this.radius,
            z: this.position.z + this.radius
        };

        const wallMin = {
            x: wall.x - wall.width / 2,
            z: wall.z - wall.depth / 2
        };
        const wallMax = {
            x: wall.x + wall.width / 2,
            z: wall.z + wall.depth / 2
        };

        // Check if overlapping
        if (playerMax.x > wallMin.x && playerMin.x < wallMax.x &&
            playerMax.z > wallMin.z && playerMin.z < wallMax.z) {
            // Find the smallest overlap
            const overlapX1 = playerMax.x - wallMin.x;
            const overlapX2 = wallMax.x - playerMin.x;
            const overlapZ1 = playerMax.z - wallMin.z;
            const overlapZ2 = wallMax.z - playerMin.z;

            const minOverlapX = Math.min(overlapX1, overlapX2);
            const minOverlapZ = Math.min(overlapZ1, overlapZ2);

            // Push out in the direction of smallest overlap
            if (minOverlapX < minOverlapZ) {
                if (overlapX1 < overlapX2) {
                    this.position.x = wallMin.x - this.radius;
                } else {
                    this.position.x = wallMax.x + this.radius;
                }
            } else {
                if (overlapZ1 < overlapZ2) {
                    this.position.z = wallMin.z - this.radius;
                } else {
                    this.position.z = wallMax.z + this.radius;
                }
            }
        }
    }

    handleMouseMove(deltaX, deltaY) {
        // Horizontal rotation (yaw)
        this.rotation.y -= deltaX;

        // Vertical rotation (pitch) with limits
        this.rotation.x -= deltaY;
        this.rotation.x = THREE.MathUtils.clamp(
            this.rotation.x,
            -Math.PI / 2 + 0.1,
            Math.PI / 2 - 0.1
        );

        // Apply to camera
        this.camera.rotation.copy(this.rotation);
    }

    takeDamage(amount) {
        this.health -= amount;
        this.health = Math.max(0, this.health);

        // Play hurt sound
        this.game.audioManager.playSound('player_hurt');

        // Show damage effect
        if (this.game.hud) {
            this.game.hud.showDamageEffect();
        }

        return this.health <= 0;
    }

    heal(amount) {
        this.health = Math.min(this.maxHealth, this.health + amount);
    }

    getPosition() {
        return this.position.clone();
    }

    getDirection() {
        const direction = new THREE.Vector3(0, 0, -1);
        direction.applyQuaternion(this.camera.quaternion);
        return direction;
    }
}
