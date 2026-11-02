import * as THREE from 'three';
import { EnvironmentType } from '../types/eva';
import { createHazardTexture } from './evaMaterials';

export class EvaEnvironmentManager {
  public group: THREE.Group;
  public currentType: EnvironmentType = 'hangar';
  private hazardTex: THREE.CanvasTexture;
  private floorMesh: THREE.Mesh | null = null;
  private gantryGroup: THREE.Group | null = null;
  private tokyoGroup: THREE.Group | null = null;
  private oceanGroup: THREE.Group | null = null;

  constructor() {
    this.group = new THREE.Group();
    this.group.name = 'EVA_ENVIRONMENT';
    this.hazardTex = createHazardTexture();
  }

  public setup(scene: THREE.Scene, type: EnvironmentType) {
    this.currentType = type;

    // Clear previous
    while (this.group.children.length > 0) {
      const child = this.group.children[0];
      this.group.remove(child);
    }

    if (type === 'spaceOrbit') {
      this.buildSpaceOrbit(scene);
    } else if (type === 'hangar') {
      this.buildHangar(scene);
    } else if (type === 'tokyo3') {
      this.buildTokyo3(scene);
    } else if (type === 'redOcean') {
      this.buildRedOcean(scene);
    } else {
      this.buildDarkVoid(scene);
    }
  }

