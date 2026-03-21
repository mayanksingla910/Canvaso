"use client";

import { useState } from "react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";
import { motion } from "motion/react";
import { ToggleTypeOptions } from "./ToolOptions";

function ColorOption({items} : {items: ToggleTypeOptions[]}) {
  const [selected, setSelected] = useState<string>(String(items[0].value));

  return (
    <TooltipProvider delayDuration={1000}>
      <div className="flex flex-wrap gap-2 py-1 px-0.5">
        {items.map((item) => {
          const val = String(item.value);
          const isSelected = selected === val;
          const isTransparent = val === "transparent";

          return (
            <Tooltip key={val}>
              <TooltipTrigger asChild>
                <motion.button
                  onClick={() => setSelected(val)}
                  animate={{ scale: isSelected ? 1.15 : 1 }}
                  whileHover={{ scale: isSelected ? 1.15 : 1.1 }}
                  whileTap={{ scale: 0.93 }}
                  transition={{
                    type: "spring",
                    stiffness: 400,
                    damping: 20,
                    duration: 0.1,
                  }}
                  className={`
                      relative w-7 h-7 rounded-md shrink-0 transition-shadow cursor-pointer
                      ${
                        isTransparent
                          ? "border border-dashed border-border"
                          : "border border-black/10 dark:border-white/10"
                      }
                      ${
                        isSelected
                          ? "ring-1 ring-primary ring-offset-1 ring-offset-card shadow-sm"
                          : ""
                      }
                    `}
                  style={{
                    backgroundColor: isTransparent ? undefined : val,
                  }}
                >
                  {/* Transparent = diagonal strike */}
                  {isTransparent && (
                    <svg
                      className="absolute inset-0 w-full h-full rounded-md"
                      viewBox="0 0 28 28"
                    >
                      <line
                        x1="3"
                        y1="3"
                        x2="25"
                        y2="25"
                        stroke="hsl(var(--destructive))"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                      />
                    </svg>
                  )}
                </motion.button>
              </TooltipTrigger>
              <TooltipContent>{item.label}</TooltipContent>
            </Tooltip>
          );
        })}
      </div>
    </TooltipProvider>
  );
}
export default ColorOption;
