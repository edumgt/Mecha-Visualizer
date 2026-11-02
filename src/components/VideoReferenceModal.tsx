import React from 'react';
import { X, Play, Zap, Shield, Sparkles } from 'lucide-react';

interface VideoReferenceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyVideoPreset: () => void;
}

export const VideoReferenceModal: React.FC<VideoReferenceModalProps> = ({
  isOpen,
  onClose,
  onApplyVideoPreset,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center p-4 bg-black/75 backdrop-none select-none">
      <div className="relative w-full max-w-2xl bg-[#090d16] border border-[#0284c7]/50 rounded-lg shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-2.5 bg-[#0e1626] border-b border-[#1e293b]">
          <div className="flex items-center space-x-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#0284c7]/20 border border-[#0284c7] text-[#38bdf8]">
              VIDEO REFERENCE
            </span>
            <span className="font-mono text-xs font-bold text-white tracking-wider">
              우주 궤도 결전 텍스쳐 및 전장 레퍼런스 분석
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-[#64748b] hover:text-white hover:bg-[#1e293b] rounded transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Video Player */}
        <div className="p-4 flex-1 overflow-y-auto no-scrollbar space-y-3">
          <div className="relative bg-black rounded border border-[#1e293b] overflow-hidden aspect-video flex items-center justify-center">
            <video
              src="/assets/aistudio/Robot_battles_ships_in_space_20261023154304_68b53c6e.mp4"
              controls
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-full object-contain"
            />
          </div>

          {/* Analysis Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
            <div className="bg-[#0f172a] border border-[#1e293b] p-2.5 rounded space-y-1">
              <div className="flex items-center space-x-1.5 text-[#38bdf8] font-mono text-[11px] font-bold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>장갑 텍스쳐 매칭</span>
              </div>
              <p className="text-[11px] text-[#94a3b8] leading-relaxed">
                영상 특유의 선명한 로열 바이올렛 퍼플, 고휘도 네온 형광 그린 벤트 라인, 무광 발리스틱 블랙 복합재 도색.
              </p>
            </div>

            <div className="bg-[#0f172a] border border-[#1e293b] p-2.5 rounded space-y-1">
              <div className="flex items-center space-x-1.5 text-[#f43f5e] font-mono text-[11px] font-bold">
                <Shield className="w-3.5 h-3.5" />
                <span>롱기누스의 창</span>
              </div>
              <p className="text-[11px] text-[#94a3b8] leading-relaxed">
                영상 속 거대 붉은 에너지 창: 이중 나선(Double-Helix) 회전 샤프트와 발광 포크 블레이드 아우라.
              </p>
            </div>

            <div className="bg-[#0f172a] border border-[#1e293b] p-2.5 rounded space-y-1">
              <div className="flex items-center space-x-1.5 text-[#38bdf8] font-mono text-[11px] font-bold">
                <Zap className="w-3.5 h-3.5" />
                <span>트윈 이온/로켓 플룸</span>
              </div>
              <p className="text-[11px] text-[#94a3b8] leading-relaxed">
                어깨 파일런 후방의 고출력 사이언 블루 이온 제트 빔 및 종아리 오렌지 로켓 화염 이펙트.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-4 py-3 bg-[#0e1626] border-t border-[#1e293b]">
          <span className="text-[11px] font-mono text-[#64748b]">
            NERV TACTICAL SPACE ORBIT COMBAT SPECIFICATION
          </span>
          <div className="flex items-center space-x-2">
            <button
              onClick={onClose}
              className="px-3 py-1.5 rounded text-xs font-mono text-[#94a3b8] hover:text-white hover:bg-[#1e293b] transition-colors"
            >
              닫기
            </button>
            <button
              onClick={() => {
                onApplyVideoPreset();
                onClose();
              }}
              className="flex items-center space-x-1.5 px-4 py-1.5 rounded text-xs font-mono font-bold bg-[#0284c7] hover:bg-[#0369a1] text-white shadow-lg transition-colors"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>영상 세팅 즉시 적용</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
