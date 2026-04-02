import { ReactNode } from "react";
import ColorIcon from "./colorIcon";
import { Copy, Minus, Trash2 } from "lucide-react";
import { useCanvasStore } from "@/store/useCanvasStore";

export interface ToggleTypeOptions {
  label: string;
  value: string | number;
  icon: ReactNode;
}

export interface StrokeOptions {
  label: string;
  type: "color" | "toggle";
  options: ToggleTypeOptions[];
}

export interface SliderTypeSettings {
  min: number;
  max: number;
  step: number;
  defaultValue: number;
}
export interface ActionOptions {
  label: string;
  icon: ReactNode;
  disabled?: boolean;
  onClick: () => void;
}

export const ColorOptions: ToggleTypeOptions[] = [
  {
    label: "None",
    value: "transparent",
    icon: <ColorIcon fillColor="transparent" />,
  },
  {
    label: "Pink",
    value: "#ffc9c9",
    icon: <ColorIcon fillColor="#ffc9c9" />,
  },
  {
    label: "Blue",
    value: "#a5d8ff",
    icon: <ColorIcon fillColor="#a5d8ff" />,
  },
  {
    label: "Green",
    value: "#b2f2bb",
    icon: <ColorIcon fillColor="#b2f2bb" />,
  },
  {
    label: "Purple",
    value: "#d0bfff",
    icon: <ColorIcon fillColor="#d0bfff" />,
  },
];

export const StrokeOptions: StrokeOptions[] = [
  {
    label: "Stroke Color",
    type: "color",
    options: [
      {
        label: "Default",
        value: "var(--foreground)",
        icon: <ColorIcon fillColor="var(--stroke-1-raw)" />,
      },
      {
        label: "Red",
        value: "#e03131",
        icon: <ColorIcon fillColor="#e03131" />,
      },
      {
        label: "Blue",
        value: "#1971c2",
        icon: <ColorIcon fillColor="#1971c2" />,
      },
      {
        label: "Green",
        value: "#2f9e44",
        icon: <ColorIcon fillColor="#2f9e44" />,
      },
      {
        label: "Purple",
        value: "#7048e8",
        icon: <ColorIcon fillColor="#7048e8" />,
      },
    ],
  },
  {
    label: "Stroke Width",
    type: "toggle",
    options: [
      { label: "Thin", value: 1.5, icon: <Minus strokeWidth={1.5} /> },
      { label: "Bold", value: 2.5, icon: <Minus strokeWidth={2.5} /> },
      { label: "Extra Bold", value: 4, icon: <Minus strokeWidth={4} /> },
    ],
  },
  {
    label: "Stroke Style",
    type: "toggle",
    options: [
      { label: "Solid", value: "solid", icon: <Minus strokeWidth={2} /> },
      {
        label: "Dashed",
        value: "dashed",
        icon: (
          <Minus strokeWidth={2} strokeDasharray={3} strokeDashoffset={1} />
        ),
      },
      {
        label: "Dotted",
        value: "dotted",
        icon: (
          <Minus strokeWidth={2} strokeDasharray={2} strokeDashoffset={4} />
        ),
      },
    ],
  },
];

export const MoreOptions = [
  {
    label: "Opacity",
    settings: { min: 0, max: 100, step: 5, defaultValue: 100 },
  },
  {
    label: "Rounded Edges",
    settings: { min: 0, max: 40, step: 2, defaultValue: 20 },
  },
];

export const ActionOptions: ActionOptions[] = [
  {
    label: "Delete",
    icon: <Trash2 className="size-4" />,
    onClick: () => useCanvasStore.getState().deleteSelected(),
  },
  {
    label: "Duplicate",
    icon: <Copy className="size-4" />,
    onClick: () => {
      useCanvasStore.getState().copySelected();
      useCanvasStore.getState().pasteElement();
    },
  },
];
