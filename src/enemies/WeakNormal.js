// WeakNormal.js - Fast melee minion enemy with improved visuals
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

        // Animation state
        this.walkCycle = 0;
        this.armSwingPhase = 0;
    }

    createMesh() {
        const group = new THREE.Group();

        // Lean humanoid body - slightly hunched
        const bodyGeo = new THREE.CapsuleGeometry(0.22, 0.5, 4, 8);
        const bodyMat = new THREE.MeshStandardMaterial({
            color: 0x7a9a6a, // Rusted skin tone
            roughness: 0.85,
            metalness: 0.05
        });
        const body = new THREE.Mesh(bodyGeo, bodyMat);
        body.position.y = 0.65;
        body.rotation.x = 0.15; // Hunched forward
        group.add(body);

        // Ribcage visible through skin
        const ribMat = new THREE.MeshStandardMaterial({
            color: 0x5a7a5a,
            roughness: 0.9,
            metalness: 0.0
        });
        for (let i = 0; i < 4; i++) {
            const ribGeo = new THREE.TorusGeometry(0.18, 0.02, 4, 8, Math.PI);
            const rib = new THREE.Mesh(ribGeo, ribMat);
            rib.position.set(0, 0.5 + i * 0.08, -0.1);
            rib.rotation.x = Math.PI / 2;
            group.add(rib);
        }

        // Head - elongated jaw
        const headGeo = new THREE.SphereGeometry(0.16, 8, 8);
        const headMat = new THREE.MeshStandardMaterial({
            color: 0x8aaa7a,
            roughness: 0.75,
            metalness: 0.05
        });
        const head = new THREE.Mesh(headGeo, headMat);
        head.position.y = 1.15;
        head.scale.set(1, 1.1, 0.9);
        group.add(head);

        // Elongated jaw
        const jawGeo = new THREE.ConeGeometry(0.1, 0.18, 6);
        const jaw = new THREE.Mesh(jawGeo, headMat);
        jaw.position.set(0, 1.02, -0.08);
        jaw.rotation.x = Math.PI;
        group.add(jaw);

        // Eyes (angry glowing)
        const eyeGeo = new THREE.SphereGeometry(0.035, 6, 6);
        const eyeMat = new THREE.MeshBasicMaterial({ color: 0xff2200 });

        const leftEye = new THREE.Mesh(eyeGeo, eyeMat);
        leftEye.position.set(-0.07, 1.18, -0.12);
        group.add(leftEye);

        const rightEye = new THREE.Mesh(eyeGeo, eyeMat);
        rightEye.position.set(0.07, 1.18, -0.12);
        group.add(rightEye);

        // Eye glow effect
        const eyeLight = new THREE.PointLight(0xff2200, 0.3, 1);
        eyeLight.position.set(0, 1.18, -0.15);
        group.add(eyeLight);

        // Torn armor pieces on shoulders
        const armorMat = new THREE.MeshStandardMaterial({
            color: 0x444444,
            roughness: 0.4,
            metalness: 0.7
        });

        const leftArmor = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.06, 0.1), armorMat);
        leftArmor.position.set(-0.28, 0.95, 0);
        leftArmor.rotation.z = 0.3;
        group.add(leftArmor);

        // Lanky arms
        const armGeo = new THREE.CylinderGeometry(0.04, 0.035, 0.45, 6);
        const armMat = new THREE.MeshStandardMaterial({
            color: 0x7a9a6a,
            roughness: 0.85
        });

        this.leftArm = new THREE.Mesh(armGeo, armMat);
        this.leftArm.position.set(-0.32, 0.6, 0);
        this.leftArm.rotation.z = 0.2;
        group.add(this.leftArm);

        this.rightArm = new THREE.Mesh(armGeo, armMat);
        this.rightArm.position.set(0.32, 0.6, 0);
        this.rightArm.rotation.z = -0.2;
        group.add(this.rightArm);

        // Forearms
        const forearmGeo = new THREE.CylinderGeometry(0.035, 0.03, 0.35, 6);

        this.leftForearm = new THREE.Mesh(forearmGeo, armMat);
        this.leftForearm.position.set(-0.38, 0.3, 0.05);
        this.leftForearm.rotation.z = 0.1;
        group.add(this.leftForearm);

        this.rightForearm = new THREE.Mesh(forearmGeo, armMat);
        this.rightForearm.position.set(0.38, 0.3, 0.05);
        this.rightForearm.rotation.z = -0.1;
        group.add(this.rightForearm);

        // Sharp claws
        const clawGeo = new THREE.ConeGeometry(0.025, 0.12, 4);
        const clawMat = new THREE.MeshStandardMaterial({
            color: 0x222222,
            roughness: 0.2,
            metalness: 0.7
        });

        for (let i = 0; i < 3; i++) {
            const leftClaw = new THREE.Mesh(clawGeo, clawMat);
            leftClaw.position.set(-0.38 + (i - 1) * 0.025, 0.1, 0.05);
            leftClaw.rotation.x = Math.PI;
            group.add(leftClaw);

            const rightClaw = new THREE.Mesh(clawGeo, clawMat);
            rightClaw.position.set(0.38 + (i - 1) * 0.025, 0.1, 0.05);
            rightClaw.rotation.x = Math.PI;
            group.add(rightClaw);
        }

        // Legs
        const legGeo = new THREE.CylinderGeometry(0.05, 0.04, 0.45, 6);
        const legMat = new THREE.MeshStandardMaterial({
            color: 0x6a8a5a,
            roughness: 0.85
        });

        this.leftLeg = new THREE.Mesh(legGeo, legMat);
        this.leftLeg.position.set(-0.12, 0.22, 0);
        group.add(this.leftLeg);

        this.rightLeg = new THREE.Mesh(legGeo, legMat);
        this.rightLeg.position.set(0.12, 0.22, 0);
        group.add(this.rightLeg);

        // Store for hit detection
        group.userData.enemy = this;

        // Store materials for hit flash
        this.originalMaterials = [bodyMat, headMat, armMat, legMat, ribMat];

        this.mesh = group;
        return group;
    }

    update(deltaTime) {
        super.update(deltaTime);

        if (!this.isDead && this.mesh && this.velocity.lengthSq() > 0.1) {
            // Walk cycle animation
            this.walkCycle += deltaTime * 12;

            // Bobbing
            this.mesh.position.y = Math.sin(this.walkCycle) * 0.04;

            // Arm swing animation
            if (this.leftArm) {
                this.leftArm.rotation.x = Math.sin(this.walkCycle) * 0.4;
                this.rightArm.rotation.x = Math.sin(this.walkCycle + Math.PI) * 0.4;
            }

            // Leg swing
            if (this.leftLeg) {
                this.leftLeg.rotation.x = Math.sin(this.walkCycle + Math.PI) * 0.3;
                this.rightLeg.rotation.x = Math.sin(this.walkCycle) * 0.3;
            }
        }
    }
}
