import * as Y from "yjs";
import { WebsocketProvider } from "y-websocket";
import { useEffect, useRef } from "react";
import { CanvasElement } from "@canvaso/shared-types";
import { useCanvasStore } from "@/store/useCanvasStore";
import { Awareness } from "y-protocols/awareness";
import { markBoardSynced, clearBoardSynced } from "./boardSyncState";

const WS_URL = process.env.NEXT_PUBLIC_WS_URL ?? "ws://localhost:8080";

interface UseCollaborationOptions {
  userId?: string | null;
  token?: string | null;
  enabled?: boolean;
}

export interface CursorState {
  x: number;
  y: number;
  name: string;
  color: string;
}

export interface AwarenessState {
  cursor?: CursorState;
  user?: { name: string; color: string };
}

export function useCollaboration(
  boardId: string,
  { userId, token, enabled = true }: UseCollaborationOptions = {},
) {
  const docRef = useRef<Y.Doc | null>(null);
  const providerRef = useRef<WebsocketProvider | null>(null);
  const awarenessRef = useRef<Awareness | null>(null);
  const yMapRef = useRef<Y.Map<CanvasElement> | null>(null);

  const isApplyingRemote = useRef(false);
  const isSynced = useRef(false);

  useEffect(() => {
    if (!enabled) return;

    const doc = new Y.Doc();
    const yMap = doc.getMap<CanvasElement>("elements");

    const params: Record<string, string> = {};
    if (userId) params.userId = userId;
    if (token) params.token = token;

    const provider = new WebsocketProvider(WS_URL, boardId, doc, { params });

    docRef.current = doc;
    providerRef.current = provider;
    awarenessRef.current = provider.awareness;
    yMapRef.current = yMap;

    provider.on("sync", (synced: boolean) => {
      if (!synced) return;

      isSynced.current = true;
      markBoardSynced(boardId);

      const snapshot: Record<string, CanvasElement> = {};
      yMap.forEach((value, key) => {
        snapshot[key] = value;
      });
      const hasServerState = Object.keys(snapshot).length > 0;

      if (hasServerState) {
        isApplyingRemote.current = true;
        try {
          const currentViewport = useCanvasStore.getState().viewport;
          useCanvasStore.getState().loadState(snapshot, currentViewport);
        } finally {
          isApplyingRemote.current = false;
        }
      } else {
        const currentElements = useCanvasStore.getState().elements;
        if (Object.keys(currentElements).length > 0) {
          doc.transact(() => {
            for (const [id, el] of Object.entries(currentElements)) {
              yMap.set(id, el);
            }
          }, "local");
        }
      }
    });

    const handleBoardLoaded = (e: Event) => {
      const { boardId: loadedId } = (e as CustomEvent<{ boardId: string }>)
        .detail;
      if (loadedId !== boardId) return;
      if (!isSynced.current) return;
      if (yMap.size > 0) return;

      const currentElements = useCanvasStore.getState().elements;
      if (Object.keys(currentElements).length === 0) return;

      doc.transact(() => {
        for (const [id, el] of Object.entries(currentElements)) {
          yMap.set(id, el);
        }
      }, "local");
    };

    window.addEventListener("boardLoaded", handleBoardLoaded);

    // ── Remote → Zustand ──────────────────────────────────────────────────────
    const onYjsChange = (
      _event: Y.YMapEvent<CanvasElement>,
      transaction: Y.Transaction,
    ) => {
      if (transaction.local) return;

      isApplyingRemote.current = true;
      try {
        const snapshot: Record<string, CanvasElement> = {};
        yMap.forEach((value, key) => {
          snapshot[key] = value;
        });
        useCanvasStore.getState().setElementsFromRemote(snapshot);
      } finally {
        isApplyingRemote.current = false;
      }
    };

    yMap.observe(onYjsChange);

    const unsubscribeStore = useCanvasStore.subscribe((state, prevState) => {
      if (!isSynced.current) return;
      if (isApplyingRemote.current) return;
      if (state.elements === prevState.elements) return;

      const currentYMap = yMapRef.current;
      const currentDoc = docRef.current;
      if (!currentYMap || !currentDoc) return;

      currentDoc.transact(() => {
        // Upsert: only push elements that actually changed
        for (const [id, el] of Object.entries(state.elements)) {
          const prev = prevState.elements[id];
          // New element or updatedAt changed → push to Y.Map
          if (!prev || prev.updatedAt !== el.updatedAt) {
            currentYMap.set(id, el);
          }
        }

        // Delete elements removed from Zustand
        currentYMap.forEach((_, key) => {
          if (!state.elements[key]) currentYMap.delete(key);
        });
      }, "local");
    });

    return () => {
      isSynced.current = false;
      clearBoardSynced(boardId);
      window.removeEventListener("boardLoaded", handleBoardLoaded);
      yMap.unobserve(onYjsChange);
      unsubscribeStore();
      provider.destroy();
      doc.destroy();
      docRef.current = null;
      providerRef.current = null;
      awarenessRef.current = null;
      yMapRef.current = null;
    };
  }, [boardId, userId, token, enabled]);

  return { docRef, providerRef, awarenessRef, yMapRef };
}
