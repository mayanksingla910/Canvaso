"use client";

import { getElementBounds, hitTestRotationHandle } from "@/lib/canvas/hit";
import { useCanvasStore } from "@/store/useCanvasStore";
import { Point } from "@/types/canvas";
import { useCallback, useRef, useState } from "react";

interface RotationState {
  isRotating: boolean;
  elementIds: string[] | null;
  centerX: number;
  centerY: number;
  startAngle: number; // angle from center to mouse at drag start
  initialStates: Record<
    string,
    {
      cx: number; // element center x at drag start
      cy: number; // element center y at drag start
      hw: number; // half width — constant, snapshot once
      hh: number;
      angle: number;
    }
  >;
}

function useRotation(getCanvasPoint: (e: React.MouseEvent) => Point) {
  const [isRotatingState, setIsRotatingState] = useState(false);

  const rotating = useRef<RotationState>({
    isRotating: false,
    elementIds: null,
    centerX: 0,
    centerY: 0,
    startAngle: 0,
    initialStates: {},
  });

  const startRotation = useCallback(
    (e: React.MouseEvent) => {
      const { elements, selectedIds } = useCanvasStore.getState();
      const canvasPoint = getCanvasPoint(e);

      const selectedElements = Object.values(elements).filter((el) =>
        selectedIds.includes(el.id),
      );

      if (selectedElements.length === 0) return false;

      const allBounds = selectedElements.map(getElementBounds);
      const sides = {
        left: Math.min(...allBounds.map((b) => b.left)),
        right: Math.max(...allBounds.map((b) => b.right)),
        top: Math.min(...allBounds.map((b) => b.top)),
        bottom: Math.max(...allBounds.map((b) => b.bottom)),
      };

      const angle =
        selectedElements.length === 1 ? (selectedElements[0].angle ?? 0) : 0;
      if (!hitTestRotationHandle(canvasPoint, sides, angle)) return false;

      const cx = (sides.left + sides.right) / 2;
      const cy = (sides.top + sides.bottom) / 2;

      const startAngle = Math.atan2(canvasPoint.y - cy, canvasPoint.x - cx);

      rotating.current = {
        isRotating: true,
        elementIds: selectedElements.map((el) => el.id),
        centerX: cx,
        centerY: cy,
        startAngle,
        initialStates: Object.fromEntries(
          selectedElements.map((el) => {
            const b = getElementBounds(el);
            const elCx = (b.left + b.right) / 2;
            const elCy = (b.top + b.bottom) / 2;
            return [
              el.id,
              {
                cx: elCx,
                cy: elCy,
                hw: (b.right - b.left) / 2,
                hh: (b.bottom - b.top) / 2,
                angle: el.angle ?? 0,
              },
            ];
          }),
        ),
      };
      setIsRotatingState(true);
      return true;
    },
    [getCanvasPoint],
  );

  const continueRotation = useCallback(
    (e: React.MouseEvent): boolean => {
      if (!rotating.current.isRotating || !rotating.current.elementIds)
        return false;

      const canvasPoint = getCanvasPoint(e);
      const { centerX, centerY, elementIds, startAngle, initialStates } =
        rotating.current;

      let deltaAngle =
        Math.atan2(canvasPoint.y - centerY, canvasPoint.x - centerX) -
        startAngle;

      if (e.shiftKey) {
        const snap = Math.PI / 12; // 15°
        deltaAngle = Math.round(deltaAngle / snap) * snap;
      }

      const cos = Math.cos(deltaAngle);
      const sin = Math.sin(deltaAngle);

      elementIds.forEach((id) => {
        const init = initialStates[id];
        if (!init) return;

        const dx = init.cx - centerX;
        const dy = init.cy - centerY;
        const newCx = centerX + dx * cos - dy * sin;
        const newCy = centerY + dx * sin + dy * cos;

        useCanvasStore.getState().updateElement(id, {
          x: newCx - init.hw,
          y: newCy - init.hh,
          angle: init.angle + deltaAngle,
        });
      });
      return true;
    },
    [getCanvasPoint],
  );

  const stopRotation = useCallback(() => {
    if (!rotating.current.isRotating) return;

    useCanvasStore.getState().pushHistory();
    rotating.current = {
      isRotating: false,
      elementIds: null,
      centerX: 0,
      centerY: 0,
      startAngle: 0,
      initialStates: {},
    };
    setIsRotatingState(false);
  }, []);

  return { startRotation, continueRotation, stopRotation, isRotatingState };
}

export default useRotation;
