import { ToolType } from "@/types/tool";
import { create } from "zustand";

type toolStore = {
  selectedTool: ToolType;
  setSelectedTool: (tool: ToolType) => void;
};

export const useToolStore = create<toolStore>()((set) => ({
  selectedTool: "select",
  setSelectedTool: (tool: ToolType) => set({ selectedTool: tool }),
}));
