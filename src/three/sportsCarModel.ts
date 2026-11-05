import * as THREE from 'three';
import { EvaMaterialManager } from './evaMaterials';
import { EvaUnitId } from '../types/eva';

export interface CarPaletteDefinition {
  name: string;
  bodyColor: number;
  bodyClearcoat: number;
  bodyRoughness: number;
  bodyMetalness: number;
  accentColor: number;
  caliperColor: number;
  wheelFinish: number;
  wheelMetalness: number;
  underglowColor: number;
  exhaustColor: number;
  cockpitStitch: number;
  stripeColor?: number;
}

export const SUPERCAR_PALETTES: Record<EvaUnitId, CarPaletteDefinition> = {
  'unit-01': {
    name: 'EVA-01 신지 스페셜 V12 (Metallic Iris Purple / Neon Lime)',
    bodyColor: 0x3d1266,        // Deep lustrous metallic violet-purple
    bodyClearcoat: 1.0,
    bodyRoughness: 0.12,
    bodyMetalness: 0.88,
    accentColor: 0x00ff66,      // Acid radioactive green
    caliperColor: 0x00ff66,
    wheelFinish: 0x111317,      // Satin forged black rims
    wheelMetalness: 0.9,
    underglowColor: 0x00ff66,
    exhaustColor: 0x00ff88,
    cockpitStitch: 0x00ff66,
    stripeColor: 0x00ff66,
  },
  'unit-02': {
    name: 'EVA-02 아스카 스쿠데리아 레이싱 (Rosso Corsa / Tangerine)',
    bodyColor: 0xc80815,        // Italian Rosso Corsa exotic red lacquer
    bodyClearcoat: 1.0,
    bodyRoughness: 0.1,
    bodyMetalness: 0.82,
    accentColor: 0xf59e0b,      // Tangerine aero accents
    caliperColor: 0xf59e0b,
    wheelFinish: 0xddae3b,      // Forged satin gold race rims
    wheelMetalness: 0.95,
    underglowColor: 0xff2200,
    exhaustColor: 0xffaa00,
    cockpitStitch: 0xff2200,
    stripeColor: 0xffffff,
  },
  'unit-00': {
    name: 'EVA-00 레이 프로토타입 (Alpine Metallic Blue / Ceramic Pearl)',
    bodyColor: 0x084298,        // Deep cobalt pearlescent blue
    bodyClearcoat: 1.0,
    bodyRoughness: 0.14,
    bodyMetalness: 0.85,
    accentColor: 0xffffff,      // High-albedo titanium white
    caliperColor: 0xffffff,
    wheelFinish: 0xe0e6ed,      // Polished mirror silver aluminum
    wheelMetalness: 0.96,
    underglowColor: 0x0099ff,
    exhaustColor: 0x00b4d8,
    cockpitStitch: 0x00b4d8,
    stripeColor: 0xffffff,
  },
  'berserk': {
    name: 'EVA-01 폭주 비스트 에디션 (Obsidian Matte Carbon / Blood Red)',
    bodyColor: 0x110814,        // Demonic satin phantom obsidian
    bodyClearcoat: 0.8,
    bodyRoughness: 0.22,
    bodyMetalness: 0.92,
    accentColor: 0xff0033,      // Crimson blood laser
    caliperColor: 0xff0022,
    wheelFinish: 0x0a0a0c,      // Midnight matte charcoal
    wheelMetalness: 0.95,
    underglowColor: 0xff0022,
    exhaustColor: 0xff0033,
    cockpitStitch: 0xff0022,
    stripeColor: 0xff0033,
  },
  'space-01': {
    name: 'EVA 우주 결전 하이퍼카 (Celestial Midnight Violet / Electric Cyan)',
    bodyColor: 0x4e1c84,        // High-contrast deep royal iridescent purple
    bodyClearcoat: 1.0,
    bodyRoughness: 0.08,
    bodyMetalness: 0.92,
    accentColor: 0x00f0ff,      // Radiant electric cyan
    caliperColor: 0x00f0ff,
    wheelFinish: 0x1f232b,      // Titanium gunmetal
    wheelMetalness: 0.94,
    underglowColor: 0x00f0ff,
    exhaustColor: 0x00f0ff,
    cockpitStitch: 0x00f0ff,
    stripeColor: 0x00f0ff,
  },
};

/**
 * Photorealistic High-Performance Cyber Hypercar Model
 * Features:
 * - Redesigned, aggressive aerodynamic silhouette with sculpted air-tunnels, side pods, and front shark-nose
 * - Dual Dihedral / Scissor butterfly doors that open upward & outward
 * - Realistic multi-layer pearlescent clearcoat car paint shader
 * - Hexagonal carbon-weave composite texture on aero splitters & roof
 * - Staggered concave forged wheels with cross-drilled ceramic brake rotors & Brembo calipers
 * - Quad projector LED headlights, razor angel-wing DRLs, and full-width continuous cyber lightbar
 * - Active rear carbon GT wing with swan-neck pylons & dual titanium quad exhausts
 * - Detailed interior racing cockpit with harness seats, center console, and telemetry yoke
 */
