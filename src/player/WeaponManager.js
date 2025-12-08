// WeaponManager.js - Manages all weapons and firing
import * as THREE from 'three';
import { Knife } from '../weapons/Knife.js';
import { Pistol } from '../weapons/Pistol.js';
import { SMG } from '../weapons/SMG.js';
import { Shotgun } from '../weapons/Shotgun.js';
import { AR15 } from '../weapons/AR15.js';
import { Minigun } from '../weapons/Minigun.js';

export class WeaponManager {
    constructor(game) {
        this.game = game;

        // Create all weapons
        this.weapons = [
            new Knife(game),
            new Pistol(game),
            new SMG(game),
            new Shotgun(game),
            new AR15(game),
            new Minigun(game)
        ];

        // Current weapon index
        this.currentIndex = 1; // Start with pistol
        this.currentWeapon = this.weapons[this.currentIndex];

        // Weapon switching
        this.isSwitching = false;
        this.switchTime = 0.3;
        this.switchTimer = 0;

        // Reloading
        this.isReloading = false;

        // Create weapon mesh container
        this.weaponContainer = new THREE.Group();
        game.camera.add(this.weaponContainer);

        // Position weapon in front of camera
        this.weaponContainer.position.set(0.3, -0.3, -0.5);

        // Add current weapon mesh
        this.updateWeaponMesh();

        // Update HUD
        this.updateHUD();
    }

    update(deltaTime) {
        const input = this.game.inputManager;

        // Handle weapon switching
        if (this.isSwitching) {
            this.switchTimer -= deltaTime;

            // Animate weapon down then up
            const progress = 1 - (this.switchTimer / this.switchTime);
            if (progress < 0.5) {
                this.weaponContainer.position.y = -0.3 - (progress * 2 * 0.3);
            } else {
                this.weaponContainer.position.y = -0.6 + ((progress - 0.5) * 2 * 0.3);
            }

            if (this.switchTimer <= 0) {
                this.isSwitching = false;
                this.weaponContainer.position.y = -0.3;
            }
            return;
        }

        // Handle reloading
        if (this.isReloading) {
            if (this.currentWeapon.reloadTimer > 0) {
                this.currentWeapon.reloadTimer -= deltaTime;

                // Weapon bob during reload
                this.weaponContainer.rotation.z = Math.sin(Date.now() * 0.01) * 0.1;
            } else {
                this.finishReload();
            }
            return;
        }

        // Reset weapon rotation
        this.weaponContainer.rotation.z = THREE.MathUtils.lerp(
            this.weaponContainer.rotation.z,
            0,
            deltaTime * 10
        );

        // Handle firing
        if (input.mouse.leftButton && input.isPointerLocked) {
            this.fire();
        } else {
            // Reset trigger for semi-auto weapons
            if (this.currentWeapon.type === 'semi-auto') {
                this.currentWeapon.canFire = true;
            }

            // Stop minigun spin
            if (this.currentWeapon.name === 'Minigun') {
                this.currentWeapon.stopSpin();
            }
        }

        // Update current weapon
        this.currentWeapon.update(deltaTime);

        // Weapon sway
        this.updateWeaponSway(deltaTime);
    }

    updateWeaponSway(deltaTime) {
        const input = this.game.inputManager;

        // Sway based on movement
        if (input.isMoving()) {
            const swayAmount = input.keys.sprint ? 0.02 : 0.01;
            const swaySpeed = input.keys.sprint ? 8 : 6;

            this.weaponContainer.position.x = 0.3 + Math.sin(Date.now() * 0.001 * swaySpeed) * swayAmount;
            this.weaponContainer.position.y = -0.3 + Math.abs(Math.sin(Date.now() * 0.002 * swaySpeed)) * swayAmount;
        }

        // Recoil recovery
        if (this.currentWeapon.recoilOffset) {
            this.currentWeapon.recoilOffset *= 0.9;
            this.weaponContainer.rotation.x = -this.currentWeapon.recoilOffset;
        }
    }

