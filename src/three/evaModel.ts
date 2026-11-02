import * as THREE from 'three';
import { EvaMaterialManager } from './evaMaterials';
import { EvaPose, EvaUnitId, EvaWeapon } from '../types/eva';

export interface EvaBoneHierarchy {
  root: THREE.Group;
  torso: THREE.Group;
  chest: THREE.Group;
  neck: THREE.Group;
  head: THREE.Group;
  jaw: THREE.Group;
  core: THREE.Mesh;
  innerCore: THREE.Mesh;
  leftShoulder: THREE.Group;
  rightShoulder: THREE.Group;
  leftPylon: THREE.Group;
  rightPylon: THREE.Group;
  leftArm: THREE.Group;
  leftForearm: THREE.Group;
  leftHand: THREE.Group;
  rightArm: THREE.Group;
  rightForearm: THREE.Group;
  rightHand: THREE.Group;
  leftThigh: THREE.Group;
  leftShin: THREE.Group;
  leftFoot: THREE.Group;
  rightThigh: THREE.Group;
  rightShin: THREE.Group;
  rightFoot: THREE.Group;
  umbilicalCable: THREE.Group;
  atField: THREE.Mesh;
  halo: THREE.Mesh;
  weapons: {
    knife: THREE.Group;
    rifle: THREE.Group;
    spear: THREE.Group;
  };
  contactShadow: THREE.Mesh;
  armorPlates: THREE.Mesh[];
  hydraulicPistons: Array<{ rod: THREE.Mesh; cylinder: THREE.Mesh }>;
  thrusterPlumes: THREE.Group;
}

interface PoseTarget {
  torsoRot: [number, number, number];
  chestRot: [number, number, number];
  headRot: [number, number, number];
  jawRot: number;
  leftArmRot: [number, number, number];
  leftForearmRot: [number, number, number];
  rightArmRot: [number, number, number];
  rightForearmRot: [number, number, number];
  leftThighRot: [number, number, number];
  leftShinRot: [number, number, number];
  rightThighRot: [number, number, number];
  rightShinRot: [number, number, number];
  rootY: number;
}

const POSE_PRESETS: Record<EvaPose, PoseTarget> = {
  stand: {
    torsoRot: [0, 0, 0],
    chestRot: [0.05, 0, 0],
    headRot: [-0.05, 0, 0],
    jawRot: 0,
    leftArmRot: [0.1, 0, 0.15],
    leftForearmRot: [-0.2, 0, 0],
    rightArmRot: [0.1, 0, -0.15],
    rightForearmRot: [-0.2, 0, 0],
    leftThighRot: [-0.05, 0, -0.05],
    leftShinRot: [0.1, 0, 0],
    rightThighRot: [-0.05, 0, 0.05],
    rightShinRot: [0.1, 0, 0],
    rootY: 0,
  },
  combat: {
    torsoRot: [0.18, 0.1, 0],
    chestRot: [0.1, 0.05, 0],
    headRot: [-0.15, -0.1, 0],
    jawRot: 0.05,
    leftArmRot: [-0.65, 0.2, 0.45],
    leftForearmRot: [-1.1, 0.3, 0],
    rightArmRot: [-0.35, -0.3, -0.4],
    rightForearmRot: [-1.4, -0.4, 0],
    leftThighRot: [-0.55, 0.1, -0.15],
    leftShinRot: [0.95, 0, 0],
    rightThighRot: [0.4, -0.15, 0.2],
    rightShinRot: [0.45, 0, 0],
    rootY: -0.35,
  },
  sprint: {
    torsoRot: [0.65, 0, 0],
    chestRot: [0.15, 0, 0],
    headRot: [-0.55, 0, 0],
    jawRot: 0.15,
    leftArmRot: [-1.1, 0, 0.3],
    leftForearmRot: [-1.2, 0, 0],
    rightArmRot: [0.9, 0, -0.3],
    rightForearmRot: [-0.4, 0, 0],
    leftThighRot: [-1.1, 0, -0.1],
    leftShinRot: [1.4, 0, 0],
    rightThighRot: [0.75, 0, 0.1],
    rightShinRot: [0.35, 0, 0],
    rootY: -0.4,
  },
  berserk: {
    torsoRot: [0.4, 0, 0],
    chestRot: [0.25, 0, 0],
    headRot: [-0.6, 0, 0],
    jawRot: 0.55,
    leftArmRot: [-0.8, -0.3, 0.8],
    leftForearmRot: [-0.9, 0.4, 0],
    rightArmRot: [-0.9, 0.3, -0.8],
    rightForearmRot: [-0.9, -0.4, 0],
    leftThighRot: [-0.45, 0.2, -0.3],
    leftShinRot: [0.8, 0, 0],
    rightThighRot: [-0.3, -0.2, 0.3],
    rightShinRot: [0.75, 0, 0],
    rootY: -0.3,
  },
  atField: {
    torsoRot: [0.05, 0, 0],
    chestRot: [0.1, 0, 0],
    headRot: [-0.1, 0, 0],
    jawRot: 0.15,
    leftArmRot: [-1.25, -0.35, 0.2],
    leftForearmRot: [-0.45, 0.2, 0],
    rightArmRot: [-1.25, 0.35, -0.2],
    rightForearmRot: [-0.45, -0.2, 0],
    leftThighRot: [-0.25, 0, -0.2],
    leftShinRot: [0.45, 0, 0],
    rightThighRot: [-0.25, 0, 0.2],
    rightShinRot: [0.45, 0, 0],
    rootY: -0.15,
  },
  sniper: {
    torsoRot: [0.2, -0.4, 0],
    chestRot: [0.15, -0.2, 0],
    headRot: [-0.15, 0.55, 0],
    jawRot: 0.05,
    leftArmRot: [-1.2, 0.5, 0.35],
    leftForearmRot: [-0.85, 0.5, 0],
    rightArmRot: [-0.8, -0.5, -0.45],
    rightForearmRot: [-1.35, 0.2, 0],
    leftThighRot: [-0.7, 0.2, -0.25],
    leftShinRot: [1.2, 0, 0],
    rightThighRot: [0.35, -0.3, 0.25],
    rightShinRot: [0.6, 0, 0],
    rootY: -0.45,
  },
  knife: {
    torsoRot: [0.25, 0.2, 0],
    chestRot: [0.1, 0.1, 0],
    headRot: [-0.2, -0.25, 0],
    jawRot: 0.1,
    leftArmRot: [-0.3, 0.3, 0.5],
    leftForearmRot: [-1.3, 0.4, 0],
    rightArmRot: [-0.95, -0.2, -0.3],
    rightForearmRot: [-1.5, -0.3, 0],
    leftThighRot: [-0.5, 0.15, -0.2],
    leftShinRot: [0.9, 0, 0],
    rightThighRot: [0.3, -0.1, 0.2],
    rightShinRot: [0.5, 0, 0],
    rootY: -0.3,
  },
};

export class EvaModel {
  public group: THREE.Group;
  public bones: EvaBoneHierarchy;
  public materials: EvaMaterialManager;

  private currentPose: EvaPose = 'stand';
  private targetPose: PoseTarget = POSE_PRESETS.stand;
  private currentWeapon: EvaWeapon = 'none';

  private explodeAmount: number = 0;
  private targetExplodeAmount: number = 0;

  private armorOffsets: Map<THREE.Mesh, THREE.Vector3> = new Map();
  private basePositions: Map<THREE.Mesh, THREE.Vector3> = new Map();

  constructor(materials: EvaMaterialManager) {
    this.materials = materials;
    this.group = new THREE.Group();
    this.group.name = 'EVA_UNIT_INTRICATE';

    this.bones = this.buildHierarchy();
    this.group.add(this.bones.root);

    this.setPose('stand', true);
  }

