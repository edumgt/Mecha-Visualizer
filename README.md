# EVA-01 Mecha Visualizer

Interactive Evangelion-style biomechanical mecha viewer. The 3D scene is **vanilla Three.js** (not React Three Fiber), mounted into a React shell. There are no glTF/OBJ assets: the unit, weapons, environments, textures, and most VFX are built at runtime from primitives, `CanvasTexture`s, and one custom GLSL shader.

## Tech stack

| Layer | Choice | Role |
| --- | --- | --- |
| Language | TypeScript (ES2022, `jsx: react-jsx`) | Scene classes and React UI |
| UI | React 19 | HUD, controls, and the DOM mount point for the canvas |
| Bundler | Vite 8 + `@vitejs/plugin-react` | Dev server (`:3000`) and production build |
| Styling | Tailwind CSS 4 (`@tailwindcss/vite`) | NERV HUD only; not used inside WebGL |
| 3D | `three` ^0.186 (`@types/three`) | Renderer, scene graph, materials, controls |
| Icons | `lucide-react` | HUD glyphs |
| Audio | Web Audio API | Procedural SFX; no audio files |
| Fonts | Chakra Petch, Share Tech Mono, Noto Sans KR | HUD and canvas decals |

Three.js is imported as a namespace (`import * as THREE from 'three'`). Addons come from `three/examples/jsm`:

- `controls/OrbitControls.js` — orbit, zoom, damping
- `environments/RoomEnvironment.js` — studio IBL, sampled through `PMREMGenerator`

Not used: React Three Fiber, `@react-three/drei`, `GLTFLoader`, `AnimationMixer`, `EffectComposer`, or any post-processing pass. Screen damage and glitch are a React overlay on top of the canvas, not a Three.js render pass.

`package.json` also lists `@google/genai`, `express`, `dotenv`, and `motion`. They are not imported by the current source.

## How 3D is wired

React owns interaction state. Three.js owns the frame loop. They meet through one imperative controller.

```
App (React)
  mountRef <div>
    EvaSceneController          src/three/evaScene.ts
      WebGLRenderer / Scene / PerspectiveCamera / OrbitControls
      EvaMaterialManager         src/three/evaMaterials.ts
      EvaModel                   src/three/evaModel.ts
      EvaEnvironmentManager      src/three/evaHangar.ts
      EvaLaserScanner            src/three/evaLaserScanner.ts
      EvaTacticalGrid            src/three/evaTacticalGrid.ts
```

`App` creates the controller once:

```ts
const controller = new EvaSceneController(mountRef.current, currentUnit);
```

UI handlers call methods (`setUnit`, `setPose`, `setWeapon`, `setEnvironment`, `setAtField`, `setCameraPreset`, …). The controller is disposed on unmount (`cancelAnimationFrame` or `clearTimeout`, control/material/renderer disposal, canvas removal).

## Renderer setup

`EvaSceneController` builds a single `WebGLRenderer` and appends `renderer.domElement` to the React div.

| Setting | Value | Why |
| --- | --- | --- |
| Output | `SRGBColorSpace` | Correct color on the canvas |
| Tone mapping | `ACESFilmicToneMapping`, exposure `1.15` | Film-like highlights on lacquer and emissives |
| Camera | `PerspectiveCamera`, FOV 45, near 0.1, far 250 | Full-body framing with close-up presets |
| Shadows | `PCFSoftShadowMap`, 2048² directional map | Soft contact on hangar/city; disabled on software GL |
| Pixel ratio | `min(devicePixelRatio, 2)` | Caps fill-rate cost |
| IBL | `PMREMGenerator.fromScene(new RoomEnvironment(), 0.04)` | Reflections on `MeshPhysicalMaterial` clearcoat without an HDR file |
| Lights | Warm `DirectionalLight` key, cool `HemisphereLight` fill, unit-tinted rim `DirectionalLight` | Armor read + silhouette |

`renderer.compile(scene, camera)` pre-warms shaders on hardware GL.

### Software-GL fallback

