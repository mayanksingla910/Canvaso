"use client";

import { useCanvasStore } from "@/store/useCanvasStore";
import Board from "@/components/board";
import { useEffect, useRef } from "react";
import LoginRedirectButton from "@/app/_components/loginRedirectButton";

export default function GuestHome() {
  const hasLoaded = useRef(false);

  useEffect(() => {
    const saved = localStorage.getItem("guest-canvas");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.elements) {
          useCanvasStore.getState().loadState(parsed.elements);
        }
      } catch {}
    }
    hasLoaded.current = true;
  }, []);

  const elements = useCanvasStore((s) => s.elements);
  useEffect(() => {
    if (!hasLoaded.current) return;
    localStorage.setItem("guest-canvas", JSON.stringify({ elements }));
  }, [elements]);

  return (
    <>
      <LoginRedirectButton />
      <Board />
    </>
  );
}