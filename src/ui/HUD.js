// HUD.js - Heads-up display controller

export class HUD {
    constructor(game) {
        this.game = game;

        // HUD elements
        this.container = document.getElementById('hud');
        this.healthFill = document.querySelector('.health-fill');
        this.healthText = document.querySelector('.health-text');
        this.waveText = document.getElementById('current-wave');
        this.enemiesCount = document.getElementById('enemies-count');
        this.ammoCurrent = document.getElementById('ammo-current');
        this.ammoMag = document.getElementById('ammo-mag');
        this.ammoReserve = document.getElementById('ammo-reserve');
        this.ammoReserveWrap = document.querySelector('.ammo-reserve-wrap');
        this.weaponSlots = document.querySelectorAll('.weapon-slot');

        // Heat bar elements
        this.heatContainer = document.getElementById('heat-container');
        this.heatFill = document.getElementById('heat-fill');

        // Flashlight indicator
        this.flashlightStatus = document.getElementById('flashlight-status');

        // Damage overlay effect
        this.createDamageOverlay();
    }

    createDamageOverlay() {
        this.damageOverlay = document.createElement('div');
        this.damageOverlay.id = 'damage-overlay';
        this.damageOverlay.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: radial-gradient(circle, transparent 40%, rgba(255, 0, 0, 0.5) 100%);
      pointer-events: none;
      opacity: 0;
      transition: opacity 0.1s ease-out;
      z-index: 45;
    `;
        document.getElementById('game-container').appendChild(this.damageOverlay);
    }

    show() {
        this.container.classList.remove('hidden');
    }

    hide() {
        this.container.classList.add('hidden');
    }

    update() {
        // Update health
        if (this.game.player) {
            const healthPercent = (this.game.player.health / this.game.player.maxHealth) * 100;
            this.healthFill.style.width = healthPercent + '%';
            this.healthText.textContent = Math.ceil(this.game.player.health);

            // Color based on health
            if (healthPercent > 60) {
                this.healthFill.style.background = 'linear-gradient(135deg, #660000 0%, #aa0000 50%, #ff0000 100%)';
                this.healthFill.style.animation = 'none';
            } else if (healthPercent > 30) {
                this.healthFill.style.background = 'linear-gradient(135deg, #664400 0%, #aa6600 50%, #ff8800 100%)';
                this.healthFill.style.animation = 'none';
            } else {
                this.healthFill.style.background = 'linear-gradient(135deg, #440000 0%, #880000 50%, #cc0000 100%)';
                // Pulse effect at low health
                this.healthFill.style.animation = 'pulse 0.5s infinite';
            }

            // Update flashlight indicator
            if (this.game.player.flashlight) {
                this.flashlightStatus.textContent = this.game.player.flashlightOn ? 'ON' : 'OFF';
                this.flashlightStatus.classList.toggle('on', this.game.player.flashlightOn);
            }
        }

        // Update wave info
        if (this.game.waveManager) {
            this.waveText.textContent = this.game.waveManager.currentWave;
            this.enemiesCount.textContent = this.game.waveManager.enemiesRemaining;
        }

        // Update ammo and heat
        if (this.game.weaponManager) {
            const weapon = this.game.weaponManager.currentWeapon;

            if (weapon.name === 'Knife') {
                this.ammoCurrent.textContent = '∞';
                if (this.ammoMag) this.ammoMag.style.display = 'none';
                if (this.ammoReserveWrap) this.ammoReserveWrap.style.display = 'none';
                document.querySelector('.ammo-divider').style.display = 'none';
            } else {
                // Format: current / magSize (reserve)
                this.ammoCurrent.textContent = weapon.currentAmmo;
                if (this.ammoMag) {
                    this.ammoMag.textContent = weapon.magSize;
                    this.ammoMag.style.display = 'inline';
                }
                if (this.ammoReserveWrap) {
                    this.ammoReserve.textContent = weapon.reserveAmmo;
                    this.ammoReserveWrap.style.display = 'inline';
                }
                document.querySelector('.ammo-divider').style.display = 'inline';
            }

            // Show/hide heat bar for minigun
            if (weapon.name === 'Minigun') {
                this.heatContainer.style.display = 'flex';
                const heatPercent = weapon.getHeatPercent();
                this.heatFill.style.width = heatPercent + '%';

                // Add overheated class
                if (weapon.isOverheated) {
                    this.heatFill.classList.add('overheated');
                } else {
                    this.heatFill.classList.remove('overheated');
                }
            } else {
                this.heatContainer.style.display = 'none';
            }
        }
    }

    showDamageEffect() {
        this.damageOverlay.style.opacity = '1';
        setTimeout(() => {
            this.damageOverlay.style.opacity = '0';
        }, 150);
    }

    showWaveNotification(waveNumber) {
        // Create wave notification
        const notification = document.createElement('div');
        notification.className = 'wave-notification';
        notification.innerHTML = `<h2>WAVE ${waveNumber}</h2>`;
        notification.style.cssText = `
      position: absolute;
      top: 30%;
      left: 50%;
      transform: translate(-50%, -50%);
      font-family: 'Impact', sans-serif;
      font-size: 4rem;
      color: #ff4444;
      text-shadow: 0 0 20px rgba(255, 68, 68, 0.8);
      pointer-events: none;
      z-index: 55;
      animation: waveNotify 2s ease-out forwards;
    `;

        // Add animation style if not exists
        if (!document.getElementById('wave-notify-style')) {
            const style = document.createElement('style');
            style.id = 'wave-notify-style';
            style.textContent = `
        @keyframes waveNotify {
          0% { opacity: 0; transform: translate(-50%, -50%) scale(0.5); }
          20% { opacity: 1; transform: translate(-50%, -50%) scale(1.2); }
          30% { transform: translate(-50%, -50%) scale(1); }
          80% { opacity: 1; }
          100% { opacity: 0; transform: translate(-50%, -50%) scale(1.1); }
        }
      `;
            document.head.appendChild(style);
        }

        document.getElementById('game-container').appendChild(notification);

        setTimeout(() => {
            notification.remove();
        }, 2000);
    }
}
