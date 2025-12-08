// Game.js - Main Game Class
import * as THREE from 'three';
import { InputManager } from './InputManager.js';
import { AudioManager } from './AudioManager.js';
import { Player } from '../player/Player.js';
import { WeaponManager } from '../player/WeaponManager.js';
import { WaveManager } from '../gameplay/WaveManager.js';
import { Map01 } from '../maps/Map01.js';
import { Map02 } from '../maps/Map02.js';
import { Map03 } from '../maps/Map03.js';
import { HUD } from '../ui/HUD.js';
import { MenuManager } from '../ui/MenuManager.js';

// Game States
export const GameState = {
    LOADING: 'loading',
    MENU: 'menu',
    MAP_SELECT: 'map_select',
    HOW_TO_PLAY: 'how_to_play',
    PLAYING: 'playing',
    PAUSED: 'paused',
    GAME_OVER: 'game_over',
    VICTORY: 'victory'
};

export class Game {
    constructor() {
        this.state = GameState.LOADING;
        this.previousState = null;

        // Three.js core
        this.scene = null;
        this.camera = null;
        this.renderer = null;

        // Game time
        this.clock = new THREE.Clock();
        this.deltaTime = 0;

        // Game systems
        this.inputManager = null;
        this.audioManager = null;
        this.player = null;
        this.weaponManager = null;
        this.waveManager = null;
        this.currentMap = null;
        this.hud = null;
        this.menuManager = null;

        // Maps
        this.maps = {
            1: Map01,
            2: Map02,
            3: Map03
        };
        this.selectedMap = 1;

        // Stats
        this.stats = {
            kills: 0,
            wave: 1
        };

        // Enemies list
        this.enemies = [];

        // Projectiles list
        this.projectiles = [];
    }

    async init() {
        // Setup Three.js
        this.setupRenderer();
        this.setupScene();
        this.setupCamera();

        // Setup input
        this.inputManager = new InputManager(this);

        // Setup audio
        this.audioManager = new AudioManager();

        // Setup HUD
        this.hud = new HUD(this);

        // Setup menus
        this.menuManager = new MenuManager(this);

        // Show loading complete, transition to menu
        await this.simulateLoading();

        // Start game loop
        this.animate();
    }

    setupRenderer() {
        const canvas = document.getElementById('game-canvas');
        this.renderer = new THREE.WebGLRenderer({
            canvas,
            antialias: true,
            alpha: false
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.outputColorSpace = THREE.SRGBColorSpace;

        // Handle resize
        window.addEventListener('resize', () => this.onResize());
    }

    setupScene() {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x111122);
        this.scene.fog = new THREE.Fog(0x111122, 10, 100);
    }

    setupCamera() {
        this.camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        this.camera.position.set(0, 1.7, 0); // Eye height
    }

    onResize() {
        const width = window.innerWidth;
        const height = window.innerHeight;

        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height);
    }

