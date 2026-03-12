"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { screenToCanvas } from "@/lib/canvas/viewport";
import { renderFrame } from "@/lib/canvas/renderer";
import { useCanvasStore } from "@/store/useCanvasStore";
import { useToolStore } from "@/store/useToolStore";
import {
  getElementBounds,
  hitTest,
  hitTestRotationHandle,
} from "@/lib/canvas/hit";
import usePanning from "./canvas/usePanning";
import useMoving from "./canvas/useMoving";
import useDrawing from "./canvas/useDrawing";
import { Point } from "@/types/canvas";
import useSelectionBox from "./canvas/useSelectionBox";
import useWheel from "./canvas/useWheel";
import useRotation from "./canvas/useRotation";

export function useCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [isHoveringElement, setIsHoveringElement] = useState(false);
  const [isHoveringRotateHandle, setIsHoveringRotateHandle] = useState(false);

  const getCanvasPoint = useCallback(
    (e: React.MouseEvent | MouseEvent): Point =>
      screenToCanvas(
        { x: e.clientX, y: e.clientY },
        useCanvasStore.getState().viewport,
      ),
    [],
  );
  const {
    isPanning,
    startPanning,
    continuePanning,
    stopPanning,
    isPanTrigger,
  } = usePanning();

  const { startMoving, continueMoving, stopMoving } = useMoving(getCanvasPoint);

  const { startDrawing, continueDrawing, stopDrawing } =
    useDrawing(getCanvasPoint);

  const { startRotation, continueRotation, stopRotation, isRotatingState } =
    useRotation(getCanvasPoint);

  const {
    startSelectionBox,
    continueSelectionBox,
    stopSelectionBox,
    isSelecting,
  } = useSelectionBox(getCanvasPoint, startMoving);

  const { elements, viewport, selectedIds, setSelectedIds, clearSelection } =
    useCanvasStore();

  const { selectedTool } = useToolStore();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    renderFrame(
      ctx,
      Object.values(elements),
      viewport,
      selectedIds,
      null,
      isRotatingState,
    );
  }, [elements, viewport, selectedIds, isRotatingState]);

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
    if (selectedTool !== "select") setSelectedIds([]);
  }, [selectedTool, setSelectedIds]);

  const onMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();

      if (isPanTrigger(e)) {
        startPanning(e);
        return;
      }

      if (selectedTool === "select") {
        if (startRotation(e)) return;
        startSelectionBox(e);
        return;
      }
      startDrawing(e);
    },
    [
      startPanning,
      selectedTool,
      isPanTrigger,
      startSelectionBox,
      startDrawing,
      startRotation,
    ],
  );

  // ── Mouse move ───────────────────────────────────────────────────────────────

  const onMouseMove = useCallback(
    (e: React.MouseEvent) => {
      const canvasPoint = getCanvasPoint(e);

      // Pan — check first, highest priority
      if (continuePanning(e)) return;

      if (continueRotation(e)) return;

      // Move selected elements
      if (continueMoving(e)) return;

      if (selectedTool === "select") {
        continueSelectionBox(e, canvasRef);

        if (!isSelecting()) {
          const { elements, selectedIds } = useCanvasStore.getState();
          const allElements = Object.values(elements);

          if (selectedIds.length >= 1) {
            const selectedElements = selectedIds
              .map((id) => elements[id])
              .filter(Boolean);
            const allBounds = selectedElements.map(getElementBounds);
            const sides = {
              left: Math.min(...allBounds.map((b) => b.left)),
              right: Math.max(...allBounds.map((b) => b.right)),
              top: Math.min(...allBounds.map((b) => b.top)),
              bottom: Math.max(...allBounds.map((b) => b.bottom)),
            };
            const angle =
              selectedElements.length === 1
                ? (selectedElements[0].angle ?? 0)
                : 0;

            if (hitTestRotationHandle(canvasPoint, sides, angle)) {
              setIsHoveringRotateHandle(true);
              setIsHoveringElement(false);
              return;
            }
          }

          setIsHoveringRotateHandle(false);
          const hit = hitTest(canvasPoint, allElements, selectedIds);
          setIsHoveringElement(!!hit);
        } else {
          setIsHoveringRotateHandle(false);
          setIsHoveringElement(false);
        }
        return;
      }

      setIsHoveringRotateHandle(false);
      setIsHoveringElement(false);
      // Drawing tools
      continueDrawing(e);
    },
    [
      continuePanning,
      continueMoving,
      continueSelectionBox,
      continueDrawing,
      selectedTool,
      getCanvasPoint,
      isSelecting,
      continueRotation,
    ],
  );

  // ── Mouse up ─────────────────────────────────────────────────────────────────

  const onMouseUp = useCallback(() => {
    stopPanning();

    stopRotation();
    // End move
    stopMoving();
    stopSelectionBox(canvasRef);
    // End draw
    stopDrawing();
  }, [stopPanning, stopMoving, stopDrawing, stopSelectionBox, stopRotation]);

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

  useWheel(canvasRef);

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
    if (isHoveringRotateHandle) return "grab";
    if (isHoveringElement && selectedTool === "select") return "move";
    if (selectedTool === "select") return "default";
    if (selectedTool === "eraser") return "cell";
    return "crosshair";
  }, [selectedTool, isPanning, isHoveringElement, isHoveringRotateHandle]);

  return {
    canvasRef,
    onMouseDown,
    onMouseMove,
    onMouseUp,
    onMouseLeave,
    getCursor,
  };
}
