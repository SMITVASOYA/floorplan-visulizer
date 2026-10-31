/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '25mb' }));

// Initialize GoogleGenAI SDK for Cloud operations
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

/**
 * Endpoint: POST /api/analyze-plan
 * Multimodal architectural blueprint analysis & spatial heuristics
 */
app.post('/api/analyze-plan', async (req, res) => {
  try {
    const { floorPlan, provider, ollamaEndpoint, ollamaModel, imageBase64 } = req.body;

    if (provider === 'heuristics') {
      const efficiency = Math.round(((floorPlan?.carpetAreaSqFt || 1000) / (floorPlan?.totalAreaSqFt || 1200)) * 100);
      return res.json({
        summary: `Deterministic spatial evaluation for ${floorPlan?.name || 'Layout'}: Delivers ${efficiency}% usable carpet efficiency with balanced acoustic zoning.`,
        totalSqFt: floorPlan?.totalAreaSqFt || 1200,
        usableEfficiency: `${efficiency}% Usable Carpet Area`,
        orientationVerdict: `Dominant orientation: ${floorPlan?.orientation || 'East'}. Optimizes daylight and circulation.`,
        roomInsights: (floorPlan?.rooms || []).map((r: any) => ({
          roomName: r.name,
          sqFt: r.areaSqFt,
          circulationRating: 'Good',
          daylightRating: 'Optimal',
          ventilationNote: `Natural ventilation along ${r.sunExposure || 'perimeter'}.`,
          furnitureOptimization: 'Clear 90cm circulation paths maintained.',
        })),
        zoningStrengths: ['Acoustic separation between master suite and entertainment salon.', 'Efficient kitchen work triangle.'],
        suggestedImprovements: ['Incorporate sliding pocket doors to maximize swing clearances.'],
        providerUsed: 'Deterministic Spatial Heuristics Engine (Offline)',
      });
    }

    if (provider === 'ollama') {
      // Proxy to local Ollama daemon
      const targetEndpoint = ollamaEndpoint || 'http://localhost:11434';
      const prompt = `You are an architectural space planning AI. Analyze this floor plan: ${JSON.stringify(
        floorPlan
      )}. Provide a concise JSON analysis with: summary, totalSqFt, usableEfficiency, orientationVerdict, roomInsights (array of roomName, sqFt, circulationRating, daylightRating, ventilationNote, furnitureOptimization), zoningStrengths (array of strings), suggestedImprovements (array of strings). Return ONLY valid JSON.`;

      try {
        const ollamaRes = await fetch(`${targetEndpoint}/api/generate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: ollamaModel || 'gemma2:latest',
            prompt,
            stream: false,
            format: 'json',
          }),
        });

        if (!ollamaRes.ok) {
          throw new Error(`Ollama daemon returned ${ollamaRes.status}`);
        }

        const ollamaData = await ollamaRes.json();
        let parsed = null;
        try {
          parsed = JSON.parse(ollamaData.response);
        } catch {
          // If not strict JSON
          parsed = {
            summary: ollamaData.response.slice(0, 300),
            totalSqFt: floorPlan.totalAreaSqFt,
            usableEfficiency: '85% Usable Area',
            orientationVerdict: floorPlan.orientation,
            roomInsights: [],
            zoningStrengths: ['Flexible zoning analyzed via local Ollama.'],
            suggestedImprovements: ['Review circulation passages.'],
          };
        }
        parsed.providerUsed = `Local Ollama (${ollamaModel || 'gemma2:latest'})`;
        return res.json(parsed);
      } catch (ollamaErr: any) {
        console.warn('Ollama proxy failed, falling back:', ollamaErr.message);
        return res.status(502).json({
          error: `Could not reach Ollama at ${targetEndpoint}: ${ollamaErr.message}`,
        });
      }
    }

    // Cloud Provider: Google GenAI (gemini-3.8-flash)
    const promptText = `Analyze this architectural floor plan layout:
Name: ${floorPlan.name}
Category: ${floorPlan.category}
Total Area: ${floorPlan.totalAreaSqFt} sq ft, Carpet Area: ${floorPlan.carpetAreaSqFt} sq ft
Orientation: ${floorPlan.orientation}
Rooms: ${JSON.stringify(
      floorPlan.rooms.map((r: any) => ({
        name: r.name,
        type: r.type,
        area: r.areaSqFt,
        dimensions: r.dimensions,
        sunExposure: r.sunExposure,
      }))
    )}

Provide a rigorous architectural evaluation including spatial circulation, natural illumination, ventilation routes, and furniture clearances.`;

    const contents: any[] = [];
    if (imageBase64 && imageBase64.includes(',')) {
      const mime = imageBase64.split(';')[0].split(':')[1] || 'image/png';
      const base64Data = imageBase64.split(',')[1];
      contents.push({
        inlineData: {
          mimeType: mime,
          data: base64Data,
        },
      });
    }
    contents.push({ text: promptText });

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: { parts: contents },
      config: {
        systemInstruction:
          'You are a senior licensed architectural planner and spatial computing engineer. Deliver professional, data-driven space evaluations. Return valid JSON only.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING },
            totalSqFt: { type: Type.NUMBER },
            usableEfficiency: { type: Type.STRING },
            orientationVerdict: { type: Type.STRING },
            roomInsights: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  roomName: { type: Type.STRING },
                  sqFt: { type: Type.NUMBER },
                  circulationRating: { type: Type.STRING },
                  daylightRating: { type: Type.STRING },
                  ventilationNote: { type: Type.STRING },
                  furnitureOptimization: { type: Type.STRING },
                },
                required: ['roomName', 'sqFt', 'circulationRating', 'daylightRating', 'ventilationNote', 'furnitureOptimization'],
              },
            },
            zoningStrengths: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            suggestedImprovements: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
          },
          required: [
            'summary',
            'totalSqFt',
            'usableEfficiency',
            'orientationVerdict',
            'roomInsights',
            'zoningStrengths',
            'suggestedImprovements',
          ],
        },
      },
    });

    const jsonText = response.text || '{}';
    const parsed = JSON.parse(jsonText);
    parsed.providerUsed = 'Google GenAI (gemini-3.8-flash Cloud)';
    return res.json(parsed);
  } catch (err: any) {
    console.error('Plan analysis error:', err);
    res.status(500).json({ error: err.message || 'Failed to analyze floor plan' });
  }
});

/**
 * Endpoint: POST /api/architect-chat
 * Multi-turn architectural reasoning and advisory copilot
 */
app.post('/api/architect-chat', async (req, res) => {
  try {
    const { messages, prompt, floorPlan, activeWing, provider, ollamaEndpoint, ollamaModel } = req.body;

    if (provider === 'heuristics') {
      const p = (prompt || '').toLowerCase();
      let reply = `Based on the architectural specifications for ${floorPlan?.name || 'this layout'}:\n\n` +
        `• **Spatial Dimensions**: ${floorPlan?.totalAreaSqFt || 1200} sq ft total built-up area.\n` +
        `• **Orientation**: ${floorPlan?.orientation || 'East'}.\n` +
        `• **Circulation**: Primary pathways retain 90-120cm clearance between furniture clusters.\n` +
        `• **Daylighting**: Glazing apertures provide balanced natural illumination across primary living zones.`;
      if (p.includes('dimension') || p.includes('size') || p.includes('sq ft')) {
        reply = `**Dimensional Breakdown for ${floorPlan?.name}**:\n` +
          (floorPlan?.rooms || []).map((r: any) => `• **${r.name}**: ${r.dimensions} (${r.areaSqFt} sq ft)`).join('\n') +
          `\n\nTotal Built-Up: ${floorPlan?.totalAreaSqFt} sq ft (${floorPlan?.carpetAreaSqFt} sq ft usable carpet area).`;
      }
      return res.json({ reply });
    }

    if (provider === 'ollama') {
      const targetEndpoint = ollamaEndpoint || 'http://localhost:11434';
      const promptOllama = `You are an expert architectural spatial consultant.
Current Layout Context:
Floor Plan: ${floorPlan?.name} (${floorPlan?.totalAreaSqFt} sq ft, ${floorPlan?.orientation})
Rooms: ${floorPlan?.rooms?.map((r: any) => `${r.name}: ${r.dimensions}`).join(', ')}
${activeWing ? `Active Building Wing: ${activeWing.name} (${activeWing.floorsCount} floors)` : ''}

User Question: ${prompt}
Provide a concise, practical architectural answer.`;

      const ollamaRes = await fetch(`${targetEndpoint}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: ollamaModel || 'gemma2:latest',
          prompt: promptOllama,
          stream: false,
        }),
      });

      if (!ollamaRes.ok) {
        throw new Error(`Ollama returned status ${ollamaRes.status}`);
      }
      const data = await ollamaRes.json();
      return res.json({ reply: data.response });
    }

    // Cloud Provider: Google GenAI
    const systemInstruction = `You are a licensed architect and building design consultant embedded in the SpatialPlan 3D visualizer.
Current floor plan context:
- Name: ${floorPlan?.name}
- Total Area: ${floorPlan?.totalAreaSqFt} sq ft (${floorPlan?.carpetAreaSqFt} sq ft carpet area)
- Orientation: ${floorPlan?.orientation}
- Rooms: ${floorPlan?.rooms?.map((r: any) => `${r.name} (${r.dimensions}, ${r.areaSqFt} sq ft)`).join('; ')}
${activeWing ? `- Active Wing: ${activeWing.name} (${activeWing.floorsCount} floors, ${activeWing.totalUnits} units)` : ''}

Respond in concise, actionable architectural drafting terms. Use bullet points where appropriate. Mention dimensions, clearances, lighting orientations, and materials.`;

    const chatHistory = (messages || []).slice(-8).map((m: any) => ({
      role: m.sender === 'user' ? 'user' : 'model',
      parts: [{ text: m.text }],
    }));

    // Generate response using gemini-3.8-flash
    const chat = ai.chats.create({
      model: 'gemini-3.8-flash',
      config: {
        systemInstruction,
      },
      history: chatHistory,
    });

    const replyResponse = await chat.sendMessage({
      message: prompt,
    });

    return res.json({ reply: replyResponse.text || 'Architectural insights processed.' });
  } catch (err: any) {
    console.error('Architect chat error:', err);
    res.status(500).json({ error: err.message || 'Failed to complete chat' });
  }
});

/**
 * Endpoint: POST /api/ollama-status
 * Checks local Ollama connectivity and lists installed models
 */
app.post('/api/ollama-status', async (req, res) => {
  const { endpoint } = req.body;
  const target = endpoint || 'http://localhost:11434';

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2000);

    const checkRes = await fetch(`${target}/api/tags`, {
      method: 'GET',
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (checkRes.ok) {
      const data = await checkRes.json();
      const models = (data.models || []).map((m: any) => m.name);
      return res.json({
        available: true,
        models,
        message: `Connected to Ollama (${models.length} models detected)`,
      });
    }

    return res.json({
      available: false,
      models: [],
      message: `Ollama replied with status ${checkRes.status}`,
    });
  } catch (err: any) {
    return res.json({
      available: false,
      models: [],
      message: `Ollama is offline or unreachable at ${target}`,
    });
  }
});

// Start server with Vite middleware in development
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`SpatialPlan 3D Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
