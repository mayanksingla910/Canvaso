"use client";

import { ToggleGroup, ToggleGroupItem } from "../ui/toggle-group";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import { motion } from "motion/react";
import { useState } from "react";
import { ToggleTypeOptions } from "./ToolOptions";

function ToggleOptions({ items }: { items: ToggleTypeOptions[] }) {
  const [selected, setSelected] = useState<string>(String(items[0].value));

  return (
    <TooltipProvider delayDuration={1000}>
      <div className="py-1 px-0.5">
        <ToggleGroup
          variant="outline"
          type="single"
          value={selected}
          onValueChange={(v) => {
            if (v) setSelected(v);
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
