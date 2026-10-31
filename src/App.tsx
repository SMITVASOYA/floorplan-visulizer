/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import {
  AIProvider,
  BuildingBrochure,
  CameraPreset,
  FloorPlan,
  LightingPreset,
  MaterialFinish,
  RoomDefinition,
} from './types/architectural.ts';
import {
  PRESET_30x40_3BHK,
  PRESET_BUILDING_BROCHURE,
  PRESET_MODERN_2BHK,
  PRESET_PENTHOUSE,
  PRESET_STUDIO_LOFT,
} from './data/samplePresets.ts';
import { SpatialSceneManager } from './three/SpatialSceneManager.ts';
import { HeaderNav } from './components/HeaderNav.tsx';
import { CollapsibleBottomDock } from './components/CollapsibleBottomDock.tsx';
import { AICopilotDrawer } from './components/AICopilotDrawer.tsx';
import { PlanUploadModal } from './components/PlanUploadModal.tsx';
import { RoomInspectorCard } from './components/RoomInspectorCard.tsx';
import { getAppConfig, testOllamaConnection } from './services/aiService.ts';
import { FileText, X as CloseIcon } from 'lucide-react';

export default function App() {
  const canvasMountRef = useRef<HTMLDivElement>(null);
  const sceneManagerRef = useRef<SpatialSceneManager | null>(null);

  // Application Data & Presets - include 30x40 3-Bedroom plan as active plan
  const [plans, setPlans] = useState<FloorPlan[]>([
    PRESET_30x40_3BHK,
    PRESET_MODERN_2BHK,
    PRESET_STUDIO_LOFT,
    PRESET_PENTHOUSE,
  ]);
  const [currentPlanId, setCurrentPlanId] = useState<string>(PRESET_30x40_3BHK.id);
  const [brochure] = useState<BuildingBrochure>(PRESET_BUILDING_BROCHURE);

  // Visualization States
  const [mode, setMode] = useState<'floorplan' | 'building'>('floorplan');
  const [wallHeightFactor, setWallHeightFactor] = useState<number>(1.0);
  const [materialFinish, setMaterialFinish] = useState<MaterialFinish>('hardwood_oak');
  const [lightingPreset, setLightingPreset] = useState<LightingPreset>('noon');
  const [cameraPreset, setCameraPreset] = useState<CameraPreset>('isometric');

  // Building Mode States
  const [selectedWingId, setSelectedWingId] = useState<string | null>(null);
  const [selectedFloorLevel, setSelectedFloorLevel] = useState<number>(4);
  const [explodedFloorFactor, setExplodedFloorFactor] = useState<number>(0.0);

  // Inspection & Modals
  const [selectedRoom, setSelectedRoom] = useState<RoomDefinition | null>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState<boolean>(false);
  const [isCopilotOpen, setIsCopilotOpen] = useState<boolean>(false);
  const [isBlueprintOverlayOpen, setIsBlueprintOverlayOpen] = useState<boolean>(true);

  // AI Architecture configuration (Cloud / Ollama / Offline) - default to Local Ollama with Gemma 4
  const [aiProvider, setAIProvider] = useState<AIProvider>('ollama');
  const [ollamaEndpoint, setOllamaEndpoint] = useState<string>('http://localhost:11434');
  const [ollamaModel, setOllamaModel] = useState<string>('gemma4:e4b');
  const [isOllamaAvailable, setIsOllamaAvailable] = useState<boolean>(false);

  const activePlan = plans.find((p) => p.id === currentPlanId) || plans[0];
  const activeWing = brochure.wings.find((w) => w.id === selectedWingId) || null;

  // Initialize Three.js Scene inside dedicated canvas container
  useEffect(() => {
    if (!canvasMountRef.current) return;

    const manager = new SpatialSceneManager(canvasMountRef.current);
    sceneManagerRef.current = manager;

    // Load initial 3D floor plan
    manager.loadFloorPlan(activePlan, materialFinish);
    manager.loadBuildingBrochure(brochure);

    // Callbacks from 3D raycasting
    manager.onRoomSelected = (room) => {
      setSelectedRoom(room);
    };

    manager.onWingSelected = (wing) => {
      setSelectedWingId(wing ? wing.id : null);
    };

    // Load server runtime config and verify Ollama connectivity
    getAppConfig().then((cfg) => {
      if (cfg.defaultProvider) setAIProvider(cfg.defaultProvider);
      if (cfg.ollamaEndpoint) setOllamaEndpoint(cfg.ollamaEndpoint);
      if (cfg.ollamaModel) setOllamaModel(cfg.ollamaModel);

      const targetEndpoint = cfg.ollamaEndpoint || 'http://localhost:11434';
      testOllamaConnection(targetEndpoint).then((res) => {
        setIsOllamaAvailable(res.available);
        if (res.available && res.models && res.models.length > 0) {
          const match = res.models.find(
            (m) => m === cfg.ollamaModel || m === 'gemma4:e4b' || m.includes('gemma4')
          );
          if (match) {
            setOllamaModel(match);
          } else if (res.models[0]) {
            setOllamaModel(res.models[0]);
          }
        }
      });
    });

    return () => {
      manager.dispose();
      sceneManagerRef.current = null;
    };
  }, []);

  // Update Plan in 3D Scene when currentPlanId or finish changes
  const handleSelectPlan = (planId: string) => {
    setCurrentPlanId(planId);
    const plan = plans.find((p) => p.id === planId);
    if (plan && sceneManagerRef.current) {
      sceneManagerRef.current.loadFloorPlan(plan, materialFinish);
      setSelectedRoom(null);
    }
  };

  const handleModeChange = (newMode: 'floorplan' | 'building') => {
    setMode(newMode);
    if (sceneManagerRef.current) {
      sceneManagerRef.current.setMode(newMode);
      setSelectedRoom(null);
    }
  };

  const handleWallHeightChange = (factor: number) => {
    setWallHeightFactor(factor);
    if (sceneManagerRef.current) {
      sceneManagerRef.current.setWallHeightFactor(factor);
    }
  };

  const handleMaterialFinishChange = (finish: MaterialFinish) => {
    setMaterialFinish(finish);
    if (sceneManagerRef.current) {
      sceneManagerRef.current.setMaterialFinish(finish);
    }
  };

  const handleLightingChange = (preset: LightingPreset) => {
    setLightingPreset(preset);
    if (sceneManagerRef.current) {
      sceneManagerRef.current.setLightingPreset(preset);
    }
  };

  const handleCameraPresetChange = (preset: CameraPreset) => {
    setCameraPreset(preset);
    if (sceneManagerRef.current) {
      sceneManagerRef.current.setCameraPreset(preset);
    }
  };

  const handleSelectWing = (wingId: string | null) => {
    setSelectedWingId(wingId);
    if (sceneManagerRef.current) {
      const wing = brochure.wings.find((w) => w.id === wingId) || null;
      sceneManagerRef.current.selectWing(wing);
    }
  };

  const handleFloorLevelChange = (level: number) => {
    setSelectedFloorLevel(level);
    if (sceneManagerRef.current) {
      sceneManagerRef.current.setSelectedFloorLevel(level);
    }
  };

  const handleExplodedFloorFactorChange = (factor: number) => {
    setExplodedFloorFactor(factor);
    if (sceneManagerRef.current) {
      sceneManagerRef.current.setExplodedFloorFactor(factor);
    }
  };

  // Drill down from building unit into apartment 3D floor plan
  const handleDrillDownUnitPlan = (planId: string) => {
    handleModeChange('floorplan');
    handleSelectPlan(planId);
  };

  // Handle User Uploaded Floor Plan
  const handleGeneratedPlan = (newPlan: FloorPlan) => {
    setPlans((prev) => [newPlan, ...prev]);
    setCurrentPlanId(newPlan.id);
    handleModeChange('floorplan');
    if (sceneManagerRef.current) {
      sceneManagerRef.current.loadFloorPlan(newPlan, materialFinish);
    }
    setIsCopilotOpen(true);
  };

  const handleFocusRoom = () => {
    if (selectedRoom && sceneManagerRef.current) {
      sceneManagerRef.current.selectRoom(selectedRoom);
    }
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#0b0e14] select-none">
      {/* 3D WebGL Canvas Container */}
      <div
        ref={canvasMountRef}
        className="absolute inset-0 w-full h-full z-0 cursor-grab active:cursor-grabbing"
      />

      {/* Top Header Navigation */}
      <HeaderNav
        mode={mode}
        onModeChange={handleModeChange}
        cameraPreset={cameraPreset}
        onCameraPresetChange={handleCameraPresetChange}
        lightingPreset={lightingPreset}
        onLightingPresetChange={handleLightingChange}
        aiProvider={aiProvider}
        isOllamaAvailable={isOllamaAvailable}
        onOpenUploadModal={() => setIsUploadModalOpen(true)}
        onToggleCopilot={() => setIsCopilotOpen(!isCopilotOpen)}
        isCopilotOpen={isCopilotOpen}
        onOpenAISettings={() => setIsCopilotOpen(true)}
      />

      {/* Floating Room Detail Callout Card */}
      <RoomInspectorCard
        room={selectedRoom}
        onClose={() => {
          setSelectedRoom(null);
          if (sceneManagerRef.current) sceneManagerRef.current.selectRoom(null);
        }}
        onFocus={handleFocusRoom}
      />

      {/* Collapsible Bottom Control Dock */}
      <CollapsibleBottomDock
        mode={mode}
        availablePlans={plans}
        currentPlanId={currentPlanId}
        onSelectPlan={handleSelectPlan}
        wallHeightFactor={wallHeightFactor}
        onWallHeightChange={handleWallHeightChange}
        materialFinish={materialFinish}
        onMaterialFinishChange={handleMaterialFinishChange}
        brochure={brochure}
        selectedWingId={selectedWingId}
        onSelectWing={handleSelectWing}
        selectedFloorLevel={selectedFloorLevel}
        onFloorLevelChange={handleFloorLevelChange}
        explodedFloorFactor={explodedFloorFactor}
        onExplodedFloorFactorChange={handleExplodedFloorFactorChange}
        onDrillDownUnitPlan={handleDrillDownUnitPlan}
      />

      {/* Right-Side Slide-Out Architectural Intelligence Copilot */}
      <AICopilotDrawer
        isOpen={isCopilotOpen}
        onClose={() => setIsCopilotOpen(false)}
        floorPlan={activePlan}
        activeWing={activeWing}
        aiProvider={aiProvider}
        onAIProviderChange={setAIProvider}
        ollamaEndpoint={ollamaEndpoint}
        onOllamaEndpointChange={setOllamaEndpoint}
        ollamaModel={ollamaModel}
        onOllamaModelChange={setOllamaModel}
        onSelectRoomIn3D={(room) => {
          setSelectedRoom(room);
          if (sceneManagerRef.current) sceneManagerRef.current.selectRoom(room);
        }}
      />

      {/* 2D Floor Plan / Brochure Upload Modal */}
      <PlanUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onGeneratePlan={handleGeneratedPlan}
      />

      {/* 2D Blueprint Reference Picture-in-Picture Card */}
      {mode === 'floorplan' && activePlan.preview2DUrl && (
        <div className="fixed bottom-24 left-5 z-20 flex flex-col items-start gap-1.5 pointer-events-auto">
          {!isBlueprintOverlayOpen ? (
            <button
              onClick={() => setIsBlueprintOverlayOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900/90 hover:bg-slate-800 border border-amber-500/40 text-amber-300 text-xs font-medium shadow-2xl backdrop-blur-md transition-all"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Show 2D Blueprint</span>
            </button>
          ) : (
            <div className="relative p-2.5 rounded-xl bg-slate-950/95 border border-white/15 shadow-2xl backdrop-blur-md w-72 sm:w-80 overflow-hidden animate-in fade-in duration-200">
              <div className="flex items-center justify-between pb-1.5 border-b border-white/10 mb-2">
                <div className="flex items-center gap-1.5 text-xs text-slate-200 font-semibold truncate">
                  <FileText className="w-3.5 h-3.5 text-amber-400" />
                  <span className="truncate">{activePlan.name} (2D)</span>
                </div>
                <button
                  onClick={() => setIsBlueprintOverlayOpen(false)}
                  className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition-colors"
                >
                  <CloseIcon className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="rounded-lg overflow-hidden bg-white/95 border border-slate-700/50 p-1 flex items-center justify-center">
                <img
                  src={activePlan.preview2DUrl}
                  alt="Original 2D Architectural Blueprint"
                  className="max-h-48 w-auto object-contain"
                />
              </div>

              <div className="flex items-center justify-between pt-2 text-[10px] text-slate-400 font-mono">
                <span>{activePlan.totalAreaSqFt} sq ft · {activePlan.bedroomsCount} BHK</span>
                <span className="text-amber-400 font-medium">1:1 Spatial 3D Sync</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
