// Map.js - Base map class
import * as THREE from 'three';

export class Map {
    constructor(game) {
        this.game = game;
        this.scene = game.scene;

        // Map bounds
        this.bounds = {
            minX: -30,
            maxX: 30,
            minZ: -30,
            maxZ: 30
        };

        // Walls for collision
        this.walls = [];
        this.wallMeshes = [];

        // Enemy spawn points
        this.spawnPoints = [];

        // Map meshes for cleanup
        this.meshes = [];

        // Lighting
        this.lights = [];
    }

    build() {
        this.createFloor();
        this.createWalls();
        this.createLighting();
        this.createDecorations();
        this.setupSpawnPoints();
    }

    createFloor() {
        const geometry = new THREE.PlaneGeometry(
            this.bounds.maxX - this.bounds.minX,
            this.bounds.maxZ - this.bounds.minZ
        );
        const material = new THREE.MeshStandardMaterial({
            color: 0x333333,
            roughness: 0.9,
            metalness: 0.1
        });
        const floor = new THREE.Mesh(geometry, material);
        floor.rotation.x = -Math.PI / 2;
        floor.receiveShadow = true;

        this.scene.add(floor);
        this.meshes.push(floor);
    }

    createWalls() {
        // Override in subclasses
    }

    createLighting() {
        // Ambient light
        const ambient = new THREE.AmbientLight(0x404040, 0.5);
        this.scene.add(ambient);
        this.lights.push(ambient);

        // Main directional light
        const directional = new THREE.DirectionalLight(0xffffff, 0.5);
        directional.position.set(10, 20, 10);
        directional.castShadow = true;
        directional.shadow.mapSize.width = 2048;
        directional.shadow.mapSize.height = 2048;
        directional.shadow.camera.near = 0.5;
        directional.shadow.camera.far = 100;
        directional.shadow.camera.left = -30;
        directional.shadow.camera.right = 30;
        directional.shadow.camera.top = 30;
        directional.shadow.camera.bottom = -30;

        this.scene.add(directional);
        this.lights.push(directional);
    }

    createDecorations() {
        // Override in subclasses
    }

    setupSpawnPoints() {
        // Default spawn points around the perimeter
        const offset = 5;

        // Corners
        this.spawnPoints = [
            { x: this.bounds.minX + offset, z: this.bounds.minZ + offset },
            { x: this.bounds.maxX - offset, z: this.bounds.minZ + offset },
            { x: this.bounds.minX + offset, z: this.bounds.maxZ - offset },
            { x: this.bounds.maxX - offset, z: this.bounds.maxZ - offset },
            // Mid edges
            { x: 0, z: this.bounds.minZ + offset },
            { x: 0, z: this.bounds.maxZ - offset },
            { x: this.bounds.minX + offset, z: 0 },
            { x: this.bounds.maxX - offset, z: 0 }
        ];
    }

    addWall(x, z, width, depth, height, material) {
        // Add wall mesh
        const geometry = new THREE.BoxGeometry(width, height, depth);
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(x, height / 2, z);
        mesh.castShadow = true;
        mesh.receiveShadow = true;

        this.scene.add(mesh);
        this.meshes.push(mesh);
        this.wallMeshes.push(mesh);

        // Add collision data
        this.walls.push({
            x,
            z,
            width,
            depth,
            height
        });

        return mesh;
    }

    addPillar(x, z, radius, height, material) {
        const geometry = new THREE.CylinderGeometry(radius, radius, height, 8);
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(x, height / 2, z);
        mesh.castShadow = true;
        mesh.receiveShadow = true;

        this.scene.add(mesh);
        this.meshes.push(mesh);
        this.wallMeshes.push(mesh);

        // Approximate as square for collision
        this.walls.push({
            x,
            z,
            width: radius * 2,
            depth: radius * 2,
            height
        });

        return mesh;
    }

    destroy() {
        // Remove all meshes
        for (const mesh of this.meshes) {
            this.scene.remove(mesh);
            if (mesh.geometry) mesh.geometry.dispose();
            if (mesh.material) {
                if (Array.isArray(mesh.material)) {
                    mesh.material.forEach(m => m.dispose());
                } else {
                    mesh.material.dispose();
                }
            }
        }
        this.meshes = [];
        this.wallMeshes = [];

        // Remove lights
        for (const light of this.lights) {
            this.scene.remove(light);
        }
        this.lights = [];

        // Clear walls
        this.walls = [];
        this.spawnPoints = [];
    }
}
