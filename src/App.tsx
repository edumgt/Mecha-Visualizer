/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import { EvaSceneController, CameraPreset } from './three/evaScene';
import { EnvironmentType, EvaPose, EvaUnitId, EvaWeapon } from './types/eva';
import { NervHeader } from './components/NervHeader';
import { NervDock } from './components/NervDock';
import { NervTelemetry } from './components/NervTelemetry';
import { ScreenDamageGlitchOverlay } from './components/ScreenDamageGlitchOverlay';
import { VideoReferenceModal } from './components/VideoReferenceModal';
import { evaAudio } from './audio/evaSoundEffects';

export default function App() {
  const mountRef = useRef<HTMLDivElement>(null);
  const controllerRef = useRef<EvaSceneController | null>(null);

  // States
  const [currentUnit, setCurrentUnit] = useState<EvaUnitId>('unit-01');
  const [currentPose, setCurrentPose] = useState<EvaPose>('stand');
  const [currentWeapon, setCurrentWeapon] = useState<EvaWeapon>('none');
  const [currentEnv, setCurrentEnv] = useState<EnvironmentType>('hangar');
  const [activeCamera, setActiveCamera] = useState<CameraPreset>('full');

  const [atFieldActive, setAtFieldActive] = useState<boolean>(false);
  const [cableConnected, setCableConnected] = useState<boolean>(true);
  const [laserScanActive, setLaserScanActive] = useState<boolean>(true);
  const [tacticalGridActive, setTacticalGridActive] = useState<boolean>(true);
  const [showVideoRef, setShowVideoRef] = useState<boolean>(false);
  const [explodedFactor, setExplodedFactor] = useState<number>(0);
  const [isMuted, setIsMuted] = useState<boolean>(false);

  // Immersion states: damage & telemetry
  const [damageLevel, setDamageLevel] = useState<number>(0);
  const [syncRate, setSyncRate] = useState<number>(78.4);
  const [batterySeconds, setBatterySeconds] = useState<number>(300);

  // Sync rate controller synchronization
  useEffect(() => {
    controllerRef.current?.setSyncRate(syncRate);
  }, [syncRate]);

  // 1. Initialize Three.js WebGL Scene in isolated ref container
  useEffect(() => {
    if (!mountRef.current) return;

    const controller = new EvaSceneController(mountRef.current, currentUnit);
    controllerRef.current = controller;

    return () => {
      controller.dispose();
      controllerRef.current = null;
    };
  }, []);

  // 2. Damage level decay loop
  useEffect(() => {
    if (damageLevel <= 0) return;
    const interval = setInterval(() => {
      setDamageLevel((prev) => Math.max(0, prev - 0.04));
    }, 50);
    return () => clearInterval(interval);
  }, [damageLevel]);

  // 3. Sync active environment with ambient procedural audio
  useEffect(() => {
    evaAudio.setEnvironment(currentEnv);
  }, [currentEnv]);

  // 3. Battery countdown loop when umbilical cable is detached
  useEffect(() => {
    if (cableConnected) {
      setBatterySeconds(300);
      return;
    }

    const interval = setInterval(() => {
      setBatterySeconds((prev) => {
        if (prev <= 0.1) {
          evaAudio.playAlarm();
          return 0;
        }
        // Critical alarm sound under 60 seconds
        if (prev <= 60 && Math.floor(prev) % 10 === 0) {
          evaAudio.playAlarm();
        }
        return Math.max(0, prev - 0.1);
      });
    }, 100);

    return () => clearInterval(interval);
  }, [cableConnected]);

  // 4. Sync Rate slight drift simulation
  useEffect(() => {
    const interval = setInterval(() => {
      if (currentUnit === 'berserk') {
        setSyncRate(400.0 + (Math.random() * 12 - 6));
      } else {
        setSyncRate((prev) => {
          const target = 78.4;
          const noise = (Math.random() - 0.5) * 0.4;
          return Math.max(40, Math.min(100, prev * 0.95 + target * 0.05 + noise));
        });
      }
    }, 400);

    return () => clearInterval(interval);
  }, [currentUnit]);

  // 5. Damage Trigger Handler
  const handleTriggerDamage = () => {
    setDamageLevel((prev) => Math.min(1.0, prev + 0.65));
    controllerRef.current?.triggerDamageShake(0.85);
    evaAudio.playDamageImpact();
    evaAudio.playGlitchStatic();
  };

  const handleQuickDrainBattery = () => {
    setCableConnected(false);
    controllerRef.current?.setCableConnected(false);
    setBatterySeconds(15);
    evaAudio.playAlarm();
    evaAudio.playGlitchStatic();
  };

  // 6. Keyboard Shortcuts for power users
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.key === 'b' || e.key === 'B') {
        const next = currentUnit === 'berserk' ? 'unit-01' : 'berserk';
        handleSelectUnit(next);
      } else if (e.key === 'd' || e.key === 'D') {
        handleTriggerDamage();
      } else if (e.key === 'l' || e.key === 'L') {
        handleToggleLaserScan();
      } else if (e.key === 'g' || e.key === 'G') {
        handleToggleTacticalGrid();
      } else if (e.key === 'v' || e.key === 'V') {
        setShowVideoRef((p) => !p);
      } else if (e.key === 'a' || e.key === 'A') {
        handleToggleAtField();
      } else if (e.key === 'c' || e.key === 'C') {
        handleToggleCable();
      } else if (e.key === 'p' || e.key === 'P') {
        evaAudio.triggerHydraulicPiston();
      } else if (e.key === '1') {
        handleSelectUnit('space-01');
      } else if (e.key === '2') {
        handleSelectUnit('unit-02');
      } else if (e.key === '0') {
        handleSelectUnit('unit-00');
      } else if (e.key === ' ') {
        e.preventDefault();
        handleSelectPose('combat');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentUnit, atFieldActive, cableConnected, laserScanActive, tacticalGridActive, showVideoRef]);

  // Model & State Handlers
  const handleApplyVideoPreset = () => {
    handleSelectUnit('space-01');
    handleSelectWeapon('spear');
    handleSelectPose('combat');
    handleSelectEnv('spaceOrbit');
    controllerRef.current?.model.setThrustersActive(true);
    evaAudio.playServo();
  };
  const handleToggleLaserScan = () => {
    setLaserScanActive((prev) => {
      const next = !prev;
      controllerRef.current?.setLaserScan(next);
      return next;
    });
  };
  const handleToggleTacticalGrid = () => {
    setTacticalGridActive((prev) => {
      const next = !prev;
      controllerRef.current?.setTacticalGrid(next);
      return next;
    });
  };
  const handleSetSyncRate = (val: number) => {
    setSyncRate(val);
    controllerRef.current?.setSyncRate(val);
  };
  const handleSelectUnit = (unit: EvaUnitId) => {
    setCurrentUnit(unit);
    if (unit === 'berserk') {
      setCurrentPose('berserk');
      setAtFieldActive(true);
      controllerRef.current?.setAtField(true);
    }
    controllerRef.current?.setUnit(unit);
  };

  const handleSelectPose = (pose: EvaPose) => {
    setCurrentPose(pose);
    controllerRef.current?.setPose(pose);
  };

  const handleSelectWeapon = (weapon: EvaWeapon) => {
    setCurrentWeapon(weapon);
    controllerRef.current?.setWeapon(weapon);
  };

  const handleSelectEnv = (env: EnvironmentType) => {
    setCurrentEnv(env);
    controllerRef.current?.setEnvironment(env);
  };

  const handleToggleAtField = () => {
    setAtFieldActive((prev) => {
      const next = !prev;
      controllerRef.current?.setAtField(next);
      return next;
    });
  };

  const handleToggleCable = () => {
    setCableConnected((prev) => {
      const next = !prev;
      controllerRef.current?.setCableConnected(next);
      return next;
    });
  };

  const handleChangeExploded = (val: number) => {
    setExplodedFactor(val);
    controllerRef.current?.setExplodedView(val);
  };

  const handleCameraSelect = (preset: CameraPreset) => {
    setActiveCamera(preset);
    controllerRef.current?.setCameraPreset(preset);
  };

  const handleToggleMute = () => {
    const next = !isMuted;
    setIsMuted(next);
    evaAudio.setMuted(next);
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-black select-none font-sans">
      {/* 3D WebGL Canvas Container */}
      <div
        ref={mountRef}
        className="w-full h-full cursor-grab active:cursor-grabbing"
      />

      {/* Screen-Space Vignette & Damage/Battery Glitch Effect */}
      <ScreenDamageGlitchOverlay
        batterySeconds={batterySeconds}
        isCableConnected={cableConnected}
        damageLevel={damageLevel}
        isBerserk={currentUnit === 'berserk'}
      />

      {/* Top Tactical Header */}
      <NervHeader
        currentUnit={currentUnit}
        onCameraSelect={handleCameraSelect}
        activeCamera={activeCamera}
        isMuted={isMuted}
        onToggleMute={handleToggleMute}
        syncRate={syncRate}
        batterySeconds={batterySeconds}
        isCableConnected={cableConnected}
      />

      {/* Corner Telemetry / MAGI Status */}
      <NervTelemetry
        currentUnit={currentUnit}
        syncRate={syncRate}
        batterySeconds={batterySeconds}
        isCableConnected={cableConnected}
        atFieldActive={atFieldActive}
      />

      {/* Keyboard Shortcut Helper Tag (discreet bottom-left) */}
      <div className="fixed bottom-3 left-4 z-10 pointer-events-none hidden lg:flex items-center space-x-2 text-[10px] font-mono text-[#4a5568]">
        <span>단축키: [1/2/0] 기체</span>
        <span>·</span>
        <span>[V] 영상 레퍼런스</span>
        <span>·</span>
        <span>[D] 피격 피해</span>
        <span>·</span>
        <span>[L] 레이저 스캔</span>
        <span>·</span>
        <span>[G] 전술 격자</span>
        <span>·</span>
        <span>[B] 폭주</span>
        <span>·</span>
        <span>[A] AT필드</span>
        <span>·</span>
        <span>[C] 전원선</span>
        <span>·</span>
        <span>[P] 유압/공압</span>
        <span>·</span>
        <span>[스페이스바] 전투</span>
        <span>·</span>
        <span>마우스 드래그: 360° 회전</span>
      </div>

      {/* Video Reference Player Modal */}
      <VideoReferenceModal
        isOpen={showVideoRef}
        onClose={() => setShowVideoRef(false)}
        onApplyVideoPreset={handleApplyVideoPreset}
      />

      {/* Consolidated Collapsible Bottom Control Dock */}
      <NervDock
        currentUnit={currentUnit}
        onSelectUnit={handleSelectUnit}
        currentPose={currentPose}
        onSelectPose={handleSelectPose}
        currentWeapon={currentWeapon}
        onSelectWeapon={handleSelectWeapon}
        currentEnv={currentEnv}
        onSelectEnv={handleSelectEnv}
        atFieldActive={atFieldActive}
        onToggleAtField={handleToggleAtField}
        cableConnected={cableConnected}
        onToggleCable={handleToggleCable}
        explodedFactor={explodedFactor}
        onChangeExploded={handleChangeExploded}
        onTriggerDamage={handleTriggerDamage}
        onQuickDrainBattery={handleQuickDrainBattery}
        laserScanActive={laserScanActive}
        onToggleLaserScan={handleToggleLaserScan}
        tacticalGridActive={tacticalGridActive}
        onToggleTacticalGrid={handleToggleTacticalGrid}
        syncRate={syncRate}
        onSetSyncRate={handleSetSyncRate}
        showVideoRef={showVideoRef}
        onToggleVideoRef={() => setShowVideoRef(!showVideoRef)}
      />
    </div>
  );
}
