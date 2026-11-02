import React, { useState } from 'react';
import { EvaPose, EvaUnitId, EvaWeapon, EnvironmentType } from '../types/eva';
import { ChevronDown, ChevronUp, Shield, Zap, Crosshair, Wrench, Globe, Flame, Radio, Scan, Video, Grid, Activity } from 'lucide-react';
import { evaAudio } from '../audio/evaSoundEffects';

interface NervDockProps {
  currentUnit: EvaUnitId;
  onSelectUnit: (unit: EvaUnitId) => void;
  currentPose: EvaPose;
  onSelectPose: (pose: EvaPose) => void;
  currentWeapon: EvaWeapon;
  onSelectWeapon: (weapon: EvaWeapon) => void;
  currentEnv: EnvironmentType;
  onSelectEnv: (env: EnvironmentType) => void;
  atFieldActive: boolean;
  onToggleAtField: () => void;
  cableConnected: boolean;
  onToggleCable: () => void;
  explodedFactor: number;
  onChangeExploded: (factor: number) => void;
  onTriggerDamage: () => void;
  onQuickDrainBattery: () => void;
  laserScanActive: boolean;
  onToggleLaserScan: () => void;
  tacticalGridActive: boolean;
  onToggleTacticalGrid: () => void;
  syncRate: number;
  onSetSyncRate: (val: number) => void;
  showVideoRef: boolean;
  onToggleVideoRef: () => void;
}

type TabType = 'units' | 'poses' | 'weapons' | 'tactical' | 'stages';

