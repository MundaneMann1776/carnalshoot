// Map01.js - Easy map: Open outdoor arena
import * as THREE from 'three';
import { Map } from './Map.js';

export class Map01 extends Map {
    constructor(game) {
        super(game);

        // Larger, open arena
        this.bounds = {
            minX: -35,
            maxX: 35,
            minZ: -35,
            maxZ: 35
        };
    }

    createFloor() {
        // Main floor
        const floorGeo = new THREE.PlaneGeometry(70, 70);
        const floorMat = new THREE.MeshStandardMaterial({
            color: 0x4a5568,
            roughness: 0.8,
            metalness: 0.2
        });
        const floor = new THREE.Mesh(floorGeo, floorMat);
        floor.rotation.x = -Math.PI / 2;
        floor.receiveShadow = true;
        this.scene.add(floor);
        this.meshes.push(floor);

        // Grid pattern overlay
        const gridHelper = new THREE.GridHelper(70, 35, 0x666666, 0x444444);
        gridHelper.position.y = 0.01;
        this.scene.add(gridHelper);
        this.meshes.push(gridHelper);

        // Central arena marking
        const ringGeo = new THREE.RingGeometry(8, 10, 32);
        const ringMat = new THREE.MeshBasicMaterial({
            color: 0x6699cc,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.3
        });
        const ring = new THREE.Mesh(ringGeo, ringMat);
        ring.rotation.x = -Math.PI / 2;
        ring.position.y = 0.02;
        this.scene.add(ring);
        this.meshes.push(ring);
    }

    createWalls() {
        const wallMat = new THREE.MeshStandardMaterial({
            color: 0x5a6a7a,
            roughness: 0.7,
            metalness: 0.3
        });

        // Perimeter walls
        const wallHeight = 5;
        const wallThickness = 1;

        // North wall
        this.addWall(0, -35, 72, wallThickness, wallHeight, wallMat);
        // South wall
        this.addWall(0, 35, 72, wallThickness, wallHeight, wallMat);
        // East wall
        this.addWall(35, 0, wallThickness, 70, wallHeight, wallMat);
        // West wall
        this.addWall(-35, 0, wallThickness, 70, wallHeight, wallMat);

        // Some cover obstacles (low walls)
        const coverMat = new THREE.MeshStandardMaterial({
            color: 0x667788,
            roughness: 0.6,
            metalness: 0.4
        });

        // Cross formation in center
        this.addWall(0, 0, 6, 1, 1.2, coverMat);
        this.addWall(0, 0, 1, 6, 1.2, coverMat);

        // Corner covers
        this.addWall(-18, -18, 5, 1, 1.5, coverMat);
        this.addWall(18, -18, 5, 1, 1.5, coverMat);
        this.addWall(-18, 18, 5, 1, 1.5, coverMat);
        this.addWall(18, 18, 5, 1, 1.5, coverMat);
    }

    createLighting() {
        // Bright, outdoor lighting
        const ambient = new THREE.AmbientLight(0x8899aa, 0.6);
        this.scene.add(ambient);
        this.lights.push(ambient);

        // Sunlight
        const sun = new THREE.DirectionalLight(0xffffee, 0.8);
        sun.position.set(20, 30, 20);
        sun.castShadow = true;
        sun.shadow.mapSize.width = 2048;
        sun.shadow.mapSize.height = 2048;
        sun.shadow.camera.near = 0.5;
        sun.shadow.camera.far = 100;
        sun.shadow.camera.left = -40;
        sun.shadow.camera.right = 40;
        sun.shadow.camera.top = 40;
        sun.shadow.camera.bottom = -40;
        this.scene.add(sun);
        this.lights.push(sun);

        // Sky color
        this.scene.background = new THREE.Color(0x87ceeb);
        this.scene.fog = new THREE.Fog(0x87ceeb, 30, 80);
    }

    createDecorations() {
        // Corner pillars
        const pillarMat = new THREE.MeshStandardMaterial({
            color: 0x4a5568,
            roughness: 0.5,
            metalness: 0.5
        });

        this.addPillar(-30, -30, 1.5, 6, pillarMat);
        this.addPillar(30, -30, 1.5, 6, pillarMat);
        this.addPillar(-30, 30, 1.5, 6, pillarMat);
        this.addPillar(30, 30, 1.5, 6, pillarMat);

        // Lamp posts (visual only)
        const lampMat = new THREE.MeshStandardMaterial({
            color: 0x222222,
            roughness: 0.3,
            metalness: 0.8
        });

        const positions = [
            { x: -15, z: -15 }, { x: 15, z: -15 },
            { x: -15, z: 15 }, { x: 15, z: 15 }
        ];

        for (const pos of positions) {
            // Pole
            const poleGeo = new THREE.CylinderGeometry(0.1, 0.1, 4, 6);
            const pole = new THREE.Mesh(poleGeo, lampMat);
            pole.position.set(pos.x, 2, pos.z);
            this.scene.add(pole);
            this.meshes.push(pole);

            // Light fixture
            const lightGeo = new THREE.SphereGeometry(0.3, 8, 8);
            const lightMat = new THREE.MeshBasicMaterial({ color: 0xffffaa });
            const light = new THREE.Mesh(lightGeo, lightMat);
            light.position.set(pos.x, 4.3, pos.z);
            this.scene.add(light);
            this.meshes.push(light);
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
            // Near corners
            { x: -20, z: -20 }, { x: 20, z: -20 },
            { x: -20, z: 20 }, { x: 20, z: 20 }
        ];
    }
}
