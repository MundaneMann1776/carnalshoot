// Map03.js - Hard map: Hellish caverns
import * as THREE from 'three';
import { Map } from './Map.js';

export class Map03 extends Map {
    constructor(game) {
        super(game);

        this.bounds = {
            minX: -35,
            maxX: 35,
            minZ: -35,
            maxZ: 35
        };
    }

    createFloor() {
        // Rocky hellish ground
        const floorGeo = new THREE.PlaneGeometry(70, 70, 20, 20);

        // Add some height variation
        const positions = floorGeo.attributes.position;
        for (let i = 0; i < positions.count; i++) {
            const x = positions.getX(i);
            const y = positions.getY(i);
            // Create subtle bumps
            const z = Math.sin(x * 0.3) * Math.cos(y * 0.3) * 0.3;
            positions.setZ(i, z);
        }
        floorGeo.computeVertexNormals();

        const floorMat = new THREE.MeshStandardMaterial({
            color: 0x2a1a1a,
            roughness: 1.0,
            metalness: 0.0
        });
        const floor = new THREE.Mesh(floorGeo, floorMat);
        floor.rotation.x = -Math.PI / 2;
        floor.receiveShadow = true;
        this.scene.add(floor);
        this.meshes.push(floor);

        // Lava pools (visual hazards, not damaging)
        const lavaGeo = new THREE.CircleGeometry(4, 16);
        const lavaMat = new THREE.MeshBasicMaterial({
            color: 0xff4400,
            transparent: true,
            opacity: 0.9
        });

        const lavaPools = [
            { x: -20, z: 0 }, { x: 20, z: 0 },
            { x: 0, z: -20 }, { x: 0, z: 20 }
        ];

        for (const pos of lavaPools) {
            const lava = new THREE.Mesh(lavaGeo, lavaMat.clone());
            lava.rotation.x = -Math.PI / 2;
            lava.position.set(pos.x, 0.05, pos.z);
            this.scene.add(lava);
            this.meshes.push(lava);

            // Lava glow light
            const lavaLight = new THREE.PointLight(0xff4400, 0.5, 10);
            lavaLight.position.set(pos.x, 1, pos.z);
            this.scene.add(lavaLight);
            this.lights.push(lavaLight);
        }
    }

    createWalls() {
        const rockMat = new THREE.MeshStandardMaterial({
            color: 0x3a2a2a,
            roughness: 0.95,
            metalness: 0.0
        });

        const obsidianMat = new THREE.MeshStandardMaterial({
            color: 0x1a0a1a,
            roughness: 0.3,
            metalness: 0.5
        });

        // Irregular rocky perimeter
        const wallHeight = 10;

        // North wall - jagged
        for (let x = -35; x <= 35; x += 5) {
            const height = wallHeight + Math.random() * 3;
            const depth = 2 + Math.random();
            this.addWall(x, -35, 6, depth, height, rockMat);
        }

        // South wall
        for (let x = -35; x <= 35; x += 5) {
            const height = wallHeight + Math.random() * 3;
            const depth = 2 + Math.random();
            this.addWall(x, 35, 6, depth, height, rockMat);
        }

        // East wall
        for (let z = -35; z <= 35; z += 5) {
            const height = wallHeight + Math.random() * 3;
            const depth = 2 + Math.random();
            this.addWall(35, z, depth, 6, height, rockMat);
        }

        // West wall
        for (let z = -35; z <= 35; z += 5) {
            const height = wallHeight + Math.random() * 3;
            const depth = 2 + Math.random();
            this.addWall(-35, z, depth, 6, height, rockMat);
        }

        // Center obstacles - obsidian pillars
        const pillarPositions = [
            { x: -12, z: -12 }, { x: 12, z: -12 },
            { x: -12, z: 12 }, { x: 12, z: 12 },
            { x: 0, z: 0 }
        ];

        for (const pos of pillarPositions) {
            this.addPillar(pos.x, pos.z, 1.5, 5, obsidianMat);
        }

        // Rock formations as cover
        const positions = [
            { x: -8, z: -20 }, { x: 8, z: -20 },
            { x: -8, z: 20 }, { x: 8, z: 20 },
            { x: -25, z: -10 }, { x: -25, z: 10 },
            { x: 25, z: -10 }, { x: 25, z: 10 }
        ];

        for (const pos of positions) {
            const size = 2 + Math.random() * 2;
            this.addWall(pos.x, pos.z, size, size, 2 + Math.random(), rockMat);
        }
    }

