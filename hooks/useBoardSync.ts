import { useCanvasStore } from "@/store/useCanvasStore";
import axios from "axios";
import { useCallback, useEffect, useRef } from "react";

export function useBoardSync(boardId: string) {
  const loadState = useCanvasStore((s) => s.loadState);
  const clearPendingDeletes = useCanvasStore((s) => s.clearPendingDeletes);

  const isLoaded = useRef(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const { data } = await axios.get(`/api/boards/${boardId}`);

        if (!cancelled) {
          loadState(data.elements, data.viewport);
          isLoaded.current = true;
        }
      } catch (err) {
        console.error("[useBoardSync] load error:", err);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [boardId, loadState]);

  const save = useCallback(async () => {
    if (!isLoaded.current) return;

    const { elements, viewport, pendingDeleteIds } = useCanvasStore.getState();
    clearPendingDeletes();

    try {
      await axios.put(`/api/boards/${boardId}`, {
        elements,
        viewport,
        deletedIds: pendingDeleteIds,
      });
    } catch (err) {
      console.error("[useBoardSync] save error:", err);
    }
  }, [boardId, clearPendingDeletes]);

  useEffect(() => {
    const unsub = useCanvasStore.subscribe((state, prev) => {
      if (!isLoaded.current) return;
      if (state.elements === prev.elements && state.viewport === prev.viewport)
        return;

      if (saveTimer.current) clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(save, 2000);
    });

    return () => {
      unsub();
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, [save]);

  useEffect(() => {
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
      save();
    };
  }, []);

  return { save };
}
