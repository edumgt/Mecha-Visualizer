import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { EvaMaterialManager } from './evaMaterials';
import { EvaModel } from './evaModel';
import { EvaEnvironmentManager } from './evaHangar';
import { EvaLaserScanner } from './evaLaserScanner';
import { EvaTacticalGrid } from './evaTacticalGrid';
import { SportsCarModel } from './sportsCarModel';
import { DisplayMode, EnvironmentType, EvaPose, EvaUnitId, EvaWeapon } from '../types/eva';

export type CameraPreset = 'full' | 'head' | 'core' | 'hands' | 'spine' | 'combat' | 'side' | 'carFront' | 'carCockpit' | 'carRear' | 'carWheel';

export class EvaSceneController {
  private container: HTMLDivElement;
  private renderer: THREE.WebGLRenderer;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private controls: OrbitControls;

  private materials: EvaMaterialManager;
  public model: EvaModel;
  public sportsCar: SportsCarModel;
  public displayMode: DisplayMode = 'car';
  private envManager: EvaEnvironmentManager;
  public laserScanner: EvaLaserScanner;
  public tacticalGrid: EvaTacticalGrid;
  private currentUnit: EvaUnitId = 'unit-01';
  private currentEnv: EnvironmentType = 'hangar';
  private currentSyncRate: number = 78.4;
  private tempLeftFoot: THREE.Vector3 = new THREE.Vector3();
  private tempRightFoot: THREE.Vector3 = new THREE.Vector3();
  private tempRootPos: THREE.Vector3 = new THREE.Vector3();

  private keyLight: THREE.DirectionalLight;
  private fillLight: THREE.HemisphereLight;
  private rimLight: THREE.DirectionalLight;

  private isSoftwareGl: boolean;
  private animationFrameId: number = 0;
  private isDestroyed: boolean = false;
  private clock: THREE.Clock;

  // Camera damping targets
  private targetCamPos: THREE.Vector3 = new THREE.Vector3(0, 5.5, 12);
  private targetTargetPos: THREE.Vector3 = new THREE.Vector3(0, 5.0, 0);
  private isTransitioningCamera: boolean = false;
  private cameraTrauma: number = 0;

