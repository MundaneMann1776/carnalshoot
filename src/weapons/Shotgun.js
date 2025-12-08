// Shotgun.js - Pump-action shotgun
import * as THREE from 'three';
import { Weapon } from './Weapon.js';

export class Shotgun extends Weapon {
    constructor(game) {
        super(game, {
            name: 'Shotgun',
            type: 'pump',
            damage: 80, // Total damage if all pellets hit
            range: 15,
            fireRate: 1,
            spread: 0.08,
            recoil: 0.15,
            magSize: 8,
            currentAmmo: 8,
            reserveAmmo: 24,
            reloadTime: 2.5
        });

        this.color = 0x5a4030;
    }

    playFireSound() {
        this.game.audioManager.playSound('shoot_shotgun');
    }

    createMesh() {
        const group = new THREE.Group();

        // Main barrel
        const barrelGeo = new THREE.CylinderGeometry(0.015, 0.015, 0.4, 8);
        const barrelMat = new THREE.MeshStandardMaterial({
            color: 0x2a2a2a,
            roughness: 0.3,
            metalness: 0.8
        });
        const barrel = new THREE.Mesh(barrelGeo, barrelMat);
        barrel.rotation.x = Math.PI / 2;
        barrel.position.set(0, 0.02, -0.1);
        group.add(barrel);

        // Pump tube (underneath barrel)
        const pumpTubeGeo = new THREE.CylinderGeometry(0.012, 0.012, 0.25, 8);
        const pumpTubeMat = new THREE.MeshStandardMaterial({
            color: 0x3a3a3a,
            roughness: 0.4,
            metalness: 0.6
        });
        const pumpTube = new THREE.Mesh(pumpTubeGeo, pumpTubeMat);
        pumpTube.rotation.x = Math.PI / 2;
        pumpTube.position.set(0, -0.01, -0.05);
        group.add(pumpTube);

        // Pump handle
        const pumpGeo = new THREE.BoxGeometry(0.04, 0.025, 0.08);
        const pumpMat = new THREE.MeshStandardMaterial({
            color: 0x4a3020,
            roughness: 0.7,
            metalness: 0.2
        });
        const pump = new THREE.Mesh(pumpGeo, pumpMat);
        pump.position.set(0, -0.01, -0.08);
        group.add(pump);

        // Receiver
        const receiverGeo = new THREE.BoxGeometry(0.05, 0.06, 0.12);
        const receiverMat = new THREE.MeshStandardMaterial({
            color: 0x2a2a2a,
            roughness: 0.4,
            metalness: 0.6
        });
        const receiver = new THREE.Mesh(receiverGeo, receiverMat);
        receiver.position.set(0, 0, 0.12);
        group.add(receiver);

        // Stock
        const stockGeo = new THREE.BoxGeometry(0.035, 0.045, 0.15);
        const stockMat = new THREE.MeshStandardMaterial({
            color: 0x5a4030,
            roughness: 0.8,
            metalness: 0.1
        });
        const stock = new THREE.Mesh(stockGeo, stockMat);
        stock.position.set(0, -0.01, 0.24);
        group.add(stock);

        // Pistol grip
        const gripGeo = new THREE.BoxGeometry(0.025, 0.06, 0.04);
        const gripMat = new THREE.MeshStandardMaterial({
            color: 0x4a3020,
            roughness: 0.8,
            metalness: 0.1
        });
        const grip = new THREE.Mesh(gripGeo, gripMat);
        grip.position.set(0, -0.05, 0.1);
        grip.rotation.x = 0.3;
        group.add(grip);

        this.mesh = group;
        return group;
    }
}
