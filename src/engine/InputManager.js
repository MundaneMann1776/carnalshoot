// InputManager.js - Handles keyboard and mouse input
import { GameState } from './Game.js';

export class InputManager {
    constructor(game) {
        this.game = game;

        // Key states
        this.keys = {
            forward: false,
            backward: false,
            left: false,
            right: false,
            jump: false,
            sprint: false,
            reload: false
        };

        // Mouse state
        this.mouse = {
            x: 0,
            y: 0,
            deltaX: 0,
            deltaY: 0,
            leftButton: false,
            rightButton: false
        };

        // Pointer lock state
        this.isPointerLocked = false;

        // Mouse sensitivity
        this.sensitivity = 0.002;

        // Setup event listeners
        this.setupKeyboardListeners();
        this.setupMouseListeners();
        this.setupPointerLock();
    }

    setupKeyboardListeners() {
        document.addEventListener('keydown', (e) => this.onKeyDown(e));
        document.addEventListener('keyup', (e) => this.onKeyUp(e));
    }

    setupMouseListeners() {
        document.addEventListener('mousemove', (e) => this.onMouseMove(e));
        document.addEventListener('mousedown', (e) => this.onMouseDown(e));
        document.addEventListener('mouseup', (e) => this.onMouseUp(e));
    }

    setupPointerLock() {
        const canvas = document.getElementById('game-canvas');

        // Click to lock pointer
        canvas.addEventListener('click', () => {
            if (this.game.state === GameState.PLAYING && !this.isPointerLocked) {
                this.lockPointer();
            }
        });

        // Pointer lock change
        document.addEventListener('pointerlockchange', () => {
            this.isPointerLocked = document.pointerLockElement === canvas;

            // Show/hide pointer prompt
            const prompt = document.getElementById('pointer-prompt');
            if (this.game.state === GameState.PLAYING) {
                if (this.isPointerLocked) {
                    prompt.classList.add('hidden');
                } else {
                    prompt.classList.remove('hidden');
                }
            }
        });

        // Pointer lock error
        document.addEventListener('pointerlockerror', () => {
            console.error('Pointer lock failed');
        });
    }

    lockPointer() {
        const canvas = document.getElementById('game-canvas');
        canvas.requestPointerLock();
    }

    unlockPointer() {
        if (document.pointerLockElement) {
            document.exitPointerLock();
        }
        // Hide pointer prompt when not playing
        const prompt = document.getElementById('pointer-prompt');
        prompt.classList.add('hidden');
    }

    onKeyDown(event) {
        // Prevent default for game keys
        if (['Space', 'KeyW', 'KeyA', 'KeyS', 'KeyD'].includes(event.code)) {
            event.preventDefault();
        }

        // Handle state-specific input
        switch (this.game.state) {
            case GameState.PLAYING:
                this.handlePlayingKeyDown(event);
                break;
            case GameState.PAUSED:
                this.handlePausedKeyDown(event);
                break;
        }
    }

    onKeyUp(event) {
        // Movement keys
        switch (event.code) {
            case 'KeyW':
                this.keys.forward = false;
                break;
            case 'KeyS':
                this.keys.backward = false;
                break;
            case 'KeyA':
                this.keys.left = false;
                break;
            case 'KeyD':
                this.keys.right = false;
                break;
            case 'Space':
                this.keys.jump = false;
                break;
            case 'ShiftLeft':
            case 'ShiftRight':
                this.keys.sprint = false;
                break;
            case 'KeyR':
                this.keys.reload = false;
                break;
        }
    }

    handlePlayingKeyDown(event) {
        switch (event.code) {
            // Movement
            case 'KeyW':
                this.keys.forward = true;
                break;
            case 'KeyS':
                this.keys.backward = true;
                break;
            case 'KeyA':
                this.keys.left = true;
                break;
            case 'KeyD':
                this.keys.right = true;
                break;
            case 'Space':
                this.keys.jump = true;
                break;
            case 'ShiftLeft':
            case 'ShiftRight':
                this.keys.sprint = true;
                break;

            // Reload
            case 'KeyR':
                this.keys.reload = true;
                if (this.game.weaponManager) {
                    this.game.weaponManager.reload();
                }
                break;

            // Weapon switching
            case 'Digit1':
                this.game.weaponManager?.switchWeapon(0);
                break;
            case 'Digit2':
                this.game.weaponManager?.switchWeapon(1);
                break;
            case 'Digit3':
                this.game.weaponManager?.switchWeapon(2);
                break;
            case 'Digit4':
                this.game.weaponManager?.switchWeapon(3);
                break;
            case 'Digit5':
                this.game.weaponManager?.switchWeapon(4);
                break;
            case 'Digit6':
                this.game.weaponManager?.switchWeapon(5);
                break;

            // Pause
            case 'Escape':
                this.game.pauseGame();
                break;
        }
    }

    handlePausedKeyDown(event) {
        if (event.code === 'Escape') {
            this.game.resumeGame();
        }
    }

    onMouseMove(event) {
        if (!this.isPointerLocked) return;

        this.mouse.deltaX = event.movementX;
        this.mouse.deltaY = event.movementY;

        // Apply to camera rotation
        if (this.game.player) {
            this.game.player.handleMouseMove(
                event.movementX * this.sensitivity,
                event.movementY * this.sensitivity
            );
        }
    }

    onMouseDown(event) {
        if (event.button === 0) {
            this.mouse.leftButton = true;
        } else if (event.button === 2) {
            this.mouse.rightButton = true;
        }
    }

    onMouseUp(event) {
        if (event.button === 0) {
            this.mouse.leftButton = false;
        } else if (event.button === 2) {
            this.mouse.rightButton = false;
        }
    }

    isMoving() {
        return this.keys.forward || this.keys.backward ||
            this.keys.left || this.keys.right;
    }

    getMovementDirection() {
        return {
            x: (this.keys.right ? 1 : 0) - (this.keys.left ? 1 : 0),
            z: (this.keys.forward ? 1 : 0) - (this.keys.backward ? 1 : 0)
        };
    }
}
