import React from 'react';
import { CameraPreset } from '../three/evaScene';
import { EvaUnitId } from '../types/eva';
import { Volume2, VolumeX, Eye, ShieldAlert, Cpu } from 'lucide-react';
import { evaAudio } from '../audio/evaSoundEffects';

interface NervHeaderProps {
  currentUnit: EvaUnitId;
  onCameraSelect: (preset: CameraPreset) => void;
  activeCamera: CameraPreset;
  isMuted: boolean;
  onToggleMute: () => void;
  syncRate: number;
  batterySeconds: number;
  isCableConnected: boolean;
}

export const NervHeader: React.FC<NervHeaderProps> = ({
  currentUnit,
  onCameraSelect,
  activeCamera,
  isMuted,
  onToggleMute,
  syncRate,
  batterySeconds,
  isCableConnected,
}) => {
  const formatBatteryTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    const ms = Math.floor((seconds % 1) * 100);
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}:${String(ms).padStart(2, '0')}`;
  };

  const getUnitName = () => {
    switch (currentUnit) {
      case 'unit-01': return { code: 'TEST TYPE 01', kr: '에반게리온 초호기 (이카리 신지)' };
      case 'unit-02': return { code: 'PRODUCTION MODEL 02', kr: '에반게리온 2호기 (아스카)' };
      case 'unit-00': return { code: 'PROTOTYPE 00', kr: '에반게리온 0호기 (아야나미 레이)' };
      case 'berserk': return { code: 'AWAKENED 01', kr: '에반게리온 초호기 [폭주 / 각성]' };
      case 'space-01': return { code: 'SPACE COMBAT 01', kr: '에반게리온 초호기 [우주 함대 결전형]' };
    }
  };

  const unitInfo = getUnitName();
  const isBerserk = currentUnit === 'berserk';

  return (
    <header className="fixed top-0 left-0 right-0 z-20 select-none bg-[#0a0d14] border-b border-[#202736] px-4 py-2.5 flex items-center justify-between text-xs text-[#a0aec0]">
      {/* Top Left: NERV Badge & Unit Identity */}
      <div className="flex items-center space-x-3">
        <div className={`px-2.5 py-1 font-mono font-bold tracking-wider text-xs border ${
          isBerserk
            ? 'bg-[#3b0808] border-[#ff2200] text-[#ff4422]'
            : 'bg-[#121926] border-[#00ff66]/50 text-[#00ff66]'
        }`}>
          NERV HQ
        </div>

        <div className="flex flex-col">
          <div className="flex items-center space-x-2">
            <span className="font-mono font-bold text-sm text-white tracking-widest">
              {unitInfo.code}
            </span>
            <span className={`px-1.5 py-0.2 rounded text-[10px] font-mono border ${
              isBerserk 
                ? 'bg-[#ff0033]/20 border-[#ff0033] text-[#ff6677]' 
                : 'bg-[#00ff66]/15 border-[#00ff66]/40 text-[#00ff66]'
            }`}>
              {isBerserk ? 'BERSERK ACTIVE' : 'COMBAT READY'}
            </span>
          </div>
          <span className="text-[11px] text-[#718096] font-sans">
            {unitInfo.kr}
          </span>
        </div>
      </div>

      {/* Center: Tactical Telemetry (Battery & Sync) */}
      <div className="hidden md:flex items-center space-x-6 bg-[#0f141e] border border-[#232c3d] px-4 py-1.5 rounded">
        {/* Battery status */}
        <div className="flex items-center space-x-2">
          <Cpu className={`w-3.5 h-3.5 ${isCableConnected ? 'text-[#00ff66]' : 'text-[#ffaa00]'}`} />
          <div className="flex flex-col">
            <span className="text-[9px] font-mono text-[#718096]">
              {isCableConnected ? '엄빌리컬 케이블 연결' : '내부 비상 전원 (5분)'}
            </span>
            <span className={`font-mono font-bold text-xs ${
              isCableConnected 
                ? 'text-[#00ff66]' 
                : batterySeconds < 60 ? 'text-[#ff3322]' : 'text-[#ffaa00]'
            }`}>
              {isCableConnected ? 'EXTERNAL POWER: 100%' : `LIMIT: ${formatBatteryTime(batterySeconds)}`}
            </span>
          </div>
        </div>

        <div className="h-6 w-px bg-[#232c3d]" />

        {/* Sync Rate */}
        <div className="flex items-center space-x-2">
          <ShieldAlert className={`w-3.5 h-3.5 ${isBerserk ? 'text-[#ff2200]' : 'text-[#00ff66]'}`} />
          <div className="flex flex-col">
            <span className="text-[9px] font-mono text-[#718096]">파일럿 신경 싱크로율</span>
            <div className="flex items-baseline space-x-1">
              <span className={`font-mono font-bold text-xs ${isBerserk ? 'text-[#ff2200]' : 'text-white'}`}>
                {syncRate.toFixed(1)}%
              </span>
              <span className="text-[9px] font-mono text-[#718096]">
                {isBerserk ? 'UNCONTROLLABLE' : 'HARMONIC'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Top Right: Camera Presets & Audio Mute */}
      <div className="flex items-center space-x-2">
        <div className="hidden sm:flex items-center space-x-1 bg-[#131924] border border-[#232d3e] p-1 rounded">
          {(['full', 'head', 'core', 'hands', 'spine', 'combat', 'side'] as CameraPreset[]).map((cam) => {
            const labels: Record<CameraPreset, string> = {
              full: '전신',
              head: '헤드',
              core: '코어',
              hands: '손/관절',
              spine: '척추/등',
              combat: '전투',
              side: '측면',
            };
            const isActive = activeCamera === cam;
            return (
              <button
                key={cam}
                onClick={() => {
                  evaAudio.playServo();
                  onCameraSelect(cam);
                }}
                className={`px-2.5 py-1 rounded text-[11px] font-mono transition-colors ${
                  isActive
                    ? 'bg-[#00ff66] text-black font-bold'
                    : 'text-[#a0aec0] hover:text-white hover:bg-[#1a2332]'
                }`}
              >
                {labels[cam]}
              </button>
            );
          })}
        </div>

        {/* Audio Mute button */}
        <button
          onClick={onToggleMute}
          title={isMuted ? '음소거 해제' : '음소거'}
          className={`p-2 rounded border transition-colors ${
            isMuted
              ? 'bg-[#1b202c] border-[#313b4d] text-[#718096]'
              : 'bg-[#131924] border-[#253246] text-[#00ff66] hover:bg-[#1a2332]'
          }`}
        >
          {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        </button>
      </div>
    </header>
  );
};
