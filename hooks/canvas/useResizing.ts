import { getElementBounds, hitTestResizeHandle } from "@/lib/canvas/hit";
import { useCanvasStore } from "@/store/useCanvasStore";
import { CanvasElement, Point } from "@/types/canvas";
import React, { useCallback, useRef } from "react";

interface ElementSnapshot {
  relLeft: number;
  relTop: number;
  relRight: number;
  relBottom: number;
  angle: number;
  points?: Array<{ rx: number; ry: number }>;
}

interface Resize {
  isResizing: boolean;
  elementId: string | null;
  elementIds: string[] | null;
  snapshots: Record<string, ElementSnapshot> | null;
  handleIndex: number;
  startPoint: Point | null;
  initial: {
    x: number;
    y: number;
    width: number;
    height: number;
    aspectRatio: number;
    cx: number;
    cy: number;
    angle: number;
    points?: Point[];
  } | null;
}

function unrotatePoints(points: Point[], angle: number): Point[] {
  if (angle === 0) return points.map((p) => ({ ...p }));
  const xs = points.map((p) => p.x);
  const ys = points.map((p) => p.y);
  const rawCx = (Math.min(...xs) + Math.max(...xs)) / 2;
  const rawCy = (Math.min(...ys) + Math.max(...ys)) / 2;
  const invCos = Math.cos(-angle);
  const invSin = Math.sin(-angle);
  return points.map((p) => {
    const dx = p.x - rawCx;
    const dy = p.y - rawCy;
    return {
      x: rawCx + dx * invCos - dy * invSin,
      y: rawCy + dx * invSin + dy * invCos,
    };
  });
}

function getUnrotatedBounds(el: CanvasElement): {
  left: number;
  right: number;
  top: number;
  bottom: number;
} {
  const isPointBased =
    el.type === "pen" || el.type === "line" || el.type === "arrow";

  if (isPointBased) {
    const unrotated = unrotatePoints(el.points, el.angle ?? 0);
    const xs = unrotated.map((p) => p.x);
    const ys = unrotated.map((p) => p.y);
    return {
      left: Math.min(...xs),
      right: Math.max(...xs),
      top: Math.min(...ys),
      bottom: Math.max(...ys),
    };
  }

  const x = el.width >= 0 ? el.x : el.x + el.width;
  const y = el.height >= 0 ? el.y : el.y + el.height;
  const w = Math.abs(el.width);
  const h = Math.abs(el.height);
  return { left: x, right: x + w, top: y, bottom: y + h };
}

