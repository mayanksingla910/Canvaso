"use client";

import { panViewport } from "@/lib/canvas/viewport";
import { useCanvasStore } from "@/store/useCanvasStore";
import { useToolStore } from "@/store/useToolStore";
import { Point } from "@/types/canvas";
import { useCallback, useRef, useState } from "react";

interface PanState {
  isPanning: boolean;
  lastPoint: Point | null;
}

function usePanning() {
  const [isPanning, setIsPanning] = useState(false);
  const panning = useRef<PanState>({
    isPanning: false,
    lastPoint: null,
  });

  const { setViewport } = useCanvasStore();

  const { selectedTool } = useToolStore();

  const startPanning = useCallback((e: React.MouseEvent) => {
    panning.current = {
      isPanning: true,
      lastPoint: { x: e.clientX, y: e.clientY },
    };
    setIsPanning(true);
  }, []);

  const continuePanning = useCallback(
    (e: React.MouseEvent) : boolean => {
      if (panning.current.isPanning && panning.current.lastPoint) {
        const dx = e.clientX - panning.current.lastPoint.x;
        const dy = e.clientY - panning.current.lastPoint.y;
        setViewport(
          panViewport(useCanvasStore.getState().viewport, { x: dx, y: dy }),
        );
        panning.current.lastPoint = { x: e.clientX, y: e.clientY };
        return true;
      }
      return false;
    },
    [setViewport],
  );

  const stopPanning = useCallback(() => {
    panning.current = { isPanning: false, lastPoint: null };
    setIsPanning(false);
  }, []);

  const isPanTrigger = useCallback(
    (e: React.MouseEvent) =>
      e.button === 1 || selectedTool === "hand" || (e.button === 0 && e.altKey),
    [selectedTool],
  );

  return { startPanning, continuePanning, stopPanning, isPanning, isPanTrigger };
}

export default usePanning;
