"use client";

import { useEffect, useRef } from "react";
import BoardPage from "./[boardId]/page";
import { useCanvasStore } from "@/store/useCanvasStore";

function Home() {
  const hasLoaded = useRef(false)

  useEffect(() => {
    const saved = localStorage.getItem("guest-canvas")
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        if (parsed.elements) {
          useCanvasStore.getState().loadState(parsed.elements)
        }
      } catch {}
    }
    hasLoaded.current = true
  }, [])

  const elements = useCanvasStore((s) => s.elements)
  useEffect(() => {
    if (!hasLoaded.current) return
    localStorage.setItem("guest-canvas", JSON.stringify({ elements }))
  }, [elements])

  return <BoardPage />
}

export default Home