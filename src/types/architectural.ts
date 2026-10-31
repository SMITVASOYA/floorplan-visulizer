/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type RoomType =
  | 'living'
  | 'bedroom'
  | 'kitchen'
  | 'bathroom'
  | 'balcony'
  | 'dining'
  | 'office'
  | 'corridor';

export interface Point2D {
  x: number;
  z: number;
}

export interface WallSegment {
  id: string;
  start: Point2D;
  end: Point2D;
  height?: number;
  thickness?: number;
  isExterior?: boolean;
  openings?: {
    type: 'door' | 'window';
    offset: number; // distance from start along wall
    width: number;
    height: number;
    elevation?: number; // distance from floor (for windows)
  }[];
}

export interface FurnitureSlot {
  id: string;
  type:
    | 'king_bed'
    | 'single_bed'
    | 'sofa_sectional'
    | 'sofa_standard'
    | 'dining_table'
    | 'coffee_table'
    | 'kitchen_island'
    | 'tv_credenza'
    | 'work_desk'
    | 'bathroom_vanity'
    | 'potted_plant'
    | 'armchair';
  position: Point2D;
  rotationY: number; // in radians
  scale?: number;
  materialTone?: string;
}

export interface RoomDefinition {
  id: string;
  name: string;
  type: RoomType;
  polygon: Point2D[];
  areaSqFt: number;
  dimensions: string; // e.g., "14'0\" x 12'6\""
  ceilingHeight: number;
  flooringType: 'hardwood_oak' | 'marble_tile' | 'polished_concrete' | 'nordic_birch';
  accentColor?: string;
  furniture: FurnitureSlot[];
  sunExposure: 'North' | 'South' | 'East' | 'West' | 'North-East' | 'South-West';
  recommendedUse?: string;
}

export interface FloorPlan {
  id: string;
  name: string;
  category: 'Apartment' | 'Studio' | 'Penthouse' | 'Commercial';
  description: string;
  totalAreaSqFt: number;
  carpetAreaSqFt: number;
  balconyAreaSqFt: number;
  bedroomsCount: number;
  bathroomsCount: number;
  orientation: string;
  rooms: RoomDefinition[];
  walls: WallSegment[];
  exteriorBoundary: Point2D[];
  preview2DUrl?: string;
}

export interface BuildingUnit {
  unitNumber: string;
  type: string; // e.g. "2BHK Luxury", "3BHK Sky Suite"
  floor: number;
  areaSqFt: number;
  facing: string;
  status: 'available' | 'reserved' | 'sold';
  floorPlanId: string;
}

export interface BuildingWing {
  id: string;
  code: string;
  name: string;
  description: string;
  floorsCount: number;
  totalUnits: number;
  elevationMeters: number;
  footprintOffset: Point2D;
  width: number;
  depth: number;
  units: BuildingUnit[];
}

export interface BuildingBrochure {
  id: string;
  name: string;
  tagline: string;
  architect: string;
  location: string;
  totalFloors: number;
  totalWings: number;
  wings: BuildingWing[];
  amenities: string[];
}

export type MaterialFinish = 'hardwood_oak' | 'marble_tile' | 'polished_concrete' | 'nordic_birch';

export type LightingPreset = 'morning' | 'noon' | 'sunset' | 'night';

export type CameraPreset = 'isometric' | 'topdown' | 'firstperson' | 'balcony';

export type AIProvider = 'cloud' | 'ollama' | 'heuristics';

export interface AIProviderConfig {
  provider: AIProvider;
  ollamaEndpoint: string;
  ollamaModel: string;
  isOllamaAvailable: boolean;
}

export interface SpatialMetric {
  label: string;
  value: string;
  description?: string;
}

export interface RoomAnalysisInsight {
  roomName: string;
  sqFt: number;
  circulationRating: 'Excellent' | 'Good' | 'Moderate';
  daylightRating: 'Optimal' | 'Good' | 'Low';
  ventilationNote: string;
  furnitureOptimization: string;
}

export interface AIPlanAnalysis {
  summary: string;
  totalSqFt: number;
  usableEfficiency: string;
  orientationVerdict: string;
  roomInsights: RoomAnalysisInsight[];
  zoningStrengths: string[];
  suggestedImprovements: string[];
  providerUsed: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
}
