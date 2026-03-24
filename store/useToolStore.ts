import { ToolType } from "@/types/tool";
import { create } from "zustand";

export interface DefaultStyles {
  strokeColor: string;
  strokeWidth: number;
  strokeStyle: "solid" | "dashed" | "dotted";
  fillColor: string;
  opacity: number;
  cornerRadius: number;
}

type toolStore = {
  selectedTool: ToolType;
  setSelectedTool: (tool: ToolType) => void;

  openSidebar: boolean;
  setOpenSidebar: (open: boolean) => void;

  defaultStyles: DefaultStyles;
  setDefaultStyle: (key: string, value: unknown) => void;
};

export const useToolStore = create<toolStore>()((set) => ({
  selectedTool: "select",
  setSelectedTool: (tool: ToolType) => set({ selectedTool: tool }),

  openSidebar: true,
  setOpenSidebar: (open: boolean) => set({ openSidebar: open }),

  defaultStyles: {
    strokeColor: "var(--foreground)",
    strokeWidth: 1,
    strokeStyle: "solid" as const,
    fillColor: "transparent",
    opacity: 1,
    cornerRadius: 20,
  },
  setDefaultStyle: (key, value) =>
    set((s) => ({ defaultStyles: { ...s.defaultStyles, [key]: value } })),
}));
