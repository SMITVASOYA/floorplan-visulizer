# SpatialPlan 3D — 2D Floor Plan & Multi-Wing Building Interactive 3D Visualizer

A web-based architectural visualization studio that transforms 2D floor plans and multi-wing property brochures into interactive 3D walkthrough models with procedural furnishings, real-time lighting, and a dual-mode AI architectural intelligence engine (Cloud GenAI & Local Ollama / Offline Fallback).

---

## User Review & Critical Decisions

> [!IMPORTANT]
> The following revisions have been incorporated directly from your feedback:

- **Architectural Drafting Studio Theme (No Purple/Green AI Tropes)**:
  - Strictly bans generic purple, violet, and neon-green AI slop aesthetics.
  - Adopts an authentic high-end architectural atelier visual language: deep charcoal drafting slate (`#0E1117`), warm architectural sandstone (`#E5DFD5`), engineered brass & warm amber accents (`#D97706`), crisp bone white typography (`#F8FAFC`), and clean hairline technical dividers.
- **Dual AI Engine (Cloud + Local Ollama / Offline Architecture)**:
  - **Cloud Mode (Default)**: Server-side Gemini / Gemma model integration via `@google/genai` for cloud-based spatial reasoning and visual plan analysis.
  - **Local / Ollama Mode**: Direct integration with local Ollama instances (e.g. `http://localhost:11434` running `gemma`, `gemma2`, or compatible models) for offline environments.
  - **Offline Heuristics Fallback**: If offline and no local Ollama daemon is running, a built-in deterministic spatial heuristics engine automatically computes area, room circulation, daylight orientations, and layout efficiency so the app remains 100% functional without external dependencies.
- **Curated Floor Plans & Multi-Wing Brochure Presets**: Instant exploration gallery (Modern 2BHK Flat, Open Studio Loft, Executive Penthouse, and Emerald Heights 4-Wing Residential Complex) plus custom image upload.

---

## 1. Overview & Core Concept

- **What It Does**: Bridges 2D blueprint schematics and 3D spatial reality. Users upload architectural floor plans or multi-page brochures; the system generates an interactive 3D spatial model rendered at 60fps with Three.js. Users can inspect room volumes, cut away roofs, customize material finishes, walk through apartments, examine multi-story wings, and consult the architectural copilot.
- **Target Audience / Persona**: Architects, interior designers, prospective home buyers, and property developers who need clear spatial comprehension of floor plans and tower brochures.
- **Key Value**: Turns static 2D blueprints into tangible, walkable 3D environments with zero 3D modeling skills, working seamlessly both online and offline.

---

## 2. User Experience & Visual Design

### Key User Flows
1. **Interactive Viewport Entry**: The 3D canvas loads immediately into a studio-lit architectural model. An ergonomic, collapsible bottom dock allows immediate switching between presets or uploading a custom floor plan.
2. **Floor Plan Mode**:
   - Room-by-room inspection with highlighted spatial zones.
   - Roof slice & wall cutaway slider to transition between dollhouse cutaway and full 3D walls.
   - PBR material finish toggles: Natural Oak parquet, Polished Marble, Industrial Concrete, and Scandi Birch.
   - Sun path & lighting simulation (Morning Dawn, High Noon, Golden Hour Sunset, Interior Night Glow).
3. **Building Brochure & Wing Navigator Mode**:
   - Multi-wing exterior view (North Wing, South Wing, East Tower, Amenities Podium).
   - Interactive wing raycasting: click any wing or floor to isolate that level.
   - Unit selection card allows drilling straight into that specific apartment's 3D floor plan.
4. **Dual AI Copilot (Cloud / Ollama / Offline)**:
   - Floating architectural panel with an engine toggle: **Cloud API** ⇄ **Local Ollama** (with endpoint tester) ⇄ **Offline Heuristics**.
   - Spatial zoning breakdown, total square footage, natural daylight analysis, and interactive architectural chat.

### Visual Identity & Theme
- **Theme Philosophy**: Precision Architectural Atelier.
- **Color Palette**:
  - Drafting Surface / Canvas Background: Deep Obsidian Slate (`#0B0E14`).
  - Card & Dock Surfaces: Matte Charcoal Slate (`#121620`) with hairline drafting borders (`rgba(255, 255, 255, 0.08)`).
  - Primary Structural Highlight: Architectural Amber & Brushed Brass (`#D97706` / `#F59E0B`).
  - Architectural Blueprints / Water Zones: Muted Steel Cyan (`#38BDF8`).
  - Typography: Pure Chalk White (`#F8FAFC`) and Muted Drafting Gray (`#94A3B8`).
