"use client";

import { motion } from "motion/react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import { ActionOptions } from "./ToolOptions";

function ButtonOptions({ items }: { items: ActionOptions[] }) {
  return (
    <TooltipProvider delayDuration={1000}>
      <div className="flex flex-wrap flex-row md:flex-col lg:flex-row gap-2 lg:py-1 px-0.5 lg:items-center">
        {items.map((item) => (
          <Tooltip key={item.label}>
            <TooltipTrigger asChild>
              <motion.button
              layout
                whileTap={{ scale: 0.95 }}
                whileHover={{ scale: 1.1 }}
                transition={{
                  type: "spring",
                  stiffness: 200,
                  damping: 20,
                  duration: 0.1,
                }}
                className="flex items-center justify-center p-2 rounded-full hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50 cursor-pointer h-10 w-10 border"
              >
                {item.icon}
              </motion.button>
            </TooltipTrigger>
            <TooltipContent>{item.label}</TooltipContent>
          </Tooltip>
        ))}
      </div>
    </TooltipProvider>
  );
}

export default ButtonOptions;
