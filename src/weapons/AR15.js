// AR15.js - Assault rifle
import * as THREE from 'three';
import { Weapon } from './Weapon.js';

export class AR15 extends Weapon {
    constructor(game) {
        super(game, {
            name: 'AR15',
            type: 'full-auto',
            damage: 25,
            range: 60,
            fireRate: 8,
            spread: 0.02,
            recoil: 0.06,
            magSize: 30,
            currentAmmo: 30,
            reserveAmmo: 90,
            reloadTime: 2.0
        });

        this.color = 0x444444;
    }

    playFireSound() {
        this.game.audioManager.playSound('shoot_ar15');
    }

    createMesh() {
        const group = new THREE.Group();

        // Main receiver
        const receiverGeo = new THREE.BoxGeometry(0.04, 0.06, 0.22);
        const receiverMat = new THREE.MeshStandardMaterial({
            color: 0x2a2a2a,
            roughness: 0.4,
            metalness: 0.6
        });
        const receiver = new THREE.Mesh(receiverGeo, receiverMat);
        receiver.position.set(0, 0, 0.02);
        group.add(receiver);

        // Barrel
        const barrelGeo = new THREE.CylinderGeometry(0.008, 0.008, 0.25, 8);
        const barrelMat = new THREE.MeshStandardMaterial({
            color: 0x3a3a3a,
            roughness: 0.3,
            metalness: 0.8
        });
        const barrel = new THREE.Mesh(barrelGeo, barrelMat);
        barrel.rotation.x = Math.PI / 2;
        barrel.position.set(0, 0.01, -0.2);
        group.add(barrel);

        // Handguard
        const guardGeo = new THREE.BoxGeometry(0.035, 0.04, 0.12);
        const guardMat = new THREE.MeshStandardMaterial({
            color: 0x3a3a3a,
            roughness: 0.5,
            metalness: 0.5
        });
        const guard = new THREE.Mesh(guardGeo, guardMat);
        guard.position.set(0, 0, -0.1);
        group.add(guard);

        // Stock
        const stockGeo = new THREE.BoxGeometry(0.03, 0.05, 0.18);
        const stockMat = new THREE.MeshStandardMaterial({
            color: 0x4a4a4a,
            roughness: 0.6,
            metalness: 0.4
        });
        const stock = new THREE.Mesh(stockGeo, stockMat);
        stock.position.set(0, -0.01, 0.2);
        group.add(stock);

        // Magazine
        const magGeo = new THREE.BoxGeometry(0.02, 0.12, 0.04);
        const magMat = new THREE.MeshStandardMaterial({
            color: 0x3a3a3a,
            roughness: 0.5,
            metalness: 0.5
        });
        const mag = new THREE.Mesh(magGeo, magMat);
        mag.position.set(0, -0.08, 0.04);
        mag.rotation.x = 0.1;
        group.add(mag);

        // Grip
        const gripGeo = new THREE.BoxGeometry(0.02, 0.06, 0.03);
        const gripMat = new THREE.MeshStandardMaterial({
            color: 0x2a2a2a,
            roughness: 0.8,
            metalness: 0.2
        });
        const grip = new THREE.Mesh(gripGeo, gripMat);
        grip.position.set(0, -0.05, 0.08);
        grip.rotation.x = 0.3;
        group.add(grip);

        // Sight
        const sightBaseGeo = new THREE.BoxGeometry(0.025, 0.015, 0.06);
        const sightMat = new THREE.MeshStandardMaterial({
            color: 0x1a1a1a,
            roughness: 0.3,
            metalness: 0.7
        });
        const sightBase = new THREE.Mesh(sightBaseGeo, sightMat);
        sightBase.position.set(0, 0.04, 0);
        group.add(sightBase);

        // Red dot
        const dotGeo = new THREE.SphereGeometry(0.003, 8, 8);
        const dotMat = new THREE.MeshBasicMaterial({
            color: 0xff0000
        });
        const dot = new THREE.Mesh(dotGeo, dotMat);
        dot.position.set(0, 0.05, 0);
        group.add(dot);

        this.mesh = group;
        return group;
    }
}
