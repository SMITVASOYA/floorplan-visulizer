/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BuildingBrochure, FloorPlan } from '../types/architectural.ts';

/**
 * Preset 1: Modern 2BHK Residence (1,250 sq ft)
 */
export const PRESET_MODERN_2BHK: FloorPlan = {
  id: 'preset-2bhk-modern',
  name: 'Aura Residence — 2BHK Modern Flat',
  category: 'Apartment',
  description: 'Contemporary two-bedroom layout with open-plan living, private bedroom zoning, gourmet kitchen island, and an expansive viewing balcony.',
  totalAreaSqFt: 1250,
  carpetAreaSqFt: 1080,
  balconyAreaSqFt: 110,
  bedroomsCount: 2,
  bathroomsCount: 2,
  orientation: 'East-Facing Living, North Balcony',
  rooms: [
    {
      id: 'r_living_dining',
      name: 'Living & Dining Great Room',
      type: 'living',
      polygon: [
        { x: -5.0, z: -3.0 },
        { x: 1.5, z: -3.0 },
        { x: 1.5, z: 2.5 },
        { x: -5.0, z: 2.5 },
      ],
      areaSqFt: 420,
      dimensions: '21\'4" x 18\'0"',
      ceilingHeight: 2.8,
      flooringType: 'hardwood_oak',
      sunExposure: 'East',
      furniture: [
        { id: 'f1', type: 'sofa_sectional', position: { x: -2.8, z: 0.2 }, rotationY: 0 },
        { id: 'f2', type: 'dining_table', position: { x: -0.2, z: -1.2 }, rotationY: Math.PI / 2 },
        { id: 'f3', type: 'potted_plant', position: { x: -4.5, z: 2.0 }, rotationY: 0 },
      ],
    },
    {
      id: 'r_kitchen',
      name: 'Gourmet Kitchen',
      type: 'kitchen',
      polygon: [
        { x: 1.5, z: -3.0 },
        { x: 5.0, z: -3.0 },
        { x: 5.0, z: 0.2 },
        { x: 1.5, z: 0.2 },
      ],
      areaSqFt: 165,
      dimensions: '11\'6" x 10\'6"',
      ceilingHeight: 2.8,
      flooringType: 'marble_tile',
      sunExposure: 'North-East',
      furniture: [
        { id: 'f4', type: 'kitchen_island', position: { x: 3.25, z: -1.4 }, rotationY: 0 },
      ],
    },
    {
      id: 'r_master_bedroom',
      name: 'Master Bedroom Suite',
      type: 'bedroom',
      polygon: [
        { x: 1.5, z: 0.2 },
        { x: 5.0, z: 0.2 },
        { x: 5.0, z: 4.5 },
        { x: 1.5, z: 4.5 },
      ],
      areaSqFt: 280,
      dimensions: '14\'0" x 14\'1"',
      ceilingHeight: 2.8,
      flooringType: 'hardwood_oak',
      sunExposure: 'North',
      furniture: [
        { id: 'f5', type: 'king_bed', position: { x: 3.3, z: 2.2 }, rotationY: Math.PI / 2 },
        { id: 'f6', type: 'potted_plant', position: { x: 4.5, z: 4.0 }, rotationY: 0 },
      ],
    },
    {
      id: 'r_master_bath',
      name: 'En-Suite Master Bath',
      type: 'bathroom',
      polygon: [
        { x: 3.2, z: 4.5 },
        { x: 5.0, z: 4.5 },
        { x: 5.0, z: 6.2 },
        { x: 3.2, z: 6.2 },
      ],
      areaSqFt: 75,
      dimensions: '8\'0" x 5\'7"',
      ceilingHeight: 2.6,
      flooringType: 'marble_tile',
      sunExposure: 'North',
      furniture: [
        { id: 'f7', type: 'bathroom_vanity', position: { x: 4.1, z: 5.3 }, rotationY: 0 },
      ],
    },
    {
      id: 'r_guest_bedroom',
      name: 'Guest Bedroom / Study',
      type: 'bedroom',
      polygon: [
        { x: -5.0, z: 2.5 },
        { x: -1.5, z: 2.5 },
        { x: -1.5, z: 6.2 },
        { x: -5.0, z: 6.2 },
      ],
      areaSqFt: 210,
      dimensions: '11\'6" x 12\'2"',
      ceilingHeight: 2.8,
      flooringType: 'nordic_birch',
      sunExposure: 'West',
      furniture: [
        { id: 'f8', type: 'king_bed', position: { x: -3.2, z: 4.3 }, rotationY: -Math.PI / 2 },
      ],
    },
    {
      id: 'r_common_bath',
      name: 'Powder Room & Bath',
      type: 'bathroom',
      polygon: [
        { x: -1.5, z: 2.5 },
        { x: 0.8, z: 2.5 },
        { x: 0.8, z: 4.2 },
        { x: -1.5, z: 4.2 },
      ],
      areaSqFt: 55,
      dimensions: '7\'6" x 5\'7"',
      ceilingHeight: 2.6,
      flooringType: 'marble_tile',
      sunExposure: 'South',
      furniture: [
        { id: 'f9', type: 'bathroom_vanity', position: { x: -0.3, z: 3.3 }, rotationY: 0 },
      ],
    },
    {
      id: 'r_balcony',
      name: 'Viewing Terrace Balcony',
      type: 'balcony',
      polygon: [
        { x: -5.0, z: -4.5 },
        { x: 0.5, z: -4.5 },
        { x: 0.5, z: -3.0 },
        { x: -5.0, z: -3.0 },
      ],
      areaSqFt: 110,
      dimensions: '18\'0" x 5\'0"',
      ceilingHeight: 2.8,
      flooringType: 'polished_concrete',
      sunExposure: 'East',
      furniture: [
        { id: 'f10', type: 'potted_plant', position: { x: -4.4, z: -3.8 }, rotationY: 0 },
        { id: 'f11', type: 'potted_plant', position: { x: -0.2, z: -3.8 }, rotationY: 0 },
      ],
    },
  ],
  walls: [
    // Exterior perimeter
    { id: 'w1', start: { x: -5.0, z: -3.0 }, end: { x: 5.0, z: -3.0 }, isExterior: true, height: 2.8, openings: [{ type: 'window', offset: 1.5, width: 2.4, height: 1.6, elevation: 0.8 }] },
    { id: 'w2', start: { x: 5.0, z: -3.0 }, end: { x: 5.0, z: 6.2 }, isExterior: true, height: 2.8, openings: [{ type: 'window', offset: 4.2, width: 1.8, height: 1.5, elevation: 0.9 }] },
    { id: 'w3', start: { x: 5.0, z: 6.2 }, end: { x: 3.2, z: 6.2 }, isExterior: true, height: 2.8 },
    { id: 'w4', start: { x: 3.2, z: 6.2 }, end: { x: 3.2, z: 4.5 }, height: 2.8 },
    { id: 'w5', start: { x: 3.2, z: 4.5 }, end: { x: 0.8, z: 4.5 }, height: 2.8 },
    { id: 'w6', start: { x: 0.8, z: 4.5 }, end: { x: 0.8, z: 2.5 }, height: 2.8 },
    { id: 'w7', start: { x: 0.8, z: 2.5 }, end: { x: -1.5, z: 2.5 }, height: 2.8, openings: [{ type: 'door', offset: 1.0, width: 0.9, height: 2.1 }] },
    { id: 'w8', start: { x: -1.5, z: 2.5 }, end: { x: -1.5, z: 6.2 }, height: 2.8 },
    { id: 'w9', start: { x: -1.5, z: 6.2 }, end: { x: -5.0, z: 6.2 }, isExterior: true, height: 2.8, openings: [{ type: 'window', offset: 1.2, width: 1.6, height: 1.4, elevation: 0.9 }] },
    { id: 'w10', start: { x: -5.0, z: 6.2 }, end: { x: -5.0, z: -3.0 }, isExterior: true, height: 2.8, openings: [{ type: 'door', offset: 1.5, width: 2.0, height: 2.4 }] },
    // Interior partitions
    { id: 'w11', start: { x: 1.5, z: -3.0 }, end: { x: 1.5, z: 4.5 }, height: 2.8, openings: [{ type: 'door', offset: 1.2, width: 1.0, height: 2.1 }, { type: 'door', offset: 3.8, width: 0.9, height: 2.1 }] },
    { id: 'w12', start: { x: 1.5, z: 0.2 }, end: { x: 5.0, z: 0.2 }, height: 2.8 },
  ],
  exteriorBoundary: [
    { x: -5.0, z: -4.5 },
    { x: 5.0, z: -4.5 },
    { x: 5.0, z: 6.2 },
    { x: -5.0, z: 6.2 },
  ],
};

