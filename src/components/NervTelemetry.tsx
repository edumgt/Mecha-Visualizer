import React, { useEffect, useState } from 'react';
import { EvaUnitId } from '../types/eva';

interface NervTelemetryProps {
  currentUnit: EvaUnitId;
  syncRate: number;
  batterySeconds: number;
  isCableConnected: boolean;
  atFieldActive: boolean;
}

export const NervTelemetry: React.FC<NervTelemetryProps> = ({
  currentUnit,
  syncRate,
  batterySeconds,
  isCableConnected,
  atFieldActive,
}) => {
  const [pulsePhase, setPulsePhase] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setPulsePhase((prev) => (prev + 1) % 60);
    }, 50);
    return () => clearInterval(timer);
  }, []);

  const isBerserk = currentUnit === 'berserk';

  // Build procedural SVG heartbeat waveform path based on sync rate
  const generateWaveform = () => {
    const points: string[] = [];
    const width = 120;
    const height = 24;
    const mid = height / 2;
    const count = 24;
    const amp = (syncRate / 100) * 8;

    for (let i = 0; i <= count; i++) {
      const x = (i / count) * width;
      // ECG spike in center
      let y = mid;
      const centerDist = Math.abs(i - 12);
      if (centerDist < 3) {
        if (i === 11) y = mid + amp * 0.8;
        else if (i === 12) y = mid - amp * 1.5;
        else if (i === 13) y = mid + amp * 0.5;
      } else {
        y = mid + Math.sin((i + pulsePhase * 0.2) * 1.2) * 1.5;
      }
      points.push(`${x.toFixed(1)},${y.toFixed(1)}`);
    }
    return points.join(' ');
  };

  return (
    <div className="fixed top-14 left-4 z-10 pointer-events-none select-none hidden sm:block">
      <div className="bg-[#0b0f17]/90 border border-[#1e2636] p-2.5 rounded text-[10px] font-mono text-[#7e8b9f] space-y-2 max-w-[210px] shadow-lg">
        {/* MAGI SUPERCOMPUTER */}
        <div className="border-b border-[#1c2433] pb-1.5 flex items-center justify-between">
          <span className="text-[#a0aec0] font-bold">MAGI SYSTEM //</span>
          <span className="text-[#00ff66] font-bold">ALL AGREE</span>
        </div>

        <div className="grid grid-cols-3 gap-1 text-[9px] text-center">
          <div className="bg-[#121824] border border-[#232d3f] p-1 rounded">
            <div className="text-[#718096]">MEL-1</div>
            <div className="text-[#00ff66]">가결</div>
          </div>
          <div className="bg-[#121824] border border-[#232d3f] p-1 rounded">
            <div className="text-[#718096]">BAL-2</div>
            <div className="text-[#00ff66]">가결</div>
          </div>
          <div className="bg-[#121824] border border-[#232d3f] p-1 rounded">
            <div className="text-[#718096]">CAS-3</div>
            <div className="text-[#00ff66]">가결</div>
          </div>
        </div>

        {/* Real-time Neurological Waveform */}
        <div className="border-t border-[#1c2433] pt-1.5">
          <div className="flex justify-between items-center text-[9px] mb-1">
            <span className="text-[#718096]">신경 펄스 주파수</span>
            <span className={isBerserk ? 'text-[#ff2200] font-bold' : 'text-[#00ff66]'}>
              {isBerserk ? 'BERSERK HARMONICS' : `${(syncRate * 1.42).toFixed(1)} Hz`}
            </span>
          </div>
          <div className="bg-[#0e131d] border border-[#20293b] rounded h-7 flex items-center justify-center overflow-hidden">
            <svg width="120" height="24" className="overflow-visible">
              <polyline
                fill="none"
                stroke={isBerserk ? '#ff2200' : '#00ff66'}
                strokeWidth="1.5"
                points={generateWaveform()}
              />
            </svg>
          </div>
        </div>

        {/* AT Field / Restraint Status */}
        <div className="border-t border-[#1c2433] pt-1 text-[9px] flex justify-between">
          <span className="text-[#718096]">AT FIELD:</span>
          <span className={atFieldActive ? 'text-[#ffaa00] font-bold' : 'text-[#64748b]'}>
            {atFieldActive ? 'PHASE EXPANDED' : 'STANDBY'}
          </span>
        </div>
      </div>
    </div>
  );
};
