"use client";

import { Counter } from "./zoomCounter";
import HistoryButtons from "./historyButtons";
import { useCanvasStore } from "@/store/useCanvasStore";
import { getZoomPercent, zoomToLevel } from "@/lib/canvas/viewport";

function Footer() {
  const { viewport, setViewport } = useCanvasStore();
  const zoomPercent = getZoomPercent(viewport);

  const handleZoomChange = (newPercent: number) => {
    const screenCenter = {
      x: window.innerWidth / 2,
      y: window.innerHeight / 2,
    };
    setViewport(zoomToLevel(viewport, newPercent / 100, screenCenter));
  };

  return (
    <div
      className="z-20 flex items-center gap-3"
    >
      <Counter
        number={zoomPercent}
        setNumber={handleZoomChange}
        className="hidden md:flex"
      />
      <HistoryButtons />
    </div>
  );
}

export default Footer;
