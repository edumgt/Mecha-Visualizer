import * as THREE from 'three';
import { EnvironmentType } from '../types/eva';

/**
 * Procedural Glowing Tactical Floor Grid Overlay for NERV Hangar
 * Features:
 * - Anti-aliased dual coordinate grid lines (major 4m, minor 1m)
 * - Dynamic concentric ripples expanding outward from mecha feet
 * - Real-time holographic target tracking reticles locked to feet in 3D world space
 * - Hexagonal tactical honeycomb sector overlay
 * - Sync-rate responsive color shifting (Crimson alert < 50% -> Tactical Amber 50-75% -> NERV Neon Green >= 75%)
 * - Berserk crimson strobe overload effect
 * - Smooth environment fade-in/out
 */
export class EvaTacticalGrid {
  public group: THREE.Group;
  private mesh: THREE.Mesh;
  private material: THREE.ShaderMaterial;
  private isVisible: boolean = true;
  private envOpacity: number = 1.0;

  private leftFootPos: THREE.Vector3 = new THREE.Vector3(-0.7, 0, 0);
  private rightFootPos: THREE.Vector3 = new THREE.Vector3(0.7, 0, 0);
  private mechaPos: THREE.Vector3 = new THREE.Vector3(0, 0, 0);

  constructor() {
    this.group = new THREE.Group();
    this.group.name = 'EVA_TACTICAL_FLOOR_GRID';

    // 56m x 56m plane slightly above hangar floor (y = 0.035) to eliminate z-fighting
    const geometry = new THREE.PlaneGeometry(56, 56, 1, 1);
    geometry.rotateX(-Math.PI / 2);

    this.material = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
      uniforms: {
        uTime: { value: 0 },
        uSyncRate: { value: 78.4 },
        uMechaPos: { value: new THREE.Vector2(0, 0) },
        uLeftFootPos: { value: new THREE.Vector2(-0.7, 0) },
        uRightFootPos: { value: new THREE.Vector2(0.7, 0) },
        uBerserk: { value: 0.0 },
        uOpacity: { value: 1.0 },
        uColorHigh: { value: new THREE.Color(0x00ff66) },   // NERV Neon Green
        uColorMid: { value: new THREE.Color(0xf59e0b) },    // Tactical Amber
        uColorLow: { value: new THREE.Color(0xef4444) },    // Danger Red
        uColorBerserk: { value: new THREE.Color(0xff0033) },// Berserk Crimson
      },
      vertexShader: `
        varying vec2 vUv;
        varying vec3 vWorldPos;

        void main() {
          vUv = uv;
          vec4 worldPosition = modelMatrix * vec4(position, 1.0);
          vWorldPos = worldPosition.xyz;
          gl_Position = projectionMatrix * viewMatrix * worldPosition;
        }
      `,
      fragmentShader: `
        uniform float uTime;
        uniform float uSyncRate;
        uniform vec2 uMechaPos;
        uniform vec2 uLeftFootPos;
        uniform vec2 uRightFootPos;
        uniform float uBerserk;
        uniform float uOpacity;

        uniform vec3 uColorHigh;
        uniform vec3 uColorMid;
        uniform vec3 uColorLow;
        uniform vec3 uColorBerserk;

        varying vec2 vUv;
        varying vec3 vWorldPos;

        // Procedural 2D Hexagonal Grid Distance
        float hexDist(vec2 p) {
          p = abs(p);
          float c = dot(p, normalize(vec2(1.0, 1.7320508)));
          c = max(c, p.x);
          return c;
        }

        vec4 hexCoords(vec2 uv) {
          vec2 r = vec2(1.0, 1.7320508);
          vec2 h = r * 0.5;
          vec2 a = mod(uv, r) - h;
          vec2 b = mod(uv - h, r) - h;
          vec2 gv = dot(a, a) < dot(b, b) ? a : b;
          float x = atan(gv.x, gv.y);
          float y = 0.5 - hexDist(gv);
          vec2 id = uv - gv;
          return vec4(x, y, id.x, id.y);
        }

        void main() {
          if (uOpacity <= 0.001) {
            discard;
          }

          vec2 coord = vWorldPos.xz;
          float distCenter = length(coord - uMechaPos);

          // Outer circular falloff so the grid fades naturally into the hangar perimeter
          float outerFalloff = smoothstep(27.0, 16.0, distCenter);
          if (outerFalloff <= 0.001) {
            discard;
          }

          // 1. Dual Coordinate Grid Lines (Major 4m, Minor 1m) with analytical anti-aliasing
          vec2 majorGrid = abs(fract(coord * 0.25 - 0.5) - 0.5) / (fwidth(coord * 0.25) + 0.0001);
          float majorLine = 1.0 - min(min(majorGrid.x, majorGrid.y), 1.0);

          vec2 minorGrid = abs(fract(coord * 1.0 - 0.5) - 0.5) / (fwidth(coord * 1.0) + 0.0001);
          float minorLine = 1.0 - min(min(minorGrid.x, minorGrid.y), 1.0);

          float gridLines = majorLine * 0.75 + minorLine * 0.22;

          // 2. Concentric Radar & Sync Wave Ripples originating from mecha center
          // Expansion speed scales with sync rate: faster and crisper at high sync
          float waveSpeed = 2.0 + (uSyncRate / 100.0) * 3.5;
          float waveFreq = 1.25;
          float ripplePhase = distCenter * waveFreq - uTime * waveSpeed;
          float ripple = sin(ripplePhase) * 0.5 + 0.5;
          ripple = pow(ripple, 7.0) * smoothstep(20.0, 2.0, distCenter) * 0.85;

          // Concentric Range Rings (at 2m, 4m, 7m, 11m, 16m)
          float rangeRing1 = smoothstep(0.06, 0.0, abs(distCenter - 2.5));
          float rangeRing2 = smoothstep(0.08, 0.0, abs(distCenter - 5.0));
          float rangeRing3 = smoothstep(0.09, 0.0, abs(distCenter - 9.0));
          float rangeRing4 = smoothstep(0.10, 0.0, abs(distCenter - 14.0));
          float rangeRings = rangeRing1 * 0.9 + rangeRing2 * 0.75 + rangeRing3 * 0.6 + rangeRing4 * 0.45;

          // Segmented radial tick compass on range rings
          float angle = atan(coord.y - uMechaPos.y, coord.x - uMechaPos.x);
          float compassTicks = pow(sin(angle * 24.0) * 0.5 + 0.5, 32.0);
          float compassRing = smoothstep(0.08, 0.0, abs(distCenter - 5.0)) * compassTicks * 1.5;

          // 3. Holographic Reticles & Target Brackets locked to feet
          float dLeftFoot = length(coord - uLeftFootPos);
          float dRightFoot = length(coord - uRightFootPos);

          // Foot circle locks
          float footRingL = smoothstep(0.06, 0.0, abs(dLeftFoot - 0.55));
          float footRingR = smoothstep(0.06, 0.0, abs(dRightFoot - 0.55));
          float footInnerL = smoothstep(0.03, 0.0, abs(dLeftFoot - 0.18));
          float footInnerR = smoothstep(0.03, 0.0, abs(dRightFoot - 0.18));

          // Foot rectangular corner brackets
          vec2 boxL = abs(coord - uLeftFootPos);
          float boxBorderL = smoothstep(0.03, 0.0, abs(max(boxL.x, boxL.y) - 0.75));
          // Clip edges to leave only 4 tactical bracket corners
          float bracketCornersL = boxBorderL * step(0.5, min(boxL.x, boxL.y));

          vec2 boxR = abs(coord - uRightFootPos);
          float boxBorderR = smoothstep(0.03, 0.0, abs(max(boxR.x, boxR.y) - 0.75));
          float bracketCornersR = boxBorderR * step(0.5, min(boxR.x, boxR.y));

          float footTelemetry = (footRingL + footRingR) * 0.85 + (footInnerL + footInnerR) * 1.1 + (bracketCornersL + bracketCornersR) * 1.3;

          // 4. Hexagonal Tactical Sub-lattice Sector Overlay
          vec4 hex = hexCoords(coord * 0.55);
          float hexBorder = smoothstep(0.04, 0.0, abs(hex.y));
          float hexGlow = hexBorder * smoothstep(14.0, 0.5, distCenter) * 0.28;

          // 5. Center Catapult Runway Guide Crosshair
          float axisX = smoothstep(0.04, 0.0, abs(coord.x - uMechaPos.x)) * smoothstep(22.0, 0.0, abs(coord.y - uMechaPos.y));
          float axisZ = smoothstep(0.04, 0.0, abs(coord.y - uMechaPos.y)) * smoothstep(22.0, 0.0, abs(coord.x - uMechaPos.x));
          float runwayCross = (axisX + axisZ) * 0.5;

          // 6. Sync Rate Dynamic Color Interpolation
          // Sync curve: < 50% = Low (Red), 50% - 75% = Mid (Amber), >= 75% = High (NERV Green)
          vec3 baseColor;
          if (uSyncRate < 50.0) {
            float t = clamp(uSyncRate / 50.0, 0.0, 1.0);
            baseColor = mix(uColorLow, uColorMid, t);
          } else if (uSyncRate < 80.0) {
            float t = clamp((uSyncRate - 50.0) / 30.0, 0.0, 1.0);
            baseColor = mix(uColorMid, uColorHigh, t);
          } else {
            // High sync: luminous neon green with slight cyan boost
            float boost = clamp((uSyncRate - 80.0) / 20.0, 0.0, 1.0);
            baseColor = mix(uColorHigh, vec3(0.1, 1.0, 0.8), boost * 0.35);
          }

          // Berserk / Overclock corruption mode
          if (uBerserk > 0.5 || uSyncRate > 150.0) {
            float strobe = sin(uTime * 45.0) * 0.5 + 0.5;
            float jitter = fract(sin(dot(coord, vec2(12.9898, 78.233)) + uTime * 30.0) * 43758.5453);
            baseColor = mix(uColorBerserk, vec3(1.0, 0.4, 0.1), strobe * 0.3 + jitter * 0.2);
          }

          // Sync brightness multiplier
          float syncBrightness = clamp(0.6 + (uSyncRate / 100.0) * 0.65, 0.5, 2.2);

          // Total tactical grid luminance composition
          float totalGlow = (
            gridLines * 0.9 +
            ripple * 1.4 +
            rangeRings * 1.1 +
            compassRing * 1.0 +
            footTelemetry * 1.5 +
            hexGlow * 0.8 +
            runwayCross * 0.6
          ) * outerFalloff * syncBrightness * uOpacity;

          // Subtle background laser ground sheen
          vec3 groundSheen = baseColor * (0.015 + ripple * 0.04) * outerFalloff * uOpacity;

          vec3 finalColor = baseColor * totalGlow + groundSheen;
          float alpha = clamp(totalGlow * 0.9 + groundSheen.g * 1.5, 0.0, 0.95);

          gl_FragColor = vec4(finalColor, alpha);
        }
      `,
    });

    this.mesh = new THREE.Mesh(geometry, this.material);
    this.mesh.position.y = 0.035; // slightly above floor mesh
    this.mesh.renderOrder = 2;   // after opaque hangar floor
    this.group.add(this.mesh);
  }

  public setVisible(visible: boolean) {
    this.isVisible = visible;
  }

  public getVisible(): boolean {
    return this.isVisible;
  }

  public update(
    delta: number,
    elapsed: number,
    syncRate: number,
    leftFootWorldPos: THREE.Vector3,
    rightFootWorldPos: THREE.Vector3,
    rootWorldPos: THREE.Vector3,
    isBerserk: boolean,
    env: EnvironmentType
  ) {
    // Smoothly handle environment visibility (hangar only)
    const targetEnvOpacity = (this.isVisible && env === 'hangar') ? 1.0 : 0.0;
    this.envOpacity = THREE.MathUtils.damp(this.envOpacity, targetEnvOpacity, 6.0, delta);
    this.mesh.visible = this.envOpacity > 0.005;

    if (!this.mesh.visible) return;

    // Smooth foot & root tracking
    this.leftFootPos.lerp(leftFootWorldPos, 0.25);
    this.rightFootPos.lerp(rightFootWorldPos, 0.25);
    this.mechaPos.lerp(rootWorldPos, 0.25);

    const u = this.material.uniforms;
    u.uTime.value = elapsed;
    u.uSyncRate.value = syncRate;
    u.uBerserk.value = isBerserk ? 1.0 : 0.0;
    u.uOpacity.value = this.envOpacity;

    u.uMechaPos.value.set(this.mechaPos.x, this.mechaPos.z);
    u.uLeftFootPos.value.set(this.leftFootPos.x, this.leftFootPos.z);
    u.uRightFootPos.value.set(this.rightFootPos.x, this.rightFootPos.z);
  }

  public dispose() {
    this.mesh.geometry.dispose();
    this.material.dispose();
  }
}
