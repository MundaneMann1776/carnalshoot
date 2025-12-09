// Tank.js - Heavy melee enemy with improved visuals
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

        // Animation
        this.walkCycle = 0;
        this.breathingPhase = 0;
    }

    createMesh() {
        const group = new THREE.Group();

        // Massive heavy-frame body
        const bodyGeo = new THREE.CapsuleGeometry(0.55, 0.9, 4, 12);
        const bodyMat = new THREE.MeshStandardMaterial({
            color: 0x8a4444, // Metal-flesh tone
            roughness: 0.75,
            metalness: 0.25
        });
        const body = new THREE.Mesh(bodyGeo, bodyMat);
        body.position.y = 1.1;
        body.scale.set(1.3, 1, 1.1);
        group.add(body);

        // Reinforced spine (visible on back)
        const spineMat = new THREE.MeshStandardMaterial({
            color: 0x444444,
            roughness: 0.3,
            metalness: 0.8
        });
        for (let i = 0; i < 6; i++) {
            const vertebra = new THREE.Mesh(
                new THREE.BoxGeometry(0.15, 0.08, 0.12),
                spineMat
            );
            vertebra.position.set(0, 0.7 + i * 0.15, 0.45);
            group.add(vertebra);
        }

        // Small head (sunk into shoulders)
        const headGeo = new THREE.SphereGeometry(0.2, 8, 8);
        const headMat = new THREE.MeshStandardMaterial({
            color: 0x9a5555,
            roughness: 0.7,
            metalness: 0.15
        });
        const head = new THREE.Mesh(headGeo, headMat);
        head.position.y = 1.75;
        head.scale.set(1, 0.85, 0.9);
        group.add(head);

        // Heavy brow ridge
        const browGeo = new THREE.BoxGeometry(0.35, 0.06, 0.15);
        const brow = new THREE.Mesh(browGeo, headMat);
        brow.position.set(0, 1.82, -0.12);
        group.add(brow);

        // Glowing eyes
        const eyeGeo = new THREE.SphereGeometry(0.045, 6, 6);
        const eyeMat = new THREE.MeshBasicMaterial({ color: 0xffaa00 });

        const leftEye = new THREE.Mesh(eyeGeo, eyeMat);
        leftEye.position.set(-0.08, 1.78, -0.16);
        group.add(leftEye);

        const rightEye = new THREE.Mesh(eyeGeo, eyeMat);
        rightEye.position.set(0.08, 1.78, -0.16);
        group.add(rightEye);

        // Eye glow
        const eyeLight = new THREE.PointLight(0xffaa00, 0.4, 1.5);
        eyeLight.position.set(0, 1.78, -0.2);
        group.add(eyeLight);

        // Armored shoulders (massive)
        const shoulderMat = new THREE.MeshStandardMaterial({
            color: 0x555555,
            roughness: 0.4,
            metalness: 0.75
        });

        const leftShoulder = new THREE.Mesh(
            new THREE.SphereGeometry(0.28, 8, 6),
            shoulderMat
        );
        leftShoulder.position.set(-0.65, 1.5, 0);
        leftShoulder.scale.set(1.2, 0.8, 1);
        group.add(leftShoulder);

        const rightShoulder = new THREE.Mesh(
            new THREE.SphereGeometry(0.28, 8, 6),
            shoulderMat
        );
        rightShoulder.position.set(0.65, 1.5, 0);
        rightShoulder.scale.set(1.2, 0.8, 1);
        group.add(rightShoulder);

        // Shoulder spikes
        const spikeGeo = new THREE.ConeGeometry(0.06, 0.28, 6);
        const spikeMat = new THREE.MeshStandardMaterial({
            color: 0x333333,
            roughness: 0.2,
            metalness: 0.85
        });

        for (let i = 0; i < 4; i++) {
            const angle = (i / 4) * Math.PI;
            // Left shoulder spikes
            const leftSpike = new THREE.Mesh(spikeGeo, spikeMat);
            leftSpike.position.set(
                -0.65 + Math.cos(angle) * 0.2,
                1.55,
                Math.sin(angle) * 0.2
            );
            leftSpike.rotation.z = 0.5 + i * 0.1;
            group.add(leftSpike);

            // Right shoulder spikes
            const rightSpike = new THREE.Mesh(spikeGeo, spikeMat);
            rightSpike.position.set(
                0.65 + Math.cos(angle) * 0.2,
                1.55,
                Math.sin(angle) * 0.2
            );
            rightSpike.rotation.z = -0.5 - i * 0.1;
            group.add(rightSpike);
        }

        // Massive arms
        const armGeo = new THREE.CapsuleGeometry(0.16, 0.55, 4, 8);
        const armMat = new THREE.MeshStandardMaterial({
            color: 0x8a4444,
            roughness: 0.8,
            metalness: 0.15
        });

        this.leftArm = new THREE.Mesh(armGeo, armMat);
        this.leftArm.position.set(-0.72, 1.0, 0);
        this.leftArm.rotation.z = 0.35;
        group.add(this.leftArm);

        this.rightArm = new THREE.Mesh(armGeo, armMat);
        this.rightArm.position.set(0.72, 1.0, 0);
        this.rightArm.rotation.z = -0.35;
        group.add(this.rightArm);

        // Armored forearms
        const forearmGeo = new THREE.CylinderGeometry(0.14, 0.12, 0.4, 8);
        const forearmMat = new THREE.MeshStandardMaterial({
            color: 0x666666,
            roughness: 0.35,
            metalness: 0.7
        });

        const leftForearm = new THREE.Mesh(forearmGeo, forearmMat);
        leftForearm.position.set(-0.78, 0.55, 0.1);
        group.add(leftForearm);

        const rightForearm = new THREE.Mesh(forearmGeo, forearmMat);
        rightForearm.position.set(0.78, 0.55, 0.1);
        group.add(rightForearm);

        // Massive fists
        const fistGeo = new THREE.SphereGeometry(0.2, 8, 8);
        const fistMat = new THREE.MeshStandardMaterial({
            color: 0x7a3333,
            roughness: 0.6,
            metalness: 0.3
        });

        this.leftFist = new THREE.Mesh(fistGeo, fistMat);
        this.leftFist.position.set(-0.82, 0.35, 0.12);
        group.add(this.leftFist);

        this.rightFist = new THREE.Mesh(fistGeo, fistMat);
        this.rightFist.position.set(0.82, 0.35, 0.12);
        group.add(this.rightFist);

        // Knuckle spikes
        for (let i = 0; i < 3; i++) {
            const lSpike = new THREE.Mesh(spikeGeo, spikeMat);
            lSpike.position.set(-0.82 + (i - 1) * 0.08, 0.22, 0.05);
            lSpike.rotation.x = Math.PI;
            lSpike.scale.set(0.6, 0.6, 0.6);
            group.add(lSpike);

            const rSpike = new THREE.Mesh(spikeGeo, spikeMat);
            rSpike.position.set(0.82 + (i - 1) * 0.08, 0.22, 0.05);
            rSpike.rotation.x = Math.PI;
            rSpike.scale.set(0.6, 0.6, 0.6);
            group.add(rSpike);
        }

        // Thick legs
        const legGeo = new THREE.CylinderGeometry(0.14, 0.16, 0.55, 8);
        const legMat = new THREE.MeshStandardMaterial({
            color: 0x7a3333,
            roughness: 0.85,
            metalness: 0.1
        });

        this.leftLeg = new THREE.Mesh(legGeo, legMat);
        this.leftLeg.position.set(-0.28, 0.28, 0);
        group.add(this.leftLeg);

        this.rightLeg = new THREE.Mesh(legGeo, legMat);
        this.rightLeg.position.set(0.28, 0.28, 0);
        group.add(this.rightLeg);

        // Store for hit detection
        group.userData.enemy = this;

        // Store materials
        this.originalMaterials = [bodyMat, headMat, armMat, fistMat, shoulderMat, forearmMat];

        this.mesh = group;
        return group;
    }

    update(deltaTime) {
        super.update(deltaTime);

        if (!this.isDead && this.mesh) {
            // Breathing animation
            this.breathingPhase += deltaTime * 2;
            const breathScale = 1 + Math.sin(this.breathingPhase) * 0.02;
            this.mesh.scale.set(breathScale, 1, breathScale);

            // Slow walk cycle
            if (this.velocity.lengthSq() > 0.01) {
                this.walkCycle += deltaTime * 4;

                // Heavy footsteps
                this.mesh.position.y = Math.abs(Math.sin(this.walkCycle)) * 0.03;

                // Arm swing
                if (this.leftArm) {
                    this.leftArm.rotation.x = Math.sin(this.walkCycle) * 0.2;
                    this.rightArm.rotation.x = Math.sin(this.walkCycle + Math.PI) * 0.2;
                }
            }
        }
    }

    performAttack() {
        // Ground slam effect - create visual
        if (this.mesh && this.game.scene) {
            const slamGeo = new THREE.RingGeometry(0.5, 2, 16);
            const slamMat = new THREE.MeshBasicMaterial({
                color: 0xff4400,
                transparent: true,
                opacity: 0.6,
                side: THREE.DoubleSide
            });
            const slam = new THREE.Mesh(slamGeo, slamMat);
            slam.rotation.x = -Math.PI / 2;
            slam.position.copy(this.position);
            slam.position.y = 0.1;
            this.game.scene.add(slam);

            // Animate and remove
            let scale = 1;
            const animateSlam = () => {
                scale += 0.15;
                slam.scale.set(scale, scale, scale);
                slamMat.opacity -= 0.08;
                if (slamMat.opacity > 0) {
                    requestAnimationFrame(animateSlam);
                } else {
                    this.game.scene.remove(slam);
                    slam.geometry.dispose();
                    slam.material.dispose();
                }
            };
            animateSlam();
        }

        super.performAttack();
    }
}