  private buildHierarchy(): EvaBoneHierarchy {
    const root = new THREE.Group();
    root.name = 'Eva_Root';

    const armorPlates: THREE.Mesh[] = [];
    const hydraulicPistons: Array<{ rod: THREE.Mesh; cylinder: THREE.Mesh }> = [];

    const registerArmor = (mesh: THREE.Mesh, explodeDir: THREE.Vector3) => {
      armorPlates.push(mesh);
      this.armorOffsets.set(mesh, explodeDir);
      this.basePositions.set(mesh, mesh.position.clone());
    };

    // Helper: Precision Chrome Hydraulic Piston Assembly
    const createPiston = (length = 0.6, radius = 0.038) => {
      const group = new THREE.Group();
      // Outer Titanium Cylinder
      const cylGeo = new THREE.CylinderGeometry(radius * 1.35, radius * 1.35, length * 0.55, 16);
      cylGeo.translate(0, length * 0.275, 0);
      const cylMesh = new THREE.Mesh(cylGeo, this.materials.anodizedTitaniumMat);
      group.add(cylMesh);

      // Gold Locking Collar
      const collarGeo = new THREE.CylinderGeometry(radius * 1.5, radius * 1.5, length * 0.08, 16);
      collarGeo.translate(0, length * 0.52, 0);
      const collarMesh = new THREE.Mesh(collarGeo, this.materials.goldHydraulicMat);
      group.add(collarMesh);

      // Mirror Chrome Rod
      const rodGeo = new THREE.CylinderGeometry(radius * 0.78, radius * 0.78, length * 0.62, 16);
      rodGeo.translate(0, length * 0.6, 0);
      const rodMesh = new THREE.Mesh(rodGeo, this.materials.chromePistonMat);
      group.add(rodMesh);

      // End Swivel Eyelet
      const eyeletGeo = new THREE.TorusGeometry(radius * 1.2, radius * 0.35, 8, 16);
      eyeletGeo.translate(0, length * 0.9, 0);
      const eyelet = new THREE.Mesh(eyeletGeo, this.materials.anodizedTitaniumMat);
      group.add(eyelet);

      hydraulicPistons.push({ rod: rodMesh, cylinder: cylMesh });
      return group;
    };

    // ==========================================
    // 1. PELVIS & LOWER ABDOMEN
    // ==========================================
    const pelvis = new THREE.Group();
    pelvis.position.y = 5.2;
    root.add(pelvis);

    // Titanium Pelvic Core Chassis
    const pelvisChassisGeo = new THREE.CylinderGeometry(0.56, 0.44, 0.68, 10);
    const pelvisChassis = new THREE.Mesh(pelvisChassisGeo, this.materials.biomechFrameMat);
    pelvisChassis.castShadow = true;
    pelvis.add(pelvisChassis);

    // Synthetic Bio-Muscle Hip Under-wraps
    const hipMuscleGeo = new THREE.CylinderGeometry(0.52, 0.46, 0.55, 10);
    const hipMuscle = new THREE.Mesh(hipMuscleGeo, this.materials.bioMuscleMat);
    pelvis.add(hipMuscle);

    // Groin Armor Plate (Multi-faceted triangular strike plate)
    const groinShape = new THREE.Shape();
    groinShape.moveTo(0, 0.38);
    groinShape.lineTo(0.26, 0.12);
    groinShape.lineTo(0.14, -0.42);
    groinShape.lineTo(-0.14, -0.42);
    groinShape.lineTo(-0.26, 0.12);
    groinShape.closePath();
    const groinGeo = new THREE.ExtrudeGeometry(groinShape, { depth: 0.24, bevelEnabled: true, bevelSize: 0.03, bevelThickness: 0.03 });
    groinGeo.center();
    groinGeo.translate(0, -0.05, 0.38);
    const groinMesh = new THREE.Mesh(groinGeo, this.materials.primaryArmorMat);
    groinMesh.castShadow = true;
    pelvis.add(groinMesh);
    registerArmor(groinMesh, new THREE.Vector3(0, 0, 0.6));

    // Groin Hazard Chevrons Inlay
    const chevronGeo = new THREE.BoxGeometry(0.16, 0.06, 0.05);
    chevronGeo.translate(0, 0.02, 0.52);
    const chevron = new THREE.Mesh(chevronGeo, this.materials.accentGreenMat);
    pelvis.add(chevron);

    // Lateral Hip Vector Thruster Pods
    for (let side = -1; side <= 1; side += 2) {
      const podGeo = new THREE.BoxGeometry(0.18, 0.32, 0.28);
      podGeo.translate(side * 0.45, -0.05, -0.15);
      const pod = new THREE.Mesh(podGeo, this.materials.secondaryArmorMat);
      pelvis.add(pod);

      // Louvered cooling exhaust slits
      for (let s = 0; s < 3; s++) {
        const slitGeo = new THREE.BoxGeometry(0.02, 0.04, 0.2);
        slitGeo.translate(side * 0.54, -0.12 + s * 0.08, -0.15);
        const slit = new THREE.Mesh(slitGeo, this.materials.anodizedTitaniumMat);
        pelvis.add(slit);
      }
    }

    // ==========================================
    // 2. TORSO (BIOMECHANICAL VERTEBRAE & RIBS)
    // ==========================================
    const torso = new THREE.Group();
    torso.position.y = 0.45;
    pelvis.add(torso);

    // Segmented Vertebrae Column (6 Articulated Titanium Spinal Blocks)
    for (let i = 0; i < 6; i++) {
      const vertGeo = new THREE.BoxGeometry(0.48 - i * 0.025, 0.15, 0.4);
      vertGeo.translate(0, 0.1 + i * 0.16, -0.07);
      const vertMesh = new THREE.Mesh(vertGeo, this.materials.biomechFrameMat);
      vertMesh.castShadow = true;
      torso.add(vertMesh);

      // Intervertebral gold shock absorber discs
      const discGeo = new THREE.CylinderGeometry(0.15, 0.15, 0.035, 10);
      discGeo.translate(0, 0.03 + i * 0.16, -0.07);
      const discMesh = new THREE.Mesh(discGeo, this.materials.goldHydraulicMat);
      torso.add(discMesh);

      // Dual Lumbar Hydraulic Dampeners
      for (let side = -1; side <= 1; side += 2) {
        const dampGeo = new THREE.CylinderGeometry(0.028, 0.028, 0.14, 8);
        dampGeo.translate(side * 0.18, 0.1 + i * 0.16, -0.28);
        const dampMesh = new THREE.Mesh(dampGeo, this.materials.accentGreenMat);
        torso.add(dampMesh);
      }
    }

    // Abdominal Armor Carapace (6 Segmented Bio-Plates)
    for (let r = 0; r < 3; r++) {
      for (let side = -1; side <= 1; side += 2) {
        const ribShape = new THREE.Shape();
        ribShape.moveTo(0, 0);
        ribShape.lineTo(0.24, 0.04);
        ribShape.lineTo(0.22, 0.15);
        ribShape.lineTo(0, 0.13);
        ribShape.closePath();
        const ribGeo = new THREE.ExtrudeGeometry(ribShape, { depth: 0.14, bevelEnabled: true, bevelSize: 0.02 });
        ribGeo.center();
        ribGeo.rotateY(side * 0.22);
        ribGeo.translate(side * 0.2, 0.2 + r * 0.22, 0.3);
        const ribMesh = new THREE.Mesh(ribGeo, this.materials.secondaryArmorMat);
        ribMesh.castShadow = true;
        torso.add(ribMesh);
        registerArmor(ribMesh, new THREE.Vector3(side * 0.35, 0, 0.48));
      }
    }

    // ==========================================
    // 3. CHEST (UPPER CARAPACE & S2 REACTOR)
    // ==========================================
    const chest = new THREE.Group();
    chest.position.y = 0.95;
    torso.add(chest);

    // Inner Thoracic Titanium Frame
    const chestFrameGeo = new THREE.CylinderGeometry(0.92, 0.68, 0.98, 10);
    chestFrameGeo.scale(1.15, 1, 0.85);
    const chestFrame = new THREE.Mesh(chestFrameGeo, this.materials.biomechFrameMat);
    chestFrame.castShadow = true;
    chest.add(chestFrame);

    // Upper Pectoral Armor Carapace
    const buildPectoral = (isLeft: boolean) => {
      const pecShape = new THREE.Shape();
      pecShape.moveTo(0, -0.32);
      pecShape.lineTo(0.5, -0.16);
      pecShape.lineTo(0.44, 0.44);
      pecShape.lineTo(0.06, 0.5);
      pecShape.lineTo(-0.02, 0.22);
      pecShape.closePath();
      const pecGeo = new THREE.ExtrudeGeometry(pecShape, { depth: 0.22, bevelEnabled: true, bevelSize: 0.035, bevelThickness: 0.035 });
      pecGeo.center();
      pecGeo.rotateY(isLeft ? 0.22 : -0.22);
      pecGeo.translate(isLeft ? -0.38 : 0.38, 0.16, 0.4);
      const pecMesh = new THREE.Mesh(pecGeo, this.materials.primaryArmorMat);
      pecMesh.castShadow = true;
      pecMesh.receiveShadow = true;
      chest.add(pecMesh);
      registerArmor(pecMesh, new THREE.Vector3(isLeft ? -0.48 : 0.48, 0.25, 0.65));

      // Heat Radiator Mesh Intake Vent
      const ventGeo = new THREE.BoxGeometry(0.3, 0.075, 0.06);
      ventGeo.translate(isLeft ? -0.36 : 0.36, 0.34, 0.52);
      const ventMesh = new THREE.Mesh(ventGeo, this.materials.accentGreenMat);
      chest.add(ventMesh);

      // Micro Heat Dissipation Fins
      for (let f = 0; f < 4; f++) {
        const finGeo = new THREE.BoxGeometry(0.018, 0.055, 0.04);
        finGeo.translate((isLeft ? -0.45 : 0.27) + f * 0.06, 0.34, 0.54);
        const fin = new THREE.Mesh(finGeo, this.materials.anodizedTitaniumMat);
        chest.add(fin);
      }
    };
    buildPectoral(true);
    buildPectoral(false);

    // S2 ENGINE JEWEL CORE (Multi-Layer Quantum Reactor)
    // 1. Outer Refractive Crystal Shell
    const coreGeo = new THREE.SphereGeometry(0.21, 32, 32);
    coreGeo.scale(1, 1, 0.68);
    coreGeo.translate(0, -0.06, 0.4);
    const coreMesh = new THREE.Mesh(coreGeo, this.materials.coreJewelMat);
    chest.add(coreMesh);

    // 2. Inner Pulsing Icosahedron Crystal Seed
    const innerCoreGeo = new THREE.IcosahedronGeometry(0.13, 1);
    innerCoreGeo.translate(0, -0.06, 0.4);
    const innerCoreMat = new THREE.MeshBasicMaterial({ color: 0xff3344, wireframe: true, blending: THREE.AdditiveBlending });
    const innerCore = new THREE.Mesh(innerCoreGeo, innerCoreMat);
    chest.add(innerCore);

    // 3. Dual Concentric Titanium Containment Gimbal Ring with 8 Locking Bolts
    const coreRingGeo = new THREE.TorusGeometry(0.23, 0.038, 12, 32);
    coreRingGeo.translate(0, -0.06, 0.4);
    const coreRing = new THREE.Mesh(coreRingGeo, this.materials.anodizedTitaniumMat);
    chest.add(coreRing);

    for (let b = 0; b < 8; b++) {
      const angle = (b * Math.PI) / 4;
      const boltGeo = new THREE.CylinderGeometry(0.018, 0.018, 0.04, 6);
      boltGeo.rotateX(Math.PI / 2);
      boltGeo.translate(0.23 * Math.cos(angle), -0.06 + 0.23 * Math.sin(angle), 0.42);
      const bolt = new THREE.Mesh(boltGeo, this.materials.goldHydraulicMat);
      chest.add(bolt);
    }

    // Rear Umbilical Bayonet Socket
    const umbilicalSocketGeo = new THREE.CylinderGeometry(0.24, 0.28, 0.24, 12);
    umbilicalSocketGeo.rotateX(Math.PI / 2);
    umbilicalSocketGeo.translate(0, 0.16, -0.46);
    const umbilicalSocket = new THREE.Mesh(umbilicalSocketGeo, this.materials.anodizedTitaniumMat);
    chest.add(umbilicalSocket);

    // Internal Copper Contact Pins
    for (let p = 0; p < 4; p++) {
      const pAngle = (p * Math.PI) / 2;
      const pinGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.1, 8);
      pinGeo.rotateX(Math.PI / 2);
      pinGeo.translate(0.1 * Math.cos(pAngle), 0.16 + 0.1 * Math.sin(pAngle), -0.52);
      const pin = new THREE.Mesh(pinGeo, this.materials.goldHydraulicMat);
      chest.add(pin);
    }

