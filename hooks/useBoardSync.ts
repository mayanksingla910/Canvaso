import { useCanvasStore } from "@/store/useCanvasStore";
import axios from "axios";
import { useCallback, useEffect, useRef } from "react";

export function useBoardSync(boardId: string) {
  const { loadState, elements, viewport, clearPendingDeletes } =
    useCanvasStore();

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

    const deletedIds = useCanvasStore.getState().pendingDeleteIds;
    clearPendingDeletes();

    try {
      await axios.put(`/api/boards/${boardId}`, {
        elements: useCanvasStore.getState().elements,
        viewport: useCanvasStore.getState().viewport,
        deletedIds,
      });
    } catch (err) {
      console.error("[useBoardSync] save error:", err);
    }
  }, [boardId, clearPendingDeletes]);

  useEffect(() => {
    if (!isLoaded.current) return;

    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(save, 2000);

    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, [elements, viewport, save]);

  useEffect(() => {
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
      save();
    };
  });

  return { save };
}
