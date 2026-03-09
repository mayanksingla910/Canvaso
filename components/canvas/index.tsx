"use client";
import { useCanvas } from "@/hooks/useCanvas";
import { useEffect } from "react";

export default function Canvas() {
  const {
    canvasRef,
    onMouseDown,
    onMouseMove,
    onMouseUp,
    onMouseLeave,
    onWheel,
    getCursor,
  } = useCanvas();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      onWheel(e);
    };

    canvas.addEventListener("wheel", handleWheel, { passive: false });
    return () => canvas.removeEventListener("wheel", handleWheel);
  }, [onWheel]);

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