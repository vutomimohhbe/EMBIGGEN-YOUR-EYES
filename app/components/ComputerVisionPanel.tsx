"use client";
import { useState } from "react";

interface ClassificationResult {
  id: string;
  label: string;
  confidence: number;
  category: string;
  boundingBox: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

interface ComputerVisionPanelProps {
  onClassificationComplete?: (results: ClassificationResult[]) => void;
}

export default function ComputerVisionPanel({ onClassificationComplete }: ComputerVisionPanelProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState<ClassificationResult[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const spaceCategories = [
    { id: "star", name: "Stars", color: "#FFD700", icon: "⭐" },
    { id: "galaxy", name: "Galaxies", color: "#8A2BE2", icon: "🌌" },
    { id: "nebula", name: "Nebulae", color: "#FF69B4", icon: "🌫️" },
    { id: "planet", name: "Planets", color: "#00BFFF", icon: "🪐" },
    { id: "moon", name: "Moons", color: "#C0C0C0", icon: "🌙" },
    { id: "asteroid", name: "Asteroids", color: "#FFA500", icon: "☄️" },
    { id: "comet", name: "Comets", color: "#00FF7F", icon: "💫" },
    { id: "blackhole", name: "Black Holes", color: "#000000", icon: "🕳️" },
  ];

  const simulateAnalysis = async () => {
    setIsAnalyzing(true);
    
    // Simulate AI processing time
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Simulate classification results - enhanced for Messier 51
    const mockResults: ClassificationResult[] = [
      {
        id: "1",
        label: "Spiral Arms Structure",
        confidence: 0.98,
        category: "galaxy",
        boundingBox: { x: 0.2, y: 0.3, width: 0.4, height: 0.3 }
      },
      {
        id: "2", 
        label: "NGC 5195 Companion Galaxy",
        confidence: 0.96,
        category: "galaxy",
        boundingBox: { x: 0.7, y: 0.2, width: 0.15, height: 0.15 }
      },
      {
        id: "3",
        label: "Star-Forming Regions (HII)",
        confidence: 0.94,
        category: "nebula",
        boundingBox: { x: 0.4, y: 0.5, width: 0.2, height: 0.2 }
      },
      {
        id: "4",
        label: "Young Blue Stars",
        confidence: 0.91,
        category: "star",
        boundingBox: { x: 0.3, y: 0.6, width: 0.15, height: 0.15 }
      },
      {
        id: "5",
        label: "Galactic Center",
        confidence: 0.97,
        category: "galaxy",
        boundingBox: { x: 0.45, y: 0.45, width: 0.1, height: 0.1 }
      },
      {
        id: "6",
        label: "Dust Lanes",
        confidence: 0.89,
        category: "nebula",
        boundingBox: { x: 0.5, y: 0.3, width: 0.25, height: 0.1 }
      }
    ];
    
    setResults(mockResults);
    setIsAnalyzing(false);
    onClassificationComplete?.(mockResults);
  };

  const filteredResults = selectedCategory === "all" 
    ? results 
    : results.filter(r => r.category === selectedCategory);

  return (
    <div className="glass-effect-strong rounded-2xl cosmic-glow">
      <div className="flex items-center justify-between mb-6 p-6">
        <h3 className="text-xl font-semibold text-white flex items-center gap-3">
          🤖 AI Space Object Classifier
        </h3>
        <button
          onClick={simulateAnalysis}
          disabled={isAnalyzing}
          className="space-button px-6 py-3 text-white rounded-xl font-medium cosmic-glow disabled:opacity-50"
        >
          {isAnalyzing ? "🔍 Analyzing..." : "🚀 Analyze Image"}
        </button>
      </div>

      {/* Category Filter */}
      <div className="mb-6 px-6">
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setSelectedCategory("all")}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              selectedCategory === "all"
                ? "space-button text-white cosmic-glow"
                : "glass-effect text-gray-300 hover:bg-purple-500/20"
            }`}
          >
            All Objects
          </button>
          {spaceCategories.map(category => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${
                selectedCategory === category.id
                  ? "space-button text-white cosmic-glow"
                  : "glass-effect text-gray-300 hover:bg-purple-500/20"
              }`}
            >
              <span className="text-lg">{category.icon}</span>
              {category.name}
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      <div className="space-y-4 max-h-80 overflow-y-auto px-6">
        {isAnalyzing ? (
          <div className="text-center py-12">
            <div className="animate-spin w-12 h-12 border-3 border-purple-500 border-t-transparent rounded-full mx-auto mb-6"></div>
            <p className="text-purple-300 text-lg">AI is analyzing the cosmic objects...</p>
          </div>
        ) : results.length === 0 ? (
          <div className="text-center py-12 text-gray-300">
            <div className="text-6xl mb-4">🔬</div>
            <p className="text-lg">Click "Analyze Image" to detect space objects</p>
          </div>
        ) : (
          filteredResults.map((result) => {
            const category = spaceCategories.find(c => c.id === result.category);
            return (
              <div
                key={result.id}
                className="glass-effect rounded-xl p-4 border border-purple-500/30"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{category?.icon}</span>
                    <span className="font-semibold text-white text-lg">{result.label}</span>
                  </div>
                  <div className="text-sm text-purple-300 font-medium">
                    {Math.round(result.confidence * 100)}% confidence
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex-1 bg-slate-700/50 rounded-full h-3">
                    <div
                      className="h-3 rounded-full bg-gradient-to-r from-purple-500 to-blue-500"
                      style={{ width: `${result.confidence * 100}%` }}
                    />
                  </div>
                  <span className="text-sm text-gray-400 font-medium">
                    {category?.name}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Analysis Summary */}
      {results.length > 0 && (
        <div className="mt-6 pt-6 border-t border-purple-500/30 mx-6">
          <div className="grid grid-cols-2 gap-6 text-center">
            <div className="glass-effect rounded-xl p-4">
              <div className="text-3xl font-bold text-purple-400 mb-2">{results.length}</div>
              <div className="text-gray-300 font-medium">Objects Detected</div>
            </div>
            <div className="glass-effect rounded-xl p-4">
              <div className="text-3xl font-bold text-blue-400 mb-2">
                {Math.round(results.reduce((acc, r) => acc + r.confidence, 0) / results.length * 100)}%
              </div>
              <div className="text-gray-300 font-medium">Avg Confidence</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
