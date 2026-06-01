import * as Y from "yjs";
import { WebsocketProvider } from "y-websocket";
import { useEffect, useRef } from "react";
import { CanvasElement } from "@canvaso/shared-types";
import { useCanvasStore } from "@/store/useCanvasStore";

export async function useCollaboration(boardId: string) {
  const docRef = useRef<Y.Doc | null>(null);
  const providerRef = useRef<WebsocketProvider | null>(null);
  const yMapRef = useRef<Y.Map<CanvasElement> | null>(null);

  const isApplyingRemoteUpdate = useRef(false);

  useEffect(() => {
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL;
    if (!wsUrl) {
      console.warn("[useCollaboration] NEXT_PUBLIC_WS_URL is not set");
      return;
    }

    const doc = new Y.Doc();
    const provider = new WebsocketProvider(wsUrl, boardId, doc);
    const yMap = doc.getMap<CanvasElement>("elements");

    docRef.current = doc;
    providerRef.current = provider;
    yMapRef.current = yMap;

    const onYjsChange = (
      _event: Y.YMapEvent<CanvasElement>,
      transaction: Y.Transaction,
    ) => {
      if (transaction.local) return;

      isApplyingRemoteUpdate.current = true;
      try {
        const snapshot: Record<string, CanvasElement> = {};
        yMap.forEach((value, key) => {
          snapshot[key] = value;
        });
        const currentViewport = useCanvasStore.getState().viewport;
        useCanvasStore.getState().loadState(snapshot, currentViewport);
      } finally {
        isApplyingRemoteUpdate.current = false;
      }
    };

    yMap.observe(onYjsChange);

    const unSubscribe = useCanvasStore.subscribe((state, prevState) => {
      if (
        isApplyingRemoteUpdate.current ||
        state.elements === prevState.elements
      )
        return;

      const currentYMap = yMapRef.current;
      const currentDoc = docRef.current;
      if (!currentYMap || !currentDoc) return;

      currentDoc.transact(() => {
        for (const [id, element] of Object.entries(state.elements)) {
          const existing = currentYMap.get(id);

          if (JSON.stringify(existing) !== JSON.stringify(element)) {
            currentYMap.set(id, element);
          }
        }
        currentYMap.forEach((value, key) => {
          if (!state.elements[key]) {
            currentYMap.delete(key);
          }
        });
      }, "local");
    });

    return () => {
      yMap.unobserve(onYjsChange);
      unSubscribe();
      provider.destroy();
      doc.destroy();
      docRef.current = null;
      providerRef.current = null;
      yMapRef.current = null;
    };
  }, [boardId]);
}