export class SportsCarModel {
  public group: THREE.Group;
  public materials: EvaMaterialManager;

  // Key articulating parts
  public leftDoor: THREE.Group;
  public rightDoor: THREE.Group;
  public wheels: THREE.Group[] = [];
  public frontWheelsGroup: THREE.Group[] = [];
  public rearSpoiler: THREE.Group;
  public exhaustGlow: THREE.PointLight;
  public headlightsGlow: THREE.Group;
  public underglowLight: THREE.PointLight;

  // Custom specialized car materials
  public carPaintMat: THREE.MeshPhysicalMaterial;
  public carbonFiberMat: THREE.MeshStandardMaterial;
  public glassMat: THREE.MeshPhysicalMaterial;
  public tireRubberMat: THREE.MeshStandardMaterial;
  public rimChromeMat: THREE.MeshStandardMaterial;
  public brakeRotorMat: THREE.MeshStandardMaterial;
  public brakeCaliperMat: THREE.MeshStandardMaterial;
  public interiorLeatherMat: THREE.MeshStandardMaterial;
  public ledHeadlightMat: THREE.MeshStandardMaterial;
  public ledTaillightMat: THREE.MeshStandardMaterial;
  public exhaustHeatMat: THREE.MeshStandardMaterial;
  public accentStripeMat: THREE.MeshStandardMaterial;

  private doorOpenAmount: number = 0;
  private targetDoorOpen: number = 0;
  private wheelRotation: number = 0;
  private steeringAngle: number = 0;
  private isEngineRunning: boolean = true;
  private nitroActive: boolean = false;
  private currentUnitId: EvaUnitId = 'unit-01';

  constructor(materials: EvaMaterialManager, initialUnit: EvaUnitId = 'unit-01') {
    this.materials = materials;
    this.currentUnitId = initialUnit;
    this.group = new THREE.Group();
    this.group.name = 'SPORTS_CAR_SUPERCAR';

    // 1. High-Precision Textures
    const carbonTex = this.createCarbonFiberTexture();
    const tireTex = this.createTireTreadTexture();
    const rotorTex = this.createBrakeRotorTexture();

    // 2. Multi-layer Automotive Lacquer with Clearcoat
    const p = SUPERCAR_PALETTES[initialUnit];

    this.carPaintMat = new THREE.MeshPhysicalMaterial({
      color: p.bodyColor,
      metalness: p.bodyMetalness,
      roughness: p.bodyRoughness,
      clearcoat: p.bodyClearcoat,
      clearcoatRoughness: 0.04,
      reflectivity: 1.0,
      ior: 1.58,
    });

    this.carbonFiberMat = new THREE.MeshStandardMaterial({
      color: 0x14161a,
      metalness: 0.6,
      roughness: 0.32,
      bumpMap: carbonTex,
      bumpScale: 0.025,
    });

    this.glassMat = new THREE.MeshPhysicalMaterial({
      color: 0x0a1018,
      metalness: 0.15,
      roughness: 0.03,
      transmission: 0.88,
      ior: 1.54,
      transparent: true,
      opacity: 0.82,
      clearcoat: 1.0,
      clearcoatRoughness: 0.02,
    });

    this.tireRubberMat = new THREE.MeshStandardMaterial({
      color: 0x181a1e,
      roughness: 0.88,
      metalness: 0.04,
      bumpMap: tireTex,
      bumpScale: 0.05,
    });

    this.rimChromeMat = new THREE.MeshStandardMaterial({
      color: p.wheelFinish,
      metalness: p.wheelMetalness,
      roughness: 0.12,
    });

    this.brakeRotorMat = new THREE.MeshStandardMaterial({
      color: 0xa8b0bc,
      metalness: 0.92,
      roughness: 0.28,
      bumpMap: rotorTex,
      bumpScale: 0.02,
    });

    this.brakeCaliperMat = new THREE.MeshStandardMaterial({
      color: p.caliperColor,
      metalness: 0.35,
      roughness: 0.2,
    });

    this.interiorLeatherMat = new THREE.MeshStandardMaterial({
      color: 0x121418,
      roughness: 0.65,
      metalness: 0.15,
    });

    this.accentStripeMat = new THREE.MeshStandardMaterial({
      color: p.accentColor,
      roughness: 0.15,
      metalness: 0.3,
    });

    this.ledHeadlightMat = new THREE.MeshStandardMaterial({
      color: 0xe0f7ff,
      emissive: 0xa0eeff,
      emissiveIntensity: 2.8,
      roughness: 0.08,
      metalness: 0.2,
    });

    this.ledTaillightMat = new THREE.MeshStandardMaterial({
      color: 0xff1522,
      emissive: 0xff0025,
      emissiveIntensity: 3.5,
      roughness: 0.08,
      metalness: 0.1,
    });

    this.exhaustHeatMat = new THREE.MeshStandardMaterial({
      color: 0x485878,
      metalness: 0.94,
      roughness: 0.18,
    });

    // 3. Build Car Geometry
    this.leftDoor = new THREE.Group();
    this.rightDoor = new THREE.Group();
    this.rearSpoiler = new THREE.Group();
    this.headlightsGlow = new THREE.Group();

    this.buildSupercarBody();

    // 4. Ambient & Visual Point Lights
    this.underglowLight = new THREE.PointLight(p.underglowColor, 2.0, 5.0);
    this.underglowLight.position.set(0, 0.15, 0);
    this.group.add(this.underglowLight);

    this.exhaustGlow = new THREE.PointLight(p.exhaustColor, 0.2, 3.5);
    this.exhaustGlow.position.set(0, 0.44, -2.4);
    this.group.add(this.exhaustGlow);

    this.updatePalette(initialUnit);
  }

