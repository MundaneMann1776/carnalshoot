// Tank.js - Heavy melee enemy
import * as THREE from 'three';
import { Enemy } from './Enemy.js';

export class Tank extends Enemy {
    constructor(game) {
        super(game, {
            name: 'Tank',
            health: 200,
            damage: 40,
            speed: 2,
            attackRange: 2.5,
            attackCooldown: 1.5,
            color: 0xff8888,
            size: 1.5
        });
    }

    createMesh() {
        const group = new THREE.Group();

        // Large body
        const bodyGeo = new THREE.CapsuleGeometry(0.5, 0.8, 4, 8);
        const bodyMat = new THREE.MeshStandardMaterial({
            color: 0x994444,
            roughness: 0.9,
            metalness: 0.1
        });
        const body = new THREE.Mesh(bodyGeo, bodyMat);
        body.position.y = 1.0;
        body.scale.x = 1.2;
        group.add(body);

        // Small head
        const headGeo = new THREE.SphereGeometry(0.22, 8, 8);
        const headMat = new THREE.MeshStandardMaterial({
            color: 0xaa5555,
            roughness: 0.8,
            metalness: 0.1
        });
        const head = new THREE.Mesh(headGeo, headMat);
        head.position.y = 1.8;
        group.add(head);

        // Angry eyes
        const eyeGeo = new THREE.SphereGeometry(0.05, 6, 6);
        const eyeMat = new THREE.MeshBasicMaterial({ color: 0xffff00 });

        const leftEye = new THREE.Mesh(eyeGeo, eyeMat);
        leftEye.position.set(-0.1, 1.85, -0.18);
        group.add(leftEye);

        const rightEye = new THREE.Mesh(eyeGeo, eyeMat);
        rightEye.position.set(0.1, 1.85, -0.18);
        group.add(rightEye);

        // Massive arms
        const armGeo = new THREE.CapsuleGeometry(0.15, 0.5, 4, 6);
        const armMat = new THREE.MeshStandardMaterial({
            color: 0x994444,
            roughness: 0.9
        });

        const leftArm = new THREE.Mesh(armGeo, armMat);
        leftArm.position.set(-0.65, 0.9, 0);
        leftArm.rotation.z = 0.4;
        group.add(leftArm);

        const rightArm = new THREE.Mesh(armGeo, armMat);
        rightArm.position.set(0.65, 0.9, 0);
        rightArm.rotation.z = -0.4;
        group.add(rightArm);

        // Fists
        const fistGeo = new THREE.SphereGeometry(0.18, 8, 8);
        const fistMat = new THREE.MeshStandardMaterial({
            color: 0x883333,
            roughness: 0.7,
            metalness: 0.2
        });

        const leftFist = new THREE.Mesh(fistGeo, fistMat);
        leftFist.position.set(-0.75, 0.5, 0);
        group.add(leftFist);

        const rightFist = new THREE.Mesh(fistGeo, fistMat);
        rightFist.position.set(0.75, 0.5, 0);
        group.add(rightFist);

        // Spikes on shoulders
        const spikeGeo = new THREE.ConeGeometry(0.08, 0.25, 6);
        const spikeMat = new THREE.MeshStandardMaterial({
            color: 0x222222,
            roughness: 0.3,
            metalness: 0.8
        });

        for (let i = 0; i < 3; i++) {
            const leftSpike = new THREE.Mesh(spikeGeo, spikeMat);
            leftSpike.position.set(-0.5, 1.4 + i * 0.12, -0.1 + i * 0.05);
            leftSpike.rotation.z = 0.5;
            group.add(leftSpike);

            const rightSpike = new THREE.Mesh(spikeGeo, spikeMat);
            rightSpike.position.set(0.5, 1.4 + i * 0.12, -0.1 + i * 0.05);
            rightSpike.rotation.z = -0.5;
            group.add(rightSpike);
        }

        // Legs (thick)
        const legGeo = new THREE.CylinderGeometry(0.12, 0.15, 0.5, 6);
        const legMat = new THREE.MeshStandardMaterial({
            color: 0x883333,
            roughness: 0.9
        });

        const leftLeg = new THREE.Mesh(legGeo, legMat);
        leftLeg.position.set(-0.25, 0.25, 0);
        group.add(leftLeg);

        const rightLeg = new THREE.Mesh(legGeo, legMat);
        rightLeg.position.set(0.25, 0.25, 0);
        group.add(rightLeg);

        // Store for hit detection
        group.userData.enemy = this;

        // Store materials
        this.originalMaterials = [bodyMat, headMat, armMat, fistMat];

        this.mesh = group;
        return group;
    }

    performAttack() {
        // Ground slam effect
        if (this.mesh) {
            const slam = this.mesh.clone();
            slam.scale.set(0.1, 0.1, 0.1);
        }

        super.performAttack();
    }
}
