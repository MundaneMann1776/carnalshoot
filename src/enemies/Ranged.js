// Ranged.js - Projectile-shooting enemy
import * as THREE from 'three';
import { Enemy, EnemyState } from './Enemy.js';

export class Ranged extends Enemy {
    constructor(game) {
        super(game, {
            name: 'Ranged',
            health: 60,
            damage: 20,
            speed: 4,
            attackRange: 15,
            attackCooldown: 2,
            color: 0x8888ff,
            size: 1
        });

        this.preferredDistance = 10;
        this.minDistance = 5;
    }

    createMesh() {
        const group = new THREE.Group();

        // Hovering body (floating)
        const bodyGeo = new THREE.OctahedronGeometry(0.35, 0);
        const bodyMat = new THREE.MeshStandardMaterial({
            color: 0x6666aa,
            roughness: 0.3,
            metalness: 0.6
        });
        const body = new THREE.Mesh(bodyGeo, bodyMat);
        body.position.y = 1.2;
        group.add(body);

        // Inner core (glowing)
        const coreGeo = new THREE.SphereGeometry(0.15, 8, 8);
        const coreMat = new THREE.MeshBasicMaterial({
            color: 0xaaaaff,
            transparent: true,
            opacity: 0.8
        });
        const core = new THREE.Mesh(coreGeo, coreMat);
        core.position.y = 1.2;
        group.add(core);

        // Eye (single, large)
        const eyeGeo = new THREE.SphereGeometry(0.12, 8, 8);
        const eyeMat = new THREE.MeshBasicMaterial({ color: 0xff0000 });
        const eye = new THREE.Mesh(eyeGeo, eyeMat);
        eye.position.set(0, 1.2, -0.3);
        group.add(eye);

        // Pupil
        const pupilGeo = new THREE.SphereGeometry(0.04, 6, 6);
        const pupilMat = new THREE.MeshBasicMaterial({ color: 0x000000 });
        const pupil = new THREE.Mesh(pupilGeo, pupilMat);
        pupil.position.set(0, 1.2, -0.4);
        group.add(pupil);

        // Floating rings
        const ringGeo = new THREE.TorusGeometry(0.45, 0.02, 8, 16);
        const ringMat = new THREE.MeshStandardMaterial({
            color: 0x8888cc,
            roughness: 0.2,
            metalness: 0.8
        });

        const ring1 = new THREE.Mesh(ringGeo, ringMat);
        ring1.position.y = 1.2;
        ring1.rotation.x = Math.PI / 2;
        group.add(ring1);

        const ring2 = new THREE.Mesh(ringGeo, ringMat);
        ring2.position.y = 1.2;
        ring2.rotation.x = Math.PI / 3;
        ring2.rotation.y = Math.PI / 4;
        group.add(ring2);

        // Store refs for animation
        this.ring1 = ring1;
        this.ring2 = ring2;
        this.coreMesh = core;

        // Store for hit detection
        group.userData.enemy = this;

        // Store materials
        this.originalMaterials = [bodyMat, coreMat, ringMat];

        this.mesh = group;
        return group;
    }

    chase(deltaTime) {
        const player = this.game.player;
        if (!player) return;

        const playerPos = player.getPosition();
        const toPlayer = playerPos.clone().sub(this.position);
        const distance = toPlayer.length();

        // Face player
        toPlayer.y = 0;
        toPlayer.normalize();
        this.rotation = Math.atan2(toPlayer.x, toPlayer.z);

        // Check if in attack range
        if (distance <= this.attackRange && distance >= this.minDistance) {
            this.state = EnemyState.ATTACK;
            return;
        }

        // Move to preferred distance
        let moveDirection;
        if (distance < this.minDistance) {
            // Too close, back away
            moveDirection = toPlayer.clone().multiplyScalar(-1);
        } else if (distance > this.preferredDistance) {
            // Too far, approach
            moveDirection = toPlayer.clone();
        } else {
            // Strafe sideways
            moveDirection = new THREE.Vector3(-toPlayer.z, 0, toPlayer.x);
            if (Math.random() > 0.5) moveDirection.multiplyScalar(-1);
        }

        moveDirection.normalize();

        // Apply velocity
        this.velocity.x = moveDirection.x * this.speed;
        this.velocity.z = moveDirection.z * this.speed;

        // Update position
        this.position.x += this.velocity.x * deltaTime;
        this.position.z += this.velocity.z * deltaTime;

        // Separation and constraints
        this.separateFromOthers();
        this.constrainToMap();
    }

