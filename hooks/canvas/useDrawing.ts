"use client";

import { useCanvasStore } from "@/store/useCanvasStore";
import { useToolStore } from "@/store/useToolStore";
import { createElement, Point } from "@/types/canvas";
import { useCallback, useRef } from "react";

interface DrawingState {
  isDrawing: boolean;
  elementId: string | null;
  startPoint: Point | null;
}

const drawableTools = [
  "rect",
  "circle",
  "diamond",
  "arrow",
  "line",
  "pen",
  "text",
  "frame",
] as const;
type DrawableTool = (typeof drawableTools)[number];

function useDrawing(getCanvasPoint: (e: React.MouseEvent) => Point) {
  const drawing = useRef<DrawingState>({
    isDrawing: false,
    elementId: null,
    startPoint: null,
  });

  const { selectedTool } = useToolStore();

  const { addElement, updateElement, pushHistory } = useCanvasStore();

  const startDrawing = useCallback(
    (e: React.MouseEvent) => {
      const canvasPoint = getCanvasPoint(e);

      if (!drawableTools.includes(selectedTool as DrawableTool)) return;

      const newElement = createElement(selectedTool as DrawableTool, {
        x: canvasPoint.x,
        y: canvasPoint.y,
        width: 0,
        height: 0,
      });

      addElement(newElement);
      drawing.current = {
        isDrawing: true,
        elementId: newElement.id,
        startPoint: canvasPoint,
      };
    },
    [addElement, selectedTool, getCanvasPoint],
  );

  const continueDrawing = useCallback(
    (e: React.MouseEvent) => {
      const { isDrawing, elementId, startPoint } = drawing.current;
      if (!isDrawing || !elementId || !startPoint) return;

      const canvasPoint = getCanvasPoint(e);

      if (selectedTool === "pen") {
        const el = useCanvasStore.getState().elements[elementId];
        if (el?.type === "pen") {
          updateElement(elementId, { points: [...el.points, canvasPoint] });
        }
        return;
      }
      if (selectedTool === "arrow" || selectedTool === "line") {
        const el = useCanvasStore.getState().elements[elementId];
        if (el?.type === "arrow" || el?.type === "line") {
          updateElement(elementId, { points: [el.points[0], canvasPoint] });
        }
        return;
      }
      let width = canvasPoint.x - startPoint.x;
      let height = canvasPoint.y - startPoint.y;
      if (e.shiftKey) {
        const size = Math.max(Math.abs(width), Math.abs(height));
        width = width < 0 ? -size : size;
        height = height < 0 ? -size : size;
      }

      updateElement(elementId, { width, height });
    },
    [getCanvasPoint, updateElement, selectedTool],
  );

  const stopDrawing = useCallback(() => {
    const { elementId, isDrawing } = drawing.current;
    if (!isDrawing || !elementId) return;

    const el = useCanvasStore.getState().elements[elementId];
    if (!el) return;

    if (el.type === "pen") {
      pushHistory();
    } else if (el.type === "line" || el.type === "arrow") {
      const points = el.points;
      const dx = points[points.length - 1].x - points[0].x;
      const dy = points[points.length - 1].y - points[0].y;
      const isTooSmall = Math.hypot(dx, dy) < 2;
      if (isTooSmall) useCanvasStore.getState().deleteElement(elementId);
      else pushHistory();
    } else {
      if (Math.abs(el.width) < 2 && Math.abs(el.height) < 2)
        useCanvasStore.getState().deleteElement(elementId);
      else pushHistory();
    }
    drawing.current = { isDrawing: false, elementId: null, startPoint: null };
  }, [pushHistory]);

  return { startDrawing, continueDrawing, stopDrawing };
}

export default useDrawing;
