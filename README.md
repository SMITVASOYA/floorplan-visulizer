# SpatialPlan 3D — 2D Floor Plan to 3D Spatial Visualizer

> Interactive 2D blueprint to 3D spatial visualizer powered by local Ollama Gemma 4 and Google GenAI.

SpatialPlan 3D bridges the gap between flat architectural drawings and immersive 3D spatial understanding. By combining real-time Three.js spatial rendering, dynamic blueprint synthesis, and offline-first multimodal AI, SpatialPlan 3D lets architects, buyers, and builders explore, evaluate, and converse with floor plans in real time.

---

## ✨ Features

- **2D-to-3D Real-time Spatial Rendering**: High-performance Three.js WebGL engine with realistic materials, architectural wall outlines, daylight simulation, and smooth camera controls (orbit, top-down, and first-person walkthrough).
- **Dynamic Blueprint Synthesizer**: Parametric layout synthesis supporting diverse residential and commercial layouts:
  - Standard 30' x 40' 3-Bedroom Master Plan (exact room-by-room architectural layout)
  - Urban Studio Loft (compact open-concept living)
  - 2BHK City Executive Suite
  - 4BHK Penthouse & Luxury Villa
  - Modern Commercial Office Suite
- **Picture-in-Picture (PiP) Blueprint Overlay**: Collapsible 2D architectural drawing inspector allowing instant cross-referencing between CAD schematics and the 3D model.
- **Dual AI Engine Architecture**:
  - **Local Offline Gemma 4 (`gemma4:e4b`)**: Powered by Ollama on local hardware. Performs spatial circulation scoring, daylighting analysis, and architectural consulting with complete privacy and zero cloud egress.
  - **Cloud Google GenAI (`gemini-2.5-flash`)**: High-throughput fallback for instant cloud-based spatial reasoning.
- **Room-by-Room Spatial Inspector**: Detailed room dimensions, orientation, sun exposure scoring, and architectural utility recommendations.

---

## 🛠️ Tech Stack

- **Frontend**: React 19, TypeScript, Three.js, Lucide Icons, Motion, Tailwind CSS 4, Vite
- **Backend**: Express, Node.js (`tsx`)
- **AI Models & Engines**:
  - Google Gemma 4 (`gemma4:e4b`) running locally via Ollama (`http://localhost:11434`)
  - Google Gemini API (`@google/genai`)
- **Dev & Build Tools**: Vite 8, TypeScript 7

---

## 🚀 Getting Started

### Prerequisites

- Node.js 20+
- Ollama with Gemma 4 model installed (`ollama pull gemma4:e4b`)

### Installation

```bash
# Clone the repository
git clone https://github.com/SMITVASOYA/floorplan-visulizer.git
cd floorplan-visulizer

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env
```

Edit `.env` to configure your AI provider:
```env
DEFAULT_AI_PROVIDER=ollama
OLLAMA_MODEL=gemma4:e4b
OLLAMA_ENDPOINT=http://localhost:11434
# Optional Gemini API key fallback:
GEMINI_API_KEY=your_gemini_api_key
```

### Run Locally

```bash
npm run dev
```

Open `http://localhost:3000` in your browser.

---

## 🏆 Hackathon Submission

Submitted to **Hacktoberfest Hack Day Ahmedabad x NavraCommunity** on Major League Hacking (MLH).

- **Best Use of Gemma 4**: Utilizes local `gemma4:e4b` via Ollama for privacy-preserving, on-device spatial reasoning, daylighting evaluations, and architectural circulation audits.
- **Best Open-Source AI Project**: 100% open-source spatial visualization platform running open-weights AI without proprietary cloud lock-in.

---

## 📄 License

MIT License. Built with ❤️ for Hacktoberfest 2026.
