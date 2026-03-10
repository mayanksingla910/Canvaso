"use client";
import { useCanvas } from "@/hooks/useCanvas";

export default function Canvas() {
  const {
    canvasRef,
    onMouseDown,
    onMouseMove,
    onMouseUp,
    onMouseLeave,
    getCursor,
  } = useCanvas();

  return (
    <canvas
      ref={canvasRef}
      style={{ cursor: getCursor() }}
      className="absolute inset-0"
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseLeave}
    />
  );
}
