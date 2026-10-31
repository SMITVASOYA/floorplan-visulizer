/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  AIPlanAnalysis,
  AIProvider,
  BuildingWing,
  ChatMessage,
  FloorPlan,
  RoomAnalysisInsight,
} from '../types/architectural.ts';

/**
 * Deterministic offline spatial heuristics engine
 * Runs instantly without internet or external AI daemon
 */
export function computeOfflineSpatialAnalysis(floorPlan: FloorPlan): AIPlanAnalysis {
  const roomInsights: RoomAnalysisInsight[] = floorPlan.rooms.map((room) => {
    // Spatial efficiency calculation
    const isMaster = room.name.toLowerCase().includes('master');
    const isLiving = room.type === 'living';
    const isBath = room.type === 'bathroom';

    let circulationRating: 'Excellent' | 'Good' | 'Moderate' = 'Good';
    let daylightRating: 'Optimal' | 'Good' | 'Low' = 'Good';

    if (isLiving || isMaster) {
      circulationRating = 'Excellent';
      daylightRating = room.sunExposure.includes('East') || room.sunExposure.includes('South') ? 'Optimal' : 'Good';
    } else if (isBath) {
      circulationRating = 'Good';
      daylightRating = 'Low';
    }

    let ventilationNote = `Natural cross-ventilation via ${room.sunExposure} facade.`;
    if (room.type === 'kitchen') {
      ventilationNote = `High-efficiency exhaust route with direct aperture to utility wall.`;
    } else if (room.type === 'balcony') {
      ventilationNote = `Unobstructed wind corridor facing ${room.sunExposure}.`;
    }

    let furnitureOptimization = 'Standard recommended circulation clearance of 90cm preserved around main pathways.';
    if (isLiving) {
      furnitureOptimization = 'Floating sectional placement allows uninterrupted sightlines from entryway to terrace.';
    } else if (isMaster) {
      furnitureOptimization = 'King bed anchored against solid structural wall with dual side access and 75cm nightstand clearance.';
    } else if (room.type === 'kitchen') {
      furnitureOptimization = 'Classic work triangle preserved: 1.4m between prep island, sink, and cooktop.';
    }

    return {
      roomName: room.name,
      sqFt: room.areaSqFt,
      circulationRating,
      daylightRating,
      ventilationNote,
      furnitureOptimization,
    };
  });

  const efficiencyPct = Math.round((floorPlan.carpetAreaSqFt / floorPlan.totalAreaSqFt) * 100);

  return {
    summary: `Spatial analysis for ${floorPlan.name}: The floor plan delivers an optimal ${efficiencyPct}% usable carpet-to-super-built-up efficiency ratio with distinct private/public zoning.`,
    totalSqFt: floorPlan.totalAreaSqFt,
    usableEfficiency: `${efficiencyPct}% Usable Carpet Area`,
    orientationVerdict: `Dominant orientation: ${floorPlan.orientation}. Maximizes morning daylight and minimizes harsh afternoon thermal gain.`,
    roomInsights,
    zoningStrengths: [
      'Clear acoustic separation between living/entertainment areas and sleeping quarters.',
      'Generous daylight penetration into high-occupancy zones (living salon & master suite).',
      'Ergonomic kitchen work-triangle preserving unobstructed circulation flow.',
      'Seamless indoor-outdoor continuity with direct outdoor terrace integration.',
    ],
    suggestedImprovements: [
      'Consider pocket sliding doors at secondary bath to reclaim 12 sq ft of swing clearance.',
      'Add low-profile acoustic ceiling baffles in the great room to soften reverberation across hardwood flooring.',
      'Incorporate recessed LED cove lighting to wash perimeter walls and visually expand spatial volume.',
    ],
    providerUsed: 'Deterministic Spatial Heuristics Engine (Offline)',
  };
}

export interface AppConfig {
  defaultProvider: AIProvider;
  ollamaEndpoint: string;
  ollamaModel: string;
  hasGeminiKey: boolean;
}

/**
 * Fetches server-side runtime configuration and environment defaults
 */
export async function getAppConfig(): Promise<AppConfig> {
  try {
    const res = await fetch('/api/config');
    if (res.ok) {
      return await res.json();
    }
  } catch {
    // ignore network failure in purely offline environment
  }
  return {
    defaultProvider: 'ollama',
    ollamaEndpoint: 'http://localhost:11434',
    ollamaModel: 'gemma4:e4b',
    hasGeminiKey: false,
  };
}

/**
 * Executes Floor Plan analysis via Cloud (Gemini) or Local Ollama or Offline Heuristics
 */
export async function analyzeFloorPlanWithAI(
  floorPlan: FloorPlan,
  provider: AIProvider,
  ollamaEndpoint: string = 'http://localhost:11434',
  ollamaModel: string = 'gemma4:e4b',
  customImageBase64?: string
): Promise<AIPlanAnalysis> {
  if (provider === 'heuristics') {
    return computeOfflineSpatialAnalysis(floorPlan);
  }

  try {
    const response = await fetch('/api/analyze-plan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        floorPlan,
        provider,
        ollamaEndpoint,
        ollamaModel,
        imageBase64: customImageBase64,
      }),
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      console.warn('API returned non-OK status, falling back to heuristics:', errData);
      const fallback = computeOfflineSpatialAnalysis(floorPlan);
      fallback.providerUsed = `${provider === 'cloud' ? 'Cloud Gemini' : 'Local Ollama'} (Offline Fallback Triggered)`;
      return fallback;
    }

    const data: AIPlanAnalysis = await response.json();
    return data;
  } catch (err) {
    console.warn('Network or server error during AI analysis, using offline heuristics:', err);
    const fallback = computeOfflineSpatialAnalysis(floorPlan);
    fallback.providerUsed = `Offline Heuristics Engine (Network unreachable)`;
    return fallback;
  }
}