    // ==========================================
    // 4. NECK & HIGH-DETAIL SCULPTURED HELMET
    // ==========================================
    const neck = new THREE.Group();
    neck.position.set(0, 0.62, 0.06);
    chest.add(neck);

    // 5 Interlocking Cervical Vertebrae
    for (let c = 0; c < 5; c++) {
      const cGeo = new THREE.CylinderGeometry(0.2 - c * 0.01, 0.22 - c * 0.01, 0.075, 12);
      cGeo.translate(0, c * 0.075, 0);
      const cMesh = new THREE.Mesh(cGeo, this.materials.biomechFrameMat);
      neck.add(cMesh);
    }

    // Bilateral Synthetic Muscle Cords & Shock Absorber Pistons
    for (let side = -1; side <= 1; side += 2) {
      const neckPiston = createPiston(0.32, 0.016);
      neckPiston.position.set(side * 0.15, 0.08, -0.04);
      neckPiston.rotation.set(-0.2, 0, side * 0.2);
      neck.add(neckPiston);

      const cordGeo = new THREE.CylinderGeometry(0.042, 0.035, 0.34, 8);
      cordGeo.rotateZ(side * 0.25);
      cordGeo.translate(side * 0.14, 0.16, 0.05);
      const cord = new THREE.Mesh(cordGeo, this.materials.bioMuscleMat);
      neck.add(cord);
    }

    const head = new THREE.Group();
    head.position.set(0, 0.36, 0.06);
    neck.add(head);

    // Multi-Piece Sculptured Cranial Shell
    const skullShape = new THREE.Shape();
    skullShape.moveTo(0, 0.48);
    skullShape.lineTo(0.26, 0.32);
    skullShape.lineTo(0.24, -0.06);
    skullShape.lineTo(0.13, -0.24);
    skullShape.lineTo(-0.13, -0.24);
    skullShape.lineTo(-0.24, -0.06);
    skullShape.lineTo(-0.26, 0.32);
    skullShape.closePath();
    const skullGeo = new THREE.ExtrudeGeometry(skullShape, { depth: 0.52, bevelEnabled: true, bevelSize: 0.038, bevelThickness: 0.038 });
    skullGeo.center();
    skullGeo.rotateX(0.25);
    skullGeo.translate(0, 0.18, -0.08);
    const skullMesh = new THREE.Mesh(skullGeo, this.materials.primaryArmorMat);
    skullMesh.castShadow = true;
    head.add(skullMesh);