  /**
   * NERV Launch Cage / GeoFront Central Dogma
   */
  private buildHangar(scene: THREE.Scene) {
    scene.fog = new THREE.FogExp2(0x0e1118, 0.022);
    scene.background = new THREE.Color(0x0a0c10);

    const hangar = new THREE.Group();
    hangar.name = 'NERV_Hangar';

    // 1. Steel Floor with launch rails & markings
    const floorCanvas = document.createElement('canvas');
    floorCanvas.width = 1024;
    floorCanvas.height = 1024;
    const fctx = floorCanvas.getContext('2d')!;

    // Dark industrial reinforced concrete
    fctx.fillStyle = '#161920';
    fctx.fillRect(0, 0, 1024, 1024);

    // Grid panels
    fctx.strokeStyle = '#222834';
    fctx.lineWidth = 3;
    for (let x = 0; x < 1024; x += 128) {
      fctx.beginPath();
      fctx.moveTo(x, 0);
      fctx.lineTo(x, 1024);
      fctx.stroke();
      fctx.beginPath();
      fctx.moveTo(0, x);
      fctx.lineTo(1024, x);
      fctx.stroke();
    }

    // Launch Catapult Rails (yellow/orange caution guide)
    fctx.fillStyle = '#ff9900';
    fctx.fillRect(440, 0, 16, 1024);
    fctx.fillRect(568, 0, 16, 1024);

    // Center launch runway markings
    fctx.strokeStyle = '#ffffff';
    fctx.lineWidth = 6;
    fctx.setLineDash([30, 20]);
    fctx.beginPath();
    fctx.moveTo(512, 0);
    fctx.lineTo(512, 1024);
    fctx.stroke();
    fctx.setLineDash([]);

    // Stencil Text
    fctx.font = 'bold 32px "Share Tech Mono", monospace';
    fctx.fillStyle = '#ffaa00';
    fctx.fillText('NERV LAUNCH CAGE // UNIT-01 CAGE #7', 60, 120);
    fctx.fillText('AUTHORIZED PERSONNEL ONLY - AT FIELD RESTRICTED', 60, 170);

    const floorTex = new THREE.CanvasTexture(floorCanvas);
    floorTex.colorSpace = THREE.SRGBColorSpace;
    floorTex.wrapS = THREE.RepeatWrapping;
    floorTex.wrapT = THREE.RepeatWrapping;

    const floorGeo = new THREE.PlaneGeometry(60, 60);
    floorGeo.rotateX(-Math.PI / 2);
    const floorMat = new THREE.MeshStandardMaterial({
      map: floorTex,
      roughness: 0.65,
      metalness: 0.35,
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.receiveShadow = true;
    hangar.add(floor);

    // 2. Launch Catapult Vertical Spine Rail
    const railSpineGeo = new THREE.BoxGeometry(2.4, 24, 1.2);
    railSpineGeo.translate(0, 12, -2.6);
    const railMat = new THREE.MeshStandardMaterial({
      color: 0x222630,
      roughness: 0.5,
      metalness: 0.8,
    });
    const railSpine = new THREE.Mesh(railSpineGeo, railMat);
    railSpine.castShadow = true;
    railSpine.receiveShadow = true;
    hangar.add(railSpine);

    // Catapult Hazard Rail Guards
    const guardGeo = new THREE.BoxGeometry(0.3, 24, 0.4);
    const guardL = new THREE.Mesh(guardGeo, new THREE.MeshStandardMaterial({ map: this.hazardTex, roughness: 0.4 }));
    guardL.position.set(-1.4, 12, -2.1);
    hangar.add(guardL);

    const guardR = new THREE.Mesh(guardGeo, new THREE.MeshStandardMaterial({ map: this.hazardTex, roughness: 0.4 }));
    guardR.position.set(1.4, 12, -2.1);
    hangar.add(guardR);

    // 3. Restraining Gantry Bridges (Left & Right)
    for (let side = -1; side <= 1; side += 2) {
      const gantryTowerGeo = new THREE.BoxGeometry(1.6, 20, 2.0);
      gantryTowerGeo.translate(side * 8.5, 10, 0);
      const gantryTower = new THREE.Mesh(gantryTowerGeo, railMat);
      gantryTower.castShadow = true;
      hangar.add(gantryTower);

      // Horizontal catwalk bridges
      for (let h = 4; h <= 16; h += 4) {
        const bridgeGeo = new THREE.BoxGeometry(4.5, 0.3, 1.2);
        bridgeGeo.translate(side * 5.8, h, 0);
        const bridge = new THREE.Mesh(bridgeGeo, new THREE.MeshStandardMaterial({ color: 0x333945, metalness: 0.7, roughness: 0.4 }));
        bridge.castShadow = true;
        hangar.add(bridge);

        // Safety yellow handrail
        const railGeo = new THREE.CylinderGeometry(0.04, 0.04, 4.5, 6);
        railGeo.rotateZ(Math.PI / 2);
        railGeo.translate(side * 5.8, h + 0.6, 0.55);
        const handrail = new THREE.Mesh(railGeo, new THREE.MeshStandardMaterial({ color: 0xffaa00 }));
        hangar.add(handrail);
      }
    }

    // 4. Rear Power Conduit Junction
    const junctionGeo = new THREE.CylinderGeometry(0.8, 1.1, 1.2, 8);
    junctionGeo.translate(0, 0.6, -6.0);
    const junction = new THREE.Mesh(junctionGeo, railMat);
    hangar.add(junction);

    this.group.add(hangar);
  }

  /**
   * Tokyo-3 Retractable City Defense Grid
   */
  private buildTokyo3(scene: THREE.Scene) {
    scene.fog = new THREE.FogExp2(0x18202e, 0.015);
    scene.background = new THREE.Color(0x121722);

    const tokyo = new THREE.Group();
    tokyo.name = 'Tokyo3_Grid';

    // Asphalt Ground
    const groundGeo = new THREE.PlaneGeometry(120, 120);
    groundGeo.rotateX(-Math.PI / 2);
    const groundMat = new THREE.MeshStandardMaterial({
      color: 0x1f242d,
      roughness: 0.85,
      metalness: 0.1,
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.receiveShadow = true;
    tokyo.add(ground);

    // Retractable armored skyscraper blocks (Iconic Tokyo-3 defense buildings)
    const buildingMat = new THREE.MeshStandardMaterial({
      color: 0x2d3545,
      roughness: 0.6,
      metalness: 0.4,
    });
    const windowMat = new THREE.MeshStandardMaterial({
      color: 0x111620,
      emissive: 0x335577,
      emissiveIntensity: 0.3,
      roughness: 0.2,
      metalness: 0.8,
    });

    const bCount = 20;
    for (let i = 0; i < bCount; i++) {
      const angle = (i / bCount) * Math.PI * 2;
      const dist = 18 + Math.random() * 22;
      const x = Math.cos(angle) * dist;
      const z = Math.sin(angle) * dist;

      // Don't place right in front of camera
      if (Math.abs(x) < 5 && z > 0) continue;

      const w = 4 + Math.random() * 4;
      const h = 12 + Math.random() * 24;
      const d = 4 + Math.random() * 4;

      const bGeo = new THREE.BoxGeometry(w, h, d);
      bGeo.translate(x, h / 2, z);
      const bMesh = new THREE.Mesh(bGeo, buildingMat);
      bMesh.castShadow = true;
      bMesh.receiveShadow = true;
      tokyo.add(bMesh);

      // Window slit band
      const bandGeo = new THREE.BoxGeometry(w + 0.1, 0.8, d + 0.1);
      bandGeo.translate(x, h * 0.7, z);
      const band = new THREE.Mesh(bandGeo, windowMat);
      tokyo.add(band);
    }

    this.group.add(tokyo);
  }

  /**
   * Post-Third Impact Red Ocean
   */
  private buildRedOcean(scene: THREE.Scene) {
    scene.fog = new THREE.FogExp2(0x3a0808, 0.018);
    scene.background = new THREE.Color(0x220404);

    const ocean = new THREE.Group();

    // Red Sea
    const seaGeo = new THREE.PlaneGeometry(150, 150, 32, 32);
    seaGeo.rotateX(-Math.PI / 2);
    const seaMat = new THREE.MeshPhysicalMaterial({
      color: 0x770a0a,
      emissive: 0x440202,
      emissiveIntensity: 0.4,
      roughness: 0.15,
      metalness: 0.3,
      clearcoat: 0.9,
    });
    const sea = new THREE.Mesh(seaGeo, seaMat);
    sea.receiveShadow = true;
    ocean.add(sea);

    // Horizon Red Cross Pylons
    for (let i = 0; i < 7; i++) {
      const crossGroup = new THREE.Group();
      const crossMat = new THREE.MeshBasicMaterial({
        color: 0xff3322,
        transparent: true,
        opacity: 0.75,
      });

      const vertGeo = new THREE.BoxGeometry(0.8, 18, 0.8);
      vertGeo.translate(0, 9, 0);
      const vert = new THREE.Mesh(vertGeo, crossMat);
      crossGroup.add(vert);

      const horizGeo = new THREE.BoxGeometry(7, 0.8, 0.8);
      horizGeo.translate(0, 12, 0);
      const horiz = new THREE.Mesh(horizGeo, crossMat);
      crossGroup.add(horiz);

      const angle = (i / 7) * Math.PI * 1.6 - 0.8 * Math.PI;
      const dist = 45;
      crossGroup.position.set(Math.cos(angle) * dist, 0, Math.sin(angle) * dist);
      ocean.add(crossGroup);
    }

    this.group.add(ocean);
  }

  /**
   * MAGI Dark Vector Void
   */
  private buildDarkVoid(scene: THREE.Scene) {
    scene.fog = new THREE.FogExp2(0x050608, 0.02);
    scene.background = new THREE.Color(0x040507);

    const voidGroup = new THREE.Group();

    // Grid Floor
    const grid = new THREE.GridHelper(50, 50, 0x00ff66, 0x113322);
    grid.position.y = 0.01;
    voidGroup.add(grid);

    // Glowing coordinate rings
    for (let r = 5; r <= 20; r += 5) {
      const ringGeo = new THREE.RingGeometry(r, r + 0.05, 64);
      ringGeo.rotateX(-Math.PI / 2);
      const ring = new THREE.Mesh(ringGeo, new THREE.MeshBasicMaterial({ color: 0x00ff66, side: THREE.DoubleSide, transparent: true, opacity: 0.3 }));
      ring.position.y = 0.02;
      voidGroup.add(ring);
    }

    this.group.add(voidGroup);
  }

  /**
   * Space Orbit Fleet Battle (Faithfully inspired by the video)
   * Featuring low Earth orbit, space battleships, asteroid debris, and cosmic nebula
   */
  private buildSpaceOrbit(scene: THREE.Scene) {
    scene.fog = new THREE.FogExp2(0x02040c, 0.004);
    scene.background = new THREE.Color(0x020308);

    const orbitGroup = new THREE.Group();
    orbitGroup.name = 'Space_Orbit_Battle';

    // 1. Curved Planet Earth below (Low Earth Orbit)
    const earthCanvas = document.createElement('canvas');
    earthCanvas.width = 1024;
    earthCanvas.height = 512;
    const ectx = earthCanvas.getContext('2d')!;

    // Deep ocean blue
    ectx.fillStyle = '#081734';
    ectx.fillRect(0, 0, 1024, 512);

    // Continents & landmasses
    ectx.fillStyle = '#0f2945';
    for (let c = 0; c < 15; c++) {
      const cx = 80 + c * 65;
      const cy = 100 + Math.sin(c) * 120 + 100;
      ectx.beginPath();
      ectx.ellipse(cx, cy, 55 + Math.random() * 40, 35 + Math.random() * 30, Math.random(), 0, Math.PI * 2);
      ectx.fill();
    }

    // Night continent city lights (golden glowing clusters, exactly as in video!)
    ectx.fillStyle = '#ffaa33';
    for (let p = 0; p < 350; p++) {
      const px = Math.random() * 1024;
      const py = 120 + Math.random() * 260;
      ectx.fillRect(px, py, 2, 2);
    }
    // Denser golden metropolis clusters
    for (let m = 0; m < 12; m++) {
      const mx = 100 + Math.random() * 824;
      const my = 150 + Math.random() * 200;
      const radGrad = ectx.createRadialGradient(mx, my, 2, mx, my, 24);
      radGrad.addColorStop(0, 'rgba(255, 200, 80, 0.9)');
      radGrad.addColorStop(0.5, 'rgba(255, 140, 20, 0.4)');
      radGrad.addColorStop(1, 'rgba(255, 100, 0, 0)');
      ectx.fillStyle = radGrad;
      ectx.fillRect(mx - 24, my - 24, 48, 48);
    }

    // Atmospheric swirling clouds
    ectx.fillStyle = 'rgba(255, 255, 255, 0.28)';
    for (let w = 0; w < 20; w++) {
      const wx = Math.random() * 1024;
      const wy = 80 + Math.random() * 300;
      ectx.beginPath();
      ectx.ellipse(wx, wy, 80 + Math.random() * 120, 14 + Math.random() * 18, 0.2, 0, Math.PI * 2);
      ectx.fill();
    }

    const earthTex = new THREE.CanvasTexture(earthCanvas);
    earthTex.colorSpace = THREE.SRGBColorSpace;
    earthTex.wrapS = THREE.RepeatWrapping;

    const earthGeo = new THREE.SphereGeometry(65, 48, 48);
    const earthMat = new THREE.MeshStandardMaterial({
      map: earthTex,
      roughness: 0.65,
      metalness: 0.1,
    });
    const earth = new THREE.Mesh(earthGeo, earthMat);
    earth.position.set(0, -66, -18);
    earth.rotation.x = 0.25;
    earth.rotation.y = -0.6;
    orbitGroup.add(earth);

    // Glowing Atmospheric Limb Ring (Luminescent cyan blue rim)
    const atmoGeo = new THREE.SphereGeometry(65.8, 48, 48);
    const atmoMat = new THREE.MeshBasicMaterial({
      color: 0x0099ff,
      transparent: true,
      opacity: 0.22,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
    });
    const atmosphere = new THREE.Mesh(atmoGeo, atmoMat);
    atmosphere.position.copy(earth.position);
    orbitGroup.add(atmosphere);

    // 2. Cosmic Nebula & Dense Starfield
    const starCount = 600;
    const starGeo = new THREE.BufferGeometry();
    const starPositions = new Float32Array(starCount * 3);
    for (let s = 0; s < starCount; s++) {
      starPositions[s * 3] = (Math.random() - 0.5) * 120;
      starPositions[s * 3 + 1] = Math.random() * 60 - 10;
      starPositions[s * 3 + 2] = (Math.random() - 0.5) * 120 - 20;
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    const starMat = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.45,
      transparent: true,
      opacity: 0.85,
    });
    const stars = new THREE.Points(starGeo, starMat);
    orbitGroup.add(stars);

    // 3. Sci-Fi Space Battleship (from Video 00:00 - 00:07)
    const buildBattleship = (posX: number, posY: number, posZ: number, rotY: number, scale: number) => {
      const ship = new THREE.Group();
      const hullMat = new THREE.MeshStandardMaterial({
        color: 0x222630,
        roughness: 0.45,
        metalness: 0.85,
      });

      // Main battleship fuselage (Heavy armored hull)
      const hullGeo = new THREE.BoxGeometry(4.2, 2.4, 22);
      const hull = new THREE.Mesh(hullGeo, hullMat);
      hull.castShadow = true;
      ship.add(hull);

      // Angled Prow / Bow
      const bowGeo = new THREE.ConeGeometry(2.1, 7.5, 4);
      bowGeo.rotateY(Math.PI / 4);
      bowGeo.rotateX(Math.PI / 2);
      bowGeo.translate(0, 0, 14.5);
      const bow = new THREE.Mesh(bowGeo, hullMat);
      bow.castShadow = true;
      ship.add(bow);

      // Superstructure Bridge Command Tower
      const bridgeGeo = new THREE.BoxGeometry(1.8, 3.2, 4.5);
      bridgeGeo.translate(0, 2.5, -3.5);
      const bridge = new THREE.Mesh(bridgeGeo, hullMat);
      ship.add(bridge);

      // Glowing Cyan Bridge Viewport Windows
      const windowGeo = new THREE.BoxGeometry(1.85, 0.4, 1.2);
      windowGeo.translate(0, 3.4, -2.8);
      const windowMesh = new THREE.Mesh(windowGeo, new THREE.MeshBasicMaterial({ color: 0x00ffff }));
      ship.add(windowMesh);

      // Main Gun Turrets (Triple-barrel cannons)
      for (let t = 0; t < 2; t++) {
        const turretBaseGeo = new THREE.CylinderGeometry(1.1, 1.2, 0.6, 10);
        turretBaseGeo.translate(0, 1.4, 4.0 + t * 5.0);
        const turretBase = new THREE.Mesh(turretBaseGeo, hullMat);
        ship.add(turretBase);

        // Barrels
        for (let b = -1; b <= 1; b++) {
          const barrelGeo = new THREE.CylinderGeometry(0.12, 0.12, 3.2, 8);
          barrelGeo.rotateX(Math.PI / 2 - 0.15);
          barrelGeo.translate(b * 0.35, 1.6, 6.2 + t * 5.0);
          const barrel = new THREE.Mesh(barrelGeo, new THREE.MeshStandardMaterial({ color: 0x11141a, metalness: 0.9, roughness: 0.2 }));
          ship.add(barrel);
        }
      }

      // Glowing Red Propulsion Sub-light Engines (exactly as in video!)
      for (let e = -1; e <= 1; e += 2) {
        const nozGeo = new THREE.CylinderGeometry(0.8, 1.1, 1.4, 12);
        nozGeo.rotateX(Math.PI / 2);
        nozGeo.translate(e * 1.3, 0, -11.5);
        const noz = new THREE.Mesh(nozGeo, new THREE.MeshStandardMaterial({ color: 0x1a1d26, metalness: 0.9 }));
        ship.add(noz);

        // Intense Red Ion Glow Disc
        const redCoreGeo = new THREE.CircleGeometry(0.9, 16);
        redCoreGeo.translate(e * 1.3, 0, -12.2);
        const redCore = new THREE.Mesh(redCoreGeo, new THREE.MeshBasicMaterial({ color: 0xff1122, side: THREE.DoubleSide }));
        ship.add(redCore);
      }

      ship.position.set(posX, posY, posZ);
      ship.rotation.y = rotY;
      ship.scale.set(scale, scale, scale);
      return ship;
    };

    // Right-flank primary battleship (matching video composition)
    const flagship = buildBattleship(18, 5, -8, -0.45, 0.85);
    orbitGroup.add(flagship);

    // Distant background support cruiser
    const cruiser = buildBattleship(-24, 14, -28, 0.65, 0.45);
    orbitGroup.add(cruiser);

    // 4. Floating Asteroid Debris Rocks (from video)
    const rockMat = new THREE.MeshStandardMaterial({
      color: 0x3d3532,
      roughness: 0.95,
      metalness: 0.1,
    });
    for (let r = 0; r < 8; r++) {
      const rockGeo = new THREE.DodecahedronGeometry(1.2 + Math.random() * 1.8, 1);
      const rock = new THREE.Mesh(rockGeo, rockMat);
      const angle = (r / 8) * Math.PI * 1.8 - 0.4;
      const dist = 10 + Math.random() * 14;
      rock.position.set(Math.cos(angle) * dist, 1 + Math.random() * 8, Math.sin(angle) * dist);
      rock.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);
      orbitGroup.add(rock);
    }

    // 5. High-Energy Laser Tracer Beam Streaks
    for (let l = 0; l < 4; l++) {
      const laserGeo = new THREE.CylinderGeometry(0.04, 0.04, 18, 6);
      laserGeo.rotateZ(Math.PI / 4 + (l % 2) * 0.4);
      laserGeo.translate(10 - l * 8, 4 + l * 3, -12 - l * 5);
      const laserMat = new THREE.MeshBasicMaterial({
        color: l % 2 === 0 ? 0xff3322 : 0x00f0ff,
        transparent: true,
        opacity: 0.75,
        blending: THREE.AdditiveBlending,
      });
      const laser = new THREE.Mesh(laserGeo, laserMat);
      orbitGroup.add(laser);
    }

    this.group.add(orbitGroup);
  }
}