/**
 * Handles multi-turn architectural copilot chat
 */
export async function queryArchitectChat(
  messages: ChatMessage[],
  userPrompt: string,
  floorPlan: FloorPlan,
  activeWing: BuildingWing | null,
  provider: AIProvider,
  ollamaEndpoint: string = 'http://localhost:11434',
  ollamaModel: string = 'gemma4:e4b'
): Promise<string> {
  if (provider === 'heuristics') {
    return generateOfflineChatResponse(userPrompt, floorPlan, activeWing);
  }

  try {
    const response = await fetch('/api/architect-chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages,
        prompt: userPrompt,
        floorPlan,
        activeWing,
        provider,
        ollamaEndpoint,
        ollamaModel,
      }),
    });

    if (!response.ok) {
      throw new Error(`Chat API error: ${response.status}`);
    }

    const data = await response.json();
    return data.reply;
  } catch (err) {
    console.warn('Chat request failed, providing offline contextual answer:', err);
    return generateOfflineChatResponse(userPrompt, floorPlan, activeWing);
  }
}

/**
 * Offline conversational reasoning generator for architectural questions
 */
function generateOfflineChatResponse(
  prompt: string,
  floorPlan: FloorPlan,
  activeWing: BuildingWing | null
): string {
  const p = prompt.toLowerCase();

  if (p.includes('dimension') || p.includes('size') || p.includes('area') || p.includes('sq ft')) {
    const breakdown = floorPlan.rooms.map((r) => `• **${r.name}**: ${r.dimensions} (${r.areaSqFt} sq ft)`).join('\n');
    return `Here is the precise dimensional breakdown for **${floorPlan.name}**:\n\n${breakdown}\n\n**Total Area**: ${floorPlan.totalAreaSqFt} sq ft (${floorPlan.carpetAreaSqFt} sq ft carpet area). All measurements conform to 2.8m–3.4m ceiling heights.`;
  }

  if (p.includes('light') || p.includes('sun') || p.includes('solar') || p.includes('orientation') || p.includes('window')) {
    return `**Solar & Daylight Analysis for ${floorPlan.name}**:\n\n• **Orientation**: ${floorPlan.orientation}\n• **Morning Light**: Main living and terrace areas capture direct eastern sunrise rays with zero shadowing from adjacent structures.\n• **Glare Mitigation**: Large window apertures are recessed 18cm into the facade to reduce midday glare while preserving wide panoramic sightlines.\n• **Recommendation**: Sheer double-track linen curtains provide soft thermal buffering without cutting lumen levels.`;
  }

  if (p.includes('furniture') || p.includes('sofa') || p.includes('bed') || p.includes('layout') || p.includes('interior')) {
    return `**Architectural Interior Layout Insights**:\n\n• **Living Space**: The modular sectional sofa anchors the room while leaving a clear 1.2m main arterial corridor from the entrance.\n• **Master Suite**: The king bed is positioned on the solid western wall, avoiding door draft and allowing direct ambient light from the north windows.\n• **Dining**: The 4-seater dining set is adjacent to the kitchen serving pass-through for minimal step distance during entertaining.`;
  }

  if (p.includes('wing') || p.includes('tower') || p.includes('building') || p.includes('floor') || p.includes('brochure')) {
    if (activeWing) {
      return `**${activeWing.name} (${activeWing.code}) Overview**:\n\n• **Floors**: ${activeWing.floorsCount} levels (Total ${activeWing.totalUnits} private residences)\n• **Elevation**: ${activeWing.elevationMeters} meters\n• **Specification**: ${activeWing.description}\n\nYou can click any floor level in the bottom dock slider to inspect unit plans for this wing in 3D.`;
    }
    return `Horizon Heights features 4 distinct structural wings interconnected by a central landscaped podium. North Tower houses executive 3BHK suites, South Wing features 2BHK family residences, and East Tower houses urban studios. Select any wing in the 3D viewport to inspect its architectural footprint.`;
  }

  return `Based on the spatial layout of **${floorPlan.name}** (${floorPlan.totalAreaSqFt} sq ft):\n\nThe floor plan achieves high spatial efficiency (${Math.round((floorPlan.carpetAreaSqFt / floorPlan.totalAreaSqFt) * 100)}% carpet efficiency) with balanced acoustic zoning between private bedrooms and entertaining zones. If you have specific inquiries regarding wall modifications, furniture clearances, or sun path studies, feel free to ask!`;
}

/**
 * Tests connectivity to local Ollama daemon
 */
export async function testOllamaConnection(
  endpoint: string = 'http://localhost:11434'
): Promise<{ available: boolean; models: string[]; message: string }> {
  try {
    const res = await fetch('/api/ollama-status', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ endpoint }),
    });

    if (!res.ok) {
      return { available: false, models: [], message: `Ollama daemon not responding at ${endpoint}` };
    }

    const data = await res.json();
    return data;
  } catch (err: any) {
    return {
      available: false,
      models: [],
      message: `Could not connect to Ollama at ${endpoint}: ${err.message || 'Offline'}`,
    };
  }
}