On startup the controller probes `webgl2` and `WEBGL_debug_renderer_info`. If the renderer string matches SwiftShader, llvmpipe, softpipe, or similar, it drops antialias, shadows, and OrbitControls damping, forces pixel ratio 1, and paces the loop with `gl.fenceSync` + `setTimeout` instead of `requestAnimationFrame`. Hardware GL uses a normal rAF loop. Delta time is clamped to 0.1s.

### Camera motion

Presets (`full`, `head`, `core`, `hands`, `spine`, `combat`, `side`) set a target position and look-at. While transitioning, both are exponentially smoothed:

```ts
const camLerp = 1.0 - Math.exp(-6.0 * delta);
camera.position.lerp(targetCamPos, camLerp);
controls.target.lerp(targetTargetPos, camLerp);
```

A user drag cancels the transition. Impact shake adds trauma that decays linearly and offsets the camera by `trauma²`.

## Procedural model (no imported mesh)

`EvaModel` is a hand-built scene graph, not a skinned character. Joints are nested `THREE.Group`s (`root → pelvis → torso → chest → neck → head`, plus shoulders, arms, forearms, hands, thighs, shins, feet, pylons). Posing writes Euler angles on those groups. There is no `SkinnedMesh`, skeleton, or clip.

Geometry is composed from:

| Primitive | Used for |
| --- | --- |
| `BoxGeometry`, `CylinderGeometry`, `SphereGeometry`, `ConeGeometry`, `TorusGeometry` | Chassis, vertebrae, pistons, nozzles, core ring |
| `ExtrudeGeometry` + `THREE.Shape` | Beveled pectoral, rib, and groin plates |
| `IcosahedronGeometry` (wireframe) | Inner S² core seed |
| `TubeGeometry` + `CatmullRomCurve3` | Progressive-knife / spear tines and cable-like curves |
| `DodecahedronGeometry` | Asteroid debris |
| Open `CylinderGeometry` / `ConeGeometry` (`openEnded`) | Ion beams and flame plumes |

Armor plates are registered with an explode direction. Exploded view damps a 0–1 factor (`MathUtils.damp`) and offsets each plate from its base position along that vector.

Weapons (progressive knife, pallet rifle, Spear of Longinus) are child groups of the right hand and toggled with `.visible`. The same pattern drives the AT Field plane, umbilical cable, berserk halo, and thruster plumes.

Unit swaps do **not** rebuild the mesh. `EvaMaterialManager.updatePalette()` recolors shared materials and regenerates the shoulder-pylon decal texture.

## Materials and procedural textures

All textures are `CanvasTexture`s painted with the 2D canvas API. Nothing is loaded from disk.

| Factory | Material use |
| --- | --- |
| `createArmorPanelBumpTexture` | 1024² bump: carbon weave, panel seams, hex rivets, scratches. `RepeatWrapping`, repeat 2 |
| `createSyntheticMuscleTexture` | Longitudinal fiber + annular band bump for bio-muscle |
| `createPylonDecalTexture` | Unit number / NERV stencil, `SRGBColorSpace` |
| `createHazardTexture` | Repeating caution stripes |
| `createAtFieldTexture` | Octagonal rings, additive |
| `createRadialShadowTexture` | Soft contact shadow under the feet |
| `createIonBeamTexture` / `createFlamePlumeTexture` | Vertical gradients masked with a radial `destination-in` |

Physically based surfaces use `MeshPhysicalMaterial` and `MeshStandardMaterial`:

- Primary armor: metalness 0.45, roughness 0.22, clearcoat 0.95, bump map
- S² core: emissive + `transmission: 0.25`, `ior: 1.75`, clearcoat
- Optic glass: `transmission: 0.85`, `ior: 1.52`
- Chrome pistons / gold collars / anodized titanium: high metalness, low roughness, so they pick up the RoomEnvironment IBL

Unlit effects use `MeshBasicMaterial` with `AdditiveBlending`, `depthWrite: false`, and usually `DoubleSide`. That covers the AT Field, laser plane, ion/flame plumes, and contact shadow. Emissive armor accents (`accent`, visor) stay on `MeshStandardMaterial` so they still receive light.

## Animation method