    // Cheek Cowling Air Intakes (Left & Right)
    for (let side = -1; side <= 1; side += 2) {
      const intakeGeo = new THREE.BoxGeometry(0.08, 0.16, 0.22);
      intakeGeo.rotateZ(side * 0.15);
      intakeGeo.translate(side * 0.22, 0.05, 0.12);
      const intake = new THREE.Mesh(intakeGeo, this.materials.secondaryArmorMat);
      head.add(intake);
    }

    // Forehead Titanium Crown Brow
    const browGeo = new THREE.BoxGeometry(0.4, 0.18, 0.26);
    browGeo.translate(0, 0.24, 0.14);
    const browMesh = new THREE.Mesh(browGeo, this.materials.secondaryArmorMat);
    head.add(browMesh);

    // Forward Horn / Crest with Titanium Root Socket & Antenna Needle
    const hornGroup = new THREE.Group();
    const hornShape = new THREE.Shape();
    hornShape.moveTo(0, 0);
    hornShape.lineTo(0.048, 0.12);
    hornShape.lineTo(0.024, 0.82);
    hornShape.lineTo(0, 0.9);
    hornShape.lineTo(-0.024, 0.82);
    hornShape.lineTo(-0.048, 0.12);
    hornShape.closePath();
    const hornGeo = new THREE.ExtrudeGeometry(hornShape, { depth: 0.065, bevelEnabled: true, bevelSize: 0.016, bevelThickness: 0.016 });
    hornGeo.center();
    hornGeo.rotateX(-0.35);
    hornGeo.translate(0, 0.68, 0.2);
    const hornMesh = new THREE.Mesh(hornGeo, this.materials.accentGreenMat);
    hornMesh.castShadow = true;
    hornGroup.add(hornMesh);

    // Stepped Titanium Root Socket
    const hornBaseGeo = new THREE.BoxGeometry(0.15, 0.14, 0.15);
    hornBaseGeo.translate(0, 0.34, 0.14);
    const hornBase = new THREE.Mesh(hornBaseGeo, this.materials.anodizedTitaniumMat);
    hornGroup.add(hornBase);

    // Secondary VHF Antenna Needle
    const needleGeo = new THREE.CylinderGeometry(0.008, 0.015, 0.35, 6);
    needleGeo.rotateX(-0.5);
    needleGeo.translate(0, 0.88, 0.1);
    const needle = new THREE.Mesh(needleGeo, this.materials.chromePistonMat);
    hornGroup.add(needle);
    head.add(hornGroup);

    // Dual Optical Eyes with Compound Diode Prisms & Sapphire Lenses
    const eyeGeo = new THREE.BoxGeometry(0.12, 0.048, 0.065);
    for (let side = -1; side <= 1; side += 2) {
      const eyeMesh = new THREE.Mesh(eyeGeo, this.materials.visorGlowMat);
      eyeMesh.position.set(side * 0.13, 0.14, 0.25);
      eyeMesh.rotation.set(-0.1, -side * 0.35, side * 0.15);
      head.add(eyeMesh);

      const lensMesh = new THREE.Mesh(eyeGeo, this.materials.opticLensMat);
      lensMesh.position.set(side * 0.13, 0.14, 0.26);
      lensMesh.rotation.set(-0.1, -side * 0.35, side * 0.15);
      head.add(lensMesh);
    }

    // Articulated Mandible / Jaw with Teeth & Dual Chrome Actuators
    const jaw = new THREE.Group();
    jaw.position.set(0, 0.02, 0.08);
    head.add(jaw);

    const jawShape = new THREE.Shape();
    jawShape.moveTo(0, -0.3);
    jawShape.lineTo(0.15, -0.24);
    jawShape.lineTo(0.17, 0.06);
    jawShape.lineTo(-0.17, 0.06);
    jawShape.lineTo(-0.15, -0.24);
    jawShape.closePath();
    const jawGeo = new THREE.ExtrudeGeometry(jawShape, { depth: 0.32, bevelEnabled: true, bevelSize: 0.022 });
    jawGeo.center();
    jawGeo.translate(0, -0.1, 0.09);
    const jawMesh = new THREE.Mesh(jawGeo, this.materials.primaryArmorMat);
    jawMesh.castShadow = true;
    jaw.add(jawMesh);

    // Titanium Teeth Rows
    const teethGeo = new THREE.BoxGeometry(0.2, 0.055, 0.13);
    teethGeo.translate(0, -0.04, 0.22);
    const teethMesh = new THREE.Mesh(teethGeo, this.materials.anodizedTitaniumMat);
    jaw.add(teethMesh);

    // Dual Jaw Chrome Hydraulic Pistons
    for (let side = -1; side <= 1; side += 2) {
      const jawPiston = createPiston(0.22, 0.018);
      jawPiston.position.set(side * 0.17, 0, 0);
      jawPiston.rotation.set(0.3, 0, side * 0.2);
      head.add(jawPiston);
    }

    // ==========================================
    // 5. SHOULDER PYLONS (WEAPON RACKS & VORTEX FINS)
    // ==========================================
    const leftShoulder = new THREE.Group();
    leftShoulder.position.set(-0.76, 0.32, 0);
    chest.add(leftShoulder);

    const rightShoulder = new THREE.Group();
    rightShoulder.position.set(0.76, 0.32, 0);
    chest.add(rightShoulder);

    const createIntricatePylon = (isLeft: boolean) => {
      const pylonGroup = new THREE.Group();
      pylonGroup.name = isLeft ? 'Left_Pylon' : 'Right_Pylon';

      // Outer Composite Aero Fin
      const shape = new THREE.Shape();
      shape.moveTo(0, -0.48);
      shape.lineTo(0.4, -0.34);
      shape.lineTo(0.5, 1.0);
      shape.lineTo(0.12, 1.3);
      shape.lineTo(-0.3, 0.85);
      shape.lineTo(-0.25, -0.34);
      shape.closePath();

      const pylonGeo = new THREE.ExtrudeGeometry(shape, {
        depth: 0.24,
        bevelEnabled: true,
        bevelSegments: 2,
        bevelSize: 0.026,
        bevelThickness: 0.026,
      });
      pylonGeo.center();

      const pylonMesh = new THREE.Mesh(pylonGeo, this.materials.pylonDecalMat);
      pylonMesh.castShadow = true;
      pylonMesh.receiveShadow = true;
      pylonGroup.add(pylonMesh);
      registerArmor(pylonMesh, new THREE.Vector3(isLeft ? -0.58 : 0.58, 0.38, 0));

      // Titanium Structural Backbone Rail
      const backboneGeo = new THREE.BoxGeometry(0.11, 1.4, 0.09);
      backboneGeo.translate(0, 0.32, 0.13);
      const backbone = new THREE.Mesh(backboneGeo, this.materials.anodizedTitaniumMat);
      pylonGroup.add(backbone);

      // Top Sensor Antenna Needle
      const antGeo = new THREE.CylinderGeometry(0.016, 0.038, 0.48, 8);
      antGeo.translate(0, 0.82, -0.07);
      const antMesh = new THREE.Mesh(antGeo, this.materials.accentGreenMat);
      pylonGroup.add(antMesh);

      // Progressive Knife Ejection Latch
      const latchGeo = new THREE.BoxGeometry(0.2, 0.055, 0.26);
      latchGeo.translate(0, 0.1, 0);
      const latchMesh = new THREE.Mesh(latchGeo, this.materials.goldHydraulicMat);
      pylonGroup.add(latchMesh);

      // Rear Heat Radiator Louvers (5 Micro Titanium Cooling Fins)
      for (let f = 0; f < 5; f++) {
        const finGeo = new THREE.BoxGeometry(0.08, 0.02, 0.18);
        finGeo.translate(0, 0.3 + f * 0.08, -0.14);
        const fin = new THREE.Mesh(finGeo, this.materials.anodizedTitaniumMat);
        pylonGroup.add(fin);
      }

      pylonGroup.position.set(isLeft ? -0.25 : 0.25, 0.5, 0);
      pylonGroup.rotation.y = isLeft ? -0.08 : 0.08;
      return pylonGroup;
    };

