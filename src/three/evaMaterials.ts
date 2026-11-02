import * as THREE from 'three';
import { EvaUnitId } from '../types/eva';

export interface UnitColorPalette {
  primary: number;
  secondary: number;
  accent: number;
  core: number;
  visor: number;
  frame: number;
  glow: number;
  muscle: number;
}

export const UNIT_PALETTES: Record<EvaUnitId, UnitColorPalette> = {
  'unit-01': {
    primary: 0x481b7a,    // Automotive metallic deep EVA violet
    secondary: 0x14161f,  // Matte ballistic charcoal black
    accent: 0x00ff66,     // Radioactive hyper-luminescent green
    core: 0xe61224,       // Deep ruby S2 engine core
    visor: 0x11ff77,      // Tactical multi-sensor optics
    frame: 0x222630,      // Titanium-alloy skeletal armature
    glow: 0x00ff77,
    muscle: 0x251e2e,     // Bio-synthetic dark violet muscle tissue
  },
  'unit-02': {
    primary: 0xcc1422,    // Scarlet racing lacquer
    secondary: 0xf07a18,  // Tangerine hazard plating
    accent: 0xffffff,     // High-albedo titanium white
    core: 0xee2200,
    visor: 0x00ffaa,      // Quad emerald optics
    frame: 0x22252c,
    glow: 0xff3b14,
    muscle: 0x2b1c20,
  },
  'unit-00': {
    primary: 0x0c4fa8,    // Cobalt Kai blue
    secondary: 0xdedede,  // Ceramic prototype thermal barrier
    accent: 0x1f232b,
    core: 0xdd2211,
    visor: 0xff2811,      // Monocular optic
    frame: 0x20232a,
    glow: 0x1a88ff,
    muscle: 0x1e242d,
  },
  'berserk': {
    primary: 0x280845,    // Corrupted shadowed purple
    secondary: 0x0b0811,  // Deep obsidian
    accent: 0x33ff66,     // Overclocked phosphor green
    core: 0xff0000,       // Molten erupting red
    visor: 0xff0028,      // Berserk bloody glare
    frame: 0x18171f,
    glow: 0xff0033,
    muscle: 0x330c18,     // Engorged muscular tissue
  },
  'space-01': {
    primary: 0x5a2196,    // High-contrast video EVA-01 deep royal purple
    secondary: 0x12141d,  // Ballistic space black composite
    accent: 0x00ff73,     // Hyper-luminescent radiant lime green (from video)
    core: 0xff142a,       // Incandescent red S2 core
    visor: 0x1cf085,      // Intense emerald optic glare
    frame: 0x222733,      // Orbital chassis gunmetal
    glow: 0x00ff80,
    muscle: 0x231b2c,
  },
};

/**
 * High-Resolution Procedural Armor Seam, Rivet, and Stencil Bump Map
 */
export function createArmorPanelBumpTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d')!;

  // Neutral 50% gray base
  ctx.fillStyle = '#808080';
  ctx.fillRect(0, 0, 1024, 1024);

  // 1. Carbon fiber micro-weave under-pattern
  const cellSize = 16;
  for (let y = 0; y < 1024; y += cellSize) {
    for (let x = 0; x < 1024; x += cellSize) {
      const isAlt = (Math.floor(x / cellSize) + Math.floor(y / cellSize)) % 2 === 0;
      ctx.fillStyle = isAlt ? '#888888' : '#787878';
      ctx.fillRect(x, y, cellSize, cellSize);
    }
  }

  // 2. High-precision panel seam lines (depressed dark grooves)
  ctx.strokeStyle = '#383838';
  ctx.lineWidth = 4;
  
  // Outer perimeter margin bevels
  ctx.strokeRect(32, 32, 960, 960);
  ctx.strokeRect(96, 96, 832, 832);

  // Diagonal armor plate chamfers
  ctx.beginPath();
  ctx.moveTo(32, 256); ctx.lineTo(256, 32);
  ctx.moveTo(992, 256); ctx.lineTo(768, 32);
  ctx.moveTo(32, 768); ctx.lineTo(256, 992);
  ctx.moveTo(992, 768); ctx.lineTo(768, 992);
  ctx.stroke();

  // Highlight side on seams for 3D bevel depth
  ctx.strokeStyle = '#b8b8b8';
  ctx.lineWidth = 2;
  ctx.strokeRect(34, 34, 958, 958);

  // 3. Hex Socket Bolt Rivets
  ctx.fillStyle = '#2b2b2b';
  const drawRivet = (cx: number, cy: number) => {
    // Outer recess
    ctx.beginPath();
    ctx.arc(cx, cy, 10, 0, Math.PI * 2);
    ctx.fill();
    // Inner raised hex bolt
    ctx.fillStyle = '#d0d0d0';
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const a = (i * Math.PI) / 3;
      const rx = cx + 5 * Math.cos(a);
      const ry = cy + 5 * Math.sin(a);
      if (i === 0) ctx.moveTo(rx, ry);
      else ctx.lineTo(rx, ry);
    }
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#2b2b2b';
  };

  for (let i = 64; i <= 960; i += 128) {
    drawRivet(i, 64);
    drawRivet(i, 960);
    drawRivet(64, i);
    drawRivet(960, i);
  }

  // 4. Subtle micro-scratches & machining marks
  ctx.strokeStyle = '#909090';
  ctx.lineWidth = 1;
  for (let s = 0; s < 40; s++) {
    const sx = Math.random() * 1024;
    const sy = Math.random() * 1024;
    const sl = 20 + Math.random() * 50;
    const sa = Math.random() * Math.PI;
    ctx.beginPath();
    ctx.moveTo(sx, sy);
    ctx.lineTo(sx + sl * Math.cos(sa), sy + sl * Math.sin(sa));
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(2, 2);
  return texture;
}