There is no animation clip system. `EvaModel.update(delta, elapsed)` runs every frame:

1. **Pose damping.** Seven presets (`stand`, `combat`, `sprint`, `berserk`, `atField`, `sniper`, `knife`) store Euler triples and a root Y. Each joint lerps with `alpha = 1 - exp(-8 * delta)`.
2. **Secondary motion.** Chest scale breathes with `sin(elapsed * 1.8)`. The AT Field pulses and yaws. The berserk halo spins and scales. The core `emissiveIntensity` pulses while the inner icosahedron rotates. Visible thruster groups jitter on Z with a fast sine plus noise.

The laser scanner is a separate object. A sine sweep (about 0.35–10.5 m) is eased again with `sin` so the plane accelerates through the torso and slows at the extremes. Curtain planes scale with sweep height. Color follows the active unit.

## Custom shader: tactical floor grid

`EvaTacticalGrid` is the only `ShaderMaterial`. A 56×56 m plane sits at `y = 0.035` (`renderOrder = 2`) to avoid z-fighting with the hangar floor. Blending is additive; depth write is off.

The vertex shader passes UV and world position. The fragment shader, in world XZ:

- Dual grid (4 m / 1 m) with analytical AA via `fwidth`
- Sync-rate ripples and range rings from the mecha root
- Foot reticles and corner brackets from world-space foot positions (`getWorldPosition` each frame, then lerped)
- Hex lattice (`hexDist` / `hexCoords`)
- Color ramp: red &lt; 50% sync, amber through ~80%, neon green above; berserk / sync &gt; 150 forces a crimson strobe
- `discard` outside a radial falloff and when opacity is ~0

Opacity damps to 0 outside the hangar so the grid does not render in orbit, Tokyo-3, the red ocean, or the void.

## Environments

`EvaEnvironmentManager.setup()` clears its group and rebuilds one of five procedural sets. Each set also replaces `scene.background` and `scene.fog` (`FogExp2`).

| Environment | Method |
| --- | --- |
| `hangar` | Canvas-textured 60 m floor, catapult rails, box gantries, hazard-mapped guards |
| `tokyo3` | 120 m asphalt plane plus radial `BoxGeometry` buildings with emissive window bands |
| `redOcean` | `MeshPhysicalMaterial` sea (clearcoat + emissive) and horizon cross pylons |
| `darkVoid` | `GridHelper` plus concentric `RingGeometry` |
| `spaceOrbit` | Canvas-textured Earth sphere, `BackSide` additive atmosphere, 600-point `Points` starfield, box/cone battleships, dodecahedron debris, additive tracer beams |

Switching to `spaceOrbit` also shows the thruster plume group.

## Frame loop

Hardware path, in order:

1. Clamp delta, read elapsed time
2. Camera preset lerp and trauma shake
3. `controls.update()` (damping)
4. `model.update` — pose, breath, VFX
5. `laserScanner.update` — sweep
6. Foot/root world positions → `tacticalGrid.update` uniforms
7. `renderer.render(scene, camera)`
8. `requestAnimationFrame`

Resize updates camera aspect, projection matrix, and renderer size.

## Project layout

```
src/
  main.tsx                 React root
  App.tsx                  State, keyboard shortcuts, controller lifecycle
  types/eva.ts             Unit, pose, weapon, environment unions
  three/
    evaScene.ts            Renderer, lights, IBL, loop, camera presets
    evaModel.ts            Procedural hierarchy, poses, weapons, VFX hooks
    evaMaterials.ts        PBR materials and CanvasTexture factories
    evaHangar.ts           Five procedural environments
    evaLaserScanner.ts     Additive scan plane and curtains
    evaTacticalGrid.ts     GLSL floor overlay
  components/              React HUD (dock, header, telemetry, glitch, video modal)
  audio/evaSoundEffects.ts Web Audio synthesis
```

## Run

```bash
npm install
npm run dev      # Vite on 0.0.0.0:3000
npm run lint     # tsc --noEmit
npm run build    # production bundle
npm run preview
```

WebGL2 is required. On a software rasterizer the scene still runs, with antialias, shadows, and control damping turned off.
