"use client";

import { hitTest } from "@/lib/canvas/hit";
import { useCanvasStore } from "@/store/useCanvasStore";
import { Point } from "@/types/canvas";
import { useCallback, useRef } from "react";

function useMoving(getCanvasPoint: (e: React.MouseEvent) => Point) {
  const moving = useRef<{
    isMoving: boolean;
    startPoint: Point | null;
    startPositions: Record<
      string,
      { x: number; y: number; points?: Point[] }
    > | null;
  }>({
    isMoving: false,
    startPoint: null,
    startPositions: null,
  });

  const hasMoved = useRef(false);
  const pendingDeselect = useRef<string | null>(null);

  const startMoving = useCallback(
    (e: React.MouseEvent) => {
      const canvasPoint = getCanvasPoint(e);
      const { elements, selectedIds, clearSelection, setSelectedIds } =
        useCanvasStore.getState();
      const allElements = Object.values(elements);
      const hit = hitTest(canvasPoint, allElements, selectedIds);
      if (!hit) {
        clearSelection();
        return false;
      }

      let idsToMove: string[];

      if (e.ctrlKey) {
        if (selectedIds.includes(hit.id)) {
          pendingDeselect.current = hit.id;
          idsToMove = selectedIds;
        } else {
          const next = [...selectedIds, hit.id];
          setSelectedIds(next);
          idsToMove = next;
        }
      } else if (selectedIds.includes(hit.id)) {
        idsToMove = selectedIds;
      } else {
        setSelectedIds([hit.id]);
        idsToMove = [hit.id];
      }

      moving.current = {
        isMoving: true,
        startPoint: canvasPoint,
        startPositions: Object.fromEntries(
          idsToMove
            .filter((id) => elements[id])
            .map((id) => {
              const el = elements[id];
              return [
                id,
                {
                  x: elements[id].x,
                  y: elements[id].y,
                  points:
                    el.type === "pen" ||
                    el.type === "line" ||
                    el.type === "arrow"
                      ? el.points.map((p) => ({ ...p }))
                      : undefined,
                },
              ];
            }),
        ),
      };
      return true;
    },
    [getCanvasPoint],
  );

  const continueMoving = useCallback(
    (e: React.MouseEvent): boolean => {
      if (
        !moving.current.isMoving ||
        !moving.current.startPoint ||
        !moving.current.startPositions
      )
        return false;

      const canvasPoint = getCanvasPoint(e);
      const { updateElement } = useCanvasStore.getState();

      const dx = canvasPoint.x - moving.current.startPoint.x;
      const dy = canvasPoint.y - moving.current.startPoint.y;
      if (Math.hypot(dx, dy) > 2) {
        hasMoved.current = true;
      }
      for (const [id, startPos] of Object.entries(
        moving.current.startPositions,
      )) {
        const el = useCanvasStore.getState().elements[id];
        if (!el) continue;

        if (el.type === "pen" || el.type === "line" || el.type === "arrow") {
          const startPoints = moving.current.startPositions[id].points;
          updateElement(id, {
            points: startPoints?.map((p) => ({
              x: p.x + dx,
              y: p.y + dy,
            })),
          });
          continue;
        }

        updateElement(id, {
          x: startPos.x + dx,
          y: startPos.y + dy,
        });
      }
      return true;
    },
    [getCanvasPoint],
  );

  const stopMoving = useCallback(() => {
    const { pushHistory, selectedIds, setSelectedIds } =
      useCanvasStore.getState();

    if (!moving.current.isMoving) return;

    if (!hasMoved.current && pendingDeselect.current) {
      const next = selectedIds.filter((id) => id !== pendingDeselect.current);
      setSelectedIds(next);
    }
    moving.current = {
      isMoving: false,
      startPoint: null,
      startPositions: null,
    };
    if (hasMoved.current) pushHistory();
    pendingDeselect.current = null;
    hasMoved.current = false;
  }, []);

  return { startMoving, continueMoving, stopMoving };
}

export default useMoving;