    async simulateLoading() {
        const loadingProgress = document.querySelector('.loading-progress');
        const loadingText = document.querySelector('.loading-text');

        // Simulate asset loading
        const steps = [
            { progress: 20, text: 'Loading textures...' },
            { progress: 40, text: 'Loading models...' },
            { progress: 60, text: 'Loading sounds...' },
            { progress: 80, text: 'Preparing arena...' },
            { progress: 100, text: 'Ready!' }
        ];

        for (const step of steps) {
            loadingProgress.style.width = step.progress + '%';
            loadingText.textContent = step.text;
            await this.delay(300);
        }

        await this.delay(500);

        // Fade out loading screen
        const loadingScreen = document.getElementById('loading-screen');
        loadingScreen.classList.add('fade-out');

        await this.delay(500);
        loadingScreen.style.display = 'none';

        // Show main menu
        this.setState(GameState.MENU);
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    setState(newState) {
        this.previousState = this.state;
        this.state = newState;

        // Notify menu manager
        if (this.menuManager) {
            this.menuManager.onStateChange(newState, this.previousState);
        }

        // Handle state transitions
        switch (newState) {
            case GameState.PLAYING:
                this.hud.show();
                this.inputManager.lockPointer();
                break;
            case GameState.PAUSED:
                this.hud.hide();
                this.inputManager.unlockPointer();
                break;
            case GameState.MENU:
            case GameState.MAP_SELECT:
            case GameState.HOW_TO_PLAY:
                this.hud.hide();
                this.inputManager.unlockPointer();
                break;
            case GameState.GAME_OVER:
            case GameState.VICTORY:
                this.hud.hide();
                this.inputManager.unlockPointer();
                break;
        }
    }

    startGame(mapNumber = this.selectedMap) {
        this.selectedMap = mapNumber;

        // Clear any existing map/enemies
        this.clearMap();

        // Reset stats
        this.stats.kills = 0;
        this.stats.wave = 1;

        // Create player
        this.player = new Player(this);

        // Create weapon manager
        this.weaponManager = new WeaponManager(this);

        // Load map
        const MapClass = this.maps[mapNumber];
        this.currentMap = new MapClass(this);
        this.currentMap.build();

        // Create wave manager
        this.waveManager = new WaveManager(this);

        // Start playing
        this.setState(GameState.PLAYING);

        // Start first wave after a short delay
        setTimeout(() => {
            if (this.state === GameState.PLAYING) {
                this.waveManager.startWave();
            }
        }, 2000);
    }

    clearMap() {
        // Remove all enemies
        for (const enemy of this.enemies) {
            if (enemy.mesh) {
                this.scene.remove(enemy.mesh);
            }
        }
        this.enemies = [];

        // Remove all projectiles
        for (const projectile of this.projectiles) {
            if (projectile.mesh) {
                this.scene.remove(projectile.mesh);
            }
        }
        this.projectiles = [];

        // Remove map geometry
        if (this.currentMap) {
            this.currentMap.destroy();
            this.currentMap = null;
        }

        // Reset camera position
        this.camera.position.set(0, 1.7, 0);
        this.camera.rotation.set(0, 0, 0);
    }

    restartGame() {
        this.startGame(this.selectedMap);
    }

    pauseGame() {
        if (this.state === GameState.PLAYING) {
            this.setState(GameState.PAUSED);
        }
    }

    resumeGame() {
        if (this.state === GameState.PAUSED) {
            this.setState(GameState.PLAYING);
        }
    }

    gameOver() {
        this.stats.wave = this.waveManager ? this.waveManager.currentWave : 1;
        document.getElementById('final-wave').textContent = this.stats.wave;
        document.getElementById('final-kills').textContent = this.stats.kills;
        this.setState(GameState.GAME_OVER);
    }

    victory() {
        document.getElementById('victory-kills').textContent = this.stats.kills;
        this.setState(GameState.VICTORY);
    }

    nextMap() {
        if (this.selectedMap < 3) {
            this.selectedMap++;
            this.startGame(this.selectedMap);
        } else {
            // All maps completed, return to menu
            this.setState(GameState.MENU);
        }
    }

    quitToMenu() {
        this.clearMap();
        this.setState(GameState.MENU);
    }

    animate() {
        requestAnimationFrame(() => this.animate());

        this.deltaTime = this.clock.getDelta();

        // Update game logic when playing
        if (this.state === GameState.PLAYING) {
            this.update();
        }

        // Always render
        this.render();
    }

    update() {
        // Update player
        if (this.player) {
            this.player.update(this.deltaTime);
        }

        // Update weapons
        if (this.weaponManager) {
            this.weaponManager.update(this.deltaTime);
        }

        // Update enemies
        for (let i = this.enemies.length - 1; i >= 0; i--) {
            const enemy = this.enemies[i];
            enemy.update(this.deltaTime);

            // Remove dead enemies
            if (enemy.isDead && enemy.deathAnimationComplete) {
                this.scene.remove(enemy.mesh);
                this.enemies.splice(i, 1);
            }
        }

        // Update projectiles
        for (let i = this.projectiles.length - 1; i >= 0; i--) {
            const projectile = this.projectiles[i];
            projectile.update(this.deltaTime);

            // Remove expired projectiles
            if (projectile.shouldRemove) {
                this.scene.remove(projectile.mesh);
                this.projectiles.splice(i, 1);
            }
        }

        // Update wave manager
        if (this.waveManager) {
            this.waveManager.update(this.deltaTime);
        }

        // Update HUD
        if (this.hud) {
            this.hud.update();
        }

        // Check game over condition
        if (this.player && this.player.health <= 0) {
            this.gameOver();
        }
    }

    render() {
        this.renderer.render(this.scene, this.camera);
    }

    addEnemy(enemy) {
        this.enemies.push(enemy);
        this.scene.add(enemy.mesh);
    }

    removeEnemy(enemy) {
        const index = this.enemies.indexOf(enemy);
        if (index > -1) {
            this.enemies.splice(index, 1);
            this.scene.remove(enemy.mesh);
        }
    }

    addProjectile(projectile) {
        this.projectiles.push(projectile);
        this.scene.add(projectile.mesh);
    }

    onEnemyKilled() {
        this.stats.kills++;

        // Check if wave is complete
        if (this.waveManager) {
            this.waveManager.onEnemyKilled();
        }
    }
}
