import { useCanvasStore } from "@/store/useCanvasStore";
import axios from "axios";
import { useCallback, useEffect, useRef } from "react";
import { isBoardSynced } from "./boardSyncState";

interface UseBoardSyncOptions {
  token?: string | null;
}

export function useBoardSync(
  boardId: string,
  { token }: UseBoardSyncOptions = {},
) {
  const loadState = useCanvasStore((s) => s.loadState);
  const clearPendingDeletes = useCanvasStore((s) => s.clearPendingDeletes);

  const isLoaded = useRef(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dirtyIds = useRef<Set<string>>(new Set());

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const url = token
          ? `/api/boards/${boardId}?token=${token}`
          : `/api/boards/${boardId}`;

        const { data } = await axios.get(url);

        if (!cancelled) {
          if (!isBoardSynced(boardId)) {
            loadState(data.elements, data.viewport);
          }
          isLoaded.current = true;

          // Dispatch tracking event to let useCollaboration know DB data is ready
          window.dispatchEvent(
            new CustomEvent("boardLoaded", { detail: { boardId } }),
          );
        }
      } catch (err) {
        console.error("[useBoardSync] load error:", err);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [boardId, loadState, token]);

  const save = useCallback(async () => {
    if (!isLoaded.current) return;

    const { elements, viewport, pendingDeleteIds } = useCanvasStore.getState();

    const changedElements = Object.fromEntries(
      [...dirtyIds.current]
        .filter((id) => elements[id])
        .map((id) => [id, elements[id]]),
    );

    dirtyIds.current.clear();
    clearPendingDeletes();

    if (
      Object.keys(changedElements).length === 0 &&
      pendingDeleteIds.length === 0
    )
      return;

    try {
      const url = token
        ? `/api/boards/${boardId}?token=${token}`
        : `/api/boards/${boardId}`;

      await axios.put(url, {
        elements: changedElements,
        viewport,
        deletedIds: pendingDeleteIds,
      });
    } catch (err) {
      console.error("[useBoardSync] save error:", err);
    }
  }, [boardId, clearPendingDeletes, token]);

  useEffect(() => {
    const unsub = useCanvasStore.subscribe((state, prev) => {
      if (!isLoaded.current) return;
      if (state.elements === prev.elements && state.viewport === prev.viewport)
        return;

      if (state.elements !== prev.elements) {
        for (const id of Object.keys(state.elements)) {
          if (state.elements[id] !== prev.elements[id]) {
            dirtyIds.current.add(id);
          }
        }
      }

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
