// Knife.js - Melee weapon
import * as THREE from 'three';
import { Weapon } from './Weapon.js';

export class Knife extends Weapon {
    constructor(game) {
        super(game, {
            name: 'Knife',
            type: 'melee',
            damage: 25,
            range: 2,
            fireRate: 2,
            spread: 0,
            recoil: 0.02,
            magSize: Infinity,
            currentAmmo: Infinity,
            reserveAmmo: Infinity,
            reloadTime: 0
        });

        this.color = 0xcccccc;
        this.isSwinging = false;
        this.swingAngle = 0;
    }

    fire() {
        if (!this.canFire) return false;

        this.canFire = false;
        this.isSwinging = true;
        this.swingAngle = 0;

        // Play swipe sound
        this.playFireSound();

        // Re-enable after swing
        setTimeout(() => {
            this.canFire = true;
            this.isSwinging = false;
        }, 1000 / this.fireRate);

        return true;
    }

    update(deltaTime) {
        super.update(deltaTime);

        // Animate swing
        if (this.isSwinging && this.mesh) {
            this.swingAngle += deltaTime * 20;
            this.mesh.rotation.x = Math.sin(this.swingAngle) * 0.5;
            this.mesh.position.z = -0.1 + Math.sin(this.swingAngle) * 0.1;
        }
    }

    playFireSound() {
        this.game.audioManager.playSound('knife_swipe');
    }

    createMesh() {
        const group = new THREE.Group();

        // Handle
        const handleGeo = new THREE.CylinderGeometry(0.015, 0.015, 0.12, 8);
        const handleMat = new THREE.MeshStandardMaterial({
            color: 0x2a2a2a,
            roughness: 0.8,
            metalness: 0.2
        });
        const handle = new THREE.Mesh(handleGeo, handleMat);
        handle.rotation.x = Math.PI / 2;
        handle.position.z = 0.1;
        group.add(handle);

        // Guard
        const guardGeo = new THREE.BoxGeometry(0.06, 0.01, 0.02);
        const guardMat = new THREE.MeshStandardMaterial({
            color: 0x888888,
            roughness: 0.3,
            metalness: 0.8
        });
        const guard = new THREE.Mesh(guardGeo, guardMat);
        guard.position.z = 0.04;
        group.add(guard);

        // Blade
        const bladeShape = new THREE.Shape();
        bladeShape.moveTo(0, 0);
        bladeShape.lineTo(0.015, 0);
        bladeShape.lineTo(0.005, 0.15);
        bladeShape.lineTo(-0.005, 0.15);
        bladeShape.lineTo(-0.015, 0);

        const bladeGeo = new THREE.ExtrudeGeometry(bladeShape, {
            depth: 0.003,
            bevelEnabled: false
        });
        const bladeMat = new THREE.MeshStandardMaterial({
            color: 0xdddddd,
            roughness: 0.2,
            metalness: 0.9
        });
        const blade = new THREE.Mesh(bladeGeo, bladeMat);
        blade.rotation.x = Math.PI / 2;
        blade.position.set(0, 0, -0.1);
        group.add(blade);

        this.mesh = group;
        return group;
    }
}