  /**
   * Procedural Carbon Fiber Twill Weave Map
   */
  private createCarbonFiberTexture(): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d')!;

    ctx.fillStyle = '#0f1115';
    ctx.fillRect(0, 0, 128, 128);

    // Diagonal twill weave 2x2 pattern
    const size = 8;
    for (let y = 0; y < 128; y += size) {
      for (let x = 0; x < 128; x += size) {
        const check = (Math.floor((x + y) / size)) % 2 === 0;
        const subCheck = (Math.floor(x / size)) % 2 === 0;
        ctx.fillStyle = check ? (subCheck ? '#22262e' : '#191c22') : '#111317';
        ctx.fillRect(x, y, size, size);
      }
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(24, 24);
    return tex;
  }

  /**
   * Realistic Asymmetric Performance Tire Tread Texture
   */
  private createTireTreadTexture(): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d')!;

    ctx.fillStyle = '#22242a';
    ctx.fillRect(0, 0, 256, 256);

    ctx.fillStyle = '#0a0b0d';
    // 4 deep continuous circumferential rain channels
    ctx.fillRect(28, 0, 12, 256);
    ctx.fillRect(72, 0, 16, 256);
    ctx.fillRect(152, 0, 16, 256);
    ctx.fillRect(212, 0, 12, 256);

    // Lateral performance shoulder blocks & angled grooves
    ctx.strokeStyle = '#0e1014';
    ctx.lineWidth = 4;
    for (let y = 0; y < 256; y += 24) {
      // Outer shoulder
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(28, y + 14);
      ctx.stroke();

      // Center ribs
      ctx.beginPath();
      ctx.moveTo(40, y + 6);
      ctx.lineTo(72, y + 18);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(88, y + 12);
      ctx.lineTo(152, y + 26);
      ctx.stroke();

      // Inner shoulder
      ctx.beginPath();
      ctx.moveTo(256, y);
      ctx.lineTo(224, y + 14);
      ctx.stroke();
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(1, 4);
    return tex;
  }

  /**
   * Cross-Drilled Ceramic Brake Rotor Texture
   */
  private createBrakeRotorTexture(): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d')!;

    // Radial brushed metallic disc
    ctx.fillStyle = '#8a94a0';
    ctx.fillRect(0, 0, 256, 256);