/**
 * Preset 2: Minimalist Studio Loft (680 sq ft)
 */
export const PRESET_STUDIO_LOFT: FloorPlan = {
  id: 'preset-studio-loft',
  name: 'Urban Atelier — Minimalist Studio Loft',
  category: 'Studio',
  description: 'Fluid open-concept loft with floating room dividers, dedicated sleeping alcove, Scandinavian light finishes, and terrace access.',
  totalAreaSqFt: 680,
  carpetAreaSqFt: 600,
  balconyAreaSqFt: 80,
  bedroomsCount: 1,
  bathroomsCount: 1,
  orientation: 'South-West Panoramic Glass',
  rooms: [
    {
      id: 'r_studio_main',
      name: 'Open Living & Lounge Studio',
      type: 'living',
      polygon: [
        { x: -4.0, z: -2.5 },
        { x: 1.0, z: -2.5 },
        { x: 1.0, z: 2.5 },
        { x: -4.0, z: 2.5 },
      ],
      areaSqFt: 350,
      dimensions: '16\'5" x 16\'5"',
      ceilingHeight: 3.0,
      flooringType: 'nordic_birch',
      sunExposure: 'South-West',
      furniture: [
        { id: 'sf1', type: 'sofa_sectional', position: { x: -2.0, z: -0.5 }, rotationY: 0 },
        { id: 'sf2', type: 'dining_table', position: { x: -0.5, z: 1.4 }, rotationY: 0 },
        { id: 'sf3', type: 'potted_plant', position: { x: -3.5, z: 2.0 }, rotationY: 0 },
      ],
    },
    {
      id: 'r_studio_sleeping',
      name: 'Sleeping Alcove',
      type: 'bedroom',
      polygon: [
        { x: 1.0, z: -2.5 },
        { x: 4.5, z: -2.5 },
        { x: 4.5, z: 0.8 },
        { x: 1.0, z: 0.8 },
      ],
      areaSqFt: 180,
      dimensions: '11\'6" x 10\'10"',
      ceilingHeight: 3.0,
      flooringType: 'nordic_birch',
      sunExposure: 'East',
      furniture: [
        { id: 'sf4', type: 'king_bed', position: { x: 2.8, z: -0.8 }, rotationY: Math.PI / 2 },
      ],
    },
    {
      id: 'r_studio_bath',
      name: 'Spa Bath & Vanity',
      type: 'bathroom',
      polygon: [
        { x: 1.0, z: 0.8 },
        { x: 4.5, z: 0.8 },
        { x: 4.5, z: 2.5 },
        { x: 1.0, z: 2.5 },
      ],
      areaSqFt: 90,
      dimensions: '11\'6" x 5\'7"',
      ceilingHeight: 2.7,
      flooringType: 'polished_concrete',
      sunExposure: 'North',
      furniture: [
        { id: 'sf5', type: 'bathroom_vanity', position: { x: 2.8, z: 1.6 }, rotationY: 0 },
      ],
    },
  ],
  walls: [
    { id: 'sw1', start: { x: -4.0, z: -2.5 }, end: { x: 4.5, z: -2.5 }, isExterior: true, height: 3.0, openings: [{ type: 'window', offset: 2.0, width: 3.0, height: 2.2, elevation: 0.4 }] },
    { id: 'sw2', start: { x: 4.5, z: -2.5 }, end: { x: 4.5, z: 2.5 }, isExterior: true, height: 3.0 },
    { id: 'sw3', start: { x: 4.5, z: 2.5 }, end: { x: -4.0, z: 2.5 }, isExterior: true, height: 3.0 },
    { id: 'sw4', start: { x: -4.0, z: 2.5 }, end: { x: -4.0, z: -2.5 }, isExterior: true, height: 3.0, openings: [{ type: 'door', offset: 1.5, width: 1.8, height: 2.4 }] },
    // Half-height wood partition between sleeping alcove and bath
    { id: 'sw5', start: { x: 1.0, z: 0.8 }, end: { x: 4.5, z: 0.8 }, height: 2.7, openings: [{ type: 'door', offset: 0.8, width: 0.9, height: 2.1 }] },
  ],
  exteriorBoundary: [
    { x: -4.0, z: -2.5 },
    { x: 4.5, z: -2.5 },
    { x: 4.5, z: 2.5 },
    { x: -4.0, z: 2.5 },
  ],
};