- **Typography**:
  - Headings: `Plus Jakarta Sans` (bold, geometric, architectural weight).
  - Technical Specifications & Measurements: `JetBrains Mono` / tabular numerals (`tabular-nums`) for precise square footage and dimension callouts.
- **Ergonomics**: All controls unified in a collapsible bottom dock (`bottom: 20px`, centered, max-width 940px) with one-click Cinema Mode toggle to prevent any obstruction of the 3D viewport.

---

## 3. Key Product Decisions & Trade-Offs

- **Dual AI Engine Architecture (Cloud + Ollama + Heuristics)**:
  - *Chosen Approach*: Multi-provider strategy. The server proxy handles Cloud Gemini/Gemma requests; the client or server can also route directly to a local Ollama endpoint (`http://localhost:11434/api/generate`), with an automatic fallback to an offline geometric heuristics analyzer if neither is reachable.
  - *Why*: Guarantees zero downtime and complete privacy for users working in offline environments or confidential pre-release property projects.
- **Procedural 3D Geometry**:
  - *Chosen Approach*: 100% procedural 3–12 part composite models in Three.js (beveled walls, lathe dining tables, multi-part sofas, architectural glass, soft radial contact shadows) generated in code with zero external 404 asset dependencies.
  - *Why*: Instant loading, zero broken asset URLs, and dynamic parametric wall adjustments.
- **Software WebGL Guard**:
  - *Chosen Approach*: GPU probe detecting software renderers (SwiftShader, llvmpipe) to adaptively balance shadows and pixel ratio while preserving exact scene fidelity.

---

## 4. Technical Architecture & Data Strategy

```
┌────────────────────────────────────────────────────────────────────────┐
│                        SPATIALPLAN 3D SYSTEM ARCHITECTURE              │
└────────────────────────────────────────────────────────────────────────┘

 [ Client Browser ]
  │
  ├─► Three.js Viewport (Full-Bleed 100vw x 100vh Canvas)
  │    ├─► Studio Lighting: RoomEnvironment + Warm Key Sunlight + Cool Hemisphere
  │    ├─► Procedural Geometry: Walls, Slabs, Beveled Openings, Multi-Part Props
  │    ├─► Raycaster: Clickable Rooms, Wing Isolator, Floor Slider
  │    └─► Damped OrbitControls: Smooth 60fps Camera Glide
  │
  ├─► Collapsible Bottom Dock (Cinema Mode Toggle)
  │    ├─► Presets: Modern 2BHK, Studio Loft, Penthouse, Emerald Tower
  │    ├─► Mode Switch: Floor Plan ◄► Multi-Wing Tower
  │    ├─► Roof Cutaway Slider & PBR Material Selector
  │    └─► Plan Upload Modal (Dropzone for custom blueprint images)
  │
  └─► Architectural Intelligence Drawer
       ├─► Engine Selector: [ Cloud GenAI ] ◄► [ Local Ollama ] ◄► [ Offline ]
       ├─► Spatial Metrics: Square Footage, Room Count, Daylighting Index
       └─► Copilot Chat: Multi-turn Architectural Reasoning
  │
  ▼
 [ Backend Proxy (/api/...) ]
  │
  ├─► POST /api/analyze-plan
  │    ├─ Cloud: Google GenAI (gemini-3.8-flash / gemma)
  │    ├─ Local: Proxy to Ollama (http://localhost:11434/api/generate)
  │    └─ Fallback: Built-in Architectural Heuristics Engine
  │
  └─► POST /api/architect-chat
       ├─ Cloud: Streaming / Multi-turn chat
       └─ Local / Offline: Ollama streaming / Contextual Spatial Knowledge
```

### Data Model & State
- **FloorPlanModel**: Defines rooms (`id`, `name`, `type`, `polygon`, `areaSqFt`, `furnitureSlots`), walls (`start`, `end`, `height`, `thickness`), and finishes.
- **BuildingBrochureModel**: Defines wings (`id`, `name`, `code`, `floorsCount`), levels, and units linked to their respective floor plans.
- **AIProviderConfig**: `provider` ('cloud' | 'ollama' | 'heuristics'), `ollamaEndpoint` (default `http://localhost:11434`), `ollamaModel` (default `gemma2:latest`), `connectionStatus` ('connected' | 'checking' | 'offline').

### Verification & Testing Plan
1. **Compilation Check**: Run `compile_applet` to confirm clean build.
2. **Theme Verification**: Verify no purple/green AI clichés; confirm rich charcoal, sandstone, and warm brass aesthetic.
3. **Dual AI Verification**: Test Cloud Gemini model analysis, test Ollama endpoint connectivity / configuration, and verify offline heuristics fallback.
4. **Interactive 3D Validation**: Verify smooth 60fps orbit controls, roof cutaway slider, room click-to-focus, and building wing exploration.
