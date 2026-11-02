import * as THREE from 'three';
import { EvaUnitId } from '../types/eva';

/**
 * Procedural Additive Laser Gradient Texture
 */
function createLaserPlaneTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  ctx.clearRect(0, 0, 512, 512);

  // Center glowing slit (Y = 256)
  const grad = ctx.createLinearGradient(0, 0, 0, 512);
  grad.addColorStop(0, 'rgba(0, 255, 120, 0)');
  grad.addColorStop(0.35, 'rgba(0, 255, 120, 0.05)');
  grad.addColorStop(0.48, 'rgba(0, 255, 120, 0.45)');
  grad.addColorStop(0.5, 'rgba(255, 255, 255, 0.95)'); // Ultra-bright razor line
  grad.addColorStop(0.52, 'rgba(0, 255, 120, 0.45)');
  grad.addColorStop(0.65, 'rgba(0, 255, 120, 0.05)');
  grad.addColorStop(1, 'rgba(0, 255, 120, 0)');

  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 512, 512);

  // Radial falloff so the square plane doesn't show harsh outer edges
  const radialGrad = ctx.createRadialGradient(256, 256, 120, 256, 256, 256);
  radialGrad.addColorStop(0, 'rgba(255, 255, 255, 1)');
  radialGrad.addColorStop(0.8, 'rgba(255, 255, 255, 0.7)');
  radialGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');

  ctx.globalCompositeOperation = 'destination-in';
  ctx.fillStyle = radialGrad;
  ctx.fillRect(0, 0, 512, 512);
  ctx.globalCompositeOperation = 'source-over';

  // Add subtle holographic diagnostic ticks & crosshairs
  ctx.strokeStyle = 'rgba(0, 255, 120, 0.6)';
  ctx.lineWidth = 2;
  for (let x = 64; x < 480; x += 32) {
    ctx.beginPath();
    ctx.moveTo(x, 248);
    ctx.lineTo(x, 264);
    ctx.stroke();
  }

  // Crosshair brackets
  ctx.strokeRect(236, 246, 40, 20);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

/**
 * Procedural Volumetric Laser Curtain Texture (Vertical Fan)
 */
function createCurtainTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  ctx.clearRect(0, 0, 256, 512);

  const grad = ctx.createLinearGradient(0, 0, 0, 512);
  grad.addColorStop(0, 'rgba(0, 255, 120, 0.0)');
  grad.addColorStop(0.1, 'rgba(0, 255, 120, 0.15)');
  grad.addColorStop(0.8, 'rgba(0, 255, 120, 0.35)');
  grad.addColorStop(1, 'rgba(255, 255, 255, 0.9)'); // Bright bottom line

  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 256, 512);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

export class EvaLaserScanner {
  public group: THREE.Group;
  private scanPlane: THREE.Mesh;
  private leftEmitter: THREE.Mesh;
  private rightEmitter: THREE.Mesh;
  private laserLine: THREE.Line;
  private curtainL: THREE.Mesh;
  private curtainR: THREE.Mesh;

  private planeMat: THREE.MeshBasicMaterial;
  private curtainMat: THREE.MeshBasicMaterial;
  private emitterMat: THREE.MeshBasicMaterial;
  private lineMat: THREE.LineBasicMaterial;

  private isEnabled: boolean = true;
  private currentColor: number = 0x00ff77;

