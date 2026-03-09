"use client";

import { Counter } from "./zoomCounter";
import HistoryButtons from "./historyButtons";
import { useCanvasStore } from "@/store/useCanvasStore";
import { getZoomPercent, zoomToLevel } from "@/lib/canvas/viewport";

function Footer() {
  const { viewport, setViewport } = useCanvasStore()
  const zoomPercent = getZoomPercent(viewport) // viewport.zoom * 100

  const handleZoomChange = (newPercent: number) => {
  const screenCenter = {
    x: window.innerWidth / 2,
    y: window.innerHeight / 2,
  }
  setViewport(zoomToLevel(viewport, newPercent / 100, screenCenter))
}
  return (
    <div className="fixed bottom-5 left-10 flex items-center gap-4">
      <Counter number={zoomPercent} setNumber={handleZoomChange} className="w-fit" />
      <HistoryButtons />
    </div>
  );
}

export default Footer;
