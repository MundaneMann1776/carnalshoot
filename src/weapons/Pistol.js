// Pistol.js - Semi-automatic pistol
import * as THREE from 'three';
import { Weapon } from './Weapon.js';

export class Pistol extends Weapon {
    constructor(game) {
        super(game, {
            name: 'Pistol',
            type: 'semi-auto',
            damage: 20,
            range: 50,
            fireRate: 3,
            spread: 0.01,
            recoil: 0.08,
            magSize: 12,
            currentAmmo: 12,
            reserveAmmo: 36,
            reloadTime: 1.2
        });

        this.color = 0x333333;
    }

    playFireSound() {
        this.game.audioManager.playSound('shoot_pistol');
    }

    createMesh() {
        const group = new THREE.Group();

        // Main body (slide)
        const slideGeo = new THREE.BoxGeometry(0.03, 0.05, 0.18);
        const slideMat = new THREE.MeshStandardMaterial({
            color: 0x2a2a2a,
            roughness: 0.4,
            metalness: 0.6
        });
        const slide = new THREE.Mesh(slideGeo, slideMat);
        slide.position.set(0, 0.015, 0);
        group.add(slide);

        // Frame/grip
        const gripGeo = new THREE.BoxGeometry(0.025, 0.08, 0.06);
        const gripMat = new THREE.MeshStandardMaterial({
            color: 0x3a3a3a,
            roughness: 0.6,
            metalness: 0.3
        });
        const grip = new THREE.Mesh(gripGeo, gripMat);
        grip.position.set(0, -0.03, 0.05);
        grip.rotation.x = 0.2;
        group.add(grip);

        // Trigger guard
        const guardGeo = new THREE.TorusGeometry(0.015, 0.003, 8, 8, Math.PI);
        const guardMat = new THREE.MeshStandardMaterial({
            color: 0x2a2a2a,
            roughness: 0.4,
            metalness: 0.6
        });
        const guard = new THREE.Mesh(guardGeo, guardMat);
        guard.rotation.z = Math.PI;
        guard.position.set(0, -0.01, 0.02);
        group.add(guard);

        // Barrel tip
        const barrelGeo = new THREE.CylinderGeometry(0.005, 0.005, 0.02, 8);
        const barrelMat = new THREE.MeshStandardMaterial({
            color: 0x1a1a1a,
            roughness: 0.3,
            metalness: 0.8
        });
        const barrel = new THREE.Mesh(barrelGeo, barrelMat);
        barrel.rotation.x = Math.PI / 2;
        barrel.position.set(0, 0.015, -0.1);
        group.add(barrel);

        // Front sight
        const sightGeo = new THREE.BoxGeometry(0.005, 0.01, 0.005);
        const sightMat = new THREE.MeshStandardMaterial({
            color: 0xffffff,
            emissive: 0x00ff00,
            emissiveIntensity: 0.3
        });
        const sight = new THREE.Mesh(sightGeo, sightMat);
        sight.position.set(0, 0.045, -0.08);
        group.add(sight);

        this.mesh = group;
        return group;
    }
}
