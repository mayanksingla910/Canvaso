"use client";

import { useCallback } from "react";
import { useCanvasStore } from "@/store/useCanvasStore";
import { zoomViewport, panViewport } from "@/lib/canvas/viewport";
import { useEffect } from "react";

function useWheel(canvasRef: React.RefObject<HTMLCanvasElement | null>) {
  const { setViewport } = useCanvasStore();

  const handleWheel = useCallback(
    (e: WheelEvent) => {
      e.preventDefault();
      const viewport = useCanvasStore.getState().viewport;

      if (e.ctrlKey) {
        const origin = { x: e.clientX, y: e.clientY };
        setViewport(zoomViewport(viewport, e.deltaY, origin, "pinch"));
        return;
      }

      setViewport(panViewport(viewport, { x: -e.deltaX, y: -e.deltaY }));
    },
    [setViewport],
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.addEventListener("wheel", handleWheel, { passive: false });
    return () => canvas.removeEventListener("wheel", handleWheel);
  }, [canvasRef, handleWheel]);
}

export default useWheel;
