"use client";
import { useEffect, useRef, useState } from "react";
import OpenSeadragon from "openseadragon";
import AnnotationPopup from "./AnnotationPopup";

type Rect = { x: number; y: number; w: number; h: number };
type Label = {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  title: string;
  note?: string;
  category?: string;
  confidence?: number;
};

export default function EnhancedDeepZoomViewer({
  dziPath,
  labels = [],
  onAddRect,
  onLabelClick,
}: {
  dziPath: string;
  labels?: Label[];
  onAddRect?: (r: Rect) => void;
  onLabelClick?: (label: Label) => void;
}) {
  const elRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<any>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPoint, setStartPoint] = useState<{ x: number; y: number } | null>(null);
  const [selectedAnnotation, setSelectedAnnotation] = useState<Label | null>(null);

  useEffect(() => {
    if (!elRef.current) return;
    
    const viewer = OpenSeadragon({
      element: elRef.current,
      prefixUrl: "https://openseadragon.github.io/openseadragon/images/",
      tileSources: dziPath,
      showNavigator: true,
      gestureSettingsMouse: { clickToZoom: true, dblClickToZoom: true },
      showFullPageControl: true,
      showHomeControl: true,
      showZoomControl: true,
      showRotationControl: true,
      showFlipControl: true,
      showSequenceControl: false,
      showReferenceStrip: true,
      referenceStripScroll: 'horizontal',
      referenceStripPosition: 'BOTTOM_LEFT',
      referenceStripSize: 200,
    });

    viewerRef.current = viewer;

    // Enhanced drawing functionality
    let down = false;
    let start: any = null;

    viewer.addHandler("canvas-press", (e: any) => {
      if (!e.originalEvent.shiftKey) return;
      down = true;
      start = viewer.viewport.pointFromPixel(e.position);
      setStartPoint({ x: start.x, y: start.y });
      setIsDrawing(true);
    });

    viewer.addHandler("canvas-release", (e: any) => {
      if (!down) return;
      down = false;
      const end = viewer.viewport.pointFromPixel(e.position);
      const x = Math.min(start.x, end.x);
      const y = Math.min(start.y, end.y);
      const w = Math.abs(end.x - start.x);
      const h = Math.abs(end.y - start.y);
      
      if (onAddRect && w > 0.002 && h > 0.002) {
        onAddRect({ x, y, w, h });
      }
      
      setIsDrawing(false);
      setStartPoint(null);
    });

    return () => viewer.destroy();
  }, [dziPath, onAddRect]);

  // Render labels as overlays
  useEffect(() => {
    if (!viewerRef.current) return;

    // Clear existing overlays
    labels.forEach((label) => {
      const overlayId = `label-${label.id}`;
      if (viewerRef.current.overlaysById[overlayId]) {
        viewerRef.current.removeOverlay(overlayId);
      }
    });

    // Add new overlays
    labels.forEach((label) => {
      const overlayId = `label-${label.id}`;
      const rect = new OpenSeadragon.Rect(
        label.x,
        label.y,
        label.w,
        label.h
      );

      const overlay = viewerRef.current.addOverlay({
        id: overlayId,
        location: rect,
        template: `
          <div class="space-annotation cosmic-glow" 
               style="
                 border: 3px solid ${getCategoryColor(label.category)};
                 background: ${getCategoryColor(label.category)}15;
                 cursor: pointer;
                 position: relative;
                 border-radius: 8px;
                 transition: all 0.3s ease;
               "
               onmouseover="this.style.background='${getCategoryColor(label.category)}30'; this.style.transform='scale(1.02)'"
               onmouseout="this.style.background='${getCategoryColor(label.category)}15'; this.style.transform='scale(1)'"
               onclick="window.handleLabelClick('${label.id}')">
            <div class="annotation-title" 
                 style="
                   background: ${getCategoryColor(label.category)};
                   color: white;
                   padding: 4px 8px;
                   font-size: 14px;
                   border-radius: 6px;
                   position: absolute;
                   top: -25px;
                   left: 0;
                   white-space: nowrap;
                   font-weight: 600;
                   box-shadow: 0 4px 12px rgba(0,0,0,0.3);
                 ">
              ${label.title}
            </div>
            <div class="annotation-icon" 
                 style="
                   position: absolute;
                   top: 50%;
                   left: 50%;
                   transform: translate(-50%, -50%);
                   font-size: 20px;
                   color: ${getCategoryColor(label.category)};
                   text-shadow: 0 0 10px ${getCategoryColor(label.category)};
                 ">
              ${getCategoryIcon(label.category)}
            </div>
          </div>
        `,
      });

      // Add click handler
      (window as any).handleLabelClick = (labelId: string) => {
        const label = labels.find(l => l.id === labelId);
        if (label) {
          setSelectedAnnotation(label);
          if (onLabelClick) {
            onLabelClick(label);
          }
        }
      };
    });
  }, [labels, onLabelClick]);

  const handleStartDiscussion = () => {
    if (selectedAnnotation) {
      onLabelClick?.(selectedAnnotation);
    }
    setSelectedAnnotation(null);
  };

  return (
    <div className="relative">
      <div ref={elRef} className="h-[70vh] w-full glass-effect-strong rounded-2xl border border-purple-500/30 cosmic-glow" />
      
      {/* Zoom Controls */}
      <div className="absolute top-6 right-6 space-y-3">
        <button
          onClick={() => viewerRef.current?.viewport.zoomBy(1.5)}
          className="space-button p-3 text-white rounded-xl cosmic-glow"
        >
          🔍+
        </button>
        <button
          onClick={() => viewerRef.current?.viewport.zoomBy(0.5)}
          className="space-button p-3 text-white rounded-xl cosmic-glow"
        >
          🔍-
        </button>
        <button
          onClick={() => viewerRef.current?.viewport.goHome()}
          className="space-button p-3 text-white rounded-xl cosmic-glow"
        >
          🏠
        </button>
      </div>

      {/* Drawing indicator */}
      {isDrawing && (
        <div className="absolute top-6 left-6 glass-effect-strong text-white px-4 py-2 rounded-xl text-lg font-medium cosmic-glow">
          🎯 Drawing annotation...
        </div>
      )}

      {/* Annotation Popup */}
      {selectedAnnotation && (
        <AnnotationPopup
          annotation={selectedAnnotation}
          onClose={() => setSelectedAnnotation(null)}
          onStartDiscussion={handleStartDiscussion}
        />
      )}
    </div>
  );
}

function getCategoryColor(category?: string): string {
  const colors: { [key: string]: string } = {
    'star': '#FFD700',
    'galaxy': '#8A2BE2',
    'nebula': '#FF69B4',
    'planet': '#00BFFF',
    'moon': '#C0C0C0',
    'asteroid': '#FFA500',
    'comet': '#00FF7F',
    'blackhole': '#000000',
    'default': '#00FF00'
  };
  return colors[category || 'default'] || colors.default;
}

function getCategoryIcon(category?: string): string {
  const icons: { [key: string]: string } = {
    'star': '⭐',
    'galaxy': '🌌',
    'nebula': '🌫️',
    'planet': '🪐',
    'moon': '🌙',
    'asteroid': '☄️',
    'comet': '💫',
    'blackhole': '🕳️',
    'default': '🔍'
  };
  return icons[category || 'default'] || icons.default;
}