/**
 * Preset 3: Luxury Skyline Penthouse (2,400 sq ft)
 */
export const PRESET_PENTHOUSE: FloorPlan = {
  id: 'preset-penthouse-skyline',
  name: 'Vanguard Sky Penthouse',
  category: 'Penthouse',
  description: 'Crown level duplex penthouse featuring double-height reception salon, dual bedroom suites with walk-in dressing, and a continuous wrap-around terrace.',
  totalAreaSqFt: 2400,
  carpetAreaSqFt: 2120,
  balconyAreaSqFt: 280,
  bedroomsCount: 3,
  bathroomsCount: 3,
  orientation: '360° Panoramic Sky View',
  rooms: [
    {
      id: 'rp_salon',
      name: 'Grand Reception Salon',
      type: 'living',
      polygon: [
        { x: -6.0, z: -4.0 },
        { x: 2.0, z: -4.0 },
        { x: 2.0, z: 3.0 },
        { x: -6.0, z: 3.0 },
      ],
      areaSqFt: 750,
      dimensions: '26\'3" x 23\'0"',
      ceilingHeight: 3.4,
      flooringType: 'marble_tile',
      sunExposure: 'South',
      furniture: [
        { id: 'pf1', type: 'sofa_sectional', position: { x: -3.5, z: -0.5 }, rotationY: 0 },
        { id: 'pf2', type: 'dining_table', position: { x: -0.5, z: -1.8 }, rotationY: 0 },
        { id: 'pf3', type: 'potted_plant', position: { x: -5.4, z: 2.2 }, rotationY: 0 },
      ],
    },
    {
      id: 'rp_kitchen',
      name: 'Chef\'s Kitchen & Wine Bar',
      type: 'kitchen',
      polygon: [
        { x: 2.0, z: -4.0 },
        { x: 6.5, z: -4.0 },
        { x: 6.5, z: 0.0 },
        { x: 2.0, z: 0.0 },
      ],
      areaSqFt: 300,
      dimensions: '14\'9" x 13\'1"',
      ceilingHeight: 3.2,
      flooringType: 'marble_tile',
      sunExposure: 'East',
      furniture: [
        { id: 'pf4', type: 'kitchen_island', position: { x: 4.2, z: -2.0 }, rotationY: 0 },
      ],
    },
    {
      id: 'rp_master',
      name: 'Presidential Master Suite',
      type: 'bedroom',
      polygon: [
        { x: 2.0, z: 0.0 },
        { x: 6.5, z: 0.0 },
        { x: 6.5, z: 5.5 },
        { x: 2.0, z: 5.5 },
      ],
      areaSqFt: 480,
      dimensions: '14\'9" x 18\'0"',
      ceilingHeight: 3.2,
      flooringType: 'hardwood_oak',
      sunExposure: 'North',
      furniture: [
        { id: 'pf5', type: 'king_bed', position: { x: 4.2, z: 2.8 }, rotationY: Math.PI / 2 },
        { id: 'pf6', type: 'bathroom_vanity', position: { x: 5.5, z: 4.6 }, rotationY: 0 },
      ],
    },
  ],
  walls: [
    { id: 'pw1', start: { x: -6.0, z: -4.0 }, end: { x: 6.5, z: -4.0 }, isExterior: true, height: 3.4, openings: [{ type: 'window', offset: 2.0, width: 4.0, height: 2.6, elevation: 0.3 }] },
    { id: 'pw2', start: { x: 6.5, z: -4.0 }, end: { x: 6.5, z: 5.5 }, isExterior: true, height: 3.4, openings: [{ type: 'window', offset: 3.0, width: 3.0, height: 2.4, elevation: 0.4 }] },
    { id: 'pw3', start: { x: 6.5, z: 5.5 }, end: { x: -6.0, z: 5.5 }, isExterior: true, height: 3.4 },
    { id: 'pw4', start: { x: -6.0, z: 5.5 }, end: { x: -6.0, z: -4.0 }, isExterior: true, height: 3.4, openings: [{ type: 'door', offset: 2.0, width: 2.4, height: 2.8 }] },
    { id: 'pw5', start: { x: 2.0, z: -4.0 }, end: { x: 2.0, z: 5.5 }, height: 3.4, openings: [{ type: 'door', offset: 1.5, width: 1.2, height: 2.4 }, { type: 'door', offset: 4.2, width: 1.2, height: 2.4 }] },
    { id: 'pw6', start: { x: 2.0, z: 0.0 }, end: { x: 6.5, z: 0.0 }, height: 3.4 },
  ],
  exteriorBoundary: [
    { x: -6.0, z: -4.0 },
    { x: 6.5, z: -4.0 },
    { x: 6.5, z: 5.5 },
    { x: -6.0, z: 5.5 },
  ],
};

