/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  Box,
  Building2,
  Camera,
  ChevronDown,
  Compass,
  Cpu,
  Layers,
  Moon,
  Sparkles,
  Sun,
  Sunrise,
  Sunset,
  Upload,
} from 'lucide-react';
import {
  AIProvider,
  CameraPreset,
  LightingPreset,
} from '../types/architectural.ts';

interface HeaderNavProps {
  mode: 'floorplan' | 'building';
  onModeChange: (mode: 'floorplan' | 'building') => void;
  cameraPreset: CameraPreset;
  onCameraPresetChange: (preset: CameraPreset) => void;
  lightingPreset: LightingPreset;
  onLightingPresetChange: (preset: LightingPreset) => void;
  aiProvider: AIProvider;
  isOllamaAvailable: boolean;
  onOpenUploadModal: () => void;
  onToggleCopilot: () => void;
  isCopilotOpen: boolean;
  onOpenAISettings: () => void;
}

export const HeaderNav: React.FC<HeaderNavProps> = ({
  mode,
  onModeChange,
  cameraPreset,
  onCameraPresetChange,
  lightingPreset,
  onLightingPresetChange,
  aiProvider,
  isOllamaAvailable,
  onOpenUploadModal,
  onToggleCopilot,
  isCopilotOpen,
  onOpenAISettings,
}) => {
  return (
    <header className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-4 py-3 bg-[#0e121a]/90 border-b border-white/8 backdrop-blur-md">
      {/* Brand & Atelier Title */}
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-8 h-8 rounded bg-amber-500/15 border border-amber-500/30 text-amber-400">
          <Building2 className="w-4 h-4" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold tracking-tight text-slate-100">SpatialPlan 3D</span>
            <span className="text-[11px] font-mono uppercase px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
              Atelier v2.4
            </span>
          </div>
          <p className="text-[11px] text-slate-400 hidden sm:block">
            Architectural 2D-to-3D Layout & Multi-Wing Building Studio
          </p>
        </div>
      </div>

      {/* Mode Switcher Tabs */}
      <div className="flex items-center gap-1 p-1 rounded-lg bg-slate-900/90 border border-white/8">
        <button
          onClick={() => onModeChange('floorplan')}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded transition-colors ${
            mode === 'floorplan'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Floor Plan 3D</span>
        </button>
        <button
          onClick={() => onModeChange('building')}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded transition-colors ${
            mode === 'building'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Building2 className="w-3.5 h-3.5" />
          <span>Multi-Wing Tower</span>
        </button>
      </div>

      {/* Camera & Lighting Controls */}
      <div className="hidden md:flex items-center gap-2">
        {/* Camera Views */}
        <div className="flex items-center gap-0.5 p-0.5 rounded bg-slate-900/80 border border-white/6 text-xs text-slate-300">
          <button
            onClick={() => onCameraPresetChange('isometric')}
            className={`px-2 py-1 rounded transition-colors ${
              cameraPreset === 'isometric' ? 'bg-slate-700 text-white font-medium' : 'hover:text-white'
            }`}
            title="Isometric 45°"
          >
            Aerial
          </button>
          <button
            onClick={() => onCameraPresetChange('topdown')}
            className={`px-2 py-1 rounded transition-colors ${
              cameraPreset === 'topdown' ? 'bg-slate-700 text-white font-medium' : 'hover:text-white'
            }`}
            title="Orthogonal Top-Down Blueprint"
          >
            Plan
          </button>
          <button
            onClick={() => onCameraPresetChange('firstperson')}
            className={`px-2 py-1 rounded transition-colors ${
              cameraPreset === 'firstperson' ? 'bg-slate-700 text-white font-medium' : 'hover:text-white'
            }`}
            title="First-Person Walkthrough"
          >
            Walk
          </button>
        </div>

        {/* Lighting Selector */}
        <div className="flex items-center gap-0.5 p-0.5 rounded bg-slate-900/80 border border-white/6 text-slate-300">
          <button
            onClick={() => onLightingPresetChange('morning')}
            className={`p-1.5 rounded transition-colors ${
              lightingPreset === 'morning' ? 'bg-amber-500/20 text-amber-300' : 'text-slate-400 hover:text-white'
            }`}
            title="Morning Dawn"
          >
            <Sunrise className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onLightingPresetChange('noon')}
            className={`p-1.5 rounded transition-colors ${
              lightingPreset === 'noon' ? 'bg-amber-500/20 text-amber-300' : 'text-slate-400 hover:text-white'
            }`}
            title="Solar Noon"
          >
            <Sun className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onLightingPresetChange('sunset')}
            className={`p-1.5 rounded transition-colors ${
              lightingPreset === 'sunset' ? 'bg-amber-500/20 text-amber-300' : 'text-slate-400 hover:text-white'
            }`}
            title="Golden Hour Sunset"
          >
            <Sunset className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onLightingPresetChange('night')}
            className={`p-1.5 rounded transition-colors ${
              lightingPreset === 'night' ? 'bg-amber-500/20 text-amber-300' : 'text-slate-400 hover:text-white'
            }`}
            title="Interior Architectural Night"
          >
            <Moon className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Right Controls: AI status, Upload, and Copilot Drawer toggle */}
      <div className="flex items-center gap-2">
        {/* AI Provider Status Pill */}
        <button
          onClick={onOpenAISettings}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded text-xs border border-white/8 bg-slate-900/80 hover:bg-slate-800 transition-colors"
          title="Click to configure AI Engine (Cloud / Local Ollama / Offline)"
        >
          <Cpu className="w-3.5 h-3.5 text-amber-400" />
          <span className="hidden sm:inline font-mono text-[11px] text-slate-300">
            {aiProvider === 'cloud' ? 'Cloud GenAI' : aiProvider === 'ollama' ? 'Local Ollama' : 'Offline Engine'}
          </span>
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              aiProvider === 'cloud'
                ? 'bg-emerald-400'
                : aiProvider === 'ollama' && isOllamaAvailable
                ? 'bg-sky-400'
                : 'bg-amber-400'
            }`}
          />
        </button>

        {/* Upload Button */}
        <button
          onClick={onOpenUploadModal}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors"
        >
          <Upload className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Upload Plan</span>
        </button>

        {/* Copilot Drawer Toggle */}
        <button
          onClick={onToggleCopilot}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium border transition-colors ${
            isCopilotOpen
              ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-sm font-semibold'
              : 'bg-amber-500/10 text-amber-300 border-amber-500/30 hover:bg-amber-500/20'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Architect AI</span>
        </button>
      </div>
    </header>
  );
};
