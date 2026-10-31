/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  ChevronDown,
  ChevronUp,
  Layers,
  Maximize2,
  Minimize2,
  Paintbrush,
  Sliders,
  Building,
  Eye,
  Home,
} from 'lucide-react';
import {
  BuildingBrochure,
  BuildingWing,
  FloorPlan,
  MaterialFinish,
} from '../types/architectural.ts';

interface CollapsibleBottomDockProps {
  mode: 'floorplan' | 'building';
  availablePlans: FloorPlan[];
  currentPlanId: string;
  onSelectPlan: (planId: string) => void;
  wallHeightFactor: number;
  onWallHeightChange: (factor: number) => void;
  materialFinish: MaterialFinish;
  onMaterialFinishChange: (finish: MaterialFinish) => void;
  brochure: BuildingBrochure;
  selectedWingId: string | null;
  onSelectWing: (wingId: string | null) => void;
  selectedFloorLevel: number;
  onFloorLevelChange: (level: number) => void;
  explodedFloorFactor: number;
  onExplodedFloorFactorChange: (factor: number) => void;
  onDrillDownUnitPlan: (planId: string) => void;
}

export const CollapsibleBottomDock: React.FC<CollapsibleBottomDockProps> = ({
  mode,
  availablePlans,
  currentPlanId,
  onSelectPlan,
  wallHeightFactor,
  onWallHeightChange,
  materialFinish,
  onMaterialFinishChange,
  brochure,
  selectedWingId,
  onSelectWing,
  selectedFloorLevel,
  onFloorLevelChange,
  explodedFloorFactor,
  onExplodedFloorFactorChange,
  onDrillDownUnitPlan,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState<'presets' | 'structure' | 'finish'>('presets');

  const selectedWing = brochure.wings.find((w) => w.id === selectedWingId) || null;
  const currentUnits = selectedWing
    ? selectedWing.units.filter((u) => u.floor === selectedFloorLevel)
    : [];

  return (
    <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-20 w-[95vw] max-w-[940px] pointer-events-none transition-all duration-300">
      {/* Collapse Toggle Handle */}
      <div className="flex justify-center mb-1 pointer-events-auto">
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="flex items-center gap-1.5 px-3 py-1 text-[11px] font-mono tracking-wider uppercase text-slate-300 bg-[#121620] hover:bg-[#1a202c] border border-white/10 rounded-t-lg transition-colors shadow-lg"
          title="Toggle dock controls (Shortcut: H)"
        >
          {isCollapsed ? (
            <>
              <ChevronUp className="w-3.5 h-3.5 text-amber-400" />
              <span>Show Controls</span>
            </>
          ) : (
            <>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              <span>Hide Controls (Cinema Mode)</span>
            </>
          )}
        </button>
      </div>

      {/* Main Dock Container */}
      {!isCollapsed && (
        <div className="pointer-events-auto p-3.5 bg-[#121620] border border-white/10 rounded-xl shadow-2xl backdrop-blur-md">
          {mode === 'floorplan' ? (
            /* Floor Plan Controls */
            <div className="space-y-3">
              {/* Top Row: Presets & Controls Tabs */}
              <div className="flex items-center justify-between border-b border-white/8 pb-2.5">
                <div className="flex items-center gap-1.5 overflow-x-auto py-0.5">
                  <span className="text-[11px] font-mono uppercase text-slate-400 mr-1.5">Presets:</span>
                  {availablePlans.map((plan) => (
                    <button
                      key={plan.id}
                      onClick={() => onSelectPlan(plan.id)}
                      className={`px-2.5 py-1 text-xs rounded transition-colors whitespace-nowrap ${
                        currentPlanId === plan.id
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-medium'
                          : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300 border border-transparent'
                      }`}
                    >
                      {plan.name.split('—')[0].trim()}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-1 text-xs">
                  <button
                    onClick={() => setActiveTab('structure')}
                    className={`px-2 py-1 rounded transition-colors ${
                      activeTab === 'structure' ? 'bg-slate-800 text-amber-300' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Structure
                  </button>
                  <button
                    onClick={() => setActiveTab('finish')}
                    className={`px-2 py-1 rounded transition-colors ${
                      activeTab === 'finish' ? 'bg-slate-800 text-amber-300' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Finishes
                  </button>
                </div>
              </div>

              {/* Bottom Row Controls */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center pt-1">
                {/* Wall Height / Cutaway Slider */}
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5 text-xs text-slate-300 min-w-[130px]">
                    <Sliders className="w-3.5 h-3.5 text-amber-400" />
                    <span>Wall Cutaway:</span>
                    <span className="font-mono text-amber-300 font-medium">
                      {Math.round(wallHeightFactor * 2.8 * 10) / 10}m
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0.2"
                    max="1.0"
                    step="0.05"
                    value={wallHeightFactor}
                    onChange={(e) => onWallHeightChange(parseFloat(e.target.value))}
                    className="w-full accent-amber-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                  />
                  <span className="text-[10px] font-mono text-slate-400 whitespace-nowrap">
                    {wallHeightFactor < 0.35 ? 'Dollhouse' : wallHeightFactor > 0.85 ? 'Full Wall' : 'Section'}
                  </span>
                </div>

                {/* Material Finish Swatches */}
                <div className="flex items-center justify-start md:justify-end gap-2">
                  <span className="text-xs text-slate-400 mr-1 flex items-center gap-1">
                    <Paintbrush className="w-3 h-3" /> Flooring:
                  </span>
                  {(
                    [
                      { id: 'hardwood_oak', label: 'Natural Oak', color: '#b08d57' },
                      { id: 'marble_tile', label: 'Carrara Marble', color: '#f1ece4' },
                      { id: 'polished_concrete', label: 'Polished Concrete', color: '#787d82' },
                      { id: 'nordic_birch', label: 'Nordic Birch', color: '#e8dcc8' },
                    ] as const
                  ).map((m) => (
                    <button
                      key={m.id}
                      onClick={() => onMaterialFinishChange(m.id)}
                      className={`flex items-center gap-1.5 px-2 py-1 rounded text-xs border transition-colors ${
                        materialFinish === m.id
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 font-medium'
                          : 'bg-slate-800/80 text-slate-300 border-transparent hover:border-slate-700'
                      }`}
                      title={m.label}
                    >
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: m.color }} />
                      <span className="text-[11px] hidden sm:inline">{m.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* Building Brochure Controls */
            <div className="space-y-3">
              {/* Wings Selector Tabs */}
              <div className="flex items-center justify-between border-b border-white/8 pb-2.5">
                <div className="flex items-center gap-1.5 overflow-x-auto py-0.5">
                  <span className="text-[11px] font-mono uppercase text-slate-400 mr-1.5">Tower Wings:</span>
                  <button
                    onClick={() => onSelectWing(null)}
                    className={`px-2.5 py-1 text-xs rounded transition-colors ${
                      selectedWingId === null
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-medium'
                        : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    Whole Complex
                  </button>
                  {brochure.wings.map((wing) => (
                    <button
                      key={wing.id}
                      onClick={() => onSelectWing(wing.id)}
                      className={`px-2.5 py-1 text-xs rounded transition-colors whitespace-nowrap ${
                        selectedWingId === wing.id
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-medium'
                          : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      {wing.name.split('—')[0].trim()}
                    </button>
                  ))}
                </div>

                <div className="text-[11px] font-mono text-slate-400 hidden sm:block">
                  Total {brochure.totalFloors} Floors · {brochure.totalWings} Wings
                </div>
              </div>

              {/* Sliders: Floor Level & Exploded Slices */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                {/* Floor Level Selector */}
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5 text-xs text-slate-300 min-w-[120px]">
                    <Building className="w-3.5 h-3.5 text-amber-400" />
                    <span>Floor Level:</span>
                    <span className="font-mono text-amber-300 font-semibold">L{selectedFloorLevel}</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max={brochure.totalFloors}
                    step="1"
                    value={selectedFloorLevel}
                    onChange={(e) => onFloorLevelChange(parseInt(e.target.value, 10))}
                    className="w-full accent-amber-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                  />
                  <span className="text-[10px] font-mono text-slate-400 whitespace-nowrap">
                    {selectedFloorLevel === 1 ? 'Podium' : selectedFloorLevel === brochure.totalFloors ? 'Penthouse' : `Elev. ${selectedFloorLevel * 3.3}m`}
                  </span>
                </div>

                {/* Exploded Section Separation */}
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5 text-xs text-slate-300 min-w-[130px]">
                    <Layers className="w-3.5 h-3.5 text-sky-400" />
                    <span>Exploded Slice:</span>
                    <span className="font-mono text-sky-300 font-medium">
                      {Math.round(explodedFloorFactor * 100)}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1.0"
                    step="0.05"
                    value={explodedFloorFactor}
                    onChange={(e) => onExplodedFloorFactorChange(parseFloat(e.target.value))}
                    className="w-full accent-sky-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                  />
                  <span className="text-[10px] font-mono text-slate-400 whitespace-nowrap">
                    {explodedFloorFactor > 0 ? 'Section Cut' : 'Solid Facade'}
                  </span>
                </div>
              </div>

              {/* Unit Quick Drill-Down Preview if a wing is active */}
              {selectedWing && currentUnits.length > 0 && (
                <div className="flex items-center justify-between p-2 rounded bg-slate-900/80 border border-white/6 text-xs mt-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-slate-200">Level {selectedFloorLevel} Unit:</span>
                    <span className="font-mono text-amber-300 font-semibold">{currentUnits[0].unitNumber}</span>
                    <span className="text-slate-400">· {currentUnits[0].type}</span>
                    <span className="text-slate-400 font-mono">({currentUnits[0].areaSqFt} sq ft)</span>
                  </div>
                  <button
                    onClick={() => onDrillDownUnitPlan(currentUnits[0].floorPlanId)}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-xs transition-colors"
                  >
                    <Home className="w-3.5 h-3.5" />
                    <span>Tour 3D Apartment</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