/**
 * Synthetic Bio-Muscle Striation Texture
 */
export function createSyntheticMuscleTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#808080';
  ctx.fillRect(0, 0, 256, 512);

  // Longitudinal fibrous muscle bundles
  for (let x = 0; x < 256; x += 3) {
    const shade = 100 + Math.floor(Math.sin(x * 0.4) * 45) + Math.floor(Math.random() * 20);
    ctx.strokeStyle = `rgb(${shade},${shade},${shade})`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x + (Math.sin(x) * 4), 512);
    ctx.stroke();
  }

  // Transverse vascular rings (annular muscle bands)
  for (let y = 0; y < 512; y += 32) {
    ctx.strokeStyle = '#404040';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(256, y);
    ctx.stroke();

    ctx.strokeStyle = '#b8b8b8';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, y + 2);
    ctx.lineTo(256, y + 2);
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(4, 4);
  return texture;
}

/**
 * Procedural Canvas Texture: Pylon Decal (EVA-01 / NERV)
 */
export function createPylonDecalTexture(unit: EvaUnitId): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#101218';
  ctx.fillRect(0, 0, 512, 512);

  // Border accents
  ctx.strokeStyle = '#00ff66';
  ctx.lineWidth = 8;
  ctx.strokeRect(16, 16, 480, 480);

  // Corner brackets
  ctx.fillStyle = '#00ff66';
  ctx.fillRect(16, 16, 48, 16);
  ctx.fillRect(16, 16, 16, 48);
  ctx.fillRect(448, 16, 48, 16);
  ctx.fillRect(480, 16, 16, 48);

  // Unit Number typography
  const unitNumber = unit === 'unit-02' ? '02' : unit === 'unit-00' ? '00' : '01';
  ctx.font = 'bold 150px "Chakra Petch", monospace';
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(unitNumber, 256, 190);

  // Subtitle
  ctx.font = 'bold 24px "Share Tech Mono", monospace';
  ctx.fillStyle = '#00ff66';
  ctx.fillText(unit === 'space-01' ? 'ORBITAL ASSAULT' : 'EVANGELION', 256, 300);

  ctx.font = 'bold 18px "Share Tech Mono", monospace';
  ctx.fillStyle = '#aaaaaa';
  if (unit === 'space-01') {
    ctx.fillText('SPACE INTERCEPT // ORBITAL FLEET STRIKE', 256, 335);
    ctx.fillText('VELOCITY: MACH 28 // LONGINUS EQUIPPED', 256, 365);
  } else {
    ctx.fillText('TEST TYPE // NERV SPECIAL AGENCY', 256, 335);
    ctx.fillText('PROJECT E // SYNC: 100%', 256, 365);
  }

  // Warning stripes at bottom
  const stripeWidth = 24;
  for (let x = 24; x < 488; x += stripeWidth * 2) {
    ctx.fillStyle = '#ffb300';
    ctx.beginPath();
    ctx.moveTo(x, 430);
    ctx.lineTo(x + stripeWidth, 430);
    ctx.lineTo(x, 470);
    ctx.lineTo(x - stripeWidth, 470);
    ctx.closePath();
    ctx.fill();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;
  return texture;
}

