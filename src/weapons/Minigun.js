// Minigun.js - Spin-up heavy weapon with overheat
import * as THREE from 'three';
import { Weapon } from './Weapon.js';

export class Minigun extends Weapon {
  constructor(game) {
    super(game, {
      name: 'Minigun',
      type: 'spin-up',
      damage: 15,
      range: 40,
      fireRate: 20, // 1200 RPM = 20 per second
      spread: 0.05,
      recoil: 0.02,
      magSize: 200,
      currentAmmo: 200,
      reserveAmmo: 400, // 2 extra magazines worth
      reloadTime: 4.0
    });
    
    this.color = 0x555555;
    
    // Spin-up mechanics (updated values)
    this.spinSpeed = 0;
    this.maxSpinSpeed = 1;
    this.spinUpTime = 0.6;  // 0.6 seconds to spin up
    this.spinDownTime = 0.8; // 0.8 seconds to spin down
    this.isSpinning = false;
    this.barrelRotation = 0;
    this.barrelMesh = null;
    
    // Overheat system
    this.heat = 0;
    this.maxHeat = 100;
    this.heatPerShot = 0.8;
    this.cooldownRate = 15; // Heat units per second
    this.isOverheated = false;
    this.overheatCooldownRate = 25; // Faster cooldown when overheated
    
    // Magazine tracking
    this.totalMags = 3;
    this.currentMagNumber = 1;
  }
  
  update(deltaTime) {
    // Update fire timer
    if (this.fireTimer > 0) {
      this.fireTimer -= deltaTime;
    }
    
    // Spin up/down
    if (this.isSpinning && !this.isOverheated) {
      this.spinSpeed = Math.min(this.maxSpinSpeed, this.spinSpeed + deltaTime / this.spinUpTime);
    } else {
      this.spinSpeed = Math.max(0, this.spinSpeed - deltaTime / this.spinDownTime);
    }
    
    // Rotate barrel visual
    if (this.barrelMesh && this.spinSpeed > 0) {
      this.barrelRotation += this.spinSpeed * deltaTime * 30;
      this.barrelMesh.rotation.z = this.barrelRotation;
    }
    
    // Handle overheat
    if (this.isOverheated) {
      this.heat -= this.overheatCooldownRate * deltaTime;
      if (this.heat <= 0) {
        this.heat = 0;
        this.isOverheated = false;
      }
    } else if (!this.isSpinning || this.spinSpeed < this.maxSpinSpeed) {
      // Cool down when not firing at full speed
      this.heat = Math.max(0, this.heat - this.cooldownRate * deltaTime);
    }
    
    // Can fire when: spun up, not overheated, fire timer ready
    this.canFire = this.spinSpeed >= this.maxSpinSpeed * 0.95 && 
                   !this.isOverheated && 
                   this.fireTimer <= 0;
  }
  
  fire() {
    // Start spinning
    this.isSpinning = true;
    
    // Check overheat
    if (this.isOverheated) return false;
    
    // Only fire if nearly at max spin (95%)
    if (this.spinSpeed < this.maxSpinSpeed * 0.95) return false;
    
    // Check ammo
    if (this.currentAmmo <= 0) return false;
    
    // Fire!
    this.currentAmmo--;
    this.fireTimer = 1 / this.fireRate;
    
    // Add heat
    this.heat += this.heatPerShot;
    if (this.heat >= this.maxHeat) {
      this.heat = this.maxHeat;
      this.isOverheated = true;
      this.isSpinning = false;
      // Play overheat sound
      this.game.audioManager.playSound('empty_clip');
    }
    
    // Play sound
    this.playFireSound();
    
    return true;
  }
  
  stopSpin() {
    this.isSpinning = false;
  }
  
  playFireSound() {
    this.game.audioManager.playSound('shoot_minigun');
  }
  
  getHeatPercent() {
    return (this.heat / this.maxHeat) * 100;
  }
  
  getSpinPercent() {
    return this.spinSpeed * 100;
  }
  
