/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Compass, Eye, Maximize2, Sun, X } from 'lucide-react';
import { RoomDefinition } from '../types/architectural.ts';

interface RoomInspectorCardProps {
  room: RoomDefinition | null;
  onClose: () => void;
  onFocus: () => void;
}

export const RoomInspectorCard: React.FC<RoomInspectorCardProps> = ({
  room,
  onClose,
  onFocus,
}) => {
  if (!room) return null;

  return (
    <div className="fixed top-16 left-6 z-20 w-80 p-4 rounded-xl bg-[#121620]/95 border border-white/10 shadow-2xl backdrop-blur-md text-slate-200 animate-in fade-in slide-in-from-top-2 duration-200">
      <div className="flex items-start justify-between mb-2">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400">
            Selected Space
          </span>
          <h3 className="text-sm font-semibold text-slate-100">{room.name}</h3>
        </div>
        <button
          onClick={onClose}
          className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2 my-3 text-xs font-mono">
        <div className="p-2 rounded bg-slate-900/80 border border-white/5">
          <span className="text-[10px] text-slate-400 block">Area</span>
          <span className="text-amber-300 font-semibold">{room.areaSqFt} sq ft</span>
        </div>
        <div className="p-2 rounded bg-slate-900/80 border border-white/5">
          <span className="text-[10px] text-slate-400 block">Dimensions</span>
          <span className="text-slate-200">{room.dimensions}</span>
        </div>
        <div className="p-2 rounded bg-slate-900/80 border border-white/5">
          <span className="text-[10px] text-slate-400 block">Ceiling Ht</span>
          <span className="text-slate-200">{room.ceilingHeight} meters</span>
        </div>
        <div className="p-2 rounded bg-slate-900/80 border border-white/5">
          <span className="text-[10px] text-slate-400 block">Daylight</span>
          <span className="text-sky-300 font-semibold">{room.sunExposure}</span>
        </div>
      </div>

      <div className="flex items-center justify-between pt-1">
        <span className="text-[11px] text-slate-400 font-mono">
          Finish: {room.flooringType.replace('_', ' ')}
        </span>
        <button
          onClick={onFocus}
          className="flex items-center gap-1.5 px-3 py-1 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-medium transition-colors"
        >
          <Eye className="w-3.5 h-3.5" />
          <span>Focus Space</span>
        </button>
      </div>
    </div>
  );
};