/**
 * Procedural Hazard Warning Stripes Texture
 */
export function createHazardTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#111111';
  ctx.fillRect(0, 0, 256, 256);

  ctx.fillStyle = '#ffaa00';
  const w = 32;
  for (let i = -256; i < 512; i += w * 2) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i + w, 0);
    ctx.lineTo(i + w + 256, 256);
    ctx.lineTo(i + 256, 256);
    ctx.closePath();
    ctx.fill();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(4, 1);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

/**
 * Procedural AT Field Octagonal Texture
 */
export function createAtFieldTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  ctx.clearRect(0, 0, 512, 512);

  const cx = 256;
  const cy = 256;
  const rings = 6;

  for (let r = 0; r < rings; r++) {
    const radius = 40 + r * 38;
    ctx.beginPath();
    for (let i = 0; i < 8; i++) {
      const angle = (i * Math.PI) / 4 + Math.PI / 8;
      const x = cx + radius * Math.cos(angle);
      const y = cy + radius * Math.sin(angle);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();

    const alpha = (1 - r / (rings + 1)) * 0.85;
    ctx.strokeStyle = `rgba(255, 170, 0, ${alpha})`;
    ctx.lineWidth = r === 0 ? 5 : 3;
    ctx.stroke();

    ctx.fillStyle = `rgba(255, 120, 0, ${alpha * 0.12})`;
    ctx.fill();
  }

  ctx.strokeStyle = 'rgba(255, 200, 50, 0.4)';
  ctx.lineWidth = 2;
  for (let i = 0; i < 8; i++) {
    const angle = (i * Math.PI) / 4 + Math.PI / 8;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + 250 * Math.cos(angle), cy + 250 * Math.sin(angle));
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

/**
 * Procedural Contact Shadow Texture
 */
export function createRadialShadowTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  const gradient = ctx.createRadialGradient(128, 128, 10, 128, 128, 120);
  gradient.addColorStop(0, 'rgba(0, 0, 0, 0.85)');
  gradient.addColorStop(0.4, 'rgba(0, 0, 0, 0.45)');
  gradient.addColorStop(0.8, 'rgba(0, 0, 0, 0.12)');
  gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 256, 256);

  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

/**
 * Procedural High-Energy Ion Beam Texture (Cyan/Blue Beam)
 */
export function createIonBeamTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  ctx.clearRect(0, 0, 128, 512);

  const grad = ctx.createLinearGradient(0, 0, 0, 512);
  grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
  grad.addColorStop(0.15, 'rgba(0, 240, 255, 0.95)');
  grad.addColorStop(0.5, 'rgba(0, 140, 255, 0.6)');
  grad.addColorStop(0.85, 'rgba(0, 60, 255, 0.2)');
  grad.addColorStop(1, 'rgba(0, 20, 200, 0)');

  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 128, 512);

  const radGrad = ctx.createRadialGradient(64, 256, 10, 64, 256, 64);
  radGrad.addColorStop(0, 'rgba(255, 255, 255, 1)');
  radGrad.addColorStop(0.7, 'rgba(255, 255, 255, 0.6)');
  radGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
  ctx.globalCompositeOperation = 'destination-in';
  ctx.fillStyle = radGrad;
  ctx.fillRect(0, 0, 128, 512);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

/**
 * Procedural Rocket Fire Plume Texture (Orange/Gold Flame)
 */
export function createFlamePlumeTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  ctx.clearRect(0, 0, 128, 512);

  const grad = ctx.createLinearGradient(0, 0, 0, 512);
  grad.addColorStop(0, 'rgba(255, 255, 240, 1)');
  grad.addColorStop(0.2, 'rgba(255, 190, 50, 0.95)');
  grad.addColorStop(0.55, 'rgba(255, 80, 10, 0.6)');
  grad.addColorStop(0.85, 'rgba(200, 20, 0, 0.25)');
  grad.addColorStop(1, 'rgba(100, 0, 0, 0)');

  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 128, 512);

  const radGrad = ctx.createRadialGradient(64, 256, 10, 64, 256, 64);
  radGrad.addColorStop(0, 'rgba(255, 255, 255, 1)');
  radGrad.addColorStop(0.7, 'rgba(255, 255, 255, 0.6)');
  radGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
  ctx.globalCompositeOperation = 'destination-in';
  ctx.fillStyle = radGrad;
  ctx.fillRect(0, 0, 128, 512);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

