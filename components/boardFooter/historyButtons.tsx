"use client";

import { Redo2, Undo2 } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import { motion } from "motion/react";
import { Button } from "../ui/button";

const buttons = [
  { id: "undo", icon: <Undo2 className="size-4" />, label: "Undo" },
  { id: "redo", icon: <Redo2 className="size-4" />, label: "Redo" },
];

function HistoryButtons() {
  return (
    <TooltipProvider delayDuration={500}>
      <motion.div
        layout
        transition={{ type: "spring", bounce: 0, stiffness: 300, damping: 30 }}
        className="flex items-center gap-1 rounded-full border bg-card px-1.5 py-1"
      >
        {buttons.map(({ id, icon, label }) => (
          <Tooltip key={id}>
            <TooltipTrigger asChild>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  size="icon"
                  variant="ghost"
                  className="size-8 rounded-full"
                  aria-label={label}
                >
                  {icon}
                </Button>
              </motion.div>
            </TooltipTrigger>
            <TooltipContent>
              <span className="text-xs">{label}</span>
            </TooltipContent>
          </Tooltip>
        ))}
      </motion.div>
    </TooltipProvider>
  );
}

export default HistoryButtons;