export const NervDock: React.FC<NervDockProps> = ({
  currentUnit,
  onSelectUnit,
  currentPose,
  onSelectPose,
  currentWeapon,
  onSelectWeapon,
  currentEnv,
  onSelectEnv,
  atFieldActive,
  onToggleAtField,
  cableConnected,
  onToggleCable,
  explodedFactor,
  onChangeExploded,
  onTriggerDamage,
  onQuickDrainBattery,
  laserScanActive,
  onToggleLaserScan,
  tacticalGridActive,
  onToggleTacticalGrid,
  syncRate,
  onSetSyncRate,
  showVideoRef,
  onToggleVideoRef,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('poses');

  const handleUnitClick = (unit: EvaUnitId) => {
    if (unit === 'berserk') {
      evaAudio.playBerserk();
    } else {
      evaAudio.playServo();
    }
    onSelectUnit(unit);
  };

  const handlePoseClick = (pose: EvaPose) => {
    evaAudio.playServo();
    if (pose === 'atField') {
      evaAudio.playAtField();
    }
    onSelectPose(pose);
  };

  const handleWeaponClick = (weapon: EvaWeapon) => {
    evaAudio.playServo();
    onSelectWeapon(weapon);
  };

  const handleEnvClick = (env: EnvironmentType) => {
    evaAudio.playServo();
    onSelectEnv(env);
  };

  return (
    <div
      className="fixed z-20 left-1/2 select-none transition-transform duration-300 ease-out"
      style={{
        bottom: '16px',
        transform: isCollapsed ? 'translate(-50%, calc(100% - 32px))' : 'translate(-50%, 0)',
        width: 'min(920px, 95vw)',
      }}
    >
      {/* Collapse / Expand Tab Button pinned to top edge */}
      <div className="flex justify-center -mb-px">
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="flex items-center space-x-1.5 px-4 py-1 rounded-t-md bg-[#131924] border-t border-l border-r border-[#263347] text-[11px] font-mono text-[#a0aec0] hover:text-[#00ff66] transition-colors"
        >
          {isCollapsed ? (
            <>
              <ChevronUp className="w-3.5 h-3.5 text-[#00ff66]" />
              <span>전술 독 펼치기 [H]</span>
            </>
          ) : (
            <>
              <ChevronDown className="w-3.5 h-3.5 text-[#00ff66]" />
              <span>전술 독 숨기기 [H]</span>
            </>
          )}
        </button>
      </div>

      {/* Main Dock Container */}
      <div className="bg-[#0b0e15] border border-[#232c3d] rounded-lg p-3 text-xs shadow-2xl">
        {/* Navigation Category Tabs */}
        <div className="flex items-center space-x-1 border-b border-[#1c2433] pb-2 mb-2.5 overflow-x-auto no-scrollbar">
          {[
            { id: 'poses', label: '포즈 지정', icon: Crosshair },
            { id: 'units', label: '기체 모델', icon: Flame },
            { id: 'weapons', label: '무장 장착', icon: Shield },
            { id: 'tactical', label: '특수 작전', icon: Wrench },
            { id: 'stages', label: '전장 환경', icon: Globe },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  evaAudio.playSyncPulse();
                  setActiveTab(tab.id as TabType);
                }}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded font-mono text-[11px] transition-colors whitespace-nowrap ${
                  isActive
                    ? 'bg-[#182333] border border-[#00ff66]/60 text-[#00ff66] font-bold'
                    : 'text-[#8898aa] hover:text-white hover:bg-[#121722]'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}

          {/* Reference Video Launcher Button */}
          <button
            onClick={() => {
              evaAudio.playSyncPulse();
              onToggleVideoRef();
            }}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded font-mono text-[11px] ml-auto transition-colors whitespace-nowrap border ${
              showVideoRef
                ? 'bg-[#00f0ff]/20 border-[#00f0ff] text-[#38bdf8] font-bold'
                : 'text-[#38bdf8] bg-[#0c1a2e] border-[#0284c7]/50 hover:bg-[#075985]/30'
            }`}
            title="사용자가 제공한 우주 전투 영상 레퍼런스 플레이어 열기"
          >
            <Video className="w-3.5 h-3.5 text-[#38bdf8]" />
            <span>◈ 영상 레퍼런스 {showVideoRef ? '[닫기]' : '[보기]'}</span>
          </button>
        </div>

        {/* Tab Content Panes */}
        <div className="min-h-[58px] flex items-center">
          {/* TAB 1: POSES */}
          {activeTab === 'poses' && (
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 w-full">
              {[
                { id: 'stand', name: '기립 대기', sub: 'STANDBY' },
                { id: 'combat', name: '전투 자세', sub: 'COMBAT' },
                { id: 'sprint', name: '전력 질주', sub: 'SPRINT' },
                { id: 'atField', name: 'AT필드 전개', sub: 'AT FIELD' },
                { id: 'sniper', name: '저격 자세', sub: 'SNIPER' },
                { id: 'knife', name: '나이프 결전', sub: 'KNIFE' },
              ].map((p) => {
                const isSelected = currentPose === p.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => handlePoseClick(p.id as EvaPose)}
                    className={`flex flex-col items-center justify-center py-1.5 px-2 rounded border transition-colors ${
                      isSelected
                        ? 'bg-[#00ff66]/15 border-[#00ff66] text-[#00ff66]'
                        : 'bg-[#121622] border-[#222b3b] text-[#94a3b8] hover:text-white hover:bg-[#182030]'
                    }`}
                  >
                    <span className="font-sans font-medium text-[11px]">{p.name}</span>
                    <span className="font-mono text-[9px] text-[#64748b]">{p.sub}</span>
                  </button>
                );
              })}
            </div>
          )}

          {/* TAB 2: UNITS */}
          {activeTab === 'units' && (
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 w-full">
              {[
                { id: 'space-01', name: 'EVA-01 우주 결전', pilot: '영상 레퍼런스 사양', color: 'border-[#06b6d4] text-[#38bdf8]' },
                { id: 'unit-01', name: 'EVA-01 초호기', pilot: '이카리 신지', color: 'border-[#7928ca] text-[#a78bfa]' },
                { id: 'unit-02', name: 'EVA-02 2호기', pilot: '소류 아스카', color: 'border-[#dc2626] text-[#f87171]' },
                { id: 'unit-00', name: 'EVA-00 0호기', pilot: '아야나미 레이', color: 'border-[#2563eb] text-[#60a5fa]' },
                { id: 'berserk', name: 'EVA-01 폭주/각성', pilot: '신화 형태', color: 'border-[#e11d48] text-[#fb7185]' },
              ].map((u) => {
                const isSelected = currentUnit === u.id;
                return (
                  <button
                    key={u.id}
                    onClick={() => handleUnitClick(u.id as EvaUnitId)}
                    className={`flex flex-col items-start px-3 py-1.5 rounded border transition-colors ${
                      isSelected
                        ? 'bg-[#182335] ' + u.color + ' font-bold'
                        : 'bg-[#121622] border-[#222b3b] text-[#94a3b8] hover:text-white hover:bg-[#182030]'
                    }`}
                  >
                    <span className="font-mono text-[11px] font-bold">{u.name}</span>
                    <span className="text-[10px] text-[#64748b]">{u.pilot}</span>
                  </button>
                );
              })}
            </div>
          )}

          {/* TAB 3: WEAPONS */}
          {activeTab === 'weapons' && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 w-full">
              {[
                { id: 'none', name: '비무장', sub: 'UNARMED' },
                { id: 'knife', name: '프로그레시브 나이프', sub: 'PROG-KNIFE' },
                { id: 'rifle', name: '양전자 포 / 팔레트 라이플', sub: 'PALLET RIFLE' },
                { id: 'spear', name: '롱기누스의 창', sub: 'LONGINUS SPEAR' },
              ].map((w) => {
                const isSelected = currentWeapon === w.id;
                return (
                  <button
                    key={w.id}
                    onClick={() => handleWeaponClick(w.id as EvaWeapon)}
                    className={`flex flex-col items-center justify-center py-1.5 px-2 rounded border transition-colors ${
                      isSelected
                        ? 'bg-[#00ff66]/15 border-[#00ff66] text-[#00ff66]'
                        : 'bg-[#121622] border-[#222b3b] text-[#94a3b8] hover:text-white hover:bg-[#182030]'
                    }`}
                  >
                    <span className="font-sans font-medium text-[11px] truncate max-w-full">{w.name}</span>
                    <span className="font-mono text-[9px] text-[#64748b]">{w.sub}</span>
                  </button>
                );
              })}
            </div>
          )}

          {/* TAB 4: TACTICAL OPERATIONS */}
          {activeTab === 'tactical' && (
            <div className="flex flex-wrap items-center justify-between gap-3 w-full">
              {/* AT Field Toggle */}
              <button
                onClick={() => {
                  evaAudio.playAtField();
                  onToggleAtField();
                }}
                className={`flex items-center space-x-2 px-3 py-2 rounded border font-mono text-[11px] transition-colors ${
                  atFieldActive
                    ? 'bg-[#ff9900]/20 border-[#ff9900] text-[#ffb300]'
                    : 'bg-[#121622] border-[#242e40] text-[#8898aa] hover:text-white hover:bg-[#182030]'
                }`}
              >
                <Radio className="w-3.5 h-3.5 text-[#ffaa00]" />
                <span>AT 필드 {atFieldActive ? '전개중 [ON]' : '비활성 [OFF]'}</span>
              </button>

              {/* Glowing Procedural Tactical Floor Grid Overlay Toggle */}
              <button
                onClick={() => {
                  evaAudio.playSyncPulse();
                  onToggleTacticalGrid();
                }}
                className={`flex items-center space-x-2 px-3 py-2 rounded border font-mono text-[11px] transition-colors ${
                  tacticalGridActive
                    ? 'bg-[#00ff66]/20 border-[#00ff66] text-[#00ff66]'
                    : 'bg-[#121622] border-[#242e40] text-[#8898aa] hover:text-white hover:bg-[#182030]'
                }`}
                title="단축키 [G]: NERV 격납고 발광 절차적 전술 바닥 격자 오버레이 가동/정지"
              >
                <Grid className="w-3.5 h-3.5 text-[#00ff66]" />
                <span>전술 바닥 격자 {tacticalGridActive ? '[ON]' : '[OFF]'}</span>
              </button>

              {/* Additive Laser Scanline Sweep Toggle */}
              <button
                onClick={() => {
                  evaAudio.playSyncPulse();
                  onToggleLaserScan();
                }}
                className={`flex items-center space-x-2 px-3 py-2 rounded border font-mono text-[11px] transition-colors ${
                  laserScanActive
                    ? 'bg-[#00ff77]/20 border-[#00ff77] text-[#00ff77]'
                    : 'bg-[#121622] border-[#242e40] text-[#8898aa] hover:text-white hover:bg-[#182030]'
                }`}
                title="단축키 [L]: NERV 격납고 진단 레이저 스캔라인 가동/정지"
              >
                <Scan className="w-3.5 h-3.5 text-[#00ff77]" />
                <span>진단 레이저 스캔 {laserScanActive ? '[ON]' : '[OFF]'}</span>
              </button>

              {/* Umbilical Cable Toggle */}
              <button
                onClick={() => {
                  evaAudio.playCableEject();
                  onToggleCable();
                }}
                className={`flex items-center space-x-2 px-3 py-2 rounded border font-mono text-[11px] transition-colors ${
                  cableConnected
                    ? 'bg-[#00ff66]/15 border-[#00ff66] text-[#00ff66]'
                    : 'bg-[#ff3322]/20 border-[#ff3322] text-[#ff5544]'
                }`}
              >
                <Zap className="w-3.5 h-3.5" />
                <span>엄빌리컬 케이블 {cableConnected ? '연결됨 [5분 타이머 정지]' : '분리됨 [내부 5분 가동]'}</span>
              </button>

              {/* Take Damage Impact Trigger */}
              <button
                onClick={() => {
                  evaAudio.playDamageImpact();
                  evaAudio.playGlitchStatic();
                  onTriggerDamage();
                }}
                className="flex items-center space-x-2 px-3 py-2 rounded border border-[#ef4444] bg-[#ef4444]/20 text-[#fca5a5] hover:bg-[#ef4444]/30 font-mono text-[11px] transition-colors"
                title="단축키 [D]: 메카 피격 시뮬레이션 및 글리치 화면 효과"
              >
                <Flame className="w-3.5 h-3.5 text-[#ef4444]" />
                <span>피격 충격 유발 [D]</span>
              </button>

              {/* Quick Low Battery Test */}
              <button
                onClick={() => {
                  evaAudio.playGlitchStatic();
                  onQuickDrainBattery();
                }}
                className="flex items-center space-x-2 px-3 py-2 rounded border border-[#f59e0b] bg-[#f59e0b]/20 text-[#fcd34d] hover:bg-[#f59e0b]/30 font-mono text-[11px] transition-colors"
                title="비상 전원 15초 잔여 상태로 즉시 변경하여 글리치 및 비네트 효과 확인"
              >
                <Zap className="w-3.5 h-3.5 text-[#f59e0b]" />
                <span>방전 임박 테스트 (15초)</span>
              </button>

              {/* Hydraulic Piston / Vent Sound Trigger */}
              <button
                onClick={() => {
                  evaAudio.triggerHydraulicPiston();
                }}
                className="flex items-center space-x-2 px-3 py-2 rounded border border-[#0ea5e9]/50 bg-[#0ea5e9]/15 text-[#38bdf8] hover:bg-[#0ea5e9]/25 font-mono text-[11px] transition-colors"
                title="단축키 [P]: 격납고 대형 유압 피스톤 및 고압 공압 릴리즈 배기음 격발"
              >
                <Wrench className="w-3.5 h-3.5 text-[#38bdf8]" />
                <span>유압 피스톤/공압 릴리즈 [P]</span>
              </button>

              {/* Exploded Armor View Slider & Quick Buttons */}
              <div className="flex flex-col sm:flex-row sm:items-center space-y-1.5 sm:space-y-0 sm:space-x-3 bg-[#121622] border border-[#242e40] px-3 py-1.5 rounded flex-1 min-w-[260px]">
                <div className="flex items-center space-x-2 flex-1">
                  <span className="font-mono text-[10px] text-[#8898aa] whitespace-nowrap">
                    정밀 장갑 분해도: {(explodedFactor * 100).toFixed(0)}%
                  </span>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.02"
                    value={explodedFactor}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      onChangeExploded(val);
                    }}
                    className="w-full accent-[#00ff66] h-1.5 bg-[#20293a] rounded cursor-pointer"
                  />
                </div>
                <div className="flex items-center space-x-1">
                  {[
                    { label: '결합', val: 0 },
                    { label: '50%', val: 0.5 },
                    { label: '완전전개', val: 1.0 },
                  ].map((p) => (
                    <button
                      key={p.label}
                      onClick={() => {
                        evaAudio.playServo();
                        onChangeExploded(p.val);
                      }}
                      className={`px-1.5 py-0.5 rounded text-[10px] font-mono border transition-colors ${
                        Math.abs(explodedFactor - p.val) < 0.05
                          ? 'bg-[#00ff66]/20 border-[#00ff66] text-[#00ff66]'
                          : 'bg-[#182030] border-[#2b3952] text-[#8898aa] hover:text-white'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Interactive Sync Rate Fluctuation & Overclock Tuner */}
              <div className="flex flex-col sm:flex-row sm:items-center space-y-1.5 sm:space-y-0 sm:space-x-3 bg-[#121622] border border-[#242e40] px-3 py-1.5 rounded flex-1 min-w-[280px]">
                <div className="flex items-center space-x-2 flex-1">
                  <Activity className="w-3.5 h-3.5 text-[#00ff66]" />
                  <span className="font-mono text-[10px] text-[#8898aa] whitespace-nowrap">
                    동기화(Sync): <span className="text-[#00ff66] font-bold">{syncRate.toFixed(1)}%</span>
                  </span>
                  <input
                    type="range"
                    min="35"
                    max="100"
                    step="0.5"
                    value={Math.min(100, Math.max(35, syncRate))}
                    onChange={(e) => {
                      onSetSyncRate(parseFloat(e.target.value));
                    }}
                    className="w-full accent-[#00ff66] h-1.5 bg-[#20293a] rounded cursor-pointer"
                    title="동기화율에 따라 전술 바닥 격자의 파동 속도, 발광 강도 및 색상(적색/황색/녹색)이 실시간 변화합니다."
                  />
                </div>
                <div className="flex items-center space-x-1">
                  {[
                    { label: '위험 45%', val: 45, color: 'text-[#ef4444]' },
                    { label: '주의 68%', val: 68, color: 'text-[#f59e0b]' },
                    { label: '최적 92%', val: 92, color: 'text-[#00ff66]' },
                  ].map((p) => (
                    <button
                      key={p.label}
                      onClick={() => {
                        evaAudio.playSyncPulse();
                        onSetSyncRate(p.val);
                      }}
                      className={`px-1.5 py-0.5 rounded text-[10px] font-mono border transition-colors ${
                        Math.abs(syncRate - p.val) < 2
                          ? 'bg-[#00ff66]/20 border-[#00ff66] text-[#00ff66] font-bold'
                          : 'bg-[#182030] border-[#2b3952] ' + p.color + ' hover:text-white'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: ENVIRONMENTS */}
          {activeTab === 'stages' && (
            <div className="flex flex-col space-y-2 w-full">
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 w-full">
                {[
                  { id: 'spaceOrbit', name: '우주 궤도 결전 (영상)', sub: 'ORBITAL FLEET' },
                  { id: 'hangar', name: 'NERV 격납고', sub: 'LAUNCH CAGE #7' },
                  { id: 'tokyo3', name: '제3신동경시', sub: 'TOKYO-3 FORTRESS' },
                  { id: 'redOcean', name: '붉은 바다', sub: 'THIRD IMPACT SEA' },
                  { id: 'darkVoid', name: '전술 벡터', sub: 'MAGI ANALYSIS' },
                ].map((env) => {
                  const isSelected = currentEnv === env.id;
                  return (
                    <button
                      key={env.id}
                      onClick={() => handleEnvClick(env.id as EnvironmentType)}
                      className={`flex flex-col items-center justify-center py-1.5 px-2 rounded border transition-colors ${
                        isSelected
                          ? 'bg-[#00ff66]/15 border-[#00ff66] text-[#00ff66]'
                          : 'bg-[#121622] border-[#222b3b] text-[#94a3b8] hover:text-white hover:bg-[#182030]'
                      }`}
                    >
                      <span className="font-sans font-medium text-[11px]">{env.name}</span>
                      <span className="font-mono text-[9px] text-[#64748b]">{env.sub}</span>
                    </button>
                  );
                })}
              </div>

              {/* Hangar Environmental Sound Info Bar */}
              {currentEnv === 'hangar' && (
                <div className="flex items-center justify-between px-3 py-1.5 rounded bg-[#0e1624] border border-[#1e2f47] text-[10px] font-mono text-[#94a3b8]">
                  <div className="flex items-center space-x-2">
                    <span className="w-2 h-2 rounded-full bg-[#00ff66] animate-pulse" />
                    <span>격납고 입체 음향 가동: <span className="text-[#00ff66] font-bold">55Hz 서브 펄스 험 · 원거리 통풍구 공조 · 유압 피스톤</span></span>
                  </div>
                  <button
                    onClick={() => evaAudio.triggerHydraulicPiston()}
                    className="px-2 py-0.5 rounded bg-[#162235] border border-[#2b3e5b] text-[#38bdf8] hover:text-white hover:bg-[#1e2f47] transition-colors"
                  >
                    피스톤 배기 격발 [P]
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