export class EvaMaterialManager {
  // Primary & secondary armor (photorealistic automotive multi-layer clearcoat)
  public primaryArmorMat: THREE.MeshPhysicalMaterial;
  public secondaryArmorMat: THREE.MeshPhysicalMaterial;
  public accentGreenMat: THREE.MeshStandardMaterial;
  public coreJewelMat: THREE.MeshPhysicalMaterial;
  public visorGlowMat: THREE.MeshStandardMaterial;
  public opticLensMat: THREE.MeshPhysicalMaterial;
  
  // High-detail mechanical materials
  public biomechFrameMat: THREE.MeshStandardMaterial;
  public bioMuscleMat: THREE.MeshStandardMaterial;
  public chromePistonMat: THREE.MeshStandardMaterial;
  public anodizedTitaniumMat: THREE.MeshStandardMaterial;
  public goldHydraulicMat: THREE.MeshStandardMaterial;
  public thrusterNozzleMat: THREE.MeshStandardMaterial;

  // Stencils & Effects
  public pylonDecalMat: THREE.MeshStandardMaterial;
  public hazardMat: THREE.MeshStandardMaterial;
  public atFieldMat: THREE.MeshBasicMaterial;
  public contactShadowMat: THREE.MeshBasicMaterial;

  // Rocket & Ion Thruster Plumes (from Video)
  public ionBeamMat: THREE.MeshBasicMaterial;
  public flamePlumeMat: THREE.MeshBasicMaterial;

  private armorBumpTex: THREE.CanvasTexture;
  private muscleTex: THREE.CanvasTexture;
  private ionTex: THREE.CanvasTexture;
  private flameTex: THREE.CanvasTexture;

