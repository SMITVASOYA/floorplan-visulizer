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
import { testOllamaConnection } from './services/aiService.ts';

export default function App() {
  const canvasMountRef = useRef<HTMLDivElement>(null);
  const sceneManagerRef = useRef<SpatialSceneManager | null>(null);

  // Application Data & Presets
  const [plans, setPlans] = useState<FloorPlan[]>([
    PRESET_MODERN_2BHK,
    PRESET_STUDIO_LOFT,
    PRESET_PENTHOUSE,
  ]);
  const [currentPlanId, setCurrentPlanId] = useState<string>(PRESET_MODERN_2BHK.id);
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

  // AI Architecture configuration (Cloud / Ollama / Offline)
  const [aiProvider, setAIProvider] = useState<AIProvider>('cloud');
  const [ollamaEndpoint, setOllamaEndpoint] = useState<string>('http://localhost:11434');
  const [ollamaModel, setOllamaModel] = useState<string>('gemma2:latest');
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

    // Test Ollama background check silently
    testOllamaConnection(ollamaEndpoint).then((res) => {
      setIsOllamaAvailable(res.available);
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
    </div>
  );
}