    const leftPylon = createIntricatePylon(true);
    leftShoulder.add(leftPylon);

    const rightPylon = createIntricatePylon(false);
    rightShoulder.add(rightPylon);

    // ==========================================
    // 6. ARMS, HYDRAULIC ELBOW & 5-FINGER HANDS
    // ==========================================
    const buildIntricateArm = (isLeft: boolean) => {
      const armGroup = new THREE.Group();
      armGroup.position.set(isLeft ? -0.16 : 0.16, -0.1, 0);

      // Spherical Shoulder Pauldron
      const pauldronGeo = new THREE.SphereGeometry(0.27, 20, 20);
      const pauldronMesh = new THREE.Mesh(pauldronGeo, this.materials.primaryArmorMat);
      pauldronMesh.castShadow = true;
      armGroup.add(pauldronMesh);

      // Bicep Titanium Armature
      const bicepChassisGeo = new THREE.CylinderGeometry(0.14, 0.12, 0.82, 12);
      bicepChassisGeo.translate(0, -0.44, 0);
      const bicepChassis = new THREE.Mesh(bicepChassisGeo, this.materials.biomechFrameMat);
      armGroup.add(bicepChassis);

      // Synthetic Bio-Muscle Fiber Sleeves
      const bicepMuscleGeo = new THREE.CylinderGeometry(0.15, 0.13, 0.68, 12);
      bicepMuscleGeo.translate(0, -0.44, 0);
      const bicepMuscle = new THREE.Mesh(bicepMuscleGeo, this.materials.bioMuscleMat);
      bicepMuscle.castShadow = true;
      armGroup.add(bicepMuscle);

      // Bicep Dual Hydraulic Actuator Rams (Chrome rods)
      for (let side = -1; side <= 1; side += 2) {
        const bicepPiston = createPiston(0.38, 0.02);
        bicepPiston.position.set(side * 0.11, -0.25, 0.06);
        armGroup.add(bicepPiston);
      }

      // Forearm Group (Elbow Hinge)
      const forearm = new THREE.Group();
      forearm.position.set(0, -0.85, 0);
      armGroup.add(forearm);

      // Dual-Rotor Titanium Elbow Joint
      const elbowJointGeo = new THREE.CylinderGeometry(0.15, 0.15, 0.3, 16);
      elbowJointGeo.rotateZ(Math.PI / 2);
      const elbowJoint = new THREE.Mesh(elbowJointGeo, this.materials.anodizedTitaniumMat);
      forearm.add(elbowJoint);

      // Central Axle Bolt
      const axleGeo = new THREE.CylinderGeometry(0.06, 0.06, 0.34, 12);
      axleGeo.rotateZ(Math.PI / 2);
      const axle = new THREE.Mesh(axleGeo, this.materials.chromePistonMat);
      forearm.add(axle);

      // Elbow Heavy Shock Piston
      const elbowPiston = createPiston(0.48, 0.024);
      elbowPiston.position.set(0, 0.16, -0.13);
      elbowPiston.rotation.x = -0.25;
      forearm.add(elbowPiston);

      // Forearm Angular Ballistic Armor Cuff
      const forearmArmorGeo = new THREE.CylinderGeometry(0.19, 0.15, 0.9, 8);
      forearmArmorGeo.translate(0, -0.48, 0);
      const forearmMesh = new THREE.Mesh(forearmArmorGeo, this.materials.primaryArmorMat);
      forearmMesh.castShadow = true;
      forearm.add(forearmMesh);
      registerArmor(forearmMesh, new THREE.Vector3(isLeft ? -0.38 : 0.38, 0, 0.28));

      // Neon Green Power Busbar Conduit
      const stripGeo = new THREE.BoxGeometry(0.065, 0.68, 0.045);
      stripGeo.translate(0, -0.48, 0.17);
      const stripMesh = new THREE.Mesh(stripGeo, this.materials.accentGreenMat);
      forearm.add(stripMesh);

      // Hand / Wrist
      const hand = new THREE.Group();
      hand.position.set(0, -0.95, 0);
      forearm.add(hand);

      // Wrist Rotator Gimbal
      const wristGeo = new THREE.CylinderGeometry(0.11, 0.11, 0.11, 12);
      const wristMesh = new THREE.Mesh(wristGeo, this.materials.anodizedTitaniumMat);
      hand.add(wristMesh);

      // Palm Carapace
      const palmGeo = new THREE.BoxGeometry(0.18, 0.23, 0.12);
      palmGeo.translate(0, -0.11, 0);
      const palmMesh = new THREE.Mesh(palmGeo, this.materials.secondaryArmorMat);
      palmMesh.castShadow = true;
      hand.add(palmMesh);

      // Articulated 5-Finger Cybernetic Hand (Thumb + Index, Middle, Ring, Pinky)
      for (let f = 0; f < 4; f++) {
        const fingerGroup = new THREE.Group();
        fingerGroup.position.set(-0.065 + f * 0.043, -0.22, 0.035);

        // Proximal segment
        const proxGeo = new THREE.BoxGeometry(0.038, 0.13, 0.048);
        proxGeo.translate(0, -0.065, 0);
        const prox = new THREE.Mesh(proxGeo, this.materials.anodizedTitaniumMat);
        fingerGroup.add(prox);

        // Distal claw / strike knuckle
        const distGeo = new THREE.ConeGeometry(0.024, 0.11, 6);
        distGeo.rotateX(Math.PI);
        distGeo.translate(0, -0.17, 0);
        const dist = new THREE.Mesh(distGeo, this.materials.chromePistonMat);
        fingerGroup.add(dist);

        hand.add(fingerGroup);
      }

      // Opposing Articulated Thumb
      const thumbGroup = new THREE.Group();
      thumbGroup.position.set(isLeft ? 0.095 : -0.095, -0.15, 0.045);
      thumbGroup.rotation.z = isLeft ? 0.45 : -0.45;
      const thumbProx = new THREE.Mesh(new THREE.BoxGeometry(0.045, 0.11, 0.045), this.materials.anodizedTitaniumMat);
      thumbProx.position.y = -0.055;
      thumbGroup.add(thumbProx);
      const thumbDist = new THREE.Mesh(new THREE.ConeGeometry(0.025, 0.1, 6), this.materials.chromePistonMat);
      thumbDist.rotation.x = Math.PI;
      thumbDist.position.y = -0.15;
      thumbGroup.add(thumbDist);
      hand.add(thumbGroup);

      return { armGroup, forearm, hand };
    };

    const leftArmComponents = buildIntricateArm(true);
    leftShoulder.add(leftArmComponents.armGroup);

    const rightArmComponents = buildIntricateArm(false);
    rightShoulder.add(rightArmComponents.armGroup);

