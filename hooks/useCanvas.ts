"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import {
  screenToCanvas,
  zoomViewport,
  panViewport,
} from "@/lib/canvas/viewport";
import { renderFrame } from "@/lib/canvas/renderer";
import { createElement, Point } from "@/types/canvas";
import { useCanvasStore } from "@/store/useCanvasStore";
import { useToolStore } from "@/store/useToolStore";
import { hitTest } from "@/lib/canvas/hit";

interface DrawingState {
  isDrawing: boolean;
  elementId: string | null;
  startPoint: Point | null;
}

interface PanState {
  isPanning: boolean;
  lastPoint: Point | null;
}

export function useCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const selectionBox = useRef<{
    x: number;
    y: number;
    width: number;
    height: number;
  } | null>(null);

  const [isPanning, setIsPanning] = useState(false);
  const [isHoveringElement, setIsHoveringElement] = useState(false);

  const drawing = useRef<DrawingState>({
    isDrawing: false,
    elementId: null,
    startPoint: null,
  });
  const panning = useRef<PanState>({
    isPanning: false,
    lastPoint: null,
  });

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

  const {
    elements,
    viewport,
    selectedIds,
    setSelectedIds,
    setViewport,
    addElement,
    updateElement,
    clearSelection,
    pushHistory,
  } = useCanvasStore();

  const { selectedTool } = useToolStore();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    renderFrame(ctx, Object.values(elements), viewport, selectedIds);
  }, [elements, viewport, selectedIds]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      const { elements, viewport, selectedIds } = useCanvasStore.getState();
      const ctx = canvas.getContext("2d");
      if (ctx) renderFrame(ctx, Object.values(elements), viewport, selectedIds);
    };

    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  useEffect(() => {
    setSelectedIds([]);
  }, [selectedTool, setSelectedIds]);

  const getCanvasPoint = useCallback(
    (e: React.MouseEvent | MouseEvent): Point =>
      screenToCanvas(
        { x: e.clientX, y: e.clientY },
        useCanvasStore.getState().viewport,
      ),
    [],
  );

  const isPanTrigger = useCallback(
    (e: React.MouseEvent) =>
      e.button === 1 || selectedTool === "hand" || (e.button === 0 && e.altKey),
    [selectedTool],
  );

  const onMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();

      if (isPanTrigger(e)) {
        panning.current = {
          isPanning: true,
          lastPoint: { x: e.clientX, y: e.clientY },
        };
        setIsPanning(true);
        return;
      }

      if (selectedTool === "select") {
        const canvasPoint = getCanvasPoint(e);
        const allElements = Object.values(useCanvasStore.getState().elements);
        const { selectedIds } = useCanvasStore.getState();
        const hit = hitTest(canvasPoint, allElements, selectedIds);

        if (hit) {
          const { elements } = useCanvasStore.getState();

          let idsToMove: string[];

          if (e.ctrlKey) {
            if (selectedIds.includes(hit.id)) {
              setSelectedIds(selectedIds.filter((id) => id !== hit.id));
              idsToMove = selectedIds.filter((id) => id !== hit.id);
            } else {
              setSelectedIds([...selectedIds, hit.id]);
              idsToMove = [...selectedIds, hit.id];
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
                  return [id, { x: elements[id].x, y: elements[id].y,  points: (el.type === "pen" || el.type === "line" || el.type === "arrow")
              ? el.points.map(p => ({ ...p }))  // clone so they don't mutate
              : undefined, }];
                }),
            ),
          };
          return;
        } else {
          clearSelection();
          selectionBox.current = {
            x: canvasPoint.x,
            y: canvasPoint.y,
            width: 0,
            height: 0,
          };
          return;
        }
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

      if (!drawableTools.includes(selectedTool as DrawableTool)) return;

      const canvasPoint = getCanvasPoint(e);

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
    [
      selectedTool,
      setSelectedIds,
      isPanTrigger,
      getCanvasPoint,
      addElement,
      clearSelection,
    ],
  );

  // ── Mouse move ───────────────────────────────────────────────────────────────

  const onMouseMove = useCallback(
    (e: React.MouseEvent) => {
      const canvasPoint = getCanvasPoint(e);

      // Pan
      if (panning.current.isPanning && panning.current.lastPoint) {
        const dx = e.clientX - panning.current.lastPoint.x;
        const dy = e.clientY - panning.current.lastPoint.y;
        setViewport(
          panViewport(useCanvasStore.getState().viewport, { x: dx, y: dy }),
        );
        panning.current.lastPoint = { x: e.clientX, y: e.clientY };
        return;
      }

      // Move selected elements
      if (
        moving.current.isMoving &&
        moving.current.startPoint &&
        moving.current.startPositions
      ) {
        const dx = canvasPoint.x - moving.current.startPoint.x;
        const dy = canvasPoint.y - moving.current.startPoint.y;
        for (const [id, startPos] of Object.entries(
          moving.current.startPositions,
        )) {
          const el = useCanvasStore.getState().elements[id];
          if (!el) continue;
          if (el.type === "pen" || el.type === "line" || el.type === "arrow") {
            // offset all points by delta from their start positions
            const startPoints = moving.current.startPositions[id].points;
            if (startPoints) {
              updateElement(id, {
                points: startPoints.map((p) => ({
                  x: p.x + dx,
                  y: p.y + dy,
                })),
              });
            }
          } else {
            updateElement(id, {
              x: startPos.x + dx,
              y: startPos.y + dy,
            });
          }
        }
        return;
      }

      if (selectedTool === "select") {
        const allElements = Object.values(useCanvasStore.getState().elements);
        const { selectedIds } = useCanvasStore.getState();
        const hit = hitTest(canvasPoint, allElements, selectedIds);
        setIsHoveringElement(!!hit);
        return;
      } else {
        setIsHoveringElement(false);
      }

      // Drawing
      const { isDrawing, elementId, startPoint } = drawing.current;
      if (!isDrawing || !elementId || !startPoint) return;

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
    [selectedTool, setViewport, updateElement, getCanvasPoint],
  );

  // ── Mouse up ─────────────────────────────────────────────────────────────────

  const onMouseUp = useCallback(() => {
    panning.current = { isPanning: false, lastPoint: null };
    setIsPanning(false);

    // End move
    if (moving.current.isMoving) {
      moving.current = {
        isMoving: false,
        startPoint: null,
        startPositions: null,
      };
      pushHistory();
      return;
    }

    if (!drawing.current.isDrawing || !drawing.current.elementId) {
      drawing.current = {
        isDrawing: false,
        elementId: null,
        startPoint: null,
      };
      return;
    }

    const { elementId } = drawing.current;
    const el = useCanvasStore.getState().elements[elementId];

    if (!el) return;

    if (el.type === "line" || el.type === "arrow") {
      const points = el.points;
      const dx = points[points.length - 1].x - points[0].x;
      const dy = points[points.length - 1].y - points[0].y;
      const isTooSmall = Math.hypot(dx, dy) < 2;
      if (isTooSmall) {
        useCanvasStore.getState().deleteElement(elementId);
        return;
      } else {
        pushHistory();
      }
    } else if (el.type === "pen") {
      pushHistory();
    } else {
      if (Math.abs(el.width) < 2 && Math.abs(el.height) < 2) {
        useCanvasStore.getState().deleteElement(elementId);
      } else {
        pushHistory();
      }
    }

    drawing.current = { isDrawing: false, elementId: null, startPoint: null };
  }, [pushHistory]);

  // ── Mouse leave ───────────────────────────────────────────────────────────────

  const onMouseLeave = useCallback(() => {
    onMouseUp();
    setIsHoveringElement(false);
  }, [onMouseUp]);

  // ── Scroll wheel (zoom) ───────────────────────────────────────────────────────

  // const onWheel = useCallback(
  //   (e: WheelEvent | React.WheelEvent) => {
  //     e.preventDefault();

  //     const origin = { x: e.clientX, y: e.clientY };
  //     const viewport = useCanvasStore.getState().viewport;

  //     // ctrlKey = pinch to zoom on trackpad
  //     if (e.ctrlKey) {
  //       setViewport(zoomViewport(viewport, e.deltaY, origin, "pinch"));
  //       return;
  //     }

  //     if (e.deltaX === 0) {
  //       setViewport(zoomViewport(viewport, e.deltaY, origin, "wheel"));
  //       return;
  //     }

  //     // Two-finger trackpad scroll = pan
  //     setViewport(panViewport(viewport, { x: -e.deltaX, y: -e.deltaY }));
  //   },
  //   [setViewport],
  // );

  const onWheel = useCallback(
    (e: WheelEvent | React.WheelEvent) => {
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

  // ── Keyboard shortcuts ────────────────────────────────────────────────────────

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      // Don't fire if user is typing in an input
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      )
        return;

      const isMod = e.metaKey || e.ctrlKey;

      if (isMod && e.key === "z" && !e.shiftKey) {
        e.preventDefault();
        useCanvasStore.getState().undo();
      }
      if (isMod && (e.key === "y" || (e.key === "z" && e.shiftKey))) {
        e.preventDefault();
        useCanvasStore.getState().redo();
      }
      if (e.key === "Delete" || e.key === "Backspace") {
        useCanvasStore.getState().deleteSelected();
      }
      if (e.key === "Escape") {
        clearSelection();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [clearSelection]);

  // ── Cursor style ──────────────────────────────────────────────────────────────

  const getCursor = useCallback(() => {
    if (isPanning) return "grabbing";
    if (selectedTool === "hand") return "grab";
    if (isHoveringElement && selectedTool === "select") return "move";
    if (selectedTool === "select") return "default";
    if (selectedTool === "eraser") return "cell";
    return "crosshair";
  }, [selectedTool, isPanning, isHoveringElement]);

  return {
    canvasRef,
    onMouseDown,
    onMouseMove,
    onMouseUp,
    onMouseLeave,
    onWheel,
    getCursor,
  };
}
