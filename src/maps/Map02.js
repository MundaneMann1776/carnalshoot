// Map02.js - Medium map: Industrial warehouse
import * as THREE from 'three';
import { Map } from './Map.js';

export class Map02 extends Map {
    constructor(game) {
        super(game);

        this.bounds = {
            minX: -30,
            maxX: 30,
            minZ: -30,
            maxZ: 30
        };
    }

    createFloor() {
        // Concrete floor
        const floorGeo = new THREE.PlaneGeometry(60, 60);
        const floorMat = new THREE.MeshStandardMaterial({
            color: 0x444444,
            roughness: 0.95,
            metalness: 0.1
        });
        const floor = new THREE.Mesh(floorGeo, floorMat);
        floor.rotation.x = -Math.PI / 2;
        floor.receiveShadow = true;
        this.scene.add(floor);
        this.meshes.push(floor);

        // Warning stripes in corners
        const stripeMat = new THREE.MeshBasicMaterial({
            color: 0xffcc00,
            transparent: true,
            opacity: 0.5
        });

        const positions = [
            { x: -25, z: -25 }, { x: 25, z: -25 },
            { x: -25, z: 25 }, { x: 25, z: 25 }
        ];

        for (const pos of positions) {
            const stripe = new THREE.Mesh(
                new THREE.PlaneGeometry(6, 6),
                stripeMat
            );
            stripe.rotation.x = -Math.PI / 2;
            stripe.position.set(pos.x, 0.02, pos.z);
            this.scene.add(stripe);
            this.meshes.push(stripe);
        }
    }

    createWalls() {
        const metalWall = new THREE.MeshStandardMaterial({
            color: 0x555555,
            roughness: 0.6,
            metalness: 0.7
        });

        const concreteWall = new THREE.MeshStandardMaterial({
            color: 0x666666,
            roughness: 0.9,
            metalness: 0.1
        });

        // Perimeter walls - industrial metal
        const wallHeight = 8;
        this.addWall(0, -30, 62, 1, wallHeight, metalWall);
        this.addWall(0, 30, 62, 1, wallHeight, metalWall);
        this.addWall(30, 0, 1, 60, wallHeight, metalWall);
        this.addWall(-30, 0, 1, 60, wallHeight, metalWall);

        // Interior rooms/corridors
        // Central partition
        this.addWall(0, -10, 20, 1, 4, concreteWall);
        this.addWall(0, 10, 20, 1, 4, concreteWall);

        // Side rooms
        this.addWall(-15, 0, 1, 18, 4, concreteWall);
        this.addWall(15, 0, 1, 18, 4, concreteWall);

        // Cover crates
        const crateMat = new THREE.MeshStandardMaterial({
            color: 0x8b7355,
            roughness: 0.8,
            metalness: 0.1
        });

        // Scattered crates
        this.addWall(-22, -15, 2, 2, 2, crateMat);
        this.addWall(-20, -15, 2, 2, 2, crateMat);
        this.addWall(-21, -15, 2, 2, 3.5, crateMat);

        this.addWall(22, 15, 2, 2, 2, crateMat);
        this.addWall(20, 15, 2, 2, 2, crateMat);
        this.addWall(21, 15, 2, 2, 3.5, crateMat);

        this.addWall(-8, 20, 3, 3, 2.5, crateMat);
        this.addWall(8, -20, 3, 3, 2.5, crateMat);
    }