  constructor(container: HTMLDivElement, initialUnit: EvaUnitId = 'unit-01') {
    this.container = container;
    this.clock = new THREE.Clock();
    this.currentUnit = initialUnit;

    // 1. Software WebGL detection
    this.isSoftwareGl = (() => {
      const gl = document.createElement('canvas').getContext('webgl2');
      if (!gl) return true;
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
      const gpu = String(gl.getParameter(param));
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
    })();

    // 2. Setup Renderer
    this.renderer = new THREE.WebGLRenderer({
      antialias: !this.isSoftwareGl,
      powerPreference: 'high-performance',
      alpha: false,
    });
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;
    this.renderer.setPixelRatio(this.isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = !this.isSoftwareGl;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.setSize(container.clientWidth, container.clientHeight);

    container.appendChild(this.renderer.domElement);

    // 3. Scene & Camera
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(
      45,
      container.clientWidth / container.clientHeight,
      0.1,
      250
    );
    this.camera.position.set(0, 6.0, 14);

    // 4. OrbitControls
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = !this.isSoftwareGl;
    this.controls.dampingFactor = 0.05;
    this.controls.target.set(0, 5.0, 0);
    this.controls.maxPolarAngle = Math.PI / 2 + 0.05; // allow slightly below ground view
    this.controls.minDistance = 2.0;
    this.controls.maxDistance = 35.0;

    this.controls.addEventListener('start', () => {
      this.isTransitioningCamera = false;
    });

    // 5. Procedural Studio Environment Reflection (RoomEnvironment)
    const pmremGenerator = new THREE.PMREMGenerator(this.renderer);
    this.scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    pmremGenerator.dispose();

    // 6. Lighting Rig (Warm Key + Cool Fill + Rim)
    this.keyLight = new THREE.DirectionalLight(0xffeedd, 2.4);
    this.keyLight.position.set(8, 14, 10);
    this.keyLight.castShadow = !this.isSoftwareGl;
    this.keyLight.shadow.mapSize.width = this.isSoftwareGl ? 512 : 2048;
    this.keyLight.shadow.mapSize.height = this.isSoftwareGl ? 512 : 2048;
    this.keyLight.shadow.camera.near = 1;
    this.keyLight.shadow.camera.far = 40;
    const shadowD = 12;
    this.keyLight.shadow.camera.left = -shadowD;
    this.keyLight.shadow.camera.right = shadowD;
    this.keyLight.shadow.camera.top = shadowD;
    this.keyLight.shadow.camera.bottom = -shadowD;
    this.keyLight.shadow.bias = -0.0005;
    this.keyLight.shadow.normalBias = 0.02;
    this.scene.add(this.keyLight);

    // Cool fill light
    this.fillLight = new THREE.HemisphereLight(0x446699, 0x111622, 1.4);
    this.scene.add(this.fillLight);

    // Rim backlight
    this.rimLight = new THREE.DirectionalLight(0x00ff88, 1.2);
    this.rimLight.position.set(-6, 8, -8);
    this.scene.add(this.rimLight);

    // 7. Initialize Materials, Models, Environment
    this.materials = new EvaMaterialManager(initialUnit);
    this.model = new EvaModel(this.materials);
    this.sportsCar = new SportsCarModel(this.materials, initialUnit);

    this.scene.add(this.model.group);
    this.scene.add(this.sportsCar.group);

    // Default to sports car as requested
    this.setDisplayMode('car');

    this.envManager = new EvaEnvironmentManager();
    this.envManager.setup(this.scene, 'hangar');
    this.scene.add(this.envManager.group);

    // 8. Add Additive Laser Scanline System
    this.laserScanner = new EvaLaserScanner();
    this.laserScanner.setUnit(initialUnit);
    this.scene.add(this.laserScanner.group);

    // 9. Procedural Glowing Tactical Floor Grid Overlay
    this.tacticalGrid = new EvaTacticalGrid();
    this.scene.add(this.tacticalGrid.group);

    // Pre-warm shaders
    if (!this.isSoftwareGl) {
      this.renderer.compile(this.scene, this.camera);
    }

    // 8. Event Listeners
    window.addEventListener('resize', this.onResize);

    // 9. Start Render Loop
    this.startLoop();
  }

  private onResize = () => {
    if (!this.container || this.isDestroyed) return;
    const w = this.container.clientWidth;
    const h = this.container.clientHeight;
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
  };

  private afterDraw(cb: () => void) {
    const gl = this.renderer.getContext() as WebGL2RenderingContext;
    const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
    gl.flush();
    const poll = () => {
      if (this.isDestroyed) return;
      const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
      if (state === gl.UNSIGNALED) {
        this.animationFrameId = window.setTimeout(poll, 5);
      } else {
        if (sync) gl.deleteSync(sync);
        this.animationFrameId = window.setTimeout(cb, 80);
      }
    };
    this.animationFrameId = window.setTimeout(poll, 5);
  }

  private startLoop() {
    const tick = () => {
      if (this.isDestroyed) return;

      const delta = Math.min(this.clock.getDelta(), 0.1);
      const elapsed = this.clock.getElapsedTime();

      // Camera transition interpolation
      if (this.isTransitioningCamera) {
        const camLerp = 1.0 - Math.exp(-6.0 * delta);
        this.camera.position.lerp(this.targetCamPos, camLerp);
        this.controls.target.lerp(this.targetTargetPos, camLerp);
        if (this.camera.position.distanceTo(this.targetCamPos) < 0.05) {
          this.isTransitioningCamera = false;
        }
      }

      // Camera trauma / impact shake
      if (this.cameraTrauma > 0) {
        this.cameraTrauma = Math.max(0, this.cameraTrauma - delta * 2.2);
        const shake = this.cameraTrauma * this.cameraTrauma * 0.45;
        this.camera.position.x += (Math.random() - 0.5) * shake;
        this.camera.position.y += (Math.random() - 0.5) * shake;
      }

      this.controls.update();

      // Update model kinematics & animations
      if (this.displayMode === 'mecha') {
        this.model.update(delta, elapsed);
      } else {
        this.sportsCar.update(delta, elapsed, this.currentSyncRate);
      }

      // Update additive 3D scanline laser sweep
      this.laserScanner.update(delta, elapsed);

      // Update procedural glowing tactical floor grid
      const isBerserk = this.currentUnit === 'berserk';
      if (this.displayMode === 'mecha' && this.model && this.model.bones) {
        this.model.bones.leftFoot.getWorldPosition(this.tempLeftFoot);
        this.model.bones.rightFoot.getWorldPosition(this.tempRightFoot);
        this.model.bones.root.getWorldPosition(this.tempRootPos);
        this.tacticalGrid.update(
          delta,
          elapsed,
          this.currentSyncRate,
          this.tempLeftFoot,
          this.tempRightFoot,
          this.tempRootPos,
          isBerserk,
          this.currentEnv
        );
      } else if (this.displayMode === 'car') {
        // Track front/rear axle positions on floor grid
        this.tempLeftFoot.set(-1.0, 0, 1.45);
        this.tempRightFoot.set(1.0, 0, 1.45);
        this.tempRootPos.set(0, 0, 0);
        this.tacticalGrid.update(
          delta,
          elapsed,
          this.currentSyncRate,
          this.tempLeftFoot,
          this.tempRightFoot,
          this.tempRootPos,
          isBerserk,
          this.currentEnv
        );
      }

      this.renderer.render(this.scene, this.camera);

      if (this.isSoftwareGl) {
        this.afterDraw(tick);
      } else {
        this.animationFrameId = requestAnimationFrame(tick);
      }
    };

    if (this.isSoftwareGl) {
      this.afterDraw(tick);
    } else {
      this.animationFrameId = requestAnimationFrame(tick);
    }
  }

  public setUnit(unit: EvaUnitId) {
    this.currentUnit = unit;
    this.materials.updatePalette(unit);
    this.sportsCar.updatePalette(unit);
    this.laserScanner.setUnit(unit);
    const isBerserk = unit === 'berserk';
    this.model.setBerserkMode(isBerserk);

    // Rim light color shift based on unit
    if (unit === 'unit-01') {
      this.rimLight.color.setHex(0x00ff88);
      this.rimLight.intensity = 1.2;
    } else if (unit === 'unit-02') {
      this.rimLight.color.setHex(0xff3322);
      this.rimLight.intensity = 1.5;
    } else if (unit === 'unit-00') {
      this.rimLight.color.setHex(0x0099ff);
      this.rimLight.intensity = 1.4;
    } else if (unit === 'berserk') {
      this.rimLight.color.setHex(0xff0022);
      this.rimLight.intensity = 2.4;
    } else if (unit === 'space-01') {
      this.rimLight.color.setHex(0x00f0ff);
      this.rimLight.intensity = 2.2;
      this.model.setThrustersActive(true);
    }
  }

  public setDisplayMode(mode: DisplayMode) {
    this.displayMode = mode;
    if (mode === 'car') {
      this.model.group.visible = false;
      this.sportsCar.group.visible = true;
      // Adjust camera comfortably to sportscar viewpoint
      this.setCameraPreset('carFront');
    } else {
      this.model.group.visible = true;
      this.sportsCar.group.visible = false;
      this.setCameraPreset('full');
    }
  }

  public setCarDoors(open: boolean | number) {
    this.sportsCar.setDoorOpen(open);
  }

  public setCarSteering(angle: number) {
    this.sportsCar.setSteeringAngle(angle);
  }

  public setCarNitro(active: boolean) {
    this.sportsCar.setNitroActive(active);
  }

  public setPose(pose: EvaPose) {
    this.model.setPose(pose);
  }

  public setWeapon(weapon: EvaWeapon) {
    this.model.setWeapon(weapon);
  }

  public setEnvironment(type: EnvironmentType) {
    this.currentEnv = type;
    this.envManager.setup(this.scene, type);
    if (type === 'spaceOrbit') {
      this.model.setThrustersActive(true);
    }
  }

  public setExplodedView(factor: number) {
    this.model.setExplodedView(factor);
    if (this.displayMode === 'car') {
      // For car, open scissor doors dynamically
      this.sportsCar.setDoorOpen(factor);
    }
  }

  public setAtField(active: boolean) {
    this.model.setAtFieldVisible(active);
  }

  public setCableConnected(connected: boolean) {
    this.model.setCableConnected(connected);
  }

  public setCameraPreset(preset: CameraPreset) {
    this.isTransitioningCamera = true;
    switch (preset) {
      case 'full':
        if (this.displayMode === 'car') {
          this.targetCamPos.set(4.8, 2.2, 5.8);
          this.targetTargetPos.set(0, 0.65, 0);
        } else {
          this.targetCamPos.set(0, 5.5, 14);
          this.targetTargetPos.set(0, 5.0, 0);
        }
        break;
      case 'carFront':
        this.targetCamPos.set(2.8, 1.4, 4.4);
        this.targetTargetPos.set(0, 0.55, 0.5);
        break;
      case 'carCockpit':
        this.targetCamPos.set(-0.35, 1.15, 0.0);
        this.targetTargetPos.set(-0.35, 0.75, 1.2);
        break;
      case 'carRear':
        this.targetCamPos.set(-3.2, 1.6, -4.6);
        this.targetTargetPos.set(0, 0.6, -0.5);
        break;
      case 'carWheel':
        this.targetCamPos.set(2.2, 0.65, 1.8);
        this.targetTargetPos.set(0.98, 0.38, 1.45);
        break;
      case 'head':
        this.targetCamPos.set(0, 7.8, 3.2);
        this.targetTargetPos.set(0, 7.6, 0.2);
        break;
      case 'core':
        this.targetCamPos.set(0, 5.6, 3.0);
        this.targetTargetPos.set(0, 5.4, 0.3);
        break;
      case 'hands':
        this.targetCamPos.set(2.0, 4.4, 2.8);
        this.targetTargetPos.set(1.4, 4.1, 0.2);
        break;
      case 'spine':
        this.targetCamPos.set(0, 5.8, -4.5);
        this.targetTargetPos.set(0, 5.2, 0);
        break;
      case 'combat':
        this.targetCamPos.set(-4.5, 4.2, 9.5);
        this.targetTargetPos.set(0, 4.8, 0);
        break;
      case 'side':
        if (this.displayMode === 'car') {
          this.targetCamPos.set(5.5, 1.2, 0);
          this.targetTargetPos.set(0, 0.55, 0);
        } else {
          this.targetCamPos.set(11, 5.5, 0);
          this.targetTargetPos.set(0, 5.0, 0);
        }
        break;
    }
  }

  public triggerDamageShake(amount = 0.8) {
    this.cameraTrauma = Math.min(1.0, this.cameraTrauma + amount);
  }

  public setLaserScan(visible: boolean) {
    this.laserScanner.setVisible(visible);
  }

  public setSyncRate(sync: number) {
    this.currentSyncRate = sync;
  }

  public setTacticalGrid(visible: boolean) {
    this.tacticalGrid.setVisible(visible);
  }

  public dispose() {
    this.isDestroyed = true;
    window.removeEventListener('resize', this.onResize);

    if (this.isSoftwareGl) {
      clearTimeout(this.animationFrameId);
    } else {
      cancelAnimationFrame(this.animationFrameId);
    }

    this.controls.dispose();
    this.laserScanner.dispose();
    this.tacticalGrid.dispose();
    this.sportsCar.dispose();
    this.materials.dispose();
    this.renderer.dispose();
    if (this.renderer.domElement.parentElement) {
      this.renderer.domElement.parentElement.removeChild(this.renderer.domElement);
    }
  }
}