    // ==========================================
    // 7. LEGS, KNEES & TWIN VECTOR THRUSTERS
    // ==========================================
    const buildIntricateLeg = (isLeft: boolean) => {
      const thigh = new THREE.Group();
      thigh.position.set(isLeft ? -0.45 : 0.45, -0.25, 0);

      // Spherical Gimbal Hip Joint
      const hipJointGeo = new THREE.SphereGeometry(0.23, 16, 16);
      const hipJoint = new THREE.Mesh(hipJointGeo, this.materials.anodizedTitaniumMat);
      thigh.add(hipJoint);

      // Hip Hydraulic Stabilizer Strut
      const hipStrut = createPiston(0.35, 0.022);
      hipStrut.position.set(isLeft ? -0.12 : 0.12, 0.05, 0.1);
      thigh.add(hipStrut);

      // Thigh Bio-Muscle Core
      const thighChassisGeo = new THREE.CylinderGeometry(0.21, 0.17, 1.55, 12);
      thighChassisGeo.translate(0, -0.78, 0);
      const thighChassis = new THREE.Mesh(thighChassisGeo, this.materials.bioMuscleMat);
      thigh.add(thighChassis);

      // Thigh Outer Armor (Multi-tiered athletic quad plates)
      const thighArmorGeo = new THREE.CylinderGeometry(0.29, 0.23, 1.5, 10);
      thighArmorGeo.scale(1, 1, 1.25);
      thighArmorGeo.translate(0, -0.75, 0);
      const thighMesh = new THREE.Mesh(thighArmorGeo, this.materials.primaryArmorMat);
      thighMesh.castShadow = true;
      thigh.add(thighMesh);
      registerArmor(thighMesh, new THREE.Vector3(isLeft ? -0.48 : 0.48, 0, 0.38));

      // Shin & Knee
      const shin = new THREE.Group();
      shin.position.set(0, -1.55, 0);
      thigh.add(shin);

      // Heavy Knee Rotor
      const kneeJointGeo = new THREE.CylinderGeometry(0.2, 0.2, 0.4, 16);
      kneeJointGeo.rotateZ(Math.PI / 2);
      const kneeJoint = new THREE.Mesh(kneeJointGeo, this.materials.anodizedTitaniumMat);
      shin.add(kneeJoint);

      // Knee Shock Absorber Piston
      const kneePiston = createPiston(0.52, 0.026);
      kneePiston.position.set(0, 0.22, -0.16);
      kneePiston.rotation.x = -0.3;
      shin.add(kneePiston);

      // Chevron Knee Strike Blade
      const kneeCapShape = new THREE.Shape();
      kneeCapShape.moveTo(0, 0.26);
      kneeCapShape.lineTo(0.22, -0.1);
      kneeCapShape.lineTo(0, -0.36);
      kneeCapShape.lineTo(-0.22, -0.1);
      kneeCapShape.closePath();
      const kneeCapGeo = new THREE.ExtrudeGeometry(kneeCapShape, { depth: 0.15, bevelEnabled: true, bevelSize: 0.028, bevelThickness: 0.028 });
      kneeCapGeo.center();
      kneeCapGeo.translate(0, 0, 0.28);
      const kneeCapMesh = new THREE.Mesh(kneeCapGeo, this.materials.accentGreenMat);
      kneeCapMesh.castShadow = true;
      shin.add(kneeCapMesh);
      registerArmor(kneeCapMesh, new THREE.Vector3(0, 0, 0.48));

      // Shin / Calf Armor
      const calfGeo = new THREE.CylinderGeometry(0.25, 0.17, 1.6, 10);
      calfGeo.translate(0, -0.8, -0.05);
      const calfMesh = new THREE.Mesh(calfGeo, this.materials.primaryArmorMat);
      calfMesh.castShadow = true;
      shin.add(calfMesh);

      // Twin Rocket Vector Thruster Nozzles with Glowing Hot Burner Rings
      for (let t = 0; t < 2; t++) {
        const nozGeo = new THREE.CylinderGeometry(0.07, 0.095, 0.26, 14);
        nozGeo.rotateX(-Math.PI / 2 - 0.2);
        nozGeo.translate(0, -0.62 - t * 0.34, -0.3);
        const nozzle = new THREE.Mesh(nozGeo, this.materials.thrusterNozzleMat);
        shin.add(nozzle);

        const burnerGeo = new THREE.TorusGeometry(0.055, 0.016, 8, 16);
        burnerGeo.translate(0, -0.62 - t * 0.34, -0.42);
        const burner = new THREE.Mesh(burnerGeo, new THREE.MeshBasicMaterial({ color: 0x00f0ff }));
        shin.add(burner);
      }

      // Aerodynamic Stabilization Fin
      const finGeo = new THREE.BoxGeometry(0.065, 0.68, 0.3);
      finGeo.translate(0, -0.74, -0.26);
      const finMesh = new THREE.Mesh(finGeo, this.materials.secondaryArmorMat);
      shin.add(finMesh);

      // Foot & Ankle
      const foot = new THREE.Group();
      foot.position.set(0, -1.65, -0.05);
      shin.add(foot);

      // Ankle Spherical Gimbal
      const ankleGeo = new THREE.SphereGeometry(0.15, 14, 14);
      const ankle = new THREE.Mesh(ankleGeo, this.materials.anodizedTitaniumMat);
      foot.add(ankle);

      // Split High-Traction Combat Boot Sole
      const soleGeo = new THREE.BoxGeometry(0.36, 0.19, 0.92);
      soleGeo.translate(0, -0.095, 0.23);
      const footMesh = new THREE.Mesh(soleGeo, this.materials.secondaryArmorMat);
      footMesh.castShadow = true;
      foot.add(footMesh);

      // Armored Heel Spur with Hydraulic Strut
      const spurGeo = new THREE.BoxGeometry(0.28, 0.17, 0.24);
      spurGeo.translate(0, 0.02, -0.24);
      const spurMesh = new THREE.Mesh(spurGeo, this.materials.primaryArmorMat);
      foot.add(spurMesh);

      const heelStrutGeo = new THREE.CylinderGeometry(0.032, 0.032, 0.24, 8);
      heelStrutGeo.translate(0, 0.15, -0.24);
      const heelStrut = new THREE.Mesh(heelStrutGeo, this.materials.chromePistonMat);
      foot.add(heelStrut);

      return { thigh, shin, foot };
    };

    const leftLeg = buildIntricateLeg(true);
    pelvis.add(leftLeg.thigh);

    const rightLeg = buildIntricateLeg(false);
    pelvis.add(rightLeg.thigh);

    // ==========================================
    // 8. CONTACT GROUND SHADOW & EFFECTS
    // ==========================================
    const shadowGeo = new THREE.PlaneGeometry(4.2, 4.2);
    shadowGeo.rotateX(-Math.PI / 2);
    const contactShadow = new THREE.Mesh(shadowGeo, this.materials.contactShadowMat);
    contactShadow.position.y = 0.02;
    root.add(contactShadow);

    // Umbilical High-Voltage Cable
    const umbilicalCable = new THREE.Group();
    const curve = new THREE.CubicBezierCurve3(
      new THREE.Vector3(0, 6.55, -0.45),
      new THREE.Vector3(0, 6.0, -2.5),
      new THREE.Vector3(0, 2.0, -4.5),
      new THREE.Vector3(0, 0.1, -6.0)
    );
    const cableGeo = new THREE.TubeGeometry(curve, 36, 0.095, 10, false);
    const cableMesh = new THREE.Mesh(cableGeo, this.materials.secondaryArmorMat);
    cableMesh.castShadow = true;
    umbilicalCable.add(cableMesh);