  constructor() {
    this.group = new THREE.Group();
    this.group.name = 'EVA_LASER_SCANNER';

    const laserTexture = createLaserPlaneTexture();
    const curtainTexture = createCurtainTexture();

    // 1. Horizontal Additive Laser Plane
    const planeGeo = new THREE.PlaneGeometry(16, 16);
    planeGeo.rotateX(-Math.PI / 2);

    this.planeMat = new THREE.MeshBasicMaterial({
      map: laserTexture,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
      depthWrite: false,
      color: 0x00ff77,
    });
    this.scanPlane = new THREE.Mesh(planeGeo, this.planeMat);
    this.group.add(this.scanPlane);

    // 2. High-intensity Central Laser Line
    const lineGeo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(-8, 0, 0),
      new THREE.Vector3(8, 0, 0),
    ]);
    this.lineMat = new THREE.LineBasicMaterial({
      color: 0xffffff,
      blending: THREE.AdditiveBlending,
      transparent: true,
      opacity: 0.95,
      linewidth: 2,
    });
    this.laserLine = new THREE.Line(lineGeo, this.lineMat);
    this.group.add(this.laserLine);

    // 3. Volumetric Gantry Laser Curtains (Left & Right vertical light fans)
    const curtainGeo = new THREE.PlaneGeometry(5, 12);
    this.curtainMat = new THREE.MeshBasicMaterial({
      map: curtainTexture,
      transparent: true,
      opacity: 0.35,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
      depthWrite: false,
      color: 0x00ff77,
    });

    this.curtainL = new THREE.Mesh(curtainGeo, this.curtainMat);
    this.curtainL.position.set(-6.5, 6, 0);
    this.curtainL.rotation.y = Math.PI / 2;
    this.group.add(this.curtainL);

    this.curtainR = new THREE.Mesh(curtainGeo, this.curtainMat);
    this.curtainR.position.set(6.5, 6, 0);
    this.curtainR.rotation.y = -Math.PI / 2;
    this.group.add(this.curtainR);

    // 4. Rail Laser Projector Emitter Heads (Left & Right)
    const emitterGeo = new THREE.SphereGeometry(0.18, 12, 12);
    this.emitterMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      blending: THREE.AdditiveBlending,
    });
    this.leftEmitter = new THREE.Mesh(emitterGeo, this.emitterMat);
    this.leftEmitter.position.set(-6.8, 0, 0);
    this.group.add(this.leftEmitter);

    this.rightEmitter = new THREE.Mesh(emitterGeo, this.emitterMat);
    this.rightEmitter.position.set(6.8, 0, 0);
    this.group.add(this.rightEmitter);

    // Initial position
    this.group.position.y = 5.0;
  }

  public setVisible(visible: boolean) {
    this.isEnabled = visible;
    this.group.visible = visible;
  }

  public setUnit(unit: EvaUnitId) {
    let color = 0x00ff77;
    if (unit === 'unit-02') {
      color = 0xff3311;
    } else if (unit === 'unit-00') {
      color = 0x00bfff;
    } else if (unit === 'berserk') {
      color = 0xff0022;
    }
    this.currentColor = color;
    this.planeMat.color.setHex(color);
    this.curtainMat.color.setHex(color);
  }

  public update(delta: number, elapsed: number) {
    if (!this.isEnabled) return;

    // Periodic sweep loop: sweeps smoothly up and down across the mecha (height 0.4 to 10.8)
    // 0.8 rad/s creates a calm yet intense ~7.8 second cycle
    const sweepProgress = (Math.sin(elapsed * 1.1) + 1.0) / 2.0;
    // Non-linear easing for natural mechanical acceleration/deceleration
    const easedProgress = Math.sin((sweepProgress - 0.5) * Math.PI) * 0.5 + 0.5;
    const currentY = 0.35 + easedProgress * 10.2;

    this.group.position.y = currentY;

    // Pulse & subtle holographic scanline shimmer
    const shimmer = 0.8 + Math.sin(elapsed * 14.0) * 0.15;
    this.planeMat.opacity = 0.75 * shimmer;

    // Scale curtain height based on current sweep height
    const curtainH = Math.max(0.5, currentY);
    this.curtainL.scale.set(1, curtainH / 12, 1);
    this.curtainL.position.y = -curtainH / 2;
    this.curtainR.scale.set(1, curtainH / 12, 1);
    this.curtainR.position.y = -curtainH / 2;

    // Subtle rotation oscillation for high-tech scanning effect
    this.scanPlane.rotation.y = Math.sin(elapsed * 0.5) * 0.05;
  }

  public dispose() {
    this.planeMat.dispose();
    this.curtainMat.dispose();
    this.emitterMat.dispose();
    this.lineMat.dispose();
  }
}
