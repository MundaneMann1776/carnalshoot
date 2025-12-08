// CarnalShoot - Main Entry Point
import { Game } from './engine/Game.js';

// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', () => {
    // Initialize the game
    const game = new Game();

    // Start the game loop
    game.init();
});
