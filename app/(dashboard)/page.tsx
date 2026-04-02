"use client";

import { useCanvasStore } from "@/store/useCanvasStore";
import { authClient } from "@/lib/auth-client";
import LoginRedirectButton from "../_components/loginRedirectButton";
import Board from "@/components/board";
import DashBoard from "@/components/dashboard";
import { useEffect, useRef } from "react";

function GuestHome() {
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

function Home() {
  const { data: session, isPending } = authClient.useSession();

  if (isPending) return null;
  if (session) return <DashBoard />;

  return <GuestHome />;
}

export default Home;
