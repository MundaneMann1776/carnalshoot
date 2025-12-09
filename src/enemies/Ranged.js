// Ranged.js - Projectile-shooting enemy with improved visuals
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

        // Animation
        this.hoverPhase = Math.random() * Math.PI * 2;
        this.chargePhase = 0;
    }

    createMesh() {
        const group = new THREE.Group();

        // Main body - thin archer shape
        const bodyGeo = new THREE.CylinderGeometry(0.15, 0.25, 0.8, 8);
        const bodyMat = new THREE.MeshStandardMaterial({
            color: 0x6666aa, // Mutated skin tone
            roughness: 0.6,
            metalness: 0.3
        });
        const body = new THREE.Mesh(bodyGeo, bodyMat);
        body.position.y = 1.0;
        group.add(body);

        // Crystalline horns
        const hornMat = new THREE.MeshStandardMaterial({
            color: 0xaa88ff,
            roughness: 0.15,
            metalness: 0.7,
            transparent: true,
            opacity: 0.9
        });

        const hornGeo = new THREE.ConeGeometry(0.06, 0.35, 6);

        // Left horn (curved forward)
        const leftHorn = new THREE.Mesh(hornGeo, hornMat);
        leftHorn.position.set(-0.15, 1.6, -0.1);
        leftHorn.rotation.x = -0.3;
        leftHorn.rotation.z = 0.25;
        group.add(leftHorn);

        // Right horn
        const rightHorn = new THREE.Mesh(hornGeo, hornMat);
        rightHorn.position.set(0.15, 1.6, -0.1);
        rightHorn.rotation.x = -0.3;
        rightHorn.rotation.z = -0.25;
        group.add(rightHorn);

        // Center horn (taller)
        const centerHorn = new THREE.Mesh(
            new THREE.ConeGeometry(0.05, 0.45, 6),
            hornMat
        );
        centerHorn.position.set(0, 1.65, 0);
        group.add(centerHorn);

        // Head
        const headGeo = new THREE.SphereGeometry(0.18, 8, 8);
        const headMat = new THREE.MeshStandardMaterial({
            color: 0x7777bb,
            roughness: 0.55,
            metalness: 0.25
        });
        const head = new THREE.Mesh(headGeo, headMat);
        head.position.y = 1.4;
        head.scale.set(1, 1.2, 0.9);
        group.add(head);

        // Large single eye
        const eyeGeo = new THREE.SphereGeometry(0.1, 12, 12);
        const eyeMat = new THREE.MeshBasicMaterial({ color: 0xff2200 });
        const eye = new THREE.Mesh(eyeGeo, eyeMat);
        eye.position.set(0, 1.45, -0.15);
        group.add(eye);

        // Eye glow
        const eyeLight = new THREE.PointLight(0xff2200, 0.5, 2);
        eyeLight.position.set(0, 1.45, -0.2);
        group.add(eyeLight);

        // Pupil (tracks player)
        const pupilGeo = new THREE.SphereGeometry(0.035, 6, 6);
        const pupilMat = new THREE.MeshBasicMaterial({ color: 0x000000 });
        this.pupil = new THREE.Mesh(pupilGeo, pupilMat);
        this.pupil.position.set(0, 1.45, -0.24);
        group.add(this.pupil);

        // Glowing projectile organ (on chest)
        const organGeo = new THREE.SphereGeometry(0.12, 8, 8);
        const organMat = new THREE.MeshBasicMaterial({
            color: 0xff00ff,
            transparent: true,
            opacity: 0.8
        });
        this.projectileOrgan = new THREE.Mesh(organGeo, organMat);
        this.projectileOrgan.position.set(0, 0.9, -0.2);
        group.add(this.projectileOrgan);

        // Organ glow
        this.organLight = new THREE.PointLight(0xff00ff, 0.4, 1.5);
        this.organLight.position.set(0, 0.9, -0.25);
        group.add(this.organLight);

        // Thin arms (lowered, not attacking pose)
        const armGeo = new THREE.CylinderGeometry(0.03, 0.025, 0.4, 6);
        const armMat = new THREE.MeshStandardMaterial({
            color: 0x6666aa,
            roughness: 0.65
        });

        const leftArm = new THREE.Mesh(armGeo, armMat);
        leftArm.position.set(-0.22, 0.9, 0);
        leftArm.rotation.z = 0.15;
        group.add(leftArm);

        const rightArm = new THREE.Mesh(armGeo, armMat);
        rightArm.position.set(0.22, 0.9, 0);
        rightArm.rotation.z = -0.15;
        group.add(rightArm);

        // Floating rings (energy)
        const ringGeo = new THREE.TorusGeometry(0.35, 0.015, 8, 24);
        const ringMat = new THREE.MeshStandardMaterial({
            color: 0xaa88ff,
            roughness: 0.15,
            metalness: 0.85,
            transparent: true,
            opacity: 0.7
        });

        this.ring1 = new THREE.Mesh(ringGeo, ringMat);
        this.ring1.position.y = 1.0;
        this.ring1.rotation.x = Math.PI / 2;
        group.add(this.ring1);

        this.ring2 = new THREE.Mesh(ringGeo, ringMat);
        this.ring2.position.y = 1.0;
        this.ring2.rotation.x = Math.PI / 3;
        this.ring2.rotation.y = Math.PI / 4;
        group.add(this.ring2);

        // Wispy lower body (fades out)
        const wispGeo = new THREE.ConeGeometry(0.2, 0.5, 8);
        const wispMat = new THREE.MeshStandardMaterial({
            color: 0x5555aa,
            roughness: 0.7,
            metalness: 0.2,
            transparent: true,
            opacity: 0.6
        });
        const wisp = new THREE.Mesh(wispGeo, wispMat);
        wisp.position.y = 0.35;
        wisp.rotation.x = Math.PI;
        group.add(wisp);

        // Store for hit detection
        group.userData.enemy = this;

        // Store materials
        this.originalMaterials = [bodyMat, headMat, armMat, hornMat];

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

        // Charge up animation
        if (!this.canAttack) {
            this.chargePhase += deltaTime * 5;
            if (this.projectileOrgan) {
                const pulse = 1 + Math.sin(this.chargePhase) * 0.3;
                this.projectileOrgan.scale.set(pulse, pulse, pulse);
                this.organLight.intensity = 0.4 + Math.sin(this.chargePhase) * 0.3;
            }
        }

        // Attack if able
        if (this.canAttack) {
            this.performAttack();
        }
    }

    performAttack() {
        const player = this.game.player;
        if (!player) return;

        // Create projectile from organ
        const projectile = new EnemyProjectile(
            this.game,
            this.position.clone().add(new THREE.Vector3(0, 0.9, -0.2)),
            player.getPosition().add(new THREE.Vector3(0, 1, 0)),
            this.damage
        );
        this.game.addProjectile(projectile);

        // Set cooldown
        this.canAttack = false;
        this.attackTimer = this.attackCooldown;
        this.chargePhase = 0;

        // Visual feedback - flash organ
        if (this.projectileOrgan) {
            this.projectileOrgan.material.color.setHex(0xffffff);
            this.organLight.intensity = 1.5;
            setTimeout(() => {
                if (this.projectileOrgan) {
                    this.projectileOrgan.material.color.setHex(0xff00ff);
                    this.organLight.intensity = 0.4;
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
            this.hoverPhase += deltaTime * 3;
            this.mesh.position.y = Math.sin(this.hoverPhase) * 0.12;
        }

        // Eye tracking
        if (this.pupil && this.game.player && !this.isDead) {
            const toPlayer = this.game.player.getPosition().clone().sub(this.position);
            toPlayer.normalize();
            this.pupil.position.x = toPlayer.x * 0.03;
            this.pupil.position.y = 1.45 + toPlayer.y * 0.02;
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

        // Create mesh - glowing energy orb
        const geometry = new THREE.SphereGeometry(0.12, 8, 8);
        const material = new THREE.MeshBasicMaterial({
            color: 0xff44ff,
            transparent: true,
            opacity: 0.9
        });
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.position.copy(startPos);

        // Outer glow
        const glowGeo = new THREE.SphereGeometry(0.2, 8, 8);
        const glowMat = new THREE.MeshBasicMaterial({
            color: 0xff00ff,
            transparent: true,
            opacity: 0.4
        });
        const glow = new THREE.Mesh(glowGeo, glowMat);
        this.mesh.add(glow);

        // Light
        const light = new THREE.PointLight(0xff00ff, 0.5, 3);
        this.mesh.add(light);

        // Trail positions
        this.trailMeshes = [];
    }

    update(deltaTime) {
        // Move projectile
        const movement = this.direction.clone().multiplyScalar(this.speed * deltaTime);
        this.mesh.position.add(movement);

        // Spin effect
        this.mesh.rotation.y += deltaTime * 10;
        this.mesh.rotation.x += deltaTime * 5;

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
