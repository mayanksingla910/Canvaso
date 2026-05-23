import { z } from "zod";

export const ToolsSchema = z.enum([
  "hand",
  "select",
  "rect",
  "circle",
  "diamond",
  "arrow",
  "line",
  "pen",
  "text",
  "image",
  "frame",
  "eraser",
]);

export type ToolType = z.infer<typeof ToolsSchema>;
