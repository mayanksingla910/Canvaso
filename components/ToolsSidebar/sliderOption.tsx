"use client";

import { Slider } from "../ui/slider";
import { SliderTypeSettings } from "./ToolOptions";
import { DefaultStyles } from "@/store/useToolStore";
import { useApplyStyle, useCurrentStyle } from "@/hooks/useStyleState";
import { useCanvasStore } from "@/store/useCanvasStore";

interface props {
  items: SliderTypeSettings;
  styleKey: keyof DefaultStyles;
}

function SliderOption({ items, styleKey }: props)  {
  const { min, max, step, defaultValue } = items;
  const apply   = useApplyStyle();
  const current = useCurrentStyle(styleKey);
 
  const isOpacity = styleKey === "opacity";
  const rawValue  = current !== undefined ? Number(current) : defaultValue;
  const displayValue = isOpacity ? Math.round(rawValue * 100) : rawValue;
 
  const handleChange = (val: number[]) => {
    const v = val[0]
    apply(styleKey, isOpacity ? v / 100 : v)
    useCanvasStore.getState().pushHistory();
  }
 
  return (
    <div className="w-48 space-y-2 mt-1">
      <Slider
        value={[displayValue]}
        onValueChange={handleChange}
        min={min}
        max={max}
        step={step}
        className="cursor-pointer"
      />
      <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
        <span>{min}</span>
        <span>{displayValue}{isOpacity ? "%" : ""}</span>
      </div>
    </div>
  );
}

export default SliderOption;
