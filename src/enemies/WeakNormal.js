// WeakNormal.js - Fast melee minion enemy
import * as THREE from 'three';
import { Enemy } from './Enemy.js';

export class WeakNormal extends Enemy {
    constructor(game) {
        super(game, {
            name: 'Minion',
            health: 30,
            damage: 10,
            speed: 6,
            attackRange: 1.5,
            attackCooldown: 0.8,
            color: 0x88ff88,
            size: 0.9
        });
    }

    createMesh() {
        const group = new THREE.Group();

        // Body
        const bodyGeo = new THREE.CapsuleGeometry(0.25, 0.4, 4, 8);
        const bodyMat = new THREE.MeshStandardMaterial({
            color: 0x88aa88,
            roughness: 0.8,
            metalness: 0.1
        });
        const body = new THREE.Mesh(bodyGeo, bodyMat);
        body.position.y = 0.6;
        group.add(body);

        // Head
        const headGeo = new THREE.SphereGeometry(0.18, 8, 8);
        const headMat = new THREE.MeshStandardMaterial({
            color: 0x99bb99,
            roughness: 0.7,
            metalness: 0.1
        });
        const head = new THREE.Mesh(headGeo, headMat);
        head.position.y = 1.1;
        group.add(head);

        // Eyes (angry red)
        const eyeGeo = new THREE.SphereGeometry(0.04, 6, 6);
        const eyeMat = new THREE.MeshBasicMaterial({ color: 0xff0000 });

        const leftEye = new THREE.Mesh(eyeGeo, eyeMat);
        leftEye.position.set(-0.08, 1.15, -0.14);
        group.add(leftEye);

        const rightEye = new THREE.Mesh(eyeGeo, eyeMat);
        rightEye.position.set(0.08, 1.15, -0.14);
        group.add(rightEye);

        // Arms (simple cylinders)
        const armGeo = new THREE.CylinderGeometry(0.05, 0.04, 0.4, 6);
        const armMat = new THREE.MeshStandardMaterial({
            color: 0x88aa88,
            roughness: 0.8
        });

        const leftArm = new THREE.Mesh(armGeo, armMat);
        leftArm.position.set(-0.35, 0.7, 0);
        leftArm.rotation.z = 0.3;
        group.add(leftArm);

        const rightArm = new THREE.Mesh(armGeo, armMat);
        rightArm.position.set(0.35, 0.7, 0);
        rightArm.rotation.z = -0.3;
        group.add(rightArm);

        // Claws
        const clawGeo = new THREE.ConeGeometry(0.03, 0.1, 4);
        const clawMat = new THREE.MeshStandardMaterial({
            color: 0x333333,
            roughness: 0.3,
            metalness: 0.6
        });

        for (let i = 0; i < 3; i++) {
            const leftClaw = new THREE.Mesh(clawGeo, clawMat);
            leftClaw.position.set(-0.35 + (i - 1) * 0.03, 0.45, -0.05);
            leftClaw.rotation.x = Math.PI;
            group.add(leftClaw);

            const rightClaw = new THREE.Mesh(clawGeo, clawMat);
            rightClaw.position.set(0.35 + (i - 1) * 0.03, 0.45, -0.05);
            rightClaw.rotation.x = Math.PI;
            group.add(rightClaw);
        }

        // Store for hit detection
        group.userData.enemy = this;

        // Store materials for hit flash
        this.originalMaterials = [bodyMat, headMat, armMat];

        this.mesh = group;
        return group;
    }

    update(deltaTime) {
        super.update(deltaTime);

        // Bobbing animation while moving
        if (!this.isDead && this.mesh && this.velocity.lengthSq() > 0.1) {
            this.mesh.position.y = Math.sin(Date.now() * 0.01) * 0.05;
        }
    }
}
