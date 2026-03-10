import { useCallback, useRef } from "react";
import { CanvasElement, Point } from "@/types/canvas";
import { useCanvasStore } from "@/store/useCanvasStore";
import { renderFrame } from "@/lib/canvas/renderer";
import { getElementBounds } from "@/lib/canvas/hit";

interface SelectionBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

function getHitsInBox(elements: Record<string, CanvasElement>, box: SelectionBox) {
  const left   = Math.min(box.x, box.x + box.width)
  const right  = Math.max(box.x, box.x + box.width)
  const top    = Math.min(box.y, box.y + box.height)
  const bottom = Math.max(box.y, box.y + box.height)

  return Object.values(elements).filter((el) => {
    const b = getElementBounds(el)
    return b.left >= left && b.right <= right && b.top >= top && b.bottom <= bottom
  })
}

function renderSelectionBox(
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
  selectionBox?: SelectionBox,
  hitIds?: string[],
) {
  const canvas = canvasRef.current;
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  // Use fresh selectedIds after setSelectedIds
  const { selectedIds, elements, viewport } = useCanvasStore.getState();
  renderFrame(
    ctx,
    Object.values(elements),
    viewport,
    hitIds ?? selectedIds,
    selectionBox,
  );
}

function useSelectionBox(
  getCanvasPoint: (e: React.MouseEvent) => Point,
  startMoving: (e: React.MouseEvent) => boolean,
) {
  const selectionBox = useRef<SelectionBox | null>(null);

  const startSelectionBox = useCallback(
    (e: React.MouseEvent) => {
      if (startMoving(e)) return;
      const canvasPoint = getCanvasPoint(e);
      selectionBox.current = {
        x: canvasPoint.x,
        y: canvasPoint.y,
        width: 0,
        height: 0,
      };
    },
    [startMoving, getCanvasPoint],
  );

  const continueSelectionBox = useCallback(
    (
      e: React.MouseEvent,
      canvasRef: React.RefObject<HTMLCanvasElement | null>,
    ) => {
      if (!selectionBox.current) return;

      const canvasPoint = getCanvasPoint(e);
      selectionBox.current.width = canvasPoint.x - selectionBox.current.x;
      selectionBox.current.height = canvasPoint.y - selectionBox.current.y;

      // Highlight elements inside box while dragging
      const { elements } = useCanvasStore.getState();
      const box = selectionBox.current;
      const hits = getHitsInBox(elements, box);

      const hitIds = hits.map((el) => el.id);

      renderSelectionBox(canvasRef, box, hitIds);
    },
    [getCanvasPoint],
  );
  const stopSelectionBox = useCallback(
    (canvasRef: React.RefObject<HTMLCanvasElement | null>) => {
      if (!selectionBox.current) return;

      const { elements, setSelectedIds } = useCanvasStore.getState();
      const box = selectionBox.current;

      const hits = getHitsInBox(elements, box);

      if (hits.length > 0) setSelectedIds(hits.map((el) => el.id));

      selectionBox.current = null;

      renderSelectionBox(canvasRef);
    },
    [],
  );

  const isSelecting = useCallback(() => !!selectionBox.current, []);

  return {
    startSelectionBox,
    continueSelectionBox,
    stopSelectionBox,
    isSelecting,
  };
}

export default useSelectionBox;
