// Enemy.js - Base enemy class with AI
import * as THREE from 'three';

export const EnemyState = {
    IDLE: 'idle',
    CHASE: 'chase',
    ATTACK: 'attack',
    DEAD: 'dead'
};

export class Enemy {
    constructor(game, config) {
        this.game = game;

        // Stats
        this.name = config.name || 'Enemy';
        this.health = config.health || 30;
        this.maxHealth = this.health;
        this.damage = config.damage || 10;
        this.speed = config.speed || 4;
        this.attackRange = config.attackRange || 2;
        this.attackCooldown = config.attackCooldown || 1;

        // State
        this.state = EnemyState.IDLE;
        this.isDead = false;
        this.deathAnimationComplete = false;

        // Position
        this.position = new THREE.Vector3();
        this.velocity = new THREE.Vector3();
        this.rotation = 0;

        // Attack timing
        this.attackTimer = 0;
        this.canAttack = true;

        // Death animation
        this.deathTimer = 0;
        this.deathDuration = 0.5;

        // Visual
        this.color = config.color || 0x00ff00;
        this.size = config.size || 1;
        this.mesh = null;

        // Hit flash
        this.hitFlashTimer = 0;
        this.originalMaterials = [];
    }

    spawn(position) {
        this.position.copy(position);
        this.createMesh();
        this.mesh.position.copy(position);
        this.state = EnemyState.CHASE;
    }

    createMesh() {
        // Base mesh - override in subclasses
        const geometry = new THREE.BoxGeometry(
            0.6 * this.size,
            1.0 * this.size,
            0.4 * this.size
        );
        const material = new THREE.MeshStandardMaterial({
            color: this.color,
            roughness: 0.7,
            metalness: 0.3
        });

        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.position.y = 0.5 * this.size;
        this.mesh.castShadow = true;
        this.mesh.receiveShadow = true;

        // Store reference for raycasting
        this.mesh.userData.enemy = this;

        // Store materials for hit flash
        this.originalMaterials = [material];
    }

    update(deltaTime) {
        if (this.isDead) {
            this.updateDeath(deltaTime);
            return;
        }

        // Update hit flash
        if (this.hitFlashTimer > 0) {
            this.hitFlashTimer -= deltaTime;
            if (this.hitFlashTimer <= 0) {
                this.resetMaterials();
            }
        }

        // Update attack cooldown
        if (!this.canAttack) {
            this.attackTimer -= deltaTime;
            if (this.attackTimer <= 0) {
                this.canAttack = true;
            }
        }

        // AI behavior based on state
        switch (this.state) {
            case EnemyState.CHASE:
                this.chase(deltaTime);
                break;
            case EnemyState.ATTACK:
                this.attack(deltaTime);
                break;
        }

        // Update mesh position
        if (this.mesh) {
            this.mesh.position.x = this.position.x;
            this.mesh.position.z = this.position.z;
            this.mesh.rotation.y = this.rotation;
        }
    }

    chase(deltaTime) {
        const player = this.game.player;
        if (!player) return;

        const playerPos = player.getPosition();
        const toPlayer = playerPos.clone().sub(this.position);
        const distance = toPlayer.length();

        // Check if in attack range
        if (distance <= this.attackRange) {
            this.state = EnemyState.ATTACK;
            return;
        }

        // Move toward player
        toPlayer.y = 0;
        toPlayer.normalize();

        // Set rotation to face player
        this.rotation = Math.atan2(toPlayer.x, toPlayer.z);

        // Apply velocity
        this.velocity.x = toPlayer.x * this.speed;
        this.velocity.z = toPlayer.z * this.speed;

        // Update position
        this.position.x += this.velocity.x * deltaTime;
        this.position.z += this.velocity.z * deltaTime;

        // Check collision with other enemies
        this.separateFromOthers();

        // Constrain to map bounds
        this.constrainToMap();
    }

    attack(deltaTime) {
        const player = this.game.player;
        if (!player) return;

        const playerPos = player.getPosition();
        const toPlayer = playerPos.clone().sub(this.position);
        const distance = toPlayer.length();

        // Check if player moved out of range
        if (distance > this.attackRange * 1.5) {
            this.state = EnemyState.CHASE;
            return;
        }

        // Face player
        toPlayer.y = 0;
        toPlayer.normalize();
        this.rotation = Math.atan2(toPlayer.x, toPlayer.z);

        // Attack if able
        if (this.canAttack) {
            this.performAttack();
        }
    }

    performAttack() {
        const player = this.game.player;
        if (!player) return;

        // Deal damage to player
        player.takeDamage(this.damage);

        // Set cooldown
        this.canAttack = false;
        this.attackTimer = this.attackCooldown;

        // Attack animation (scale bounce)
        if (this.mesh) {
            const originalScale = this.mesh.scale.clone();
            this.mesh.scale.multiplyScalar(1.2);

            setTimeout(() => {
                if (this.mesh) {
                    this.mesh.scale.copy(originalScale);
                }
            }, 100);
        }
    }

    separateFromOthers() {
        const separation = new THREE.Vector3();
        const separationRadius = 1;

        for (const other of this.game.enemies) {
            if (other === this || other.isDead) continue;

            const toOther = this.position.clone().sub(other.position);
            const distance = toOther.length();

            if (distance < separationRadius && distance > 0) {
                toOther.normalize();
                toOther.multiplyScalar((separationRadius - distance) * 0.5);
                separation.add(toOther);
            }
        }

        this.position.add(separation);
    }

    constrainToMap() {
        if (this.game.currentMap) {
            const bounds = this.game.currentMap.bounds;
            const padding = 0.5;

            this.position.x = THREE.MathUtils.clamp(
                this.position.x,
                bounds.minX + padding,
                bounds.maxX - padding
            );
            this.position.z = THREE.MathUtils.clamp(
                this.position.z,
                bounds.minZ + padding,
                bounds.maxZ - padding
            );
        }
    }

    takeDamage(amount) {
        if (this.isDead) return;

        this.health -= amount;

        // Hit flash
        this.hitFlashTimer = 0.1;
        this.flashMaterials();

        if (this.health <= 0) {
            this.die();
        }
    }

    flashMaterials() {
        if (!this.mesh) return;

        const flashMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });

        if (this.mesh.material) {
            this.mesh.material = flashMaterial;
        }

        this.mesh.traverse((child) => {
            if (child.isMesh) {
                child.material = flashMaterial;
            }
        });
    }

    resetMaterials() {
        if (!this.mesh) return;

        // Restore original materials
        if (this.originalMaterials.length > 0) {
            this.mesh.material = this.originalMaterials[0];
        }
    }

    die() {
        this.isDead = true;
        this.state = EnemyState.DEAD;
        this.deathTimer = this.deathDuration;

        // Play death sound
        this.game.audioManager.playSound('enemy_death');

        // Notify game
        this.game.onEnemyKilled();
    }

    updateDeath(deltaTime) {
        this.deathTimer -= deltaTime;

        // Death animation - sink into ground and fade
        if (this.mesh) {
            const progress = 1 - (this.deathTimer / this.deathDuration);
            this.mesh.position.y = (0.5 * this.size) * (1 - progress);
            this.mesh.scale.y = 1 - progress * 0.5;

            if (this.mesh.material) {
                this.mesh.material.transparent = true;
                this.mesh.material.opacity = 1 - progress;
            }
        }

        if (this.deathTimer <= 0) {
            this.deathAnimationComplete = true;
        }
    }

    getPosition() {
        return this.position.clone();
    }
}