    fire() {
        if (this.isSwitching || this.isReloading) return;

        // Check if weapon can fire
        if (!this.currentWeapon.canFire) return;

        // Check ammo
        if (this.currentWeapon.currentAmmo <= 0) {
            if (this.currentWeapon.reserveAmmo > 0) {
                this.reload();
            } else {
                this.game.audioManager.playSound('empty_clip');
            }
            return;
        }

        // Fire the weapon
        this.currentWeapon.fire();

        // Apply recoil
        this.applyRecoil();

        // Raycasting to detect hits
        this.performHitscan();

        // Update HUD
        this.updateHUD();
    }

    performHitscan() {
        const weapon = this.currentWeapon;

        if (weapon.name === 'Knife') {
            // Melee attack - check enemies in front
            this.performMeleeAttack();
            return;
        }

        // For shotgun, fire multiple pellets
        const pelletCount = weapon.name === 'Shotgun' ? 8 : 1;

        for (let i = 0; i < pelletCount; i++) {
            // Calculate spread
            const spread = weapon.spread || 0;
            const spreadX = (Math.random() - 0.5) * spread;
            const spreadY = (Math.random() - 0.5) * spread;

            // Ray origin and direction
            const origin = this.game.camera.position.clone();
            const direction = this.game.player.getDirection();

            // Apply spread
            direction.x += spreadX;
            direction.y += spreadY;
            direction.normalize();

            // Create raycaster
            const raycaster = new THREE.Raycaster(origin, direction, 0, weapon.range);

            // Check for enemy hits
            const enemyMeshes = this.game.enemies.map(e => e.mesh).filter(m => m);
            const hits = raycaster.intersectObjects(enemyMeshes, true);

            if (hits.length > 0) {
                // Find the enemy that was hit
                let hitMesh = hits[0].object;
                while (hitMesh.parent && !hitMesh.userData.enemy) {
                    hitMesh = hitMesh.parent;
                }

                const enemy = hitMesh.userData.enemy;
                if (enemy) {
                    // Calculate damage (shotgun pellets do less per pellet)
                    const damage = weapon.name === 'Shotgun'
                        ? weapon.damage / 8
                        : weapon.damage;

                    enemy.takeDamage(damage);

                    // Create hit effect
                    this.createHitEffect(hits[0].point);
                }
            } else {
                // Check for wall hits to create impact effect
                if (this.game.currentMap) {
                    const wallMeshes = this.game.currentMap.wallMeshes || [];
                    const wallHits = raycaster.intersectObjects(wallMeshes, true);

                    if (wallHits.length > 0) {
                        this.createWallImpact(wallHits[0].point, wallHits[0].face.normal);
                    }
                }
            }
        }
    }

    performMeleeAttack() {
        const range = this.currentWeapon.range;
        const playerPos = this.game.player.getPosition();
        const playerDir = this.game.player.getDirection();

        // Check all enemies
        for (const enemy of this.game.enemies) {
            if (enemy.isDead) continue;

            const enemyPos = enemy.getPosition();
            const toEnemy = enemyPos.clone().sub(playerPos);
            const distance = toEnemy.length();

            // Check if in range
            if (distance <= range) {
                // Check if in front of player (within ~90 degree cone)
                toEnemy.normalize();
                const dot = playerDir.dot(toEnemy);

                if (dot > 0.3) {
                    enemy.takeDamage(this.currentWeapon.damage);
                    this.createHitEffect(enemyPos);
                }
            }
        }
    }

