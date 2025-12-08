// Minigun.js - Spin-up heavy weapon
import * as THREE from 'three';
import { Weapon } from './Weapon.js';

export class Minigun extends Weapon {
    constructor(game) {
        super(game, {
            name: 'Minigun',
            type: 'spin-up',
            damage: 15,
            range: 40,
            fireRate: 20,
            spread: 0.05,
            recoil: 0.02,
            magSize: 200,
            currentAmmo: 200,
            reserveAmmo: 400,
            reloadTime: 4.0
        });

        this.color = 0x555555;

        // Spin-up mechanics
        this.spinSpeed = 0;
        this.maxSpinSpeed = 1;
        this.spinUpTime = 0.5;
        this.spinDownTime = 0.3;
        this.isSpinning = false;
        this.barrelRotation = 0;
        this.barrelMesh = null;
    }

    update(deltaTime) {
        super.update(deltaTime);

        // Spin up/down
        if (this.isSpinning) {
            this.spinSpeed = Math.min(this.maxSpinSpeed, this.spinSpeed + deltaTime / this.spinUpTime);
        } else {
            this.spinSpeed = Math.max(0, this.spinSpeed - deltaTime / this.spinDownTime);
        }

        // Rotate barrel visual
        if (this.barrelMesh && this.spinSpeed > 0) {
            this.barrelRotation += this.spinSpeed * deltaTime * 30;
            this.barrelMesh.rotation.z = this.barrelRotation;
        }

        // Can only fire at full spin
        this.canFire = this.spinSpeed >= this.maxSpinSpeed && this.fireTimer <= 0;
    }

    fire() {
        // Start spinning
        this.isSpinning = true;

        // Only fire if at max spin
        if (this.spinSpeed < this.maxSpinSpeed) return false;

        return super.fire();
    }

    stopSpin() {
        this.isSpinning = false;
    }

    playFireSound() {
        this.game.audioManager.playSound('shoot_minigun');
    }

    createMesh() {
        const group = new THREE.Group();

        // Main housing
        const housingGeo = new THREE.CylinderGeometry(0.05, 0.05, 0.25, 12);
        const housingMat = new THREE.MeshStandardMaterial({
            color: 0x3a3a3a,
            roughness: 0.4,
            metalness: 0.7
        });
        const housing = new THREE.Mesh(housingGeo, housingMat);
        housing.rotation.x = Math.PI / 2;
        housing.position.set(0, 0, 0);
        group.add(housing);

        // Barrel cluster (6 barrels)
        const barrelGroup = new THREE.Group();
        const barrelGeo = new THREE.CylinderGeometry(0.006, 0.006, 0.3, 6);
        const barrelMat = new THREE.MeshStandardMaterial({
            color: 0x2a2a2a,
            roughness: 0.3,
            metalness: 0.8
        });

        for (let i = 0; i < 6; i++) {
            const barrel = new THREE.Mesh(barrelGeo, barrelMat);
            barrel.rotation.x = Math.PI / 2;
            const angle = (i / 6) * Math.PI * 2;
            const radius = 0.025;
            barrel.position.set(
                Math.cos(angle) * radius,
                Math.sin(angle) * radius,
                -0.22
            );
            barrelGroup.add(barrel);
        }

        this.barrelMesh = barrelGroup;
        group.add(barrelGroup);

        // Front shroud
        const shroudGeo = new THREE.CylinderGeometry(0.04, 0.045, 0.08, 12);
        const shroudMat = new THREE.MeshStandardMaterial({
            color: 0x4a4a4a,
            roughness: 0.5,
            metalness: 0.6
        });
        const shroud = new THREE.Mesh(shroudGeo, shroudMat);
        shroud.rotation.x = Math.PI / 2;
        shroud.position.set(0, 0, -0.1);
        group.add(shroud);

        // Back motor housing
        const motorGeo = new THREE.CylinderGeometry(0.04, 0.035, 0.12, 12);
        const motorMat = new THREE.MeshStandardMaterial({
            color: 0x3a3a3a,
            roughness: 0.5,
            metalness: 0.5
        });
        const motor = new THREE.Mesh(motorGeo, motorMat);
        motor.rotation.x = Math.PI / 2;
        motor.position.set(0, 0, 0.15);
        group.add(motor);

        // Handle
        const handleGeo = new THREE.BoxGeometry(0.03, 0.08, 0.04);
        const handleMat = new THREE.MeshStandardMaterial({
            color: 0x2a2a2a,
            roughness: 0.8,
            metalness: 0.2
        });
        const handle = new THREE.Mesh(handleGeo, handleMat);
        handle.position.set(0, -0.06, 0.08);
        group.add(handle);

        // Ammo belt feed
        const feedGeo = new THREE.BoxGeometry(0.06, 0.04, 0.05);
        const feedMat = new THREE.MeshStandardMaterial({
            color: 0x5a5a3a,
            roughness: 0.6,
            metalness: 0.4
        });
        const feed = new THREE.Mesh(feedGeo, feedMat);
        feed.position.set(0.05, 0, 0.05);
        group.add(feed);

        this.mesh = group;
        return group;
    }
}