function useResizing(getCanvasPoint: (e: React.MouseEvent) => Point) {
  const resize = useRef<Resize>({
    isResizing: false,
    elementId: null,
    elementIds: null,
    snapshots: null,
    handleIndex: -1,
    startPoint: null,
    initial: null,
  });

  const startResize = useCallback(
    (e: React.MouseEvent): boolean => {
      const { elements, selectedIds, viewport } = useCanvasStore.getState();
      if (selectedIds.length === 0) return false;

      const canvasPoint = getCanvasPoint(e);

      if (selectedIds.length > 1) {
        const selectedEls = selectedIds
          .map((id) => elements[id])
          .filter(Boolean) as CanvasElement[];

        const allBounds = selectedEls.map(getUnrotatedBounds);
        const groupLeft = Math.min(...allBounds.map((b) => b.left));
        const groupRight = Math.max(...allBounds.map((b) => b.right));
        const groupTop = Math.min(...allBounds.map((b) => b.top));
        const groupBottom = Math.max(...allBounds.map((b) => b.bottom));
        const groupW = groupRight - groupLeft;
        const groupH = groupBottom - groupTop;

        const fakeGroupEl = {
          x: groupLeft,
          y: groupTop,
          width: groupW,
          height: groupH,
          angle: 0,
        } as CanvasElement;

        const handleIndex = hitTestResizeHandle(
          canvasPoint,
          fakeGroupEl,
          viewport.zoom,
        );
        if (handleIndex === -1) return false;

        const snapshots: Record<string, ElementSnapshot> = {};
        for (const el of selectedEls) {
          const b = getUnrotatedBounds(el);
          const snap: ElementSnapshot = {
            relLeft: (b.left - groupLeft) / groupW,
            relTop: (b.top - groupTop) / groupH,
            relRight: (b.right - groupLeft) / groupW,
            relBottom: (b.bottom - groupTop) / groupH,
            angle: el.angle ?? 0,
          };

          const isPointBased =
            el.type === "pen" || el.type === "line" || el.type === "arrow";
          if (isPointBased) {
            const unrotated = unrotatePoints(el.points, el.angle ?? 0);
            snap.points = unrotated.map((p) => ({
              rx: (p.x - groupLeft) / groupW,
              ry: (p.y - groupTop) / groupH,
            }));
          }

          snapshots[el.id] = snap;
        }

        resize.current = {
          isResizing: true,
          elementId: null,
          elementIds: selectedIds,
          snapshots,
          handleIndex,
          startPoint: canvasPoint,
          initial: {
            x: groupLeft,
            y: groupTop,
            width: groupW,
            height: groupH,
            aspectRatio: groupW / groupH,
            cx: (groupLeft + groupRight) / 2,
            cy: (groupTop + groupBottom) / 2,
            angle: 0,
          },
        };
        return true;
      }

      const el = elements[selectedIds[0]];
      if (!el) return false;

      const handleIndex = hitTestResizeHandle(canvasPoint, el, viewport.zoom);
      if (handleIndex === -1) return false;

      const angle = el.angle ?? 0;
      const isPointBased =
        el.type === "pen" || el.type === "line" || el.type === "arrow";

      if (isPointBased) {
        const unrotatedPoints = unrotatePoints(el.points, angle);
        const uxs = unrotatedPoints.map((p) => p.x);
        const uys = unrotatedPoints.map((p) => p.y);
        const uMinX = Math.min(...uxs);
        const uMaxX = Math.max(...uxs);
        const uMinY = Math.min(...uys);
        const uMaxY = Math.max(...uys);
        const uWidth = uMaxX - uMinX;
        const uHeight = uMaxY - uMinY;

        resize.current = {
          isResizing: true,
          elementId: el.id,
          elementIds: null,
          snapshots: null,
          handleIndex,
          startPoint: canvasPoint,
          initial: {
            x: uMinX,
            y: uMinY,
            width: uWidth,
            height: uHeight,
            aspectRatio: uWidth / uHeight,
            cx: (uMinX + uMaxX) / 2,
            cy: (uMinY + uMaxY) / 2,
            angle,
            points: unrotatedPoints,
          },
        };
        return true;
      }

      const b = getElementBounds(el);
      const normalizedX = el.width >= 0 ? el.x : el.x + el.width;
      const normalizedY = el.height >= 0 ? el.y : el.y + el.height;
      const normalizedW = Math.abs(el.width);
      const normalizedH = Math.abs(el.height);

      resize.current = {
        isResizing: true,
        elementId: el.id,
        elementIds: null,
        snapshots: null,
        handleIndex,
        startPoint: canvasPoint,
        initial: {
          x: normalizedX,
          y: normalizedY,
          width: normalizedW,
          height: normalizedH,
          aspectRatio: normalizedW / normalizedH,
          cx: (b.left + b.right) / 2,
          cy: (b.top + b.bottom) / 2,
          angle,
          points: undefined,
        },
      };
      return true;
    },
    [getCanvasPoint],
  );

  const continueResize = useCallback(
    (e: React.MouseEvent): boolean => {
      if (!resize.current.isResizing || !resize.current.initial) return false;

      const { handleIndex, initial } = resize.current;
      const canvasPoint = getCanvasPoint(e);
      const { cx, cy, angle } = initial;

      const invCos = Math.cos(-angle);
      const invSin = Math.sin(-angle);

      const mdx = canvasPoint.x - cx;
      const mdy = canvasPoint.y - cy;
      const localMouseX = cx + mdx * invCos - mdy * invSin;
      const localMouseY = cy + mdx * invSin + mdy * invCos;

      const sdx = resize.current.startPoint!.x - cx;
      const sdy = resize.current.startPoint!.y - cy;
      const localStartX = cx + sdx * invCos - sdy * invSin;
      const localStartY = cy + sdx * invSin + sdy * invCos;

      const dx = localMouseX - localStartX;
      const dy = localMouseY - localStartY;

      let { x, y, width, height } = initial;

      switch (handleIndex) {
        case 0:
          x = initial.x + dx;
          y = initial.y + dy;
          width = initial.width - dx;
          height = initial.height - dy;
          break;
        case 1:
          y = initial.y + dy;
          height = initial.height - dy;
          width = initial.width + dx;
          break;
        case 2:
          width = initial.width + dx;
          height = initial.height + dy;
          break;
        case 3:
          x = initial.x + dx;
          width = initial.width - dx;
          height = initial.height + dy;
          break;
      }

      if (e.shiftKey) {
        const ar = initial.aspectRatio;
        if (Math.abs(width) > Math.abs(height * ar)) {
          height = width / ar;
          if (handleIndex === 0 || handleIndex === 1)
            y = initial.y + initial.height - height;
        } else {
          width = height * ar;
          if (handleIndex === 0 || handleIndex === 3)
            x = initial.x + initial.width - width;
        }
      }

      const anchors = [
        { x: initial.x + initial.width, y: initial.y + initial.height },
        { x: initial.x, y: initial.y + initial.height },
        { x: initial.x, y: initial.y },
        { x: initial.x + initial.width, y: initial.y },
      ];
      const localAnchor = anchors[handleIndex];

      if (resize.current.elementIds && resize.current.snapshots) {
        const { elements } = useCanvasStore.getState();

        for (const id of resize.current.elementIds) {
          const snap = resize.current.snapshots[id];
          const el = elements[id];
          if (!snap || !el) continue;

          const newLeft = x + snap.relLeft * width;
          const newTop = y + snap.relTop * height;
          const newRight = x + snap.relRight * width;
          const newBottom = y + snap.relBottom * height;
          const newW = newRight - newLeft;
          const newH = newBottom - newTop;

          const isPointBased =
            el.type === "pen" || el.type === "line" || el.type === "arrow";

          if (isPointBased && snap.points) {
            const scaled = snap.points.map((rp) => ({
              x: x + rp.rx * width,
              y: y + rp.ry * height,
            }));

            if (snap.angle !== 0) {
              const fwdCos = Math.cos(snap.angle);
              const fwdSin = Math.sin(snap.angle);
              const sxs = scaled.map((p) => p.x);
              const sys = scaled.map((p) => p.y);
              const newCx = (Math.min(...sxs) + Math.max(...sxs)) / 2;
              const newCy = (Math.min(...sys) + Math.max(...sys)) / 2;
              useCanvasStore.getState().updateElement(id, {
                points: scaled.map((p) => {
                  const pdx = p.x - newCx;
                  const pdy = p.y - newCy;
                  return {
                    x: newCx + pdx * fwdCos - pdy * fwdSin,
                    y: newCy + pdx * fwdSin + pdy * fwdCos,
                  };
                }),
                angle: snap.angle,
              });
            } else {
              useCanvasStore.getState().updateElement(id, { points: scaled });
            }
            continue;
          }
          useCanvasStore.getState().updateElement(id, {
            x: newLeft,
            y: newTop,
            width: newW,
            height: newH,
          });
        }
        return true;
      }

      const elementId = resize.current.elementId;
      if (!elementId) return false;
      const el = useCanvasStore.getState().elements[elementId];
      if (!el) return false;

      if (el.type === "pen" || el.type === "line" || el.type === "arrow") {
        if (!initial.points) return false;

        const scaleX = initial.width !== 0 ? width / initial.width : 1;
        const scaleY = initial.height !== 0 ? height / initial.height : 1;

        const scaled = initial.points.map((p) => ({
          x: localAnchor.x + (p.x - localAnchor.x) * scaleX,
          y: localAnchor.y + (p.y - localAnchor.y) * scaleY,
        }));

        if (angle !== 0) {
          const fwdCos = Math.cos(angle);
          const fwdSin = Math.sin(angle);
          const sxs = scaled.map((p) => p.x);
          const sys = scaled.map((p) => p.y);
          const newCx = (Math.min(...sxs) + Math.max(...sxs)) / 2;
          const newCy = (Math.min(...sys) + Math.max(...sys)) / 2;
          useCanvasStore.getState().updateElement(elementId, {
            points: scaled.map((p) => {
              const pdx = p.x - newCx;
              const pdy = p.y - newCy;
              return {
                x: newCx + pdx * fwdCos - pdy * fwdSin,
                y: newCy + pdx * fwdSin + pdy * fwdCos,
              };
            }),
            angle,
          });
          return true;
        }

        useCanvasStore.getState().updateElement(elementId, { points: scaled });
        return true;
      }

      if (angle !== 0) {
        const fwdCos = Math.cos(angle);
        const fwdSin = Math.sin(angle);

        const adx = localAnchor.x - cx;
        const ady = localAnchor.y - cy;
        const worldAnchorX = cx + adx * fwdCos - ady * fwdSin;
        const worldAnchorY = cy + adx * fwdSin + ady * fwdCos;

        const newLocalCx = x + width / 2;
        const newLocalCy = y + height / 2;
        const ndx = newLocalCx - localAnchor.x;
        const ndy = newLocalCy - localAnchor.y;
        const worldCx = worldAnchorX + ndx * fwdCos - ndy * fwdSin;
        const worldCy = worldAnchorY + ndx * fwdSin + ndy * fwdCos;

        useCanvasStore.getState().updateElement(elementId, {
          x: worldCx - width / 2,
          y: worldCy - height / 2,
          width,
          height,
        });
        return true;
      }

      useCanvasStore
        .getState()
        .updateElement(elementId, { x, y, width, height });
      return true;
    },
    [getCanvasPoint],
  );

  const stopResize = useCallback(() => {
    if (!resize.current.isResizing) return;

    useCanvasStore.getState().pushHistory();

    resize.current = {
      isResizing: false,
      elementId: null,
      elementIds: null,
      snapshots: null,
      handleIndex: -1,
      startPoint: null,
      initial: null,
    };
  }, []);

  return { startResize, continueResize, stopResize };
}

export default useResizing;
