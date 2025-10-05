"use client";
import { useState, useEffect } from "react";

interface AnnotationPopupProps {
  annotation: {
    id: string;
    title: string;
    note: string;
    category: string;
    confidence: number;
    x: number;
    y: number;
    w: number;
    h: number;
  };
  onClose: () => void;
  onStartDiscussion: () => void;
}

export default function AnnotationPopup({ annotation, onClose, onStartDiscussion }: AnnotationPopupProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const getCategoryIcon = (category: string) => {
    const icons: { [key: string]: string } = {
      'star': '⭐',
      'galaxy': '🌌',
      'nebula': '🌫️',
      'planet': '🪐',
      'moon': '🌙',
      'asteroid': '☄️',
      'comet': '💫',
      'blackhole': '🕳️'
    };
    return icons[category] || '🔍';
  };

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      'star': '#FFD700',
      'galaxy': '#8A2BE2',
      'nebula': '#FF69B4',
      'planet': '#00BFFF',
      'moon': '#C0C0C0',
      'asteroid': '#FFA500',
      'comet': '#00FF7F',
      'blackhole': '#000000'
    };
    return colors[category] || '#00FF00';
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-opacity duration-300 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
      onClick={handleBackdropClick}
    >
      <div 
        className={`glass-effect-strong rounded-2xl p-6 max-w-md w-full cosmic-glow transform transition-all duration-300 ${
          isVisible ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'
        }`}
        style={{ borderColor: getCategoryColor(annotation.category) + '30' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{getCategoryIcon(annotation.category)}</span>
            <div>
              <h3 className="text-xl font-bold text-white">{annotation.title}</h3>
              <div className="flex items-center gap-2">
                <span 
                  className="text-xs px-2 py-1 rounded-full text-white font-medium"
                  style={{ backgroundColor: getCategoryColor(annotation.category) }}
                >
                  {annotation.category.toUpperCase()}
                </span>
                <span className="text-sm text-purple-300">
                  {Math.round(annotation.confidence * 100)}% confidence
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-2xl transition-colors"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="mb-6">
          <p className="text-gray-300 text-lg leading-relaxed">
            {annotation.note}
          </p>
        </div>

        {/* AI Analysis Badge */}
        <div className="mb-6 p-4 glass-effect rounded-xl border border-purple-500/30">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">🤖</span>
            <span className="font-semibold text-white">AI Analysis</span>
          </div>
          <p className="text-sm text-gray-300">
            This feature was automatically detected and analyzed by our AI system with {Math.round(annotation.confidence * 100)}% confidence.
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onStartDiscussion}
            className="flex-1 space-button px-4 py-3 text-white rounded-xl font-medium cosmic-glow"
          >
            💬 Discuss
          </button>
          <button
            onClick={onClose}
            className="flex-1 glass-effect px-4 py-3 text-white rounded-xl font-medium hover:bg-purple-500/20 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
