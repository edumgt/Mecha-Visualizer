import React from 'react';
import { CameraPreset } from '../three/evaScene';
import { DisplayMode, EvaUnitId } from '../types/eva';
import { Volume2, VolumeX, Eye, ShieldAlert, Cpu, Car, Bot } from 'lucide-react';
import { evaAudio } from '../audio/evaSoundEffects';

interface NervHeaderProps {
  currentUnit: EvaUnitId;
  displayMode: DisplayMode;
  onToggleDisplayMode: () => void;
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
  displayMode,
  onToggleDisplayMode,
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
    if (displayMode === 'car') {
      switch (currentUnit) {
        case 'unit-01': return { code: 'SUPERCAR 01', kr: 'NERV EVA-01 하이퍼카 (신지 스페셜 V12)' };
        case 'unit-02': return { code: 'SUPERCAR 02', kr: '스쿠데리아 2호기 (아스카 레이싱 레드)' };
        case 'unit-00': return { code: 'SUPERCAR 00', kr: '프로토타입 0호기 (레이 코발트 카이)' };
        case 'berserk': return { code: 'BEAST EDITION', kr: 'EVA-01 각성 폭주 하이퍼카 [다크 흑요석]' };
        case 'space-01': return { code: 'SPACE HYPERCAR', kr: '우주 궤도 사양 결전형 슈퍼카 (시안 네온)' };
      }
    }
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

  // Contextual Camera Presets based on car vs mecha
  const carPresets: { id: CameraPreset; label: string }[] = [
    { id: 'carFront', label: '차량 전면' },
    { id: 'full', label: '쿼터뷰' },
    { id: 'side', label: '측면' },
    { id: 'carCockpit', label: '운전석 콕핏' },
    { id: 'carRear', label: '후면/디퓨저' },
    { id: 'carWheel', label: '단조 휠' },
  ];

  const mechaPresets: { id: CameraPreset; label: string }[] = [
    { id: 'full', label: '전신' },
    { id: 'head', label: '헤드' },
    { id: 'core', label: '코어' },
    { id: 'hands', label: '손/관절' },
    { id: 'spine', label: '척추/등' },
    { id: 'combat', label: '전투' },
    { id: 'side', label: '측면' },
  ];

  const activePresets = displayMode === 'car' ? carPresets : mechaPresets;

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

        {/* Mode Switcher: Car <-> Mecha */}
        <button
          onClick={() => {
            if (displayMode === 'car') {
              evaAudio.playServo();
            } else {
              evaAudio.playEngineRev();
            }
            onToggleDisplayMode();
          }}
          className={`flex items-center space-x-1.5 px-3 py-1 rounded border font-mono text-[11px] transition-all shadow-md ${
            displayMode === 'car'
              ? 'bg-[#00ff66] border-[#00ff66] text-black font-extrabold ring-2 ring-[#00ff66]/30'
              : 'bg-[#151c28] border-[#293649] text-[#00ff66] hover:bg-[#1c2738]'
          }`}
          title="단축키 [M]: 스포츠카 / 로봇 메카 모드 즉시 전환"
        >
          {displayMode === 'car' ? (
            <>
              <Car className="w-3.5 h-3.5 text-black" />
              <span>스포츠카 모드 [ON]</span>
            </>
          ) : (
            <>
              <Bot className="w-3.5 h-3.5 text-[#00ff66]" />
              <span>로봇 메카 모드</span>
            </>
          )}
        </button>

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
              {displayMode === 'car' ? 'HYPERCAR ACTIVE' : (isBerserk ? 'BERSERK ACTIVE' : 'COMBAT READY')}
            </span>
          </div>
          <span className="text-[11px] text-[#718096] font-sans">
            {unitInfo.kr}
          </span>
        </div>
      </div>

      {/* Center: Tactical Telemetry (Battery & Sync) */}
      <div className="hidden md:flex items-center space-x-6 bg-[#0f141e] border border-[#232c3d] px-4 py-1.5 rounded">
        {/* Battery / Fuel status */}
        <div className="flex items-center space-x-2">
          <Cpu className={`w-3.5 h-3.5 ${isCableConnected ? 'text-[#00ff66]' : 'text-[#ffaa00]'}`} />
          <div className="flex flex-col">
            <span className="text-[9px] font-mono text-[#718096]">
              {displayMode === 'car' ? '하이브리드 터보 동력원' : (isCableConnected ? '엄빌리컬 케이블 연결' : '내부 비상 전원 (5분)')}
            </span>
            <span className={`font-mono font-bold text-xs ${
              isCableConnected 
                ? 'text-[#00ff66]' 
                : batterySeconds < 60 ? 'text-[#ff3322]' : 'text-[#ffaa00]'
            }`}>
              {displayMode === 'car' ? 'V12 TWIN-TURBO: READY' : (isCableConnected ? 'EXTERNAL POWER: 100%' : `LIMIT: ${formatBatteryTime(batterySeconds)}`)}
            </span>
          </div>
        </div>

        <div className="h-6 w-px bg-[#232c3d]" />

        {/* Sync Rate */}
        <div className="flex items-center space-x-2">
          <ShieldAlert className={`w-3.5 h-3.5 ${isBerserk ? 'text-[#ff2200]' : 'text-[#00ff66]'}`} />
          <div className="flex flex-col">
            <span className="text-[9px] font-mono text-[#718096]">
              {displayMode === 'car' ? '차량 ECU 동기화율' : '파일럿 신경 싱크로율'}
            </span>
            <div className="flex items-baseline space-x-1">
              <span className={`font-mono font-bold text-xs ${isBerserk ? 'text-[#ff2200]' : 'text-white'}`}>
                {syncRate.toFixed(1)}%
              </span>
              <span className="text-[9px] font-mono text-[#718096]">
                {isBerserk ? 'UNCONTROLLABLE' : (displayMode === 'car' ? 'TRACK MODE' : 'HARMONIC')}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Top Right: Camera Presets & Audio Mute */}
      <div className="flex items-center space-x-2">
        <div className="hidden sm:flex items-center space-x-1 bg-[#131924] border border-[#232d3e] p-1 rounded">
          {activePresets.map((cam) => {
            const isActive = activeCamera === cam.id;
            return (
              <button
                key={cam.id}
                onClick={() => {
                  evaAudio.playServo();
                  onCameraSelect(cam.id);
                }}
                className={`px-2.5 py-1 rounded text-[11px] font-mono transition-colors ${
                  isActive
                    ? 'bg-[#00ff66] text-black font-bold'
                    : 'text-[#a0aec0] hover:text-white hover:bg-[#1a2332]'
                }`}
              >
                {cam.label}
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