    // Concentric machining rings
    ctx.strokeStyle = '#6e7784';
    ctx.lineWidth = 1;
    for (let r = 30; r < 120; r += 4) {
      ctx.beginPath();
      ctx.arc(128, 128, r, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Spiral cooling ventilation holes (cross-drilled)
    ctx.fillStyle = '#1c2026';
    for (let a = 0; a < 16; a++) {
      const angle = (a * Math.PI * 2) / 16;
      for (let d = 45; d < 115; d += 15) {
        const curAngle = angle + (d / 120) * 0.4;
        const x = 128 + Math.cos(curAngle) * d;
        const y = 128 + Math.sin(curAngle) * d;
        ctx.beginPath();
        ctx.arc(x, y, 3.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    return new THREE.CanvasTexture(canvas);
  }

  /**
   * Sculpted Supercar Geometry with Low-drag Aerodynamics & Aggressive Stance
   */
  private buildSupercarBody() {
    // Dimensions: Length ~4.8m, Width ~2.18m, Height ~1.14m

    // ==========================================
    // 1. CHASSIS PLATFORM & FLAT CARBON TRAY
    // ==========================================
    const underbodyGeo = new THREE.BoxGeometry(2.05, 0.1, 4.5);
    const underbody = new THREE.Mesh(underbodyGeo, this.carbonFiberMat);
    underbody.position.set(0, 0.16, 0);
    underbody.castShadow = true;
    underbody.receiveShadow = true;
    this.group.add(underbody);

    // Front Aerodynamic Carbon Splitter with End Canards
    const splitterGeo = new THREE.BoxGeometry(2.2, 0.045, 0.72);
    const splitter = new THREE.Mesh(splitterGeo, this.carbonFiberMat);
    splitter.position.set(0, 0.11, 2.3);
    splitter.castShadow = true;
    this.group.add(splitter);

    // Aerodynamic Front Canards (Dive Planes)
    for (const side of [-1, 1]) {
      const canardGeo = new THREE.BoxGeometry(0.35, 0.025, 0.28);
      const canard = new THREE.Mesh(canardGeo, this.carbonFiberMat);
      canard.position.set(side * 1.05, 0.24, 2.2);
      canard.rotation.z = side * -0.22;
      canard.rotation.x = -0.15;
      this.group.add(canard);
    }

    // Extended Carbon Side Skirts with Air Curtains
    for (const side of [-1, 1]) {
      const skirtGeo = new THREE.BoxGeometry(0.14, 0.08, 2.75);
      const skirt = new THREE.Mesh(skirtGeo, this.carbonFiberMat);
      skirt.position.set(side * 1.08, 0.13, 0.05);
      this.group.add(skirt);
    }

    // Rear Venturi Diffuser with 6 Aggressive Ground-Effect Strakes
    const diffuserBaseGeo = new THREE.BoxGeometry(2.08, 0.2, 0.95);
    const diffuserBase = new THREE.Mesh(diffuserBaseGeo, this.carbonFiberMat);
    diffuserBase.position.set(0, 0.22, -2.18);
    diffuserBase.rotation.x = 0.18;
    this.group.add(diffuserBase);

    for (let i = -3; i <= 3; i++) {
      const finGeo = new THREE.BoxGeometry(0.038, 0.24, 0.85);
      const fin = new THREE.Mesh(finGeo, this.carbonFiberMat);
      fin.position.set(i * 0.28, 0.24, -2.18);
      fin.rotation.x = 0.18;
      this.group.add(fin);
    }

    // ==========================================
    // 2. SCULPTED BODY SHELL & SHARK-NOSE HOOD
    // ==========================================
    // Lower Main Monocoque
    const bodyLowerGeo = new THREE.BoxGeometry(1.98, 0.44, 4.3);
    const bodyLower = new THREE.Mesh(bodyLowerGeo, this.carPaintMat);
    bodyLower.position.set(0, 0.42, 0);
    bodyLower.castShadow = true;
    bodyLower.receiveShadow = true;
    this.group.add(bodyLower);

    // Front Shark-Nose Sloping Hood with Deep Air Channel (S-Duct)
    const hoodGeo = new THREE.CylinderGeometry(0.72, 1.02, 1.7, 8);
    hoodGeo.rotateX(Math.PI / 2);
    hoodGeo.scale(1.0, 0.32, 1.0);
    const hood = new THREE.Mesh(hoodGeo, this.carPaintMat);
    hood.position.set(0, 0.53, 1.4);
    hood.castShadow = true;
    this.group.add(hood);

    // Center Aerodynamic Hood Spine & Heat Extractor Vent
    const hoodVentGeo = new THREE.BoxGeometry(0.65, 0.05, 0.85);
    const hoodVent = new THREE.Mesh(hoodVentGeo, this.carbonFiberMat);
    hoodVent.position.set(0, 0.67, 1.25);
    hoodVent.rotation.x = -0.16;
    this.group.add(hoodVent);

    // Center Racing Accent Stripe (NERV Liveried)
    const stripeGeo = new THREE.BoxGeometry(0.16, 0.03, 3.8);
    const stripe = new THREE.Mesh(stripeGeo, this.accentStripeMat);
    stripe.position.set(0, 0.66, 0.2);
    this.group.add(stripe);

    // Wide Muscular Front Fenders with Air Relief Gills
    for (const side of [-1, 1]) {
      const fenderGeo = new THREE.CylinderGeometry(0.54, 0.54, 0.26, 18, 1, false, 0, Math.PI);
      fenderGeo.rotateZ(Math.PI / 2);
      const fender = new THREE.Mesh(fenderGeo, this.carPaintMat);
      fender.position.set(side * 0.98, 0.48, 1.45);
      fender.scale.set(1, 0.92, 1.18);
      fender.castShadow = true;
      this.group.add(fender);

      // Fender Top Carbon Vent Slits
      for (let s = -1; s <= 1; s++) {
        const slitGeo = new THREE.BoxGeometry(0.16, 0.02, 0.08);
        const slit = new THREE.Mesh(slitGeo, this.carbonFiberMat);
        slit.position.set(side * 0.92, 0.76, 1.45 + s * 0.14);
        this.group.add(slit);
      }
    }

    // Wide Rear Muscular Shoulders / Haunches
    for (const side of [-1, 1]) {
      const rearFenderGeo = new THREE.BoxGeometry(0.34, 0.62, 1.55);
      const rearFender = new THREE.Mesh(rearFenderGeo, this.carPaintMat);
      rearFender.position.set(side * 0.98, 0.60, -1.25);
      rearFender.castShadow = true;
      this.group.add(rearFender);

      // Deep Sculpted Side Nacelle Intake (Feeding Twin-Turbos)
      const intakeNacelleGeo = new THREE.BoxGeometry(0.24, 0.38, 0.85);
      const intakeNacelle = new THREE.Mesh(intakeNacelleGeo, this.carbonFiberMat);
      intakeNacelle.position.set(side * 1.04, 0.52, -0.35);
      intakeNacelle.rotation.y = side * 0.16;
      this.group.add(intakeNacelle);

      // Aerodynamic intake strake
      const strakeGeo = new THREE.BoxGeometry(0.04, 0.32, 0.7);
      const strake = new THREE.Mesh(strakeGeo, this.accentStripeMat);
      strake.position.set(side * 1.14, 0.52, -0.35);
      strake.rotation.y = side * 0.16;
      this.group.add(strake);
    }

    // ==========================================
    // 3. TEARDROP COCKPIT CANOPY & GLASS
    // ==========================================
    const roofGeo = new THREE.CylinderGeometry(0.66, 0.94, 1.95, 10);
    roofGeo.rotateX(Math.PI / 2);
    roofGeo.scale(1.0, 0.44, 1.0);
    const roof = new THREE.Mesh(roofGeo, this.glassMat);
    roof.position.set(0, 0.88, 0.06);
    roof.castShadow = true;
    this.group.add(roof);

    // Carbon Center Roof Spine with Integrated Roof Scoop
    const roofSpineGeo = new THREE.BoxGeometry(0.82, 0.08, 1.45);
    const roofSpine = new THREE.Mesh(roofSpineGeo, this.carbonFiberMat);
    roofSpine.position.set(0, 1.06, -0.05);
    roofSpine.castShadow = true;
    this.group.add(roofSpine);

    // Functional Roof Air Scoop
    const scoopGeo = new THREE.BoxGeometry(0.32, 0.12, 0.55);
    const scoop = new THREE.Mesh(scoopGeo, this.carbonFiberMat);
    scoop.position.set(0, 1.12, 0.32);
    scoop.rotation.x = -0.15;
    this.group.add(scoop);

    // Front Windshield Frame A-Pillars
    for (const side of [-1, 1]) {
      const aPillarGeo = new THREE.CylinderGeometry(0.045, 0.05, 1.15, 8);
      const aPillar = new THREE.Mesh(aPillarGeo, this.carbonFiberMat);
      aPillar.position.set(side * 0.66, 0.86, 0.62);
      aPillar.rotation.x = -0.78;
      aPillar.rotation.z = side * -0.24;
      this.group.add(aPillar);
    }

    // ==========================================
    // 4. BUTTERFLY / SCISSOR ARTICULATING DOORS
    // ==========================================
    for (const side of [-1, 1]) {
      const doorRoot = side === -1 ? this.leftDoor : this.rightDoor;
      doorRoot.position.set(side * 0.94, 0.56, 0.68); // Pivot point at A-pillar base

      const doorMeshGeo = new THREE.BoxGeometry(0.2, 0.54, 1.3);
      doorMeshGeo.translate(0, 0.1, -0.58);
      const doorMesh = new THREE.Mesh(doorMeshGeo, this.carPaintMat);
      doorMesh.castShadow = true;
      doorRoot.add(doorMesh);

      // Carbon Mirror Stem & Housing
      const mirrorStemGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.24, 8);
      mirrorStemGeo.rotateZ(side * Math.PI / 3);
      const mirrorStem = new THREE.Mesh(mirrorStemGeo, this.carbonFiberMat);
      mirrorStem.position.set(side * 0.12, 0.36, -0.05);
      doorRoot.add(mirrorStem);

      const mirrorHousingGeo = new THREE.BoxGeometry(0.22, 0.1, 0.14);
      const mirrorHousing = new THREE.Mesh(mirrorHousingGeo, this.carbonFiberMat);
      mirrorHousing.position.set(side * 0.25, 0.44, -0.05);
      doorRoot.add(mirrorHousing);

      this.group.add(doorRoot);
    }

    // ==========================================
    // 5. DETAILED COCKPIT RACING INTERIOR
    // ==========================================
    for (const side of [-0.36, 0.36]) {
      const seatBaseGeo = new THREE.BoxGeometry(0.48, 0.18, 0.58);
      const seatBase = new THREE.Mesh(seatBaseGeo, this.interiorLeatherMat);
      seatBase.position.set(side, 0.42, 0.05);
      this.group.add(seatBase);

      const seatBackGeo = new THREE.BoxGeometry(0.46, 0.64, 0.14);
      seatBackGeo.translate(0, 0.28, 0);
      const seatBack = new THREE.Mesh(seatBackGeo, this.interiorLeatherMat);
      seatBack.position.set(side, 0.48, -0.24);
      seatBack.rotation.x = -0.26;
      this.group.add(seatBack);

      // 4-Point Racing Harness
      const harnessGeo = new THREE.BoxGeometry(0.07, 0.52, 0.025);
      const harness = new THREE.Mesh(harnessGeo, this.accentStripeMat);
      harness.position.set(side, 0.72, -0.21);
      harness.rotation.x = -0.26;
      this.group.add(harness);
    }

    // Center Console
    const consoleGeo = new THREE.BoxGeometry(0.24, 0.3, 1.15);
    const consoleMesh = new THREE.Mesh(consoleGeo, this.carbonFiberMat);
    consoleMesh.position.set(0, 0.48, 0.15);
    this.group.add(consoleMesh);

    // Dashboard with Telemetry Display Screen
    const dashGeo = new THREE.BoxGeometry(1.42, 0.32, 0.46);
    const dash = new THREE.Mesh(dashGeo, this.interiorLeatherMat);
    dash.position.set(0, 0.68, 0.68);
    this.group.add(dash);

    // Driver HUD Instrument Cluster
    const hudGeo = new THREE.PlaneGeometry(0.34, 0.15);
    const hudMat = new THREE.MeshBasicMaterial({
      color: 0x00ff88,
      transparent: true,
      opacity: 0.92,
    });
    const hud = new THREE.Mesh(hudGeo, hudMat);
    hud.position.set(-0.36, 0.76, 0.54);
    hud.rotation.x = -0.32;
    this.group.add(hud);

    // Cyber Yoke Steering Wheel
    const yokeGroup = new THREE.Group();
    yokeGroup.position.set(-0.36, 0.68, 0.40);
    yokeGroup.rotation.x = -0.36;

    const yokeGeo = new THREE.TorusGeometry(0.14, 0.026, 8, 24, Math.PI * 1.5);
    const yoke = new THREE.Mesh(yokeGeo, this.interiorLeatherMat);
    yokeGroup.add(yoke);

    const yokeHub = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.08, 12), this.carbonFiberMat);
    yokeHub.rotateX(Math.PI / 2);
    yokeGroup.add(yokeHub);

    this.group.add(yokeGroup);

    // ==========================================
    // 6. STAGGERED CONCAVE FORGED WHEELS & BRAKES
    // ==========================================
    const wheelPositions = [
      { x: -1.02, y: 0.38, z: 1.48, isFront: true },   // Front Left
      { x: 1.02, y: 0.38, z: 1.48, isFront: true },    // Front Right
      { x: -1.06, y: 0.40, z: -1.35, isFront: false }, // Rear Left (staggered deep concave)
      { x: 1.06, y: 0.40, z: -1.35, isFront: false },  // Rear Right
    ];

    this.wheels = [];
    this.frontWheelsGroup = [];

    for (const pos of wheelPositions) {
      const wheelHolder = new THREE.Group();
      wheelHolder.position.set(pos.x, pos.y, pos.z);

      const rotatingAssembly = new THREE.Group();

      const tireRadius = pos.isFront ? 0.38 : 0.40;
      const tireWidth = pos.isFront ? 0.29 : 0.38;

      // Tire Tread Outer Ring
      const tireGeo = new THREE.CylinderGeometry(tireRadius, tireRadius, tireWidth, 32);
      tireGeo.rotateZ(Math.PI / 2);
      const tire = new THREE.Mesh(tireGeo, this.tireRubberMat);
      tire.castShadow = true;
      rotatingAssembly.add(tire);

      // Deep Concave Rim Barrel
      const rimGeo = new THREE.CylinderGeometry(tireRadius * 0.74, tireRadius * 0.74, tireWidth * 0.96, 28);
      rimGeo.rotateZ(Math.PI / 2);
      const rim = new THREE.Mesh(rimGeo, this.rimChromeMat);
      rotatingAssembly.add(rim);

      // 5-Y Twin Spoke Centers
      for (let s = 0; s < 5; s++) {
        const spokeGeo = new THREE.BoxGeometry(tireWidth * 0.98, tireRadius * 0.70, 0.038);
        const spoke = new THREE.Mesh(spokeGeo, this.rimChromeMat);
        spoke.rotation.x = (s * Math.PI * 2) / 5;
        rotatingAssembly.add(spoke);
      }

      // Center Locking Wheel Nut
      const centerNut = new THREE.Mesh(
        new THREE.CylinderGeometry(0.048, 0.048, tireWidth + 0.02, 12),
        this.accentStripeMat
      );
      centerNut.rotateZ(Math.PI / 2);
      rotatingAssembly.add(centerNut);

      // Cross-Drilled Ceramic Brake Rotor
      const rotorGeo = new THREE.CylinderGeometry(tireRadius * 0.68, tireRadius * 0.68, 0.042, 28);
      rotorGeo.rotateZ(Math.PI / 2);
      const rotor = new THREE.Mesh(rotorGeo, this.brakeRotorMat);
      wheelHolder.add(rotor);

      // Brembo Monobloc High-Performance Brake Caliper
      const caliperGeo = new THREE.BoxGeometry(0.125, tireRadius * 0.48, 0.15);
      const caliper = new THREE.Mesh(caliperGeo, this.brakeCaliperMat);
      const sign = pos.x > 0 ? 1 : -1;
      caliper.position.set(sign * -0.065, tireRadius * 0.34, 0.065);
      wheelHolder.add(caliper);

      wheelHolder.add(rotatingAssembly);
      this.group.add(wheelHolder);

      this.wheels.push(rotatingAssembly);
      if (pos.isFront) {
        this.frontWheelsGroup.push(wheelHolder);
      }
    }

    // ==========================================
    // 7. ADVANCED LED LIGHTING ARCHITECTURE
    // ==========================================
    // Front Triple LED Projector Headlights & Angel-Wing DRLs
    for (const side of [-1, 1]) {
      const headHousingGeo = new THREE.BoxGeometry(0.44, 0.1, 0.3);
      const headHousing = new THREE.Mesh(headHousingGeo, this.carbonFiberMat);
      headHousing.position.set(side * 0.74, 0.46, 2.1);
      headHousing.rotation.y = side * -0.3;
      this.group.add(headHousing);

      // Dynamic DRL Razor Strip
      const drlGeo = new THREE.BoxGeometry(0.40, 0.035, 0.07);
      const drl = new THREE.Mesh(drlGeo, this.ledHeadlightMat);
      drl.position.set(side * 0.74, 0.49, 2.2);
      drl.rotation.y = side * -0.3;
      this.group.add(drl);

      // Triple projector optics
      for (let p = -1; p <= 1; p++) {
        const lensGeo = new THREE.SphereGeometry(0.046, 14, 14);
        const lens = new THREE.Mesh(lensGeo, this.ledHeadlightMat);
        lens.position.set(side * (0.66 + p * 0.09), 0.44, 2.16);
        this.headlightsGlow.add(lens);
      }
    }
    this.group.add(this.headlightsGlow);

    // Continuous Full-Width Rear Cyber Neon Lightbar
    const taillightBarGeo = new THREE.BoxGeometry(1.92, 0.065, 0.08);
    const taillightBar = new THREE.Mesh(taillightBarGeo, this.ledTaillightMat);
    taillightBar.position.set(0, 0.65, -2.22);
    this.group.add(taillightBar);

    // Lower Rear Fog and Reverse Strips
    for (const side of [-1, 1]) {
      const markerGeo = new THREE.BoxGeometry(0.26, 0.045, 0.04);
      const marker = new THREE.Mesh(markerGeo, this.ledTaillightMat);
      marker.position.set(side * 0.68, 0.38, -2.25);
      this.group.add(marker);
    }

    // ==========================================
    // 8. TITANIUM QUAD EXHAUST WITH HEAT TINT
    // ==========================================
    for (const side of [-0.32, -0.16, 0.16, 0.32]) {
      const exhaustGeo = new THREE.CylinderGeometry(0.068, 0.068, 0.28, 18);
      exhaustGeo.rotateX(Math.PI / 2);
      const exhaust = new THREE.Mesh(exhaustGeo, this.exhaustHeatMat);
      exhaust.position.set(side, 0.44, -2.24);
      this.group.add(exhaust);

      // Internal flame nozzle
      const nozzleGeo = new THREE.CylinderGeometry(0.046, 0.046, 0.08, 14);
      nozzleGeo.rotateX(Math.PI / 2);
      const nozzle = new THREE.Mesh(nozzleGeo, this.accentStripeMat);
      nozzle.position.set(side, 0.44, -2.30);
      this.group.add(nozzle);
    }

    // ==========================================
    // 9. HIGH-DOWNFORCE CARBON FIBER SWAN-NECK GT WING
    // ==========================================
    this.rearSpoiler.position.set(0, 0.84, -1.98);

    // Swan-Neck Top-Mount Carbon Pylons
    for (const side of [-0.64, 0.64]) {
      const pylonGeo = new THREE.BoxGeometry(0.04, 0.42, 0.24);
      const pylon = new THREE.Mesh(pylonGeo, this.carbonFiberMat);
      pylon.position.set(side, 0.18, 0);
      pylon.rotation.x = 0.35;
      this.rearSpoiler.add(pylon);
    }

    // 3D Airfoil Wing Main Element
    const wingGeo = new THREE.BoxGeometry(2.18, 0.065, 0.46);
    const wing = new THREE.Mesh(wingGeo, this.carbonFiberMat);
    wing.position.set(0, 0.38, -0.08);
    wing.rotation.x = -0.14; // Downforce angle of attack
    wing.castShadow = true;
    this.rearSpoiler.add(wing);

    // Aerodynamic Wing Endplates
    for (const side of [-1, 1]) {
      const endplateGeo = new THREE.BoxGeometry(0.04, 0.28, 0.5);
      const endplate = new THREE.Mesh(endplateGeo, this.carPaintMat);
      endplate.position.set(side * 1.1, 0.38, -0.08);
      this.rearSpoiler.add(endplate);
    }

    this.group.add(this.rearSpoiler);
  }

  public setDoorOpen(open: boolean | number) {
    if (typeof open === 'boolean') {
      this.targetDoorOpen = open ? 1.0 : 0.0;
    } else {
      this.targetDoorOpen = THREE.MathUtils.clamp(open, 0, 1);
    }
  }

  public setSteeringAngle(angle: number) {
    this.steeringAngle = THREE.MathUtils.clamp(angle, -0.55, 0.55);
    for (const frontWheel of this.frontWheelsGroup) {
      frontWheel.rotation.y = this.steeringAngle;
    }
  }

  public setNitroActive(active: boolean) {
    this.nitroActive = active;
  }

  /**
   * Complete overhaul of colors, textures, and finishes based on selected EVA theme
   */
  public updatePalette(unit: EvaUnitId) {
    this.currentUnitId = unit;
    const p = SUPERCAR_PALETTES[unit] || SUPERCAR_PALETTES['unit-01'];

    // Body Paint
    this.carPaintMat.color.setHex(p.bodyColor);
    this.carPaintMat.metalness = p.bodyMetalness;
    this.carPaintMat.roughness = p.bodyRoughness;
    this.carPaintMat.clearcoat = p.bodyClearcoat;

    // Accents & Stripes
    this.accentStripeMat.color.setHex(p.accentColor);
    this.brakeCaliperMat.color.setHex(p.caliperColor);

    // Wheels
    this.rimChromeMat.color.setHex(p.wheelFinish);
    this.rimChromeMat.metalness = p.wheelMetalness;

    // Lights
    this.underglowLight.color.setHex(p.underglowColor);
    this.exhaustGlow.color.setHex(p.exhaustColor);

    // Cockpit
    this.interiorLeatherMat.color.setHex(0x121418);
  }

  public update(delta: number, elapsed: number, syncRate: number = 80) {
    // 1. Smooth Dihedral / Scissor Door articulation
    if (Math.abs(this.doorOpenAmount - this.targetDoorOpen) > 0.001) {
      this.doorOpenAmount = THREE.MathUtils.damp(this.doorOpenAmount, this.targetDoorOpen, 8.0, delta);

      const openAngle = this.doorOpenAmount * 0.95;
      this.leftDoor.rotation.y = this.doorOpenAmount * 0.35;
      this.leftDoor.rotation.x = -openAngle;
      this.leftDoor.rotation.z = -this.doorOpenAmount * 0.45;

      this.rightDoor.rotation.y = -this.doorOpenAmount * 0.35;
      this.rightDoor.rotation.x = -openAngle;
      this.rightDoor.rotation.z = this.doorOpenAmount * 0.45;
    }

    // 2. High-speed wheel spin & engine vibration
    if (this.isEngineRunning) {
      const speed = 4.0 + (syncRate / 100.0) * 8.0;
      this.wheelRotation += delta * speed;
      for (const wheel of this.wheels) {
        wheel.rotation.x = this.wheelRotation;
      }

      // Idle chassis purr / vibration
      const idleVibe = Math.sin(elapsed * 34.0) * 0.002;
      this.group.position.y = idleVibe;
      this.group.rotation.x = Math.sin(elapsed * 2.2) * 0.0025;
    }

    // 3. Dynamic Underglow & Headlight breathing
    const pulse = 1.4 + Math.sin(elapsed * 4.5) * 0.35;
    this.underglowLight.intensity = pulse;

    // 4. Nitro exhaust flame pulse
    if (this.nitroActive) {
      this.exhaustGlow.intensity = 2.8 + Math.random() * 1.6;
    } else {
      this.exhaustGlow.intensity = Math.max(0.15, Math.sin(elapsed * 6.5) * 0.45);
    }
  }

  public dispose() {
    this.carPaintMat.dispose();
    this.carbonFiberMat.dispose();
    this.glassMat.dispose();
    this.tireRubberMat.dispose();
    this.rimChromeMat.dispose();
    this.brakeRotorMat.dispose();
    this.brakeCaliperMat.dispose();
    this.interiorLeatherMat.dispose();
    this.ledHeadlightMat.dispose();
    this.ledTaillightMat.dispose();
    this.exhaustHeatMat.dispose();
    this.accentStripeMat.dispose();
  }
}