  createMesh() {
    const group = new THREE.Group();
    
    // Main housing - larger and more detailed
    const housingGeo = new THREE.CylinderGeometry(0.055, 0.055, 0.28, 16);
    const housingMat = new THREE.MeshStandardMaterial({
      color: 0x3a3a3a,
      roughness: 0.35,
      metalness: 0.75
    });
    const housing = new THREE.Mesh(housingGeo, housingMat);
    housing.rotation.x = Math.PI / 2;
    housing.position.set(0, 0, 0);
    group.add(housing);
    
    // Barrel cluster (6 barrels)
    const barrelGroup = new THREE.Group();
    const barrelGeo = new THREE.CylinderGeometry(0.007, 0.007, 0.35, 8);
    const barrelMat = new THREE.MeshStandardMaterial({
      color: 0x2a2a2a,
      roughness: 0.25,
      metalness: 0.85
    });
    
    for (let i = 0; i < 6; i++) {
      const barrel = new THREE.Mesh(barrelGeo, barrelMat);
      barrel.rotation.x = Math.PI / 2;
      const angle = (i / 6) * Math.PI * 2;
      const radius = 0.028;
      barrel.position.set(
        Math.cos(angle) * radius,
        Math.sin(angle) * radius,
        -0.25
      );
      barrelGroup.add(barrel);
    }
    
    // Central barrel
    const centerBarrelGeo = new THREE.CylinderGeometry(0.008, 0.008, 0.35, 8);
    const centerBarrel = new THREE.Mesh(centerBarrelGeo, barrelMat);
    centerBarrel.rotation.x = Math.PI / 2;
    centerBarrel.position.set(0, 0, -0.25);
    barrelGroup.add(centerBarrel);
    
    this.barrelMesh = barrelGroup;
    group.add(barrelGroup);
    
    // Front shroud with heat vents
    const shroudGeo = new THREE.CylinderGeometry(0.045, 0.05, 0.1, 16);
    const shroudMat = new THREE.MeshStandardMaterial({
      color: 0x4a4a4a,
      roughness: 0.45,
      metalness: 0.65
    });
    const shroud = new THREE.Mesh(shroudGeo, shroudMat);
    shroud.rotation.x = Math.PI / 2;
    shroud.position.set(0, 0, -0.1);
    group.add(shroud);
    
    // Heat vent rings
    for (let i = 0; i < 3; i++) {
      const ventGeo = new THREE.TorusGeometry(0.048, 0.003, 6, 16);
      const ventMat = new THREE.MeshStandardMaterial({
        color: 0x333333,
        roughness: 0.3,
        metalness: 0.8
      });
      const vent = new THREE.Mesh(ventGeo, ventMat);
      vent.position.set(0, 0, -0.05 - i * 0.03);
      group.add(vent);
    }
    
    // Back motor housing
    const motorGeo = new THREE.CylinderGeometry(0.045, 0.04, 0.14, 16);
    const motorMat = new THREE.MeshStandardMaterial({
      color: 0x3a3a3a,
      roughness: 0.45,
      metalness: 0.55
    });
    const motor = new THREE.Mesh(motorGeo, motorMat);
    motor.rotation.x = Math.PI / 2;
    motor.position.set(0, 0, 0.18);
    group.add(motor);
    
    // Handle with grip texture
    const handleGeo = new THREE.BoxGeometry(0.035, 0.09, 0.045);
    const handleMat = new THREE.MeshStandardMaterial({
      color: 0x222222,
      roughness: 0.9,
      metalness: 0.1
    });
    const handle = new THREE.Mesh(handleGeo, handleMat);
    handle.position.set(0, -0.065, 0.1);
    group.add(handle);
    
    // Front grip
    const frontGripGeo = new THREE.BoxGeometry(0.03, 0.06, 0.035);
    const frontGrip = new THREE.Mesh(frontGripGeo, handleMat);
    frontGrip.position.set(0, -0.05, -0.02);
    group.add(frontGrip);
    
    // Ammo belt feed box
    const feedGeo = new THREE.BoxGeometry(0.08, 0.06, 0.07);
    const feedMat = new THREE.MeshStandardMaterial({
      color: 0x5a5a3a,
      roughness: 0.55,
      metalness: 0.45
    });
    const feed = new THREE.Mesh(feedGeo, feedMat);
    feed.position.set(0.06, 0.02, 0.08);
    group.add(feed);
    
    // Ammo belt link
    const beltGeo = new THREE.BoxGeometry(0.02, 0.03, 0.06);
    const beltMat = new THREE.MeshStandardMaterial({
      color: 0x8b7355,
      roughness: 0.7,
      metalness: 0.3
    });
    const belt = new THREE.Mesh(beltGeo, beltMat);
    belt.position.set(0.03, 0.01, 0.04);
    group.add(belt);
    
    this.mesh = group;
    return group;
  }
}
