import { CanvasElement, Viewport } from "@/types/canvas";
import { create } from "zustand";

type CanvasStore = {
  elements: Record<string, CanvasElement>;
  addElement: (el: CanvasElement) => void;
  updateElement: (id: string, changes: Partial<CanvasElement>) => void;
  deleteElement: (id: string) => void;
  deleteSelected: () => void;

  viewport: Viewport;
  setViewport: (viewport: Viewport) => void;

  selectedIds: string[];
  setSelectedIds: (ids: string[]) => void;
  addToSelection: (id: string) => void;
  clearSelection: () => void;

  history: Record<string, CanvasElement>[];
  historyIndex: number;
  pushHistory: () => void;
  undo: () => void;
  redo: () => void;
};

export const useCanvasStore = create<CanvasStore>((set, get) => ({
  elements: {},

  addElement: (el) => {
    set((s) => ({ elements: { ...s.elements, [el.id]: el } }));
  },

  updateElement: (id, changes) =>
  set((s) => {
    const existing = s.elements[id]
    if (!existing) return s
    return {
      elements: {
        ...s.elements,
        [id]: { ...existing, ...changes, updatedAt: Date.now() } as CanvasElement,
      },
    }
  }),

  deleteElement: (id) =>
    set((s) => {
      const { [id]: _, ...rest } = s.elements;
      return { elements: rest };
    }),

  deleteSelected: () => {
    const { selectedIds, elements } = get();
    const next = { ...elements };
    for (const id of selectedIds) delete next[id];
    set({ elements: next, selectedIds: [] });
  },

  viewport: { x: 0, y: 0, zoom: 1 },
  setViewport: (viewport) => set({ viewport }),

  selectedIds: [],
  setSelectedIds: (ids) => set({ selectedIds: ids }),
  addToSelection: (id) => set((s) => ({ selectedIds: [...s.selectedIds, id] })),
  clearSelection: () => set({ selectedIds: [] }),

  history: [],
  historyIndex: -1,
  pushHistory: () => {
    set((s) => {
      const newHistory = s.history.slice(0, s.historyIndex + 1);
      return {
        history: [...newHistory, s.elements],
        historyIndex: newHistory.length,
      };
    });
  },

  undo: () => {
  const { history, historyIndex } = get();
  if (historyIndex < 0) return;
  set({
    elements: historyIndex === 0 ? {} : structuredClone(history[historyIndex - 1]),
    historyIndex: historyIndex - 1,
    selectedIds: [],
  });
},

  redo: () => {
    const { history, historyIndex } = get();
    if (historyIndex >= history.length - 1) return;
    set((s) => ({
      elements: history[historyIndex + 1],
      historyIndex: s.historyIndex + 1,
    }));
  },
}));
