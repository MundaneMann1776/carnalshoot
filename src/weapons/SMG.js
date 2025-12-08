// SMG.js - Submachine gun
import * as THREE from 'three';
import { Weapon } from './Weapon.js';

export class SMG extends Weapon {
    constructor(game) {
        super(game, {
            name: 'SMG',
            type: 'full-auto',
            damage: 12,
            range: 30,
            fireRate: 10,
            spread: 0.04,
            recoil: 0.04,
            magSize: 30,
            currentAmmo: 30,
            reserveAmmo: 120,
            reloadTime: 1.8
        });

        this.color = 0x444444;
    }

    playFireSound() {
        this.game.audioManager.playSound('shoot_smg');
    }

    createMesh() {
        const group = new THREE.Group();

        // Main receiver
        const receiverGeo = new THREE.BoxGeometry(0.04, 0.06, 0.2);
        const receiverMat = new THREE.MeshStandardMaterial({
            color: 0x3a3a3a,
            roughness: 0.5,
            metalness: 0.5
        });
        const receiver = new THREE.Mesh(receiverGeo, receiverMat);
        receiver.position.set(0, 0, 0);
        group.add(receiver);

        // Barrel
        const barrelGeo = new THREE.CylinderGeometry(0.008, 0.008, 0.12, 8);
        const barrelMat = new THREE.MeshStandardMaterial({
            color: 0x2a2a2a,
            roughness: 0.3,
            metalness: 0.8
        });
        const barrel = new THREE.Mesh(barrelGeo, barrelMat);
        barrel.rotation.x = Math.PI / 2;
        barrel.position.set(0, 0.01, -0.16);
        group.add(barrel);

        // Magazine
        const magGeo = new THREE.BoxGeometry(0.025, 0.1, 0.04);
        const magMat = new THREE.MeshStandardMaterial({
            color: 0x2a2a2a,
            roughness: 0.6,
            metalness: 0.4
        });
        const mag = new THREE.Mesh(magGeo, magMat);
        mag.position.set(0, -0.07, 0.03);
        group.add(mag);

        // Stock
        const stockGeo = new THREE.BoxGeometry(0.025, 0.04, 0.1);
        const stockMat = new THREE.MeshStandardMaterial({
            color: 0x4a4a4a,
            roughness: 0.7,
            metalness: 0.3
        });
        const stock = new THREE.Mesh(stockGeo, stockMat);
        stock.position.set(0, -0.01, 0.14);
        group.add(stock);

        // Grip
        const gripGeo = new THREE.BoxGeometry(0.02, 0.06, 0.03);
        const gripMat = new THREE.MeshStandardMaterial({
            color: 0x2a2a2a,
            roughness: 0.8,
            metalness: 0.2
        });
        const grip = new THREE.Mesh(gripGeo, gripMat);
        grip.position.set(0, -0.05, 0.07);
        grip.rotation.x = 0.3;
        group.add(grip);

        // Foregrip
        const foregrip = grip.clone();
        foregrip.scale.set(0.8, 0.6, 0.8);
        foregrip.position.set(0, -0.04, -0.05);
        foregrip.rotation.x = 0;
        group.add(foregrip);

        this.mesh = group;
        return group;
    }
}
