import { Awareness } from "y-protocols/awareness";
import { useEffect, useRef, useState } from "react";
import type { AwarenessState, CursorState } from "./useCollaboration";

export interface PeerCursor {
  clientId: number;
  cursor: CursorState;
  name: string;
  color: string;
}

// Deterministic color from a string (userId or clientId)
export function getUserColor(id: string | number): string {
  const colors = [
    "#E03131", "#C2255C", "#9C36B5", "#6741D9",
    "#3B5BDB", "#1971C2", "#0C8599", "#099268",
    "#2F9E44", "#66A80F", "#F08C00", "#E8590C",
  ];
  const str = String(id);
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length]!;
}

export function useCursors(awarenessRef: React.RefObject<Awareness | null>) {
  const [cursors, setCursors] = useState<PeerCursor[]>([]);
  // Stable ref so the awareness listener doesn't need to re-register
  const awarenessListenerRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    // Poll for awareness becoming available (it's set after provider connects)
    const interval = setInterval(() => {
      const awareness = awarenessRef.current;
      if (!awareness) return;

      clearInterval(interval);

      const update = () => {
        const peers: PeerCursor[] = [];
        awareness.getStates().forEach((state: AwarenessState, clientId: number) => {
          if (clientId === awareness.clientID) return;
          if (!state.cursor) return;
          peers.push({
            clientId,
            cursor: state.cursor,
            name: state.user?.name ?? "Guest",
            color: state.user?.color ?? getUserColor(clientId),
          });
        });
        setCursors(peers);
      };

      awareness.on("change", update);
      awarenessListenerRef.current = () => awareness.off("change", update);
      update(); // run once immediately
    }, 100);

    return () => {
      clearInterval(interval);
      awarenessListenerRef.current?.();
    };
  }, [awarenessRef]);

  return cursors;
}