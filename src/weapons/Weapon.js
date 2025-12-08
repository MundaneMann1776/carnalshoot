// Weapon.js - Base weapon class
import * as THREE from 'three';

export class Weapon {
    constructor(game, config) {
        this.game = game;

        // Basic properties
        this.name = config.name || 'Weapon';
        this.type = config.type || 'semi-auto'; // semi-auto, full-auto, melee, pump, spin-up
        this.damage = config.damage || 10;
        this.range = config.range || 50;
        this.fireRate = config.fireRate || 3; // shots per second
        this.spread = config.spread || 0;
        this.recoil = config.recoil || 0.05;

        // Ammo
        this.magSize = config.magSize || 30;
        this.currentAmmo = config.currentAmmo || this.magSize;
        this.reserveAmmo = config.reserveAmmo || 90;
        this.reloadTime = config.reloadTime || 1.5;
        this.reloadTimer = 0;

        // Fire timing
        this.fireInterval = 1 / this.fireRate;
        this.fireTimer = 0;
        this.canFire = true;

        // Recoil animation
        this.recoilOffset = 0;

        // Visual
        this.color = config.color || 0x888888;
        this.mesh = null;
    }

    update(deltaTime) {
        // Update fire timer
        if (this.fireTimer > 0) {
            this.fireTimer -= deltaTime;
            if (this.fireTimer <= 0 && this.type === 'full-auto') {
                this.canFire = true;
            }
        }
    }

    fire() {
        if (!this.canFire) return false;
        if (this.currentAmmo <= 0) return false;

        // Consume ammo
        this.currentAmmo--;

        // Set cooldown
        this.fireTimer = this.fireInterval;

        // Handle different weapon types
        switch (this.type) {
            case 'semi-auto':
                this.canFire = false; // Must release and press again
                break;
            case 'full-auto':
                this.canFire = false; // Will reset after interval
                break;
            case 'pump':
                this.canFire = false;
                this.fireTimer = this.fireInterval; // Pump action delay
                setTimeout(() => { this.canFire = true; }, this.fireInterval * 1000);
                break;
            case 'melee':
                this.canFire = false;
                setTimeout(() => { this.canFire = true; }, this.fireInterval * 1000);
                break;
        }

        // Play sound
        this.playFireSound();

        return true;
    }

    playFireSound() {
        // Default implementation - override in subclasses
    }

    createMesh() {
        // Default weapon mesh - override in subclasses for unique shapes
        const group = new THREE.Group();

        // Main body
        const bodyGeometry = new THREE.BoxGeometry(0.1, 0.1, 0.4);
        const bodyMaterial = new THREE.MeshStandardMaterial({
            color: this.color,
            roughness: 0.4,
            metalness: 0.6
        });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        group.add(body);

        return group;
    }

    refillAmmo() {
        this.currentAmmo = this.magSize;
        this.reserveAmmo = this.magSize * 3;
    }
}
