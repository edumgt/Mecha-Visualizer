import React, { useEffect, useState } from 'react';
import { AlertTriangle, ZapOff, Activity } from 'lucide-react';

interface ScreenDamageGlitchOverlayProps {
  batterySeconds: number;
  isCableConnected: boolean;
  damageLevel: number; // 0 to 1
  isBerserk: boolean;
}

export const ScreenDamageGlitchOverlay: React.FC<ScreenDamageGlitchOverlayProps> = ({
  batterySeconds,
  isCableConnected,
  damageLevel,
  isBerserk,
}) => {
  const [glitchOffset, setGlitchOffset] = useState({ x: 0, y: 0, active: false });
  const [pulseTime, setPulseTime] = useState(0);

  // Compute battery danger (0.0 to 1.0)
  let batteryDanger = 0;
  if (!isCableConnected) {
    if (batterySeconds <= 0) {
      batteryDanger = 1.0;
    } else if (batterySeconds < 30) {
      batteryDanger = 0.85 + (1 - batterySeconds / 30) * 0.15;
    } else if (batterySeconds < 90) {
      batteryDanger = 0.5 + (1 - (batterySeconds - 30) / 60) * 0.35;
    } else if (batterySeconds < 180) {
      batteryDanger = (1 - (batterySeconds - 90) / 90) * 0.5;
    }
  }

  // Combined overall intensity (0 to 1)
  const totalIntensity = Math.min(1.0, Math.max(batteryDanger, damageLevel) + (isBerserk ? 0.3 : 0));

  // Pulse & glitch ticker
  useEffect(() => {
    let animId: number;
    let lastTime = performance.now();

    const loop = (time: number) => {
      const dt = (time - lastTime) / 1000;
      lastTime = time;

      setPulseTime((prev) => prev + dt);

      // Random glitch slices trigger frequently when intensity is high
      if (totalIntensity > 0.15) {
        const glitchChance = totalIntensity * 0.45;
        if (Math.random() < glitchChance) {
          setGlitchOffset({
            x: (Math.random() - 0.5) * totalIntensity * 28,
            y: (Math.random() - 0.5) * totalIntensity * 12,
            active: true,
          });
        } else {
          setGlitchOffset((prev) => (prev.active ? { ...prev, active: false } : prev));
        }
      } else {
        setGlitchOffset({ x: 0, y: 0, active: false });
      }

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [totalIntensity]);

  if (totalIntensity <= 0.02) {
    return null;
  }

  // Vignette calculations
  const pulseSpeed = 2.0 + totalIntensity * 6.0;
  const pulse = Math.sin(pulseTime * pulseSpeed);
  const vignetteSpread = Math.max(25, 75 - totalIntensity * 38 + pulse * (totalIntensity * 6));
  const vignetteAlpha = Math.min(0.88, totalIntensity * 0.75 + pulse * (totalIntensity * 0.1));

  // Color selection: Crimson red for damage/critical battery, eerie purple-red for Berserk, amber for mid-battery warning
  let vignetteColor = 'rgba(235, 15, 35, ';
  if (isBerserk) {
    vignetteColor = 'rgba(180, 0, 40, ';
  } else if (batteryDanger > 0 && batteryDanger < 0.6 && damageLevel < 0.3) {
    vignetteColor = 'rgba(240, 110, 0, ';
  }

  return (
    <div className="fixed inset-0 pointer-events-none z-15 overflow-hidden select-none">
      {/* 1. Dynamic Peripheral Screen-Space Vignette */}
      <div
        className="absolute inset-0 transition-opacity duration-150"
        style={{
          background: `radial-gradient(ellipse at center, transparent ${vignetteSpread}%, ${vignetteColor}${vignetteAlpha}) 100%)`,
        }}
      />

      {/* 2. Tactical Scanlines & CRT Horizontal Noise Grid */}
      {totalIntensity > 0.12 && (
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0, 0, 0, 0.75) 3px, rgba(0, 0, 0, 0.75) 4px)`,
          }}
        />
      )}

      {/* 3. Chromatic Aberration & Glitch Tear Slices */}
      {glitchOffset.active && totalIntensity > 0.25 && (
        <>
          {/* Red/Cyan Color Separation Slices */}
          <div
            className="absolute inset-0 mix-blend-screen opacity-40 bg-red-600 pointer-events-none"
            style={{
              clipPath: `polygon(0% ${20 + glitchOffset.y * 2}%, 100% ${20 + glitchOffset.y * 2}%, 100% ${35 + glitchOffset.y * 2}%, 0% ${35 + glitchOffset.y * 2}%)`,
              transform: `translateX(${glitchOffset.x}px)`,
            }}
          />
          <div
            className="absolute inset-0 mix-blend-screen opacity-40 bg-cyan-500 pointer-events-none"
            style={{
              clipPath: `polygon(0% ${60 - glitchOffset.y}%, 100% ${60 - glitchOffset.y}%, 100% ${75 - glitchOffset.y}%, 0% ${75 - glitchOffset.y}%)`,
              transform: `translateX(${-glitchOffset.x}px)`,
            }}
          />
        </>
      )}

      {/* 4. High-Damage Flash (White/Red Impact Strobe) */}
      {damageLevel > 0.4 && (
        <div
          className="absolute inset-0 bg-red-600/30 transition-opacity duration-100 ease-out"
          style={{ opacity: damageLevel * 0.6 }}
        />
      )}

      {/* 5. NERV Emergency Tactical Warning Banners (when danger > 0.4) */}
      {totalIntensity > 0.45 && (
        <div className="absolute top-14 left-1/2 -translate-x-1/2 flex flex-col items-center space-y-1.5 animate-pulse">
          {/* Main Emergency Badge */}
          <div className="bg-[#cc0022] border-2 border-white px-6 py-1.5 shadow-2xl flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-white" />
            <span className="font-mono font-bold tracking-widest text-sm text-white">
              EMERGENCY // 警報
            </span>
            <AlertTriangle className="w-5 h-5 text-white" />
          </div>

          {/* Subtext Warning */}
          <div className="bg-black/90 border border-[#ff2233] px-4 py-1 text-center font-mono text-xs text-[#ff4444] shadow-md">
            {!isCableConnected && batterySeconds <= 0 ? (
              <span className="flex items-center space-x-1.5 text-white font-bold">
                <ZapOff className="w-3.5 h-3.5 text-red-400" />
                <span>내부 전원 완전 고갈 — 시스템 셧다운 임박</span>
              </span>
            ) : !isCableConnected && batterySeconds < 60 ? (
              <span className="flex items-center space-x-1.5 text-red-200">
                <ZapOff className="w-3.5 h-3.5 text-red-400" />
                <span>비상 전원 위험 수위 [{(batterySeconds).toFixed(0)}초 잔여] — 케이블 재연결 요망</span>
              </span>
            ) : damageLevel > 0.35 ? (
              <span className="flex items-center space-x-1.5 text-yellow-300">
                <Activity className="w-3.5 h-3.5 text-yellow-400" />
                <span>선체 기밀 파손 감지 — 장갑 손상도 {(damageLevel * 100).toFixed(0)}%</span>
              </span>
            ) : (
              <span>신경 링크 임계치 돌파 — 파일럿 뇌파 불안정</span>
            )}
          </div>
        </div>
      )}

      {/* 6. Hexagonal NERV Corner Warning Brackets */}
      {totalIntensity > 0.35 && (
        <div className="absolute inset-0 p-3 pointer-events-none flex flex-col justify-between">
          <div className="flex justify-between font-mono text-[10px] text-[#ff3344] tracking-widest">
            <div>[ WARN_LVL: {(totalIntensity * 100).toFixed(0)}% ]</div>
            <div>[ VOLTAGE: UNSTABLE ]</div>
          </div>
          <div className="flex justify-between font-mono text-[10px] text-[#ff3344] tracking-widest">
            <div>[ CODE: 601 ]</div>
            <div>[ MAGI OVERRIDE READY ]</div>
          </div>
        </div>
      )}
    </div>
  );
};
