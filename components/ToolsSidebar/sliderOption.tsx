"use client";

import { useState } from "react";
import { Slider } from "../ui/slider";
import { SliderTypeSettings } from "./ToolOptions";

function SliderOption({ items }: { items: SliderTypeSettings }) {
  const { min, max, step, defaultValue } = items;
  const [value, setValue] = useState([defaultValue]);
  return (
    <div className="w-48 space-y-2 mt-1 ">
      <Slider
        value={value}
        onValueChange={setValue}
        min={min}
        max={max}
        defaultValue={[defaultValue]}
        step={step}
        className="cursor-pointer"
      />
      <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
        <span>{min}</span>
        <span>{value[0]}</span>
      </div>
    </div>
  );
}

export default SliderOption;