    createLighting() {
        // Raised ambient for better visibility
        const ambient = new THREE.AmbientLight(0x606080, 0.5);
        this.scene.add(ambient);
        this.lights.push(ambient);

        // Main overhead lights (5 original)
        const lightPositions = [
            { x: -15, z: -15 }, { x: 15, z: -15 },
            { x: -15, z: 15 }, { x: 15, z: 15 },
            { x: 0, z: 0 }
        ];

        for (const pos of lightPositions) {
            const light = new THREE.PointLight(0xffeecc, 1.0, 30);
            light.position.set(pos.x, 6, pos.z);
            light.castShadow = true;
            this.scene.add(light);
            this.lights.push(light);

            // Visual light fixture
            const fixtureGeo = new THREE.BoxGeometry(1, 0.2, 1);
            const fixtureMat = new THREE.MeshStandardMaterial({
                color: 0x333333,
                roughness: 0.3,
                metalness: 0.8
            });
            const fixture = new THREE.Mesh(fixtureGeo, fixtureMat);
            fixture.position.set(pos.x, 7, pos.z);
            this.scene.add(fixture);
            this.meshes.push(fixture);

            // Glowing element
            const glowGeo = new THREE.PlaneGeometry(0.8, 0.8);
            const glowMat = new THREE.MeshBasicMaterial({
                color: 0xffffcc,
                side: THREE.DoubleSide
            });
            const glow = new THREE.Mesh(glowGeo, glowMat);
            glow.position.set(pos.x, 6.89, pos.z);
            glow.rotation.x = Math.PI / 2;
            this.scene.add(glow);
            this.meshes.push(glow);
        }

        // Additional 14 fill lights for better visibility
        const fillLightPositions = [
            { x: -25, z: -25 }, { x: 0, z: -25 }, { x: 25, z: -25 },
            { x: -25, z: 0 }, { x: 25, z: 0 },
            { x: -25, z: 25 }, { x: 0, z: 25 }, { x: 25, z: 25 },
            { x: -10, z: -10 }, { x: 10, z: -10 },
            { x: -10, z: 10 }, { x: 10, z: 10 },
            { x: 0, z: -15 }, { x: 0, z: 15 }
        ];

        for (const pos of fillLightPositions) {
            const fillLight = new THREE.PointLight(0xaabbcc, 0.4, 18);
            fillLight.position.set(pos.x, 4, pos.z);
            this.scene.add(fillLight);
            this.lights.push(fillLight);
        }

        // Lighter industrial sky
        this.scene.background = new THREE.Color(0x252540);
        this.scene.fog = new THREE.Fog(0x252540, 25, 65);
    }

    createDecorations() {
        // Industrial pillars
        const pillarMat = new THREE.MeshStandardMaterial({
            color: 0x666666,
            roughness: 0.5,
            metalness: 0.6
        });

        // Support pillars
        this.addPillar(-10, -10, 0.5, 8, pillarMat);
        this.addPillar(10, -10, 0.5, 8, pillarMat);
        this.addPillar(-10, 10, 0.5, 8, pillarMat);
        this.addPillar(10, 10, 0.5, 8, pillarMat);

        // Pipes along walls
        const pipeMat = new THREE.MeshStandardMaterial({
            color: 0xff6600,
            roughness: 0.4,
            metalness: 0.7
        });

        const pipeGeo = new THREE.CylinderGeometry(0.15, 0.15, 58, 8);

        const pipe1 = new THREE.Mesh(pipeGeo, pipeMat);
        pipe1.rotation.z = Math.PI / 2;
        pipe1.position.set(0, 5, -29);
        this.scene.add(pipe1);
        this.meshes.push(pipe1);

        const pipe2 = new THREE.Mesh(pipeGeo, pipeMat);
        pipe2.rotation.z = Math.PI / 2;
        pipe2.position.set(0, 6, -29);
        this.scene.add(pipe2);
        this.meshes.push(pipe2);

        // Barrels
        const barrelMat = new THREE.MeshStandardMaterial({
            color: 0x336633,
            roughness: 0.7,
            metalness: 0.3
        });

        const barrelPositions = [
            { x: -25, z: 20 }, { x: -24, z: 21 },
            { x: 25, z: -20 }, { x: 24, z: -21 }
        ];

        for (const pos of barrelPositions) {
            const barrelGeo = new THREE.CylinderGeometry(0.4, 0.4, 1.2, 12);
            const barrel = new THREE.Mesh(barrelGeo, barrelMat);
            barrel.position.set(pos.x, 0.6, pos.z);
            barrel.castShadow = true;
            this.scene.add(barrel);
            this.meshes.push(barrel);
        }
    }

    setupSpawnPoints() {
        this.spawnPoints = [
            // Room corners
            { x: -25, z: -25 }, { x: 25, z: -25 },
            { x: -25, z: 25 }, { x: 25, z: 25 },
            // Side room entrances
            { x: -20, z: -5 }, { x: -20, z: 5 },
            { x: 20, z: -5 }, { x: 20, z: 5 },
            // Corridor ends
            { x: 0, z: -20 }, { x: 0, z: 20 }
        ];
    }
}