    for (let c = 0; c < 6; c++) {
      const ringGeo = new THREE.TorusGeometry(0.14, 0.038, 8, 16);
      const t = 0.12 + c * 0.16;
      const pt = curve.getPoint(t);
      ringGeo.translate(pt.x, pt.y, pt.z);
      const ringMesh = new THREE.Mesh(ringGeo, this.materials.accentGreenMat);
      umbilicalCable.add(ringMesh);
    }
    root.add(umbilicalCable);

    // AT Field Barrier
    const atFieldGeo = new THREE.PlaneGeometry(6.8, 6.8);
    const atField = new THREE.Mesh(atFieldGeo, this.materials.atFieldMat);
    atField.position.set(0, 5.5, 2.2);
    atField.visible = false;
    root.add(atField);

    // Berserk Halo
    const haloGeo = new THREE.TorusGeometry(1.68, 0.058, 12, 48);
    haloGeo.rotateX(Math.PI / 2);
    const halo = new THREE.Mesh(haloGeo, new THREE.MeshBasicMaterial({ color: 0xff3300, transparent: true, opacity: 0.88, blending: THREE.AdditiveBlending }));
    halo.position.set(0, 9.0, 0);
    halo.visible = false;
    root.add(halo);

    // Weapons
    // 1. Progressive Knife
    const knife = new THREE.Group();
    const bladeShape = new THREE.Shape();
    bladeShape.moveTo(0, 0);
    bladeShape.lineTo(0.08, 0.15);
    bladeShape.lineTo(0.06, 1.15);
    bladeShape.lineTo(0, 1.3);
    bladeShape.lineTo(-0.06, 1.15);
    bladeShape.closePath();
    const bladeGeo = new THREE.ExtrudeGeometry(bladeShape, { depth: 0.035, bevelEnabled: true, bevelSize: 0.01 });
    bladeGeo.center();
    const bladeMesh = new THREE.Mesh(bladeGeo, this.materials.chromePistonMat);
    knife.add(bladeMesh);
    const knifeEdgeGeo = new THREE.BoxGeometry(0.02, 1.15, 0.045);
    knifeEdgeGeo.translate(0.045, 0, 0);
    const knifeEdge = new THREE.Mesh(knifeEdgeGeo, this.materials.accentGreenMat);
    knife.add(knifeEdge);
    const handleGeo = new THREE.CylinderGeometry(0.065, 0.065, 0.48, 8);
    handleGeo.translate(0, -0.72, 0);
    const handleMesh = new THREE.Mesh(handleGeo, this.materials.secondaryArmorMat);
    knife.add(handleMesh);
    knife.position.set(0, -0.3, 0.15);
    knife.rotation.set(Math.PI / 2, 0, 0);
    knife.scale.set(0.85, 0.85, 0.85);
    knife.visible = false;
    rightArmComponents.hand.add(knife);

    // 2. Positron Sniper Rifle / Pallet Rifle
    const rifle = new THREE.Group();
    const barrelGeo = new THREE.CylinderGeometry(0.065, 0.085, 4.0, 16);
    barrelGeo.rotateX(Math.PI / 2);
    barrelGeo.translate(0, 0.22, 1.7);
    const barrelMesh = new THREE.Mesh(barrelGeo, this.materials.anodizedTitaniumMat);
    barrelMesh.castShadow = true;
    rifle.add(barrelMesh);
    const receiverGeo = new THREE.BoxGeometry(0.26, 0.48, 1.5);
    receiverGeo.translate(0, 0.16, 0.22);
    const receiverMesh = new THREE.Mesh(receiverGeo, this.materials.secondaryArmorMat);
    receiverMesh.castShadow = true;
    rifle.add(receiverMesh);
    const scopeGeo = new THREE.CylinderGeometry(0.085, 0.085, 0.95, 12);
    scopeGeo.rotateX(Math.PI / 2);
    scopeGeo.translate(0, 0.52, 0.12);
    const scopeMesh = new THREE.Mesh(scopeGeo, this.materials.chromePistonMat);
    rifle.add(scopeMesh);
    rifle.position.set(0, -0.25, 0.2);
    rifle.rotation.set(0.1, 0, 0);
    rifle.scale.set(0.8, 0.8, 0.8);
    rifle.visible = false;
    rightArmComponents.hand.add(rifle);

    // 3. Spear of Longinus (Glowing Double-Helix Spiral Lance)
    const spear = new THREE.Group();
    spear.name = 'Spear_of_Longinus';

    const helixLength = 7.5;
    const helixRadius = 0.08;
    const helixTurns = 3;
    const curvePoints1: THREE.Vector3[] = [];
    const curvePoints2: THREE.Vector3[] = [];
    for (let i = 0; i <= 60; i++) {
      const t = i / 60;
      const y = -1.2 + t * helixLength;
      const angle = t * Math.PI * 2 * helixTurns;
      curvePoints1.push(new THREE.Vector3(Math.cos(angle) * helixRadius, y, Math.sin(angle) * helixRadius));
      curvePoints2.push(new THREE.Vector3(Math.cos(angle + Math.PI) * helixRadius, y, Math.sin(angle + Math.PI) * helixRadius));
    }
    const curve1 = new THREE.CatmullRomCurve3(curvePoints1);
    const curve2 = new THREE.CatmullRomCurve3(curvePoints2);
    const helixGeo1 = new THREE.TubeGeometry(curve1, 48, 0.045, 8, false);
    const helixGeo2 = new THREE.TubeGeometry(curve2, 48, 0.045, 8, false);

    const spearMat = new THREE.MeshStandardMaterial({
      color: 0xee1525,
      roughness: 0.2,
      metalness: 0.5,
      emissive: 0xdd1122,
      emissiveIntensity: 0.9,
    });
    spear.add(new THREE.Mesh(helixGeo1, spearMat));
    spear.add(new THREE.Mesh(helixGeo2, spearMat));

