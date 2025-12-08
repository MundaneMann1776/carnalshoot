// AudioManager.js - Handles sound effects and music

export class AudioManager {
    constructor() {
        this.sounds = {};
        this.music = null;
        this.musicVolume = 0.3;
        this.sfxVolume = 0.5;
        this.isMuted = false;

        // Create audio context on first user interaction
        this.audioContext = null;
        this.initAudioContext();
    }

    initAudioContext() {
        const initContext = () => {
            if (!this.audioContext) {
                this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            }
            document.removeEventListener('click', initContext);
            document.removeEventListener('keydown', initContext);
        };

        document.addEventListener('click', initContext);
        document.addEventListener('keydown', initContext);
    }

    // For now, we'll use simple audio without loading files
    // Sound effects will be generated procedurally

    playSound(name, volume = 1) {
        if (this.isMuted || !this.audioContext) return;

        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        // Different sounds based on name
        switch (name) {
            case 'shoot_pistol':
                oscillator.frequency.setValueAtTime(200, this.audioContext.currentTime);
                oscillator.frequency.exponentialRampToValueAtTime(50, this.audioContext.currentTime + 0.1);
                gainNode.gain.setValueAtTime(this.sfxVolume * volume, this.audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.1);
                oscillator.start();
                oscillator.stop(this.audioContext.currentTime + 0.1);
                break;

            case 'shoot_smg':
                oscillator.frequency.setValueAtTime(300, this.audioContext.currentTime);
                oscillator.frequency.exponentialRampToValueAtTime(100, this.audioContext.currentTime + 0.05);
                gainNode.gain.setValueAtTime(this.sfxVolume * volume * 0.6, this.audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.05);
                oscillator.start();
                oscillator.stop(this.audioContext.currentTime + 0.05);
                break;

            case 'shoot_shotgun':
                oscillator.type = 'sawtooth';
                oscillator.frequency.setValueAtTime(100, this.audioContext.currentTime);
                oscillator.frequency.exponentialRampToValueAtTime(30, this.audioContext.currentTime + 0.2);
                gainNode.gain.setValueAtTime(this.sfxVolume * volume, this.audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.2);
                oscillator.start();
                oscillator.stop(this.audioContext.currentTime + 0.2);
                break;

            case 'shoot_ar15':
                oscillator.frequency.setValueAtTime(250, this.audioContext.currentTime);
                oscillator.frequency.exponentialRampToValueAtTime(80, this.audioContext.currentTime + 0.08);
                gainNode.gain.setValueAtTime(this.sfxVolume * volume * 0.8, this.audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.08);
                oscillator.start();
                oscillator.stop(this.audioContext.currentTime + 0.08);
                break;

            case 'shoot_minigun':
                oscillator.frequency.setValueAtTime(400, this.audioContext.currentTime);
                oscillator.frequency.exponentialRampToValueAtTime(200, this.audioContext.currentTime + 0.03);
                gainNode.gain.setValueAtTime(this.sfxVolume * volume * 0.4, this.audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.03);
                oscillator.start();
                oscillator.stop(this.audioContext.currentTime + 0.03);
                break;

            case 'knife_swipe':
                oscillator.type = 'sawtooth';
                oscillator.frequency.setValueAtTime(800, this.audioContext.currentTime);
                oscillator.frequency.exponentialRampToValueAtTime(200, this.audioContext.currentTime + 0.15);
                gainNode.gain.setValueAtTime(this.sfxVolume * volume * 0.3, this.audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.15);
                oscillator.start();
                oscillator.stop(this.audioContext.currentTime + 0.15);
                break;

            case 'enemy_hit':
                oscillator.type = 'square';
                oscillator.frequency.setValueAtTime(150, this.audioContext.currentTime);
                oscillator.frequency.exponentialRampToValueAtTime(50, this.audioContext.currentTime + 0.1);
                gainNode.gain.setValueAtTime(this.sfxVolume * volume * 0.4, this.audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.1);
                oscillator.start();
                oscillator.stop(this.audioContext.currentTime + 0.1);
                break;

            case 'enemy_death':
                oscillator.type = 'sawtooth';
                oscillator.frequency.setValueAtTime(200, this.audioContext.currentTime);
                oscillator.frequency.exponentialRampToValueAtTime(20, this.audioContext.currentTime + 0.3);
                gainNode.gain.setValueAtTime(this.sfxVolume * volume * 0.5, this.audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.3);
                oscillator.start();
                oscillator.stop(this.audioContext.currentTime + 0.3);
                break;

            case 'player_hurt':
                oscillator.type = 'sawtooth';
                oscillator.frequency.setValueAtTime(100, this.audioContext.currentTime);
                oscillator.frequency.exponentialRampToValueAtTime(50, this.audioContext.currentTime + 0.2);
                gainNode.gain.setValueAtTime(this.sfxVolume * volume * 0.6, this.audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.2);
                oscillator.start();
                oscillator.stop(this.audioContext.currentTime + 0.2);
                break;

            case 'reload':
                oscillator.frequency.setValueAtTime(500, this.audioContext.currentTime);
                oscillator.frequency.setValueAtTime(600, this.audioContext.currentTime + 0.1);
                oscillator.frequency.setValueAtTime(400, this.audioContext.currentTime + 0.2);
                gainNode.gain.setValueAtTime(this.sfxVolume * volume * 0.3, this.audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.3);
                oscillator.start();
                oscillator.stop(this.audioContext.currentTime + 0.3);
                break;

            case 'empty_clip':
                oscillator.frequency.setValueAtTime(800, this.audioContext.currentTime);
                oscillator.frequency.setValueAtTime(600, this.audioContext.currentTime + 0.05);
                gainNode.gain.setValueAtTime(this.sfxVolume * volume * 0.2, this.audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.05);
                oscillator.start();
                oscillator.stop(this.audioContext.currentTime + 0.05);
                break;

            case 'wave_complete':
                this.playTone(440, 0.15, 0.3);
                setTimeout(() => this.playTone(554, 0.15, 0.3), 150);
                setTimeout(() => this.playTone(659, 0.2, 0.3), 300);
                break;

            case 'wave_start':
                this.playTone(330, 0.1, 0.3);
                setTimeout(() => this.playTone(440, 0.2, 0.4), 100);
                break;
        }
    }

    playTone(frequency, duration, volume = 0.5) {
        if (this.isMuted || !this.audioContext) return;

        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
        gainNode.gain.setValueAtTime(this.sfxVolume * volume, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);

        oscillator.start();
        oscillator.stop(this.audioContext.currentTime + duration);
    }

    setMusicVolume(volume) {
        this.musicVolume = volume;
    }

    setSFXVolume(volume) {
        this.sfxVolume = volume;
    }

    mute() {
        this.isMuted = true;
    }

    unmute() {
        this.isMuted = false;
    }

    toggleMute() {
        this.isMuted = !this.isMuted;
        return this.isMuted;
    }
}