/**
 * Preset 4: Horizon Heights — Multi-Wing 4-Tower Residential Complex Brochure
 */
export const PRESET_BUILDING_BROCHURE: BuildingBrochure = {
  id: 'brochure-horizon-heights',
  name: 'Horizon Heights Residences',
  tagline: 'Sculpted architecture with 4 distinct residential wings, podium club amenities, and 360-degree city views.',
  architect: 'Foster & Partners Design Group',
  location: '742 Skyline Boulevard, Financial District',
  totalFloors: 14,
  totalWings: 4,
  amenities: [
    'Infinity Edge Sky Pool on Level 14',
    'Private Wellness Spa & Fitness Pavilion',
    'Landscaped Podium Zen Garden',
    'Automated Multi-Level Valet Parking',
    'Skyline Observation Deck & Club Lounge',
  ],
  wings: [
    {
      id: 'wing-north',
      code: 'WING-A',
      name: 'North Tower — Skyline Residences',
      description: 'Premium high-rise tower featuring luxury 3BHK residences and duplex penthouses facing the central park.',
      floorsCount: 14,
      totalUnits: 56,
      elevationMeters: 46.2,
      footprintOffset: { x: -7.0, z: -6.0 },
      width: 7.5,
      depth: 6.5,
      units: [
        { unitNumber: 'A-101', type: '3BHK Luxury', floor: 1, areaSqFt: 1850, facing: 'Park View', status: 'sold', floorPlanId: 'preset-penthouse-skyline' },
        { unitNumber: 'A-402', type: '3BHK Luxury', floor: 4, areaSqFt: 1850, facing: 'Park View', status: 'available', floorPlanId: 'preset-penthouse-skyline' },
        { unitNumber: 'A-801', type: '3BHK Sky Suite', floor: 8, areaSqFt: 2100, facing: 'Panoramic North', status: 'reserved', floorPlanId: 'preset-penthouse-skyline' },
        { unitNumber: 'A-1401', type: 'Crown Penthouse', floor: 14, areaSqFt: 2400, facing: '360 Skyline', status: 'available', floorPlanId: 'preset-penthouse-skyline' },
      ],
    },
    {
      id: 'wing-south',
      code: 'WING-B',
      name: 'South Wing — Horizon Modern Homes',
      description: 'Contemporary family apartments optimized for cross-ventilation and sunlight, offering 2BHK and 3BHK flats.',
      floorsCount: 11,
      totalUnits: 44,
      elevationMeters: 36.3,
      footprintOffset: { x: -6.5, z: 6.0 },
      width: 7.0,
      depth: 6.0,
      units: [
        { unitNumber: 'B-201', type: '2BHK Modern', floor: 2, areaSqFt: 1250, facing: 'East Courtyard', status: 'available', floorPlanId: 'preset-2bhk-modern' },
        { unitNumber: 'B-503', type: '2BHK Modern', floor: 5, areaSqFt: 1250, facing: 'East Courtyard', status: 'sold', floorPlanId: 'preset-2bhk-modern' },
        { unitNumber: 'B-902', type: '2BHK Premier', floor: 9, areaSqFt: 1320, facing: 'South Boulevard', status: 'available', floorPlanId: 'preset-2bhk-modern' },
      ],
    },
    {
      id: 'wing-east',
      code: 'WING-C',
      name: 'East Tower — Urban Executive Studios',
      description: 'Sleek executive suites and studio lofts catering to tech executives and urban professionals.',
      floorsCount: 13,
      totalUnits: 52,
      elevationMeters: 42.9,
      footprintOffset: { x: 7.0, z: -1.0 },
      width: 6.8,
      depth: 7.2,
      units: [
        { unitNumber: 'C-301', type: 'Urban Studio', floor: 3, areaSqFt: 680, facing: 'Sunrise Plaza', status: 'available', floorPlanId: 'preset-studio-loft' },
        { unitNumber: 'C-704', type: 'Urban Studio Loft', floor: 7, areaSqFt: 720, facing: 'Sunrise Plaza', status: 'reserved', floorPlanId: 'preset-studio-loft' },
        { unitNumber: 'C-1201', type: 'Executive Suite', floor: 12, areaSqFt: 850, facing: 'City Skyline', status: 'available', floorPlanId: 'preset-studio-loft' },
      ],
    },
    {
      id: 'wing-podium',
      code: 'PODIUM',
      name: 'Central Club Pavilion & Atrium',
      description: 'The social anchor of Horizon Heights housing the wellness club, indoor courts, and landscaped botanical deck.',
      floorsCount: 3,
      totalUnits: 0,
      elevationMeters: 12.0,
      footprintOffset: { x: 0.0, z: 0.0 },
      width: 5.5,
      depth: 5.5,
      units: [],
    },
  ],
};
