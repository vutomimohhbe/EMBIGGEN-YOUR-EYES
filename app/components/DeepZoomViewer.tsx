"use client";
import { useEffect, useRef } from "react";
import OpenSeadragon from "openseadragon";

type Rect = { x:number; y:number; w:number; h:number };
export default function DeepZoomViewer({
  dziUrl, onAddRect,
}: { dziUrl: string; onAddRect?: (r:Rect)=>void }) {
  const elRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!elRef.current) return;
    const viewer = OpenSeadragon({
      element: elRef.current,
      prefixUrl: "https://openseadragon.github.io/openseadragon/images/",
      tileSources: dziUrl,
      showNavigator: true,
      gestureSettingsMouse: { clickToZoom: true, dblClickToZoom: true },
    });

    // Shift+drag to add an annotation rectangle (normalized coords)
    let down = false; let start:any = null;
    viewer.addHandler("canvas-press", (e:any) => {
      if (!e.originalEvent.shiftKey) return;
      down = true; start = viewer.viewport.pointFromPixel(e.position);
    });
    viewer.addHandler("canvas-release", (e:any) => {
      if (!down) return; down = false;
      const end = viewer.viewport.pointFromPixel(e.position);
      const x = Math.min(start.x, end.x), y = Math.min(start.y, end.y);
      const w = Math.abs(end.x - start.x), h = Math.abs(end.y - start.y);
      if (onAddRect && w > 0.002 && h > 0.002) onAddRect({ x, y, w, h });
    });

    return () => viewer.destroy();
  }, [dziUrl]);
  return <div ref={elRef} className="h-[70vh] w-full bg-black rounded" />;
}
