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
    onTouchStart,
    onTouchMove,
    onTouchEnd,
    getCursor,
  } = useCanvas();

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