    createHitEffect(position) {
        // Create a small red flash at hit point
        const geometry = new THREE.SphereGeometry(0.1, 8, 8);
        const material = new THREE.MeshBasicMaterial({
            color: 0xff0000,
            transparent: true,
            opacity: 1
        });
        const flash = new THREE.Mesh(geometry, material);
        flash.position.copy(position);
        this.game.scene.add(flash);

        // Play hit sound
        this.game.audioManager.playSound('enemy_hit');

        // Fade and remove
        const startTime = Date.now();
        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = elapsed / 200;

            if (progress < 1) {
                material.opacity = 1 - progress;
                flash.scale.setScalar(1 + progress);
                requestAnimationFrame(animate);
            } else {
                this.game.scene.remove(flash);
                geometry.dispose();
                material.dispose();
            }
        };
        animate();
    }

    createWallImpact(position, normal) {
        // Create a small yellow spark at impact point
        const geometry = new THREE.SphereGeometry(0.05, 4, 4);
        const material = new THREE.MeshBasicMaterial({
            color: 0xffff00,
            transparent: true,
            opacity: 1
        });
        const spark = new THREE.Mesh(geometry, material);
        spark.position.copy(position);
        spark.position.addScaledVector(normal, 0.02);
        this.game.scene.add(spark);

        // Fade and remove
        const startTime = Date.now();
        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = elapsed / 100;

            if (progress < 1) {
                material.opacity = 1 - progress;
                requestAnimationFrame(animate);
            } else {
                this.game.scene.remove(spark);
                geometry.dispose();
                material.dispose();
            }
        };
        animate();
    }

    applyRecoil() {
        const recoilAmount = this.currentWeapon.recoil || 0.05;
        this.currentWeapon.recoilOffset = (this.currentWeapon.recoilOffset || 0) + recoilAmount;

        // Also apply to player camera slightly
        const player = this.game.player;
        player.rotation.x -= recoilAmount * 0.3;
        player.rotation.x = THREE.MathUtils.clamp(
            player.rotation.x,
            -Math.PI / 2 + 0.1,
            Math.PI / 2 - 0.1
        );
        this.game.camera.rotation.copy(player.rotation);
    }

    reload() {
        if (this.isReloading) return;
        if (this.currentWeapon.name === 'Knife') return;
        if (this.currentWeapon.currentAmmo >= this.currentWeapon.magSize) return;
        if (this.currentWeapon.reserveAmmo <= 0) return;

        this.isReloading = true;
        this.currentWeapon.reloadTimer = this.currentWeapon.reloadTime;
        this.game.audioManager.playSound('reload');
    }

    finishReload() {
        const weapon = this.currentWeapon;
        const neededAmmo = weapon.magSize - weapon.currentAmmo;
        const ammoToAdd = Math.min(neededAmmo, weapon.reserveAmmo);

        weapon.currentAmmo += ammoToAdd;
        weapon.reserveAmmo -= ammoToAdd;

        this.isReloading = false;
        this.weaponContainer.rotation.z = 0;

        this.updateHUD();
    }

    switchWeapon(index) {
        if (index === this.currentIndex) return;
        if (index < 0 || index >= this.weapons.length) return;
        if (this.isSwitching) return;

        this.isSwitching = true;
        this.isReloading = false;
        this.switchTimer = this.switchTime;

        // Change weapon at midpoint of animation
        setTimeout(() => {
            this.currentIndex = index;
            this.currentWeapon = this.weapons[index];
            this.updateWeaponMesh();
            this.updateHUD();
        }, this.switchTime * 500);
    }

    updateWeaponMesh() {
        // Remove old weapon mesh
        while (this.weaponContainer.children.length > 0) {
            this.weaponContainer.remove(this.weaponContainer.children[0]);
        }

        // Add new weapon mesh
        const mesh = this.currentWeapon.createMesh();
        this.weaponContainer.add(mesh);
    }

    updateHUD() {
        // Update ammo display
        const currentEl = document.getElementById('ammo-current');
        const reserveEl = document.getElementById('ammo-reserve');

        if (this.currentWeapon.name === 'Knife') {
            currentEl.textContent = '∞';
            reserveEl.textContent = '';
            document.querySelector('.ammo-divider').style.display = 'none';
        } else {
            currentEl.textContent = this.currentWeapon.currentAmmo;
            reserveEl.textContent = this.currentWeapon.reserveAmmo;
            document.querySelector('.ammo-divider').style.display = 'inline';
        }

        // Update weapon slots
        const slots = document.querySelectorAll('.weapon-slot');
        slots.forEach((slot, i) => {
            slot.classList.toggle('active', i === this.currentIndex);
        });
    }

    getCurrentWeapon() {
        return this.currentWeapon;
    }
}
