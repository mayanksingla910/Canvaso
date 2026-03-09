import { z } from "zod";
import { ToolsSchema } from "./tool";

export const PointSchema = z.object({
  x: z.number(),
  y: z.number(),
});

export const ViewportSchema = z.object({
  x: z.number(),
  y: z.number(),
  zoom: z.number().min(0.1).max(20).default(1),
});

export const BoundsSchema = z.object({
  x: z.number(),
  y: z.number(),
  width: z.number(),
  height: z.number(),
});

export const StrokeStyleSchema = z.enum(["solid", "dashed", "dotted"]);
export const ArrowHeadSchema = z.enum(["none", "arrow", "dot"]);
export const OpacitySchema = z.number().min(0).max(1).default(1);
export const FontFamilySchema = z.enum([
  "sans",
  "serif",
  "mono",
  "handwriting",
]);
export const FontSizeSchema = z.enum(["sm", "md", "lg", "xl"]);
export const TextAlignSchema = z.enum(["left", "center", "right"]);

export const BaseElementSchema = z.object({
  id: z.string().min(1),
  x: z.number(),
  y: z.number(),
  width: z.number(),
  height: z.number(),
  angle: z.number().default(0),
  opacity: OpacitySchema,
  strokeColor: z.string(),
  strokeWidth: z.number().min(1).max(100).default(2),
  strokeStyle: StrokeStyleSchema.default("solid"),
  fillColor: z.string().default("transparent"),
  isLocked: z.boolean().default(false),
  isHidden: z.boolean().default(false),
  isSelected: z.boolean().default(false),
  strokeSharpness: z.number().min(0).max(100).default(100),
  boundElements: z.array(z.string()).default([]),
  createdAt: z.number().default(() => Date.now()),
  updatedAt: z.number().default(() => Date.now()),
});

export const RectElementSchema = BaseElementSchema.extend({
  type: z.literal("rect"),
  cornerRadius: z.number().min(2).default(2),
});

export const CircleElementSchema = BaseElementSchema.extend({
  type: z.literal("circle"),
});

export const DiamondElementSchema = BaseElementSchema.extend({
  type: z.literal("diamond"),
  cornerRadius: z.number().min(2).default(2),
});

export const LineElementSchema = BaseElementSchema.extend({
  type: z.literal("line"),
  points: z.array(PointSchema).min(2),
  smoothing: z.number().min(0).max(1).default(0.5),
});

export const PenElementSchema = BaseElementSchema.extend({
  type: z.literal("pen"),
  points: z.array(PointSchema).min(1),
  smoothing: z.number().min(0).max(1).default(0.5),
});

export const ArrowElementSchema = BaseElementSchema.extend({
  type: z.literal("arrow"),
  points: z.array(PointSchema).min(2),
  smoothing: z.number().min(0).max(1).default(0.5),
  startBindingId: z.string().nullable().default(null),
  endBindingId: z.string().nullable().default(null),
  startArrowhead: ArrowHeadSchema.default("none"),
  endArrowhead: ArrowHeadSchema.default("arrow"),
  dash: z.number().min(0).max(100).default(100),
});

export const TextElementSchema = BaseElementSchema.extend({
  type: z.literal("text"),
  content: z.string().default(""),
  fontFamily: FontFamilySchema.default("sans"),
  fontSize: FontSizeSchema.default("md"),
  textAlign: TextAlignSchema.default("left"),
  isEditing: z.boolean().default(false),
});

export const ImageElementSchema = BaseElementSchema.extend({
  type: z.literal("image"),
  src: z.string().url(),
  naturalWidth: z.number(),
  naturalHeight: z.number(),
  crop: BoundsSchema.nullable().default(null),
});

export const FrameElementSchema = BaseElementSchema.extend({
  type: z.literal("frame"),
  label: z.string().default("Frame"),
  childIds: z.array(z.string()).default([]),
});

export const CanvasElementSchema = z.discriminatedUnion("type", [
  RectElementSchema,
  CircleElementSchema,
  DiamondElementSchema,
  LineElementSchema,
  PenElementSchema,
  ArrowElementSchema,
  TextElementSchema,
  ImageElementSchema,
  FrameElementSchema,
]);

export const CanvasStateSchema = z.object({
  elements: z.record(z.string(), CanvasElementSchema),
  viewport: ViewportSchema,
  selectedIds: z.array(z.string()).default([]),
  activeTool: ToolsSchema.default("select"),
  pageSize: z.object({
    width: z.number(),
    height: z.number(),
    label: z.string(),
    isInfinite: z.boolean().default(true),
  }),
});

export type Point = z.infer<typeof PointSchema>;
export type Viewport = z.infer<typeof ViewportSchema>;
export type Bounds = z.infer<typeof BoundsSchema>;
export type StrokeStyle = z.infer<typeof StrokeStyleSchema>;

export type BaseElement = z.infer<typeof BaseElementSchema>;
export type RectElement = z.infer<typeof RectElementSchema>;
export type CircleElement = z.infer<typeof CircleElementSchema>;
export type DiamondElement = z.infer<typeof DiamondElementSchema>;
export type LineElement = z.infer<typeof LineElementSchema>;
export type PenElement = z.infer<typeof PenElementSchema>;
export type ArrowElement = z.infer<typeof ArrowElementSchema>;
export type TextElement = z.infer<typeof TextElementSchema>;
export type ImageElement = z.infer<typeof ImageElementSchema>;
export type FrameElement = z.infer<typeof FrameElementSchema>;
export type CanvasElement = z.infer<typeof CanvasElementSchema>;
export type CanvasState = z.infer<typeof CanvasStateSchema>;

export function createElement<T extends CanvasElement["type"]>(
  type: T,
  overrides: Partial<CanvasElement> &
    Pick<BaseElement, "x" | "y" | "width" | "height">,
): Extract<CanvasElement, { type: T }> {
  const now = Date.now();

  // Type-specific defaults — Zod requires these fields to exist
  const typeDefaults: Partial<CanvasElement> = (() => {
    switch (type) {
      case "pen":
        return {
          points: [{ x: overrides.x, y: overrides.y }], // seed with start point
          smoothing: 0.5,
        };
      case "line":
        return {
          points: [
            { x: overrides.x, y: overrides.y },
            { x: overrides.x, y: overrides.y },
          ],
          smoothing: 0.5,
        };
      case "arrow":
        return {
          points: [
            { x: overrides.x, y: overrides.y },
            { x: overrides.x, y: overrides.y }, // start = end, grows on mousemove
          ],
          startArrowhead: "none",
          endArrowhead: "arrow",
          startBindingId: null,
          endBindingId: null,
        };
      case "text":
        return {
          content: "",
          fontFamily: "sans",
          fontSize: "md",
          textAlign: "left",
          isEditing: true, // immediately enter edit mode
        };
      case "rect":
        return { cornerRadius: 30 };
      case "diamond":
        return { cornerRadius: 30 };
      case "image":
        return { src: "", naturalWidth: 0, naturalHeight: 0, crop: null };
      case "frame":
        return { label: "Frame", childIds: [] };
      default:
        return {};
    }
  })();

  const base = {
    id: crypto.randomUUID(),
    type,
    angle: 0,
    opacity: 1,
    strokeColor: "", 
    strokeWidth: 2,
    strokeStyle: "solid" as const,
    fillColor: "transparent",
    isLocked: false,
    isHidden: false,
    createdAt: now,
    updatedAt: now,
    ...typeDefaults, // type defaults first
    ...overrides, // then overrides (so caller can still override points etc.)
  };

  return CanvasElementSchema.parse(base) as Extract<CanvasElement, { type: T }>;
}
