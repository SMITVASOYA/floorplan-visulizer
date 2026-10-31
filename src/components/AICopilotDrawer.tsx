/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import {
  Check,
  ChevronRight,
  Compass,
  Cpu,
  Layers,
  Lightbulb,
  Maximize2,
  RefreshCw,
  Send,
  Sparkles,
  Sun,
  Wind,
  X,
} from 'lucide-react';
import {
  AIPlanAnalysis,
  AIProvider,
  BuildingWing,
  ChatMessage,
  FloorPlan,
  RoomDefinition,
} from '../types/architectural.ts';
import {
  analyzeFloorPlanWithAI,
  queryArchitectChat,
  testOllamaConnection,
} from '../services/aiService.ts';

interface AICopilotDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  floorPlan: FloorPlan;
  activeWing: BuildingWing | null;
  aiProvider: AIProvider;
  onAIProviderChange: (provider: AIProvider) => void;
  ollamaEndpoint: string;
  onOllamaEndpointChange: (endpoint: string) => void;
  ollamaModel: string;
  onOllamaModelChange: (model: string) => void;
  onSelectRoomIn3D: (room: RoomDefinition) => void;
}

export const AICopilotDrawer: React.FC<AICopilotDrawerProps> = ({
  isOpen,
  onClose,
  floorPlan,
  activeWing,
  aiProvider,
  onAIProviderChange,
  ollamaEndpoint,
  onOllamaEndpointChange,
  ollamaModel,
  onOllamaModelChange,
  onSelectRoomIn3D,
}) => {
  const [activeTab, setActiveTab] = useState<'analysis' | 'chat' | 'settings'>('analysis');
  const [analysis, setAnalysis] = useState<AIPlanAnalysis | null>(null);
  const [isLoadingAnalysis, setIsLoadingAnalysis] = useState(false);

  // Chat state
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: `Welcome to the SpatialPlan Architectural Copilot. I have analyzed the spatial zoning for **${floorPlan.name}**. You can ask me regarding circulation clearances, daylighting optimization, structural wall modifications, or wing layout details.`,
      timestamp: 'Now',
    },
  ]);
  const [inputPrompt, setInputPrompt] = useState('');
  const [isChatStreaming, setIsChatStreaming] = useState(false);
  const chatScrollRef = useRef<HTMLDivElement>(null);

  // Ollama test state
  const [ollamaStatus, setOllamaStatus] = useState<{ available: boolean; message: string; models: string[] }>({
    available: false,
    message: 'Untested',
    models: [],
  });

  // Fetch or compute spatial analysis whenever floor plan or provider changes
  useEffect(() => {
    let isCancelled = false;
    const runAnalysis = async () => {
      setIsLoadingAnalysis(true);
      try {
        const result = await analyzeFloorPlanWithAI(floorPlan, aiProvider, ollamaEndpoint, ollamaModel);
        if (!isCancelled) setAnalysis(result);
      } catch (err) {
        console.error('Error running plan analysis:', err);
      } finally {
        if (!isCancelled) setIsLoadingAnalysis(false);
      }
    };
    runAnalysis();
    return () => {
      isCancelled = true;
    };
  }, [floorPlan.id, aiProvider]);

  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async (textToSend?: string) => {
    const prompt = (textToSend || inputPrompt).trim();
    if (!prompt || isChatStreaming) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: prompt,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputPrompt('');
    setIsChatStreaming(true);

    try {
      const replyText = await queryArchitectChat(
        [...messages, userMsg],
        prompt,
        floorPlan,
        activeWing,
        aiProvider,
        ollamaEndpoint,
        ollamaModel
      );

      const assistantMsg: ChatMessage = {
        id: `reply-${Date.now()}`,
        sender: 'assistant',
        text: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          sender: 'assistant',
          text: `Architectural copilot response: ${err.message || 'Consultation complete.'}`,
          timestamp: 'Just now',
        },
      ]);
    } finally {
      setIsChatStreaming(false);
    }
  };

  const handleTestOllama = async () => {
    setOllamaStatus({ available: false, message: 'Testing connection to Ollama daemon...', models: [] });
    const res = await testOllamaConnection(ollamaEndpoint);
    setOllamaStatus(res);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed top-0 right-0 bottom-0 z-30 w-full sm:w-[440px] bg-[#10141d] border-l border-white/10 shadow-2xl flex flex-col text-slate-200">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3.5 border-b border-white/8 bg-[#0b0e14]">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded bg-amber-500/15 text-amber-400 border border-amber-500/30">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-semibold tracking-tight text-slate-100">Architectural Copilot</h2>
            <p className="text-[11px] text-slate-400 font-mono">
              {aiProvider === 'cloud'
                ? 'Cloud GenAI (gemini-3.8-flash)'
                : aiProvider === 'ollama'
                ? `Local Ollama (${ollamaModel})`
                : 'Deterministic Spatial Heuristics'}
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center border-b border-white/8 bg-[#0e121a] px-3 pt-2 text-xs font-medium">
        <button
          onClick={() => setActiveTab('analysis')}
          className={`flex items-center gap-1.5 pb-2 px-3 border-b-2 transition-colors ${
            activeTab === 'analysis'
              ? 'border-amber-400 text-amber-300 font-semibold'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Spatial Breakdown</span>
        </button>
        <button
          onClick={() => setActiveTab('chat')}
          className={`flex items-center gap-1.5 pb-2 px-3 border-b-2 transition-colors ${
            activeTab === 'chat'
              ? 'border-amber-400 text-amber-300 font-semibold'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Consultation Chat</span>
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={`flex items-center gap-1.5 pb-2 px-3 border-b-2 transition-colors ml-auto ${
            activeTab === 'settings'
              ? 'border-amber-400 text-amber-300 font-semibold'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Cpu className="w-3.5 h-3.5" />
          <span>AI Engine</span>
        </button>
      </div>

      {/* Drawer Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {activeTab === 'analysis' && (
          <div className="space-y-4">
            {/* Overview Metric Banner */}
            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-white/8 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Total Built-Up Area:</span>
                <span className="font-mono text-amber-300 font-semibold text-sm">
                  {floorPlan.totalAreaSqFt} sq ft
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Carpet Efficiency:</span>
                <span className="font-mono text-slate-200 font-medium">
                  {floorPlan.carpetAreaSqFt} sq ft ({Math.round((floorPlan.carpetAreaSqFt / floorPlan.totalAreaSqFt) * 100)}%)
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Solar Orientation:</span>
                <span className="text-slate-200 font-medium">{floorPlan.orientation}</span>
              </div>
              <div className="text-[11px] text-slate-400 border-t border-white/6 pt-2 leading-relaxed">
                {isLoadingAnalysis ? (
                  <span className="italic text-amber-400 flex items-center gap-1.5">
                    <RefreshCw className="w-3 h-3 animate-spin" /> Computing spatial analysis...
                  </span>
                ) : (
                  analysis?.summary
                )}
              </div>
            </div>

            {/* Room Breakdown list with interactive click-to-fly */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400">
                  Room Zoning & Circulation
                </h4>
                <span className="text-[10px] text-slate-400 font-mono">Click card to fly camera</span>
              </div>

              {floorPlan.rooms.map((room) => {
                const insight = analysis?.roomInsights.find((r) => r.roomName === room.name);
                return (
                  <div
                    key={room.id}
                    onClick={() => onSelectRoomIn3D(room)}
                    className="p-3 rounded-lg bg-[#141a24] hover:bg-[#1a2230] border border-white/6 hover:border-amber-500/40 cursor-pointer transition-all space-y-1.5 group"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-100 group-hover:text-amber-300 transition-colors">
                          {room.name}
                        </span>
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 border border-slate-700">
                          {room.type}
                        </span>
                      </div>
                      <span className="font-mono text-amber-400 text-xs font-medium">
                        {room.areaSqFt} sq ft
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-[11px] text-slate-400 font-mono">
                      <span>Dim: {room.dimensions}</span>
                      <span>·</span>
                      <span>Ceiling: {room.ceilingHeight}m</span>
                      <span>·</span>
                      <span>Sun: {room.sunExposure}</span>
                    </div>

                    {insight && (
                      <div className="text-[11px] text-slate-300 pt-1 border-t border-white/5 space-y-1">
                        <p className="text-slate-400">{insight.furnitureOptimization}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Architectural Recommendations */}
            {analysis?.zoningStrengths && (
              <div className="p-3.5 rounded-xl bg-slate-900/60 border border-white/8 space-y-2 text-xs">
                <div className="flex items-center gap-1.5 text-amber-400 font-semibold">
                  <Check className="w-3.5 h-3.5" />
                  <span>Zoning Strengths</span>
                </div>
                <ul className="space-y-1 text-slate-300 text-[11px] list-disc list-inside">
                  {analysis.zoningStrengths.map((str, idx) => (
                    <li key={idx} className="leading-relaxed">
                      {str}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {analysis?.suggestedImprovements && (
              <div className="p-3.5 rounded-xl bg-slate-900/60 border border-white/8 space-y-2 text-xs">
                <div className="flex items-center gap-1.5 text-sky-400 font-semibold">
                  <Lightbulb className="w-3.5 h-3.5" />
                  <span>Spatial Optimizations</span>
                </div>
                <ul className="space-y-1 text-slate-300 text-[11px] list-disc list-inside">
                  {analysis.suggestedImprovements.map((imp, idx) => (
                    <li key={idx} className="leading-relaxed">
                      {imp}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {activeTab === 'chat' && (
          <div className="flex flex-col h-[calc(100vh-210px)]">
            {/* Quick Prompt Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-white/8 text-[11px]">
              {[
                'Daylighting & Solar Heat Analysis',
                'Kitchen-to-Dining Circulation',
                'Master Suite Storage Optimization',
                'Acoustic Separation Between Wings',
              ].map((chip) => (
                <button
                  key={chip}
                  onClick={() => handleSendMessage(chip)}
                  className="px-2.5 py-1 rounded bg-slate-800/80 hover:bg-slate-700 text-slate-300 whitespace-nowrap border border-white/6 transition-colors"
                >
                  {chip}
                </button>
              ))}
            </div>

            {/* Chat Stream */}
            <div ref={chatScrollRef} className="flex-1 overflow-y-auto py-3 space-y-3">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[88%] p-3 rounded-xl text-xs leading-relaxed ${
                      m.sender === 'user'
                        ? 'bg-amber-500 text-slate-950 font-medium rounded-br-none shadow-md'
                        : 'bg-[#151c27] border border-white/8 text-slate-200 rounded-bl-none'
                    }`}
                  >
                    <div className="whitespace-pre-wrap">{m.text}</div>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400 px-1 mt-0.5">{m.timestamp}</span>
                </div>
              ))}
              {isChatStreaming && (
                <div className="flex items-center gap-2 p-2.5 rounded bg-[#151c27] text-xs text-amber-400 italic">
                  <RefreshCw className="w-3 h-3 animate-spin" />
                  <span>Synthesizing architectural advice...</span>
                </div>
              )}
            </div>

            {/* Input Bar */}
            <div className="pt-2 border-t border-white/8">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="flex items-center gap-2"
              >
                <input
                  type="text"
                  value={inputPrompt}
                  onChange={(e) => setInputPrompt(e.target.value)}
                  placeholder="Ask regarding circulation, dimensions, or lighting..."
                  className="flex-1 px-3 py-2 text-xs rounded-lg bg-slate-900 border border-slate-700 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-400"
                />
                <button
                  type="submit"
                  disabled={!inputPrompt.trim() || isChatStreaming}
                  className="p-2 rounded-lg bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-slate-950 font-semibold transition-colors"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="space-y-5 text-xs">
            <div>
              <h3 className="font-semibold text-slate-100 mb-1">Dual AI Engine Architecture</h3>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                SpatialPlan 3D operates either through the Cloud Gemini 3.8 / Gemma endpoint or locally via Ollama when working offline.
              </p>
            </div>

            {/* Provider Selector Cards */}
            <div className="space-y-2">
              {[
                {
                  id: 'cloud',
                  title: 'Cloud Google GenAI (gemini-3.8-flash)',
                  desc: 'High-performance cloud multimodal reasoning, optimal for floor plan blueprint image parsing.',
                },
                {
                  id: 'ollama',
                  title: 'Local Ollama Daemon (Offline)',
                  desc: 'Runs directly against your localhost Ollama installation (e.g. gemma2, llama3) for 100% offline environments.',
                },
                {
                  id: 'heuristics',
                  title: 'Deterministic Heuristics Engine',
                  desc: 'Zero-network built-in spatial calculation engine for area ratios, daylight ratings, and circulation checks.',
                },
              ].map((p) => (
                <div
                  key={p.id}
                  onClick={() => onAIProviderChange(p.id as AIProvider)}
                  className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                    aiProvider === p.id
                      ? 'bg-amber-500/15 border-amber-500/40 text-slate-100'
                      : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-slate-200">{p.title}</span>
                    {aiProvider === p.id && <Check className="w-4 h-4 text-amber-400" />}
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">{p.desc}</p>
                </div>
              ))}
            </div>

            {/* Ollama Configuration Section */}
            {aiProvider === 'ollama' && (
              <div className="p-3.5 rounded-xl bg-slate-900/80 border border-white/8 space-y-3">
                <h4 className="font-semibold text-slate-200 flex items-center gap-1.5">
                  <Cpu className="w-4 h-4 text-sky-400" />
                  <span>Local Ollama Endpoint Configuration</span>
                </h4>

                <div>
                  <label className="block text-slate-400 text-[11px] mb-1">Daemon Endpoint URL</label>
                  <input
                    type="text"
                    value={ollamaEndpoint}
                    onChange={(e) => onOllamaEndpointChange(e.target.value)}
                    className="w-full px-3 py-1.5 rounded bg-slate-950 border border-slate-700 text-slate-100 font-mono text-xs focus:outline-none focus:border-amber-400"
                    placeholder="http://localhost:11434"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 text-[11px] mb-1">Ollama Model Name</label>
                  <input
                    type="text"
                    value={ollamaModel}
                    onChange={(e) => onOllamaModelChange(e.target.value)}
                    className="w-full px-3 py-1.5 rounded bg-slate-950 border border-slate-700 text-slate-100 font-mono text-xs focus:outline-none focus:border-amber-400"
                    placeholder="gemma2:latest or gemma:7b"
                  />
                </div>

                <div className="flex items-center justify-between pt-1">
                  <button
                    onClick={handleTestOllama}
                    className="px-3 py-1.5 rounded bg-sky-500/20 text-sky-300 border border-sky-500/40 hover:bg-sky-500/30 font-medium text-xs transition-colors"
                  >
                    Test Connectivity
                  </button>
                  <span className="text-[11px] font-mono text-slate-400">{ollamaStatus.message}</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
