"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import EnhancedDeepZoomViewer from "@/app/components/EnhancedDeepZoomViewer";
import SpaceChat from "@/app/components/SpaceChat";
import ComputerVisionPanel from "@/app/components/ComputerVisionPanel";

interface Asset {
  id: string;
  title: string;
  dziPath: string;
  thumbUrl?: string;
  labels: Array<{
    id: string;
    x: number;
    y: number;
    w: number;
    h: number;
    title: string;
    note?: string;
    category?: string;
    confidence?: number;
  }>;
}

export default function ExplorePage() {
  const params = useParams();
  const [asset, setAsset] = useState<Asset | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedLabel, setSelectedLabel] = useState<any>(null);
  const [showChat, setShowChat] = useState(false);
  const [showAI, setShowAI] = useState(false);

  useEffect(() => {
    if (params.id) {
      fetch(`/api/assets/${params.id}`)
        .then(r => {
          if (!r.ok) {
            throw new Error(`HTTP error! status: ${r.status}`);
          }
          return r.json();
        })
        .then(data => {
          console.log('Asset data:', data);
          setAsset(data);
          setLoading(false);
        })
        .catch(err => {
          console.error('Error fetching asset:', err);
          setAsset(null);
          setLoading(false);
        });
    }
  }, [params.id]);

  const handleAddRect = (rect: { x: number; y: number; w: number; h: number }) => {
    const title = prompt("What did you discover?");
    if (title) {
      // Here you would typically save the annotation to the database
      console.log("New annotation:", { ...rect, title });
    }
  };

  const handleLabelClick = (label: any) => {
    setSelectedLabel(label);
    setShowChat(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <div className="text-xl text-white">Loading cosmic data...</div>
        </div>
      </div>
    );
  }

  if (!asset) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="text-6xl mb-4">🌌</div>
          <div className="text-xl">Asset not found in the cosmic database</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative">
      {/* Header */}
      <div className="glass-effect-strong border-b border-purple-500/30 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-3 cosmic-glow">{asset.title}</h1>
            <p className="text-purple-300 text-lg">Explore the cosmic wonders with enhanced zoom and AI analysis</p>
          </div>
          <div className="flex gap-4">
            <button
              onClick={() => setShowAI(!showAI)}
              className="space-button px-6 py-3 text-white rounded-xl font-medium cosmic-glow"
            >
              🤖 AI Analysis
            </button>
            <button
              onClick={() => setShowChat(!showChat)}
              className="space-button px-6 py-3 text-white rounded-xl font-medium cosmic-glow"
            >
              💬 Community
            </button>
          </div>
        </div>
      </div>

      <div className="flex h-[calc(100vh-120px)]">
        {/* Main Viewer */}
        <div className="flex-1 p-4">
          <EnhancedDeepZoomViewer
            dziPath={asset.dziPath}
            labels={asset.labels}
            onAddRect={handleAddRect}
            onLabelClick={handleLabelClick}
          />
        </div>

        {/* Side Panels */}
        <div className="w-80 space-y-4 p-4 overflow-y-auto">
          {/* AI Analysis Panel */}
          {showAI && (
            <ComputerVisionPanel
              onClassificationComplete={(results) => {
                console.log("AI Analysis Complete:", results);
              }}
            />
          )}

          {/* Chat Panel */}
          {showChat && (
            <SpaceChat
              assetId={asset.id}
              labelId={selectedLabel?.id}
              onNewComment={(comment) => {
                console.log("New comment:", comment);
              }}
            />
          )}

          {/* Instructions */}
          <div className="glass-effect-strong rounded-2xl p-6 cosmic-glow">
            <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-3">
              🚀 Explorer Guide
            </h3>
            <div className="space-y-4 text-gray-300">
              <div className="flex items-center gap-3">
                <span className="text-2xl">🔍</span>
                <span className="text-lg">Mouse wheel to zoom in/out</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-2xl">🎯</span>
                <span className="text-lg">Shift+drag to create annotations</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-2xl">💬</span>
                <span className="text-lg">Click annotations to discuss</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-2xl">🤖</span>
                <span className="text-lg">Use AI to classify objects</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