  constructor(unit: EvaUnitId) {
    const palette = UNIT_PALETTES[unit];
    this.armorBumpTex = createArmorPanelBumpTexture();
    this.muscleTex = createSyntheticMuscleTexture();

    // 1. Primary Outer Armor: Multi-layer metallic automotive lacquer with clearcoat
    this.primaryArmorMat = new THREE.MeshPhysicalMaterial({
      color: palette.primary,
      roughness: 0.22,
      metalness: 0.45,
      clearcoat: 0.95,
      clearcoatRoughness: 0.12,
      bumpMap: this.armorBumpTex,
      bumpScale: 0.012,
    });

    // 2. Secondary Armor: Ballistic composite matte armor with chamfered seams
    this.secondaryArmorMat = new THREE.MeshPhysicalMaterial({
      color: palette.secondary,
      roughness: 0.48,
      metalness: 0.25,
      clearcoat: 0.35,
      clearcoatRoughness: 0.3,
      bumpMap: this.armorBumpTex,
      bumpScale: 0.008,
    });

    // 3. Neon Hyper-Luminescent Accent with emissive glow
    this.accentGreenMat = new THREE.MeshStandardMaterial({
      color: palette.accent,
      emissive: palette.glow,
      emissiveIntensity: 1.1,
      roughness: 0.15,
      metalness: 0.2,
    });

    // 4. S2 Engine Jewel Core: Multi-layer refractive jewel with glowing inner seed
    this.coreJewelMat = new THREE.MeshPhysicalMaterial({
      color: palette.core,
      emissive: palette.core,
      emissiveIntensity: 1.2,
      roughness: 0.08,
      metalness: 0.1,
      clearcoat: 1.0,
      clearcoatRoughness: 0.05,
      transmission: 0.25,
      ior: 1.75,
    });

    // 5. Visor Optical Sensors
    this.visorGlowMat = new THREE.MeshStandardMaterial({
      color: palette.visor,
      emissive: palette.visor,
      emissiveIntensity: unit === 'berserk' ? 3.0 : 1.8,
      roughness: 0.08,
      metalness: 0.3,
    });

    // Protective outer optical sensor glass
    this.opticLensMat = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      roughness: 0.04,
      metalness: 0.1,
      transmission: 0.85,
      ior: 1.52,
      clearcoat: 1.0,
      transparent: true,
      opacity: 0.8,
    });

    // 6. Biomechanical Titanium Skeleton Frame
    this.biomechFrameMat = new THREE.MeshStandardMaterial({
      color: palette.frame,
      roughness: 0.55,
      metalness: 0.65,
      bumpMap: this.armorBumpTex,
      bumpScale: 0.015,
    });

    // 7. Synthetic Artificial Muscle Tissue (interwoven bio-fibers)
    this.bioMuscleMat = new THREE.MeshStandardMaterial({
      color: palette.muscle,
      roughness: 0.62,
      metalness: 0.3,
      bumpMap: this.muscleTex,
      bumpScale: 0.035,
    });

    // 8. Mirror Chrome Hydraulic Pistons (Polished steel rams)
    this.chromePistonMat = new THREE.MeshStandardMaterial({
      color: 0xf5f8fc,
      roughness: 0.05,
      metalness: 0.98,
    });

    // 9. Anodized Gunmetal / Dark Titanium for structural pivots
    this.anodizedTitaniumMat = new THREE.MeshStandardMaterial({
      color: 0x454b58,
      roughness: 0.28,
      metalness: 0.88,
    });

    // 10. Gold-plated Hydraulic Locking Collars & Valves
    this.goldHydraulicMat = new THREE.MeshStandardMaterial({
      color: 0xd4af37,
      roughness: 0.18,
      metalness: 0.95,
    });

    // 11. Rocket Vector Thruster Exhaust Nozzles
    this.thrusterNozzleMat = new THREE.MeshStandardMaterial({
      color: 0x242834,
      roughness: 0.35,
      metalness: 0.9,
    });

    // 12. Pylon Decal
    const pylonTex = createPylonDecalTexture(unit);
    this.pylonDecalMat = new THREE.MeshStandardMaterial({
      map: pylonTex,
      roughness: 0.35,
      metalness: 0.4,
    });

    // 13. Hazard Stripes
    const hazardTex = createHazardTexture();
    this.hazardMat = new THREE.MeshStandardMaterial({
      map: hazardTex,
      roughness: 0.45,
      metalness: 0.2,
    });

    // 14. AT Field
    const atFieldTex = createAtFieldTexture();
    this.atFieldMat = new THREE.MeshBasicMaterial({
      map: atFieldTex,
      transparent: true,
      opacity: 0.85,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    // 15. Contact Shadow
    const shadowTex = createRadialShadowTexture();
    this.contactShadowMat = new THREE.MeshBasicMaterial({
      map: shadowTex,
      transparent: true,
      opacity: 0.6,
      depthWrite: false,
    });

    // 16. Video-Inspired Back Thruster Ion Beams & Rocket Plumes
    this.ionTex = createIonBeamTexture();
    this.ionBeamMat = new THREE.MeshBasicMaterial({
      map: this.ionTex,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
      depthWrite: false,
    });

    this.flameTex = createFlamePlumeTexture();
    this.flamePlumeMat = new THREE.MeshBasicMaterial({
      map: this.flameTex,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
  }

  public updatePalette(unit: EvaUnitId) {
    const palette = UNIT_PALETTES[unit];
    this.primaryArmorMat.color.setHex(palette.primary);
    this.secondaryArmorMat.color.setHex(palette.secondary);
    this.accentGreenMat.color.setHex(palette.accent);
    this.accentGreenMat.emissive.setHex(palette.glow);
    this.coreJewelMat.color.setHex(palette.core);
    this.coreJewelMat.emissive.setHex(palette.core);
    this.visorGlowMat.color.setHex(palette.visor);
    this.visorGlowMat.emissive.setHex(palette.visor);
    this.visorGlowMat.emissiveIntensity = unit === 'berserk' ? 3.0 : 1.8;
    this.biomechFrameMat.color.setHex(palette.frame);
    this.bioMuscleMat.color.setHex(palette.muscle);

    const newDecal = createPylonDecalTexture(unit);
    this.pylonDecalMat.map = newDecal;
    this.pylonDecalMat.needsUpdate = true;
  }

  public dispose() {
    this.primaryArmorMat.dispose();
    this.secondaryArmorMat.dispose();
    this.accentGreenMat.dispose();
    this.coreJewelMat.dispose();
    this.visorGlowMat.dispose();
    this.opticLensMat.dispose();
    this.biomechFrameMat.dispose();
    this.bioMuscleMat.dispose();
    this.chromePistonMat.dispose();
    this.anodizedTitaniumMat.dispose();
    this.goldHydraulicMat.dispose();
    this.thrusterNozzleMat.dispose();
    this.pylonDecalMat.dispose();
    this.hazardMat.dispose();
    this.atFieldMat.dispose();
    this.contactShadowMat.dispose();
    this.ionBeamMat.dispose();
    this.flamePlumeMat.dispose();
    this.armorBumpTex.dispose();
    this.muscleTex.dispose();
    this.ionTex.dispose();
    this.flameTex.dispose();
  }
}
