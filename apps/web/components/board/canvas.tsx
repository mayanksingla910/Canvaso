"use client";

import { useCanvas } from "@/hooks/useCanvas";
import { useCollaborationContext } from "@/app/[boardId]/_components/CollaborationContext";
import { useCursors } from "@/hooks/useCursors";
import { useCanvasStore } from "@/store/useCanvasStore";
import { screenToCanvas, canvasToScreen } from "@canvaso/canvas-engine";
import { useEffect } from "react";

export default function Canvas() {
  const {
    canvasRef,
    onMouseDown,
    onMouseMove,
    onMouseUp,
    onMouseLeave,
    onTouchStart,
    onTouchMove,
    onTouchEnd,
    getCursor,
  } = useCanvas();

  const { awarenessRef, userId, userName } = useCollaborationContext();
  const cursors = useCursors(awarenessRef);
  const viewport = useCanvasStore((s) => s.viewport);

  // Broadcast local cursor position to peers via awareness
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handlePointerMove = (e: PointerEvent) => {
      const awareness = awarenessRef.current;
      if (!awareness) return;

      const canvasPos = screenToCanvas(
        { x: e.clientX, y: e.clientY },
        viewport,
      );

      awareness.setLocalStateField("cursor", {
        x: canvasPos.x,
        y: canvasPos.y,
        name: userName ?? "Guest",
        color: awareness.getLocalState()?.user?.color ?? "#3B5BDB",
      });
    };

    const handlePointerLeave = () => {
      const awareness = awarenessRef.current;
      if (!awareness) return;
      // Clear cursor so it disappears from other clients when we leave
      awareness.setLocalStateField("cursor", null);
    };

    canvas.addEventListener("pointermove", handlePointerMove);
    canvas.addEventListener("pointerleave", handlePointerLeave);
    return () => {
      canvas.removeEventListener("pointermove", handlePointerMove);
      canvas.removeEventListener("pointerleave", handlePointerLeave);
    };
  }, [canvasRef, awarenessRef, viewport, userName]);

  // Touch events need passive: false to allow preventDefault
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const opts = { passive: false };
    canvas.addEventListener(
      "touchstart",
      onTouchStart as unknown as EventListener,
      opts,
    );
    canvas.addEventListener(
      "touchmove",
      onTouchMove as unknown as EventListener,
      opts,
    );
    canvas.addEventListener(
      "touchend",
      onTouchEnd as unknown as EventListener,
      opts,
    );

    return () => {
      canvas.removeEventListener(
        "touchstart",
        onTouchStart as unknown as EventListener,
      );
      canvas.removeEventListener(
        "touchmove",
        onTouchMove as unknown as EventListener,
      );
      canvas.removeEventListener(
        "touchend",
        onTouchEnd as unknown as EventListener,
      );
    };
  }, [canvasRef, onTouchStart, onTouchMove, onTouchEnd]);

  return (
    <div className="absolute inset-0">
      <canvas
        ref={canvasRef}
        style={{ cursor: getCursor() }}
        className="absolute inset-0"
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseLeave}
      />

      {/* Peer cursors overlay — rendered outside the canvas element so they
          don't interfere with hit testing */}
      {cursors.map((peer) => {
        const screenPos = canvasToScreen(
          { x: peer.cursor.x, y: peer.cursor.y },
          viewport,
        );
        return (
          <div
            key={peer.clientId}
            className="pointer-events-none fixed z-50 flex items-start gap-1"
            style={{
              left: screenPos.x,
              top: screenPos.y,
              transform: "translate(0, 0)",
            }}
          >
            {/* Cursor arrow */}
            <svg
              width="18"
              height="18"
              viewBox="0 0 18 18"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="shrink-0"
            >
              <path
                d="M2 2L2 13L5.5 9.5L8 16L10.5 15L8 8.5L13 8.5L2 2Z"
                fill={peer.color}
                stroke="white"
                strokeWidth="1.2"
                strokeLinejoin="round"
              />
            </svg>
            {/* Name label */}
            <span
              className="mt-3 rounded px-1.5 py-0.5 text-xs font-medium text-white shadow-sm whitespace-nowrap"
              style={{ background: peer.color }}
            >
              {peer.name}
            </span>
          </div>
        );
      })}
    </div>
  );
}
