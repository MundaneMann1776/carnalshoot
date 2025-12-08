// WaveManager.js - Manages wave spawning and progression
import { WeakNormal } from '../enemies/WeakNormal.js';
import { Tank } from '../enemies/Tank.js';
import { Ranged } from '../enemies/Ranged.js';

export class WaveManager {
    constructor(game) {
        this.game = game;

        // Wave state
        this.currentWave = 0;
        this.totalWaves = 5;
        this.enemiesRemaining = 0;
        this.enemiesSpawned = 0;
        this.totalEnemiesInWave = 0;

        // Spawning
        this.spawnQueue = [];
        this.spawnTimer = 0;
        this.spawnInterval = 1; // seconds between spawns
        this.isSpawning = false;

        // Wave pause
        this.wavePauseTimer = 0;
        this.wavePauseDuration = 3; // seconds between waves
        this.isWaveComplete = false;

        // Get wave config based on map
        this.waveConfig = this.getWaveConfig();
    }

    getWaveConfig() {
        const mapNumber = this.game.selectedMap;

        // Wave configurations per map
        const configs = {
            1: [ // Map 01 - Easy (only weak_normal)
                { weak: 5 },
                { weak: 8 },
                { weak: 12 },
                { weak: 15 },
                { weak: 20 }
            ],
            2: [ // Map 02 - Medium (weak_normal + tank)
                { weak: 5, tank: 1 },
                { weak: 8, tank: 2 },
                { weak: 10, tank: 3 },
                { weak: 12, tank: 4 },
                { weak: 15, tank: 5 }
            ],
            3: [ // Map 03 - Hard (all types)
                { weak: 5, tank: 1, ranged: 2 },
                { weak: 8, tank: 2, ranged: 3 },
                { weak: 10, tank: 3, ranged: 4 },
                { weak: 12, tank: 4, ranged: 5 },
                { weak: 15, tank: 5, ranged: 6 }
            ]
        };

        return configs[mapNumber] || configs[1];
    }

    startWave() {
        if (this.currentWave >= this.totalWaves) {
            // All waves complete - victory!
            this.game.victory();
            return;
        }

        this.currentWave++;
        this.isWaveComplete = false;

        // Get wave config
        const config = this.waveConfig[this.currentWave - 1];

        // Build spawn queue
        this.spawnQueue = [];

        // Add enemies in a mixed order
        if (config.weak) {
            for (let i = 0; i < config.weak; i++) {
                this.spawnQueue.push('weak');
            }
        }
        if (config.tank) {
            for (let i = 0; i < config.tank; i++) {
                this.spawnQueue.push('tank');
            }
        }
        if (config.ranged) {
            for (let i = 0; i < config.ranged; i++) {
                this.spawnQueue.push('ranged');
            }
        }

        // Shuffle spawn queue for variety
        this.shuffleArray(this.spawnQueue);

        this.totalEnemiesInWave = this.spawnQueue.length;
        this.enemiesRemaining = this.totalEnemiesInWave;
        this.enemiesSpawned = 0;
        this.isSpawning = true;
        this.spawnTimer = 0;

        // Update HUD
        this.updateHUD();

        // Play wave start sound
        this.game.audioManager.playSound('wave_start');
    }

    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    update(deltaTime) {
        // Handle wave pause
        if (this.wavePauseTimer > 0) {
            this.wavePauseTimer -= deltaTime;
            if (this.wavePauseTimer <= 0) {
                this.startWave();
            }
            return;
        }

        // Handle spawning
        if (this.isSpawning && this.spawnQueue.length > 0) {
            this.spawnTimer -= deltaTime;

            if (this.spawnTimer <= 0) {
                this.spawnEnemy();
                this.spawnTimer = this.spawnInterval;

                // Decrease spawn interval as waves progress
                this.spawnInterval = Math.max(0.3, 1 - (this.currentWave * 0.1));
            }
        }

        // Check if all spawned and all dead
        if (this.enemiesSpawned >= this.totalEnemiesInWave &&
            this.game.enemies.length === 0 &&
            !this.isWaveComplete) {
            this.completeWave();
        }
    }

    spawnEnemy() {
        if (this.spawnQueue.length === 0) {
            this.isSpawning = false;
            return;
        }

        const type = this.spawnQueue.shift();
        let enemy;

        switch (type) {
            case 'weak':
                enemy = new WeakNormal(this.game);
                break;
            case 'tank':
                enemy = new Tank(this.game);
                break;
            case 'ranged':
                enemy = new Ranged(this.game);
                break;
            default:
                return;
        }

        // Get spawn position
        const spawnPos = this.getSpawnPosition();
        enemy.spawn(spawnPos);

        this.game.addEnemy(enemy);
        this.enemiesSpawned++;
    }

    getSpawnPosition() {
        const map = this.game.currentMap;
        if (!map || !map.spawnPoints || map.spawnPoints.length === 0) {
            // Default spawn positions around the edges
            const angle = Math.random() * Math.PI * 2;
            const radius = 20;
            return {
                x: Math.cos(angle) * radius,
                y: 0,
                z: Math.sin(angle) * radius
            };
        }

        // Pick random spawn point
        const index = Math.floor(Math.random() * map.spawnPoints.length);
        const point = map.spawnPoints[index];

        // Add some randomness
        return {
            x: point.x + (Math.random() - 0.5) * 3,
            y: 0,
            z: point.z + (Math.random() - 0.5) * 3
        };
    }

    onEnemyKilled() {
        this.enemiesRemaining = this.game.enemies.filter(e => !e.isDead).length;
        this.updateHUD();
    }

    completeWave() {
        this.isWaveComplete = true;

        // Play sound
        this.game.audioManager.playSound('wave_complete');

        // Heal player
        if (this.game.player) {
            this.game.player.heal(30);
        }

        // Refill ammo
        if (this.game.weaponManager) {
            for (const weapon of this.game.weaponManager.weapons) {
                weapon.refillAmmo();
            }
            this.game.weaponManager.updateHUD();
        }

        // Check if all waves complete
        if (this.currentWave >= this.totalWaves) {
            setTimeout(() => {
                this.game.victory();
            }, 1000);
            return;
        }

        // Start timer for next wave
        this.wavePauseTimer = this.wavePauseDuration;
    }

    updateHUD() {
        const waveEl = document.getElementById('current-wave');
        const enemiesEl = document.getElementById('enemies-count');

        if (waveEl) waveEl.textContent = this.currentWave;
        if (enemiesEl) enemiesEl.textContent = this.enemiesRemaining;
    }
}