    const forkCurve1 = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 5.0, 0),
      new THREE.Vector3(0.25, 5.8, 0.1),
      new THREE.Vector3(0.18, 6.6, 0),
      new THREE.Vector3(0.08, 7.4, 0),
    ]);
    const forkCurve2 = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 5.0, 0),
      new THREE.Vector3(-0.25, 5.8, -0.1),
      new THREE.Vector3(-0.18, 6.6, 0),
      new THREE.Vector3(-0.08, 7.4, 0),
    ]);
    const forkGeo1 = new THREE.TubeGeometry(forkCurve1, 24, 0.05, 8, false);
    const forkGeo2 = new THREE.TubeGeometry(forkCurve2, 24, 0.05, 8, false);
    spear.add(new THREE.Mesh(forkGeo1, spearMat));
    spear.add(new THREE.Mesh(forkGeo2, spearMat));

    const auraGeo = new THREE.CylinderGeometry(0.2, 0.05, 7.6, 12);
    auraGeo.translate(0, 3.2, 0);
    const auraMat = new THREE.MeshBasicMaterial({
      color: 0xff3333,
      transparent: true,
      opacity: 0.45,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    const aura = new THREE.Mesh(auraGeo, auraMat);
    spear.add(aura);

    spear.position.set(0, -0.3, 0);
    spear.rotation.set(0.2, 0, 0.1);
    spear.scale.set(0.95, 0.95, 0.95);
    spear.visible = false;
    rightArmComponents.hand.add(spear);

    // ==========================================
    // 9. HIGH-OUTPUT SPACE THRUSTER PLUMES
    // ==========================================
    const thrusterPlumes = new THREE.Group();
    thrusterPlumes.name = 'Space_Thruster_Plumes';

    for (let side = -1; side <= 1; side += 2) {
      const pylonPlume = new THREE.Group();
      pylonPlume.position.set(side * 0.95, 0.85, -0.4);
      pylonPlume.rotation.x = Math.PI / 2 + 0.1;

      const ionGeo = new THREE.CylinderGeometry(0.12, 0.35, 3.4, 12, 1, true);
      ionGeo.rotateX(-Math.PI / 2);
      ionGeo.translate(0, 0, 1.7);
      const ionMesh = new THREE.Mesh(ionGeo, this.materials.ionBeamMat);
      pylonPlume.add(ionMesh);

      const flameGeo = new THREE.ConeGeometry(0.22, 1.8, 12, 1, true);
      flameGeo.rotateX(Math.PI / 2);
      flameGeo.translate(0, 0, 0.9);
      const flameMesh = new THREE.Mesh(flameGeo, this.materials.flamePlumeMat);
      pylonPlume.add(flameMesh);

      chest.add(pylonPlume);
      thrusterPlumes.add(pylonPlume);
    }

    for (let side = -1; side <= 1; side += 2) {
      const calfPlume = new THREE.Group();
      calfPlume.position.set(side * 0.44, -1.0, -0.4);
      calfPlume.rotation.x = Math.PI / 2 + 0.3;

      const calfFlameGeo = new THREE.ConeGeometry(0.18, 1.5, 10, 1, true);
      calfFlameGeo.rotateX(Math.PI / 2);
      calfFlameGeo.translate(0, 0, 0.75);
      const calfFlame = new THREE.Mesh(calfFlameGeo, this.materials.flamePlumeMat);
      calfPlume.add(calfFlame);

      pelvis.add(calfPlume);
      thrusterPlumes.add(calfPlume);
    }
    thrusterPlumes.visible = false;

    return {
      root,
      torso,
      chest,
      neck,
      head,
      jaw,
      core: coreMesh,
      innerCore,
      leftShoulder,
      rightShoulder,
      leftPylon,
      rightPylon,
      leftArm: leftArmComponents.armGroup,
      leftForearm: leftArmComponents.forearm,
      leftHand: leftArmComponents.hand,
      rightArm: rightArmComponents.armGroup,
      rightForearm: rightArmComponents.forearm,
      rightHand: rightArmComponents.hand,
      leftThigh: leftLeg.thigh,
      leftShin: leftLeg.shin,
      leftFoot: leftLeg.foot,
      rightThigh: rightLeg.thigh,
      rightShin: rightLeg.shin,
      rightFoot: rightLeg.foot,
      umbilicalCable,
      atField,
      halo,
      weapons: {
        knife,
        rifle,
        spear,
      },
      contactShadow,
      armorPlates,
      hydraulicPistons,
      thrusterPlumes,
    };
  }

  public setPose(pose: EvaPose, immediate = false) {
    this.currentPose = pose;
    this.targetPose = POSE_PRESETS[pose] || POSE_PRESETS.stand;

    if (immediate) {
      this.applyPoseValues(1.0);
    }
  }

  public setWeapon(weapon: EvaWeapon) {
    this.currentWeapon = weapon;
    this.bones.weapons.knife.visible = weapon === 'knife';
    this.bones.weapons.rifle.visible = weapon === 'rifle';
    this.bones.weapons.spear.visible = weapon === 'spear';
  }

  public setThrustersActive(active: boolean) {
    this.bones.thrusterPlumes.visible = active;
  }

  public setExplodedView(factor: number) {
    this.targetExplodeAmount = THREE.MathUtils.clamp(factor, 0, 1);
  }

  public setAtFieldVisible(visible: boolean) {
    this.bones.atField.visible = visible;
  }

  public setCableConnected(connected: boolean) {
    this.bones.umbilicalCable.visible = connected;
  }

  public setBerserkMode(isBerserk: boolean) {
    this.bones.halo.visible = isBerserk;
    if (isBerserk) {
      this.setPose('berserk');
    }
  }

  private applyPoseValues(alpha: number) {
    const t = this.targetPose;
    const b = this.bones;

    const lerpRot = (obj: THREE.Object3D, target: [number, number, number]) => {
      obj.rotation.x = THREE.MathUtils.lerp(obj.rotation.x, target[0], alpha);
      obj.rotation.y = THREE.MathUtils.lerp(obj.rotation.y, target[1], alpha);
      obj.rotation.z = THREE.MathUtils.lerp(obj.rotation.z, target[2], alpha);
    };

    lerpRot(b.torso, t.torsoRot);
    lerpRot(b.chest, t.chestRot);
    lerpRot(b.head, t.headRot);
    b.jaw.rotation.x = THREE.MathUtils.lerp(b.jaw.rotation.x, t.jawRot, alpha);

    lerpRot(b.leftArm, t.leftArmRot);
    lerpRot(b.leftForearm, t.leftForearmRot);
    lerpRot(b.rightArm, t.rightArmRot);
    lerpRot(b.rightForearm, t.rightForearmRot);

    lerpRot(b.leftThigh, t.leftThighRot);
    lerpRot(b.leftShin, t.leftShinRot);
    lerpRot(b.rightThigh, t.rightThighRot);
    lerpRot(b.rightShin, t.rightShinRot);

    b.root.position.y = THREE.MathUtils.lerp(b.root.position.y, t.rootY, alpha);
  }

  public update(delta: number, elapsed: number) {
    // 1. Smooth kinematic damping towards target pose
    const dampingSpeed = 8.0;
    const alpha = 1.0 - Math.exp(-dampingSpeed * delta);
    this.applyPoseValues(alpha);

    // 2. Subtle organic breathing rhythm
    const breath = Math.sin(elapsed * 1.8) * 0.015;
    this.bones.chest.scale.set(1 + breath, 1 + breath * 0.5, 1 + breath);

    // 3. AT Field pulsing
    if (this.bones.atField.visible) {
      const atPulse = 1.0 + Math.sin(elapsed * 7.0) * 0.04;
      this.bones.atField.scale.set(atPulse, atPulse, 1);
      this.bones.atField.rotation.z = Math.sin(elapsed * 0.5) * 0.05;
    }

    // 4. Berserk Halo rotation & pulse
    if (this.bones.halo.visible) {
      this.bones.halo.rotation.z += delta * 1.2;
      const haloScale = 1.0 + Math.sin(elapsed * 4.0) * 0.06;
      this.bones.halo.scale.set(haloScale, haloScale, haloScale);
    }

    // 5. Exploded view animation damping
    if (Math.abs(this.explodeAmount - this.targetExplodeAmount) > 0.001) {
      this.explodeAmount = THREE.MathUtils.damp(this.explodeAmount, this.targetExplodeAmount, 6.0, delta);
      this.bones.armorPlates.forEach((mesh) => {
        const offset = this.armorOffsets.get(mesh);
        const basePos = this.basePositions.get(mesh);
        if (offset && basePos) {
          mesh.position.x = basePos.x + offset.x * this.explodeAmount * 2.2;
          mesh.position.y = basePos.y + offset.y * this.explodeAmount * 2.2;
          mesh.position.z = basePos.z + offset.z * this.explodeAmount * 2.2;
        }
      });
    }

    // 6. S2 Engine Jewel Core & Inner Seed Rotation
    const corePulse = 0.9 + Math.sin(elapsed * 3.5) * 0.35;
    this.materials.coreJewelMat.emissiveIntensity = corePulse;
    this.bones.innerCore.rotation.x += delta * 0.8;
    this.bones.innerCore.rotation.y += delta * 1.2;

    // 7. High-Energy Thruster Plume Jitter
    if (this.bones.thrusterPlumes.visible) {
      const plumeJitter = 1.0 + Math.sin(elapsed * 35.0) * 0.12 + (Math.random() - 0.5) * 0.08;
      this.bones.thrusterPlumes.children.forEach((plume) => {
        plume.scale.set(1.0, 1.0, plumeJitter);
      });
    }
  }
}