    attack(deltaTime) {
        const player = this.game.player;
        if (!player) return;

        const playerPos = player.getPosition();
        const toPlayer = playerPos.clone().sub(this.position);
        const distance = toPlayer.length();

        // Face player
        toPlayer.y = 0;
        toPlayer.normalize();
        this.rotation = Math.atan2(toPlayer.x, toPlayer.z);

        // Check if player moved out of range
        if (distance > this.attackRange || distance < this.minDistance) {
            this.state = EnemyState.CHASE;
            return;
        }

        // Attack if able
        if (this.canAttack) {
            this.performAttack();
        }
    }

    performAttack() {
        const player = this.game.player;
        if (!player) return;

        // Create projectile
        const projectile = new EnemyProjectile(
            this.game,
            this.position.clone().add(new THREE.Vector3(0, 1.2, 0)),
            player.getPosition().add(new THREE.Vector3(0, 1, 0)),
            this.damage
        );
        this.game.addProjectile(projectile);

        // Set cooldown
        this.canAttack = false;
        this.attackTimer = this.attackCooldown;

        // Visual feedback - flash core
        if (this.coreMesh) {
            this.coreMesh.material.color.setHex(0xffffff);
            setTimeout(() => {
                if (this.coreMesh) {
                    this.coreMesh.material.color.setHex(0xaaaaff);
                }
            }, 100);
        }
    }

    update(deltaTime) {
        super.update(deltaTime);

        // Animate rings
        if (this.ring1 && !this.isDead) {
            this.ring1.rotation.z += deltaTime * 2;
        }
        if (this.ring2 && !this.isDead) {
            this.ring2.rotation.z -= deltaTime * 1.5;
        }

        // Hover animation
        if (this.mesh && !this.isDead) {
            this.mesh.position.y = Math.sin(Date.now() * 0.003) * 0.1;
        }
    }
}

// Projectile class for ranged enemies
class EnemyProjectile {
    constructor(game, startPos, targetPos, damage) {
        this.game = game;
        this.damage = damage;
        this.speed = 15;
        this.lifetime = 3;
        this.shouldRemove = false;

        // Calculate direction
        this.direction = targetPos.clone().sub(startPos).normalize();

        // Create mesh
        const geometry = new THREE.SphereGeometry(0.15, 8, 8);
        const material = new THREE.MeshBasicMaterial({
            color: 0xff00ff,
            transparent: true,
            opacity: 0.8
        });
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.position.copy(startPos);

        // Trail
        this.trailPositions = [];
    }

    update(deltaTime) {
        // Move projectile
        const movement = this.direction.clone().multiplyScalar(this.speed * deltaTime);
        this.mesh.position.add(movement);

        // Check player collision
        const player = this.game.player;
        if (player) {
            const distance = this.mesh.position.distanceTo(player.getPosition());
            if (distance < 0.5) {
                player.takeDamage(this.damage);
                this.shouldRemove = true;
                return;
            }
        }

        // Check wall collision
        if (this.game.currentMap) {
            const bounds = this.game.currentMap.bounds;
            const pos = this.mesh.position;

            if (pos.x < bounds.minX || pos.x > bounds.maxX ||
                pos.z < bounds.minZ || pos.z > bounds.maxZ ||
                pos.y < 0 || pos.y > 10) {
                this.shouldRemove = true;
                return;
            }
        }

        // Lifetime
        this.lifetime -= deltaTime;
        if (this.lifetime <= 0) {
            this.shouldRemove = true;
        }
    }
}
