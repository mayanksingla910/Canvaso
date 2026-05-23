"use client";

import { ToggleGroup, ToggleGroupItem } from "../../ui/toggle-group";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../../ui/tooltip";
import { motion } from "motion/react";
import { useState } from "react";
import { ToggleTypeOptions } from "./ToolOptions";
import { DefaultStyles } from "@/store/useToolStore";
import { useApplyStyle, useCurrentStyle } from "@/hooks/useStyleState";
import { useCanvasStore } from "@/store/useCanvasStore";

interface props {
  items: ToggleTypeOptions[];
  styleKey: keyof DefaultStyles;
}

function ToggleOptions({ items, styleKey }: props) {
  const apply = useApplyStyle();
  const current = useCurrentStyle(styleKey);
  const selected = current !== undefined ? String(current) : "";

  return (
    <TooltipProvider delayDuration={1000}>
      <div className="py-1 px-0.5">
        <ToggleGroup
          variant="outline"
          type="single"
          value={selected}
          onValueChange={(v) => {
            if (v) {
              apply(styleKey, v);
              useCanvasStore.getState().pushHistory();
            }
          }}
          className="flex-wrap gap-1"
        >
          {items.map((item) => (
            <Tooltip key={String(item.value)}>
              <TooltipTrigger asChild>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <ToggleGroupItem value={String(item.value)}>
                    {item.icon}
                  </ToggleGroupItem>
                </motion.div>
              </TooltipTrigger>
              <TooltipContent>{item.label}</TooltipContent>
            </Tooltip>
          ))}
        </ToggleGroup>
      </div>
    </TooltipProvider>
  );
}

export default ToggleOptions;
