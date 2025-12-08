// MenuManager.js - Handles all menu navigation and interactions
import { GameState } from '../engine/Game.js';

export class MenuManager {
    constructor(game) {
        this.game = game;

        // Menu elements
        this.mainMenu = document.getElementById('main-menu');
        this.mapSelect = document.getElementById('map-select');
        this.howToPlay = document.getElementById('how-to-play');
        this.pauseMenu = document.getElementById('pause-menu');
        this.gameOver = document.getElementById('game-over');
        this.victory = document.getElementById('victory');

        // Previous menu stack for back navigation
        this.menuStack = [];

        // Setup button listeners
        this.setupMainMenuButtons();
        this.setupMapSelectButtons();
        this.setupPauseMenuButtons();
        this.setupGameOverButtons();
        this.setupVictoryButtons();
        this.setupBackButtons();
    }

    setupMainMenuButtons() {
        const buttons = this.mainMenu.querySelectorAll('.menu-btn');

        buttons.forEach(btn => {
            btn.addEventListener('click', () => {
                const action = btn.dataset.action;

                switch (action) {
                    case 'start':
                        this.game.startGame(1); // Default to map 1
                        break;
                    case 'maps':
                        this.menuStack.push(GameState.MENU);
                        this.game.setState(GameState.MAP_SELECT);
                        break;
                    case 'howto':
                        this.menuStack.push(GameState.MENU);
                        this.game.setState(GameState.HOW_TO_PLAY);
                        break;
                    case 'quit':
                        this.showQuitConfirm();
                        break;
                }
            });

            // Hover sound effect
            btn.addEventListener('mouseenter', () => {
                // Could add hover sound here
            });
        });
    }

    setupMapSelectButtons() {
        const mapCards = this.mapSelect.querySelectorAll('.map-card');

        mapCards.forEach(card => {
            card.addEventListener('click', () => {
                const mapNumber = parseInt(card.dataset.map);
                this.menuStack = []; // Clear stack
                this.game.startGame(mapNumber);
            });

            // Hover effect
            card.addEventListener('mouseenter', () => {
                card.style.transform = 'translateY(-5px) scale(1.02)';
            });

            card.addEventListener('mouseleave', () => {
                card.style.transform = '';
            });
        });
    }

    setupPauseMenuButtons() {
        const buttons = this.pauseMenu.querySelectorAll('.menu-btn');

        buttons.forEach(btn => {
            btn.addEventListener('click', () => {
                const action = btn.dataset.action;

                switch (action) {
                    case 'resume':
                        this.game.resumeGame();
                        break;
                    case 'restart':
                        this.game.restartGame();
                        break;
                    case 'howto':
                        this.menuStack.push(GameState.PAUSED);
                        this.game.setState(GameState.HOW_TO_PLAY);
                        break;
                    case 'mainmenu':
                        this.menuStack = [];
                        this.game.quitToMenu();
                        break;
                }
            });
        });
    }

    setupGameOverButtons() {
        const buttons = this.gameOver.querySelectorAll('.menu-btn');

        buttons.forEach(btn => {
            btn.addEventListener('click', () => {
                const action = btn.dataset.action;

                switch (action) {
                    case 'restart':
                        this.game.restartGame();
                        break;
                    case 'mainmenu':
                        this.game.quitToMenu();
                        break;
                }
            });
        });
    }

    setupVictoryButtons() {
        const buttons = this.victory.querySelectorAll('.menu-btn');

        buttons.forEach(btn => {
            btn.addEventListener('click', () => {
                const action = btn.dataset.action;

                switch (action) {
                    case 'nextmap':
                        this.game.nextMap();
                        break;
                    case 'mainmenu':
                        this.game.quitToMenu();
                        break;
                }
            });
        });
    }

    setupBackButtons() {
        const backButtons = document.querySelectorAll('.back-btn');

        backButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                this.goBack();
            });
        });
    }

    goBack() {
        if (this.menuStack.length > 0) {
            const previousState = this.menuStack.pop();
            this.game.setState(previousState);
        } else {
            this.game.setState(GameState.MENU);
        }
    }

    onStateChange(newState, previousState) {
        // Hide all menus first
        this.hideAllMenus();

        // Show the appropriate menu
        switch (newState) {
            case GameState.MENU:
                this.showMenu(this.mainMenu);
                break;
            case GameState.MAP_SELECT:
                this.showMenu(this.mapSelect);
                break;
            case GameState.HOW_TO_PLAY:
                this.showMenu(this.howToPlay);
                break;
            case GameState.PAUSED:
                this.showMenu(this.pauseMenu);
                break;
            case GameState.GAME_OVER:
                this.showMenu(this.gameOver);
                break;
            case GameState.VICTORY:
                this.showMenu(this.victory);
                break;
            case GameState.PLAYING:
                // All menus hidden
                break;
        }
    }

    hideAllMenus() {
        this.mainMenu.classList.add('hidden');
        this.mapSelect.classList.add('hidden');
        this.howToPlay.classList.add('hidden');
        this.pauseMenu.classList.add('hidden');
        this.gameOver.classList.add('hidden');
        this.victory.classList.add('hidden');
    }

    showMenu(menu) {
        menu.classList.remove('hidden');
    }

    showQuitConfirm() {
        // Simple confirm dialog
        const confirmed = confirm('Are you sure you want to quit?');
        if (confirmed) {
            // Try to close the window/tab
            window.close();
            // If that doesn't work, show a message
            setTimeout(() => {
                alert('You can close this tab to exit the game.');
            }, 100);
        }
    }
}