    createLighting() {
        // Very dim ambient - hellish red
        const ambient = new THREE.AmbientLight(0x330000, 0.2);
        this.scene.add(ambient);
        this.lights.push(ambient);

        // Hellfire glow from below
        const underLight = new THREE.DirectionalLight(0xff2200, 0.3);
        underLight.position.set(0, -10, 0);
        this.scene.add(underLight);
        this.lights.push(underLight);

        // Scattered fire lights
        const firePositions = [
            { x: -25, z: -25 }, { x: 25, z: -25 },
            { x: -25, z: 25 }, { x: 25, z: 25 },
            { x: 0, z: 0 }
        ];

        for (const pos of firePositions) {
            const fireLight = new THREE.PointLight(0xff4400, 0.8, 20);
            fireLight.position.set(pos.x, 3, pos.z);
            fireLight.castShadow = true;
            this.scene.add(fireLight);
            this.lights.push(fireLight);

            // Fire visual
            this.createFireVisual(pos.x, pos.z);
        }

        // Blood red sky
        this.scene.background = new THREE.Color(0x1a0505);
        this.scene.fog = new THREE.Fog(0x1a0505, 10, 60);
    }

    createFireVisual(x, z) {
        // Simple fire representation
        const fireGeo = new THREE.ConeGeometry(0.5, 2, 8);
        const fireMat = new THREE.MeshBasicMaterial({
            color: 0xff6600,
            transparent: true,
            opacity: 0.8
        });
        const fire = new THREE.Mesh(fireGeo, fireMat);
        fire.position.set(x, 1, z);
        this.scene.add(fire);
        this.meshes.push(fire);

        // Inner flame
        const innerGeo = new THREE.ConeGeometry(0.3, 1.5, 6);
        const innerMat = new THREE.MeshBasicMaterial({
            color: 0xffff00,
            transparent: true,
            opacity: 0.9
        });
        const inner = new THREE.Mesh(innerGeo, innerMat);
        inner.position.set(x, 0.8, z);
        this.scene.add(inner);
        this.meshes.push(inner);

        // Fire base
        const baseGeo = new THREE.CylinderGeometry(0.8, 1, 0.5, 12);
        const baseMat = new THREE.MeshStandardMaterial({
            color: 0x333333,
            roughness: 0.9,
            metalness: 0.1
        });
        const base = new THREE.Mesh(baseGeo, baseMat);
        base.position.set(x, 0.25, z);
        this.scene.add(base);
        this.meshes.push(base);
    }

    createDecorations() {
        // Skulls scattered around
        const skullMat = new THREE.MeshStandardMaterial({
            color: 0xccbbaa,
            roughness: 0.9,
            metalness: 0.0
        });

        const skullPositions = [
            { x: -15, z: -5 }, { x: 15, z: 5 },
            { x: -5, z: 15 }, { x: 5, z: -15 },
            { x: -20, z: -20 }, { x: 20, z: 20 }
        ];

        for (const pos of skullPositions) {
            // Simple skull representation
            const skullGeo = new THREE.SphereGeometry(0.3, 8, 6);
            const skull = new THREE.Mesh(skullGeo, skullMat);
            skull.position.set(pos.x, 0.3, pos.z);
            skull.rotation.y = Math.random() * Math.PI * 2;
            this.scene.add(skull);
            this.meshes.push(skull);
        }

        // Stalagmites
        const stalagMat = new THREE.MeshStandardMaterial({
            color: 0x2a2020,
            roughness: 0.8,
            metalness: 0.2
        });

        for (let i = 0; i < 15; i++) {
            const x = (Math.random() - 0.5) * 60;
            const z = (Math.random() - 0.5) * 60;

            // Check not too close to center
            if (Math.abs(x) < 8 && Math.abs(z) < 8) continue;

            const height = 1 + Math.random() * 3;
            const radius = 0.3 + Math.random() * 0.4;

            const stalagGeo = new THREE.ConeGeometry(radius, height, 6);
            const stalag = new THREE.Mesh(stalagGeo, stalagMat);
            stalag.position.set(x, height / 2, z);
            this.scene.add(stalag);
            this.meshes.push(stalag);
        }

        // Hanging chains (visual)
        const chainMat = new THREE.MeshStandardMaterial({
            color: 0x444444,
            roughness: 0.4,
            metalness: 0.8
        });

        for (let i = 0; i < 8; i++) {
            const x = (Math.random() - 0.5) * 50;
            const z = (Math.random() - 0.5) * 50;

            const chainGeo = new THREE.CylinderGeometry(0.05, 0.05, 4 + Math.random() * 3, 4);
            const chain = new THREE.Mesh(chainGeo, chainMat);
            chain.position.set(x, 10, z);
            this.scene.add(chain);
            this.meshes.push(chain);
        }
    }

    setupSpawnPoints() {
        this.spawnPoints = [
            // Corners
            { x: -28, z: -28 }, { x: 28, z: -28 },
            { x: -28, z: 28 }, { x: 28, z: 28 },
            // Mid edges
            { x: 0, z: -28 }, { x: 0, z: 28 },
            { x: -28, z: 0 }, { x: 28, z: 0 },
            // Inner ring
            { x: -18, z: -18 }, { x: 18, z: -18 },
            { x: -18, z: 18 }, { x: 18, z: 18 },
            // More spawn points for harder waves
            { x: -10, z: -28 }, { x: 10, z: -28 },
            { x: -10, z: 28 }, { x: 10, z: 28 }
        ];
    }
}
