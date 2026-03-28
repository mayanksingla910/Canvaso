"use client";

import { Redo2, Undo2 } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../../ui/tooltip";
import { motion } from "motion/react";
import { Button } from "../../ui/button";
import { useCanvasStore } from "@/store/useCanvasStore";
import { MouseEvent, ReactNode } from "react";
import { useShallow } from "zustand/shallow";

interface HistoryButton {
  id: string;
  icon: ReactNode;
  label: string;
  disabled: boolean;
  onClick: (e: MouseEvent<HTMLButtonElement>) => void;
}

function HistoryButtons() {
  const { historyIndex, history, undo, redo } = useCanvasStore(
    useShallow((s) => ({
      historyIndex: s.historyIndex,
      history: s.history,
      undo: s.undo,
      redo: s.redo,
    })),
  );

  const buttons: HistoryButton[] = [
    {
      id: "undo",
      icon: <Undo2 className="size-4" />,
      label: "Undo",
      disabled: historyIndex < 0,
      onClick: (e) => {
        e.preventDefault();
        undo();
      },
    },
    {
      id: "redo",
      icon: <Redo2 className="size-4" />,
      label: "Redo",
      disabled: historyIndex >= history.length - 1,
      onClick: (e) => {
        e.preventDefault();
        redo();
      },
    },
  ];

  return (
    <TooltipProvider delayDuration={500}>
      <motion.div
        layout
        transition={{ type: "spring", bounce: 0, stiffness: 300, damping: 30 }}
        className="flex items-center gap-1 rounded-full border bg-card px-1.5 py-1"
      >
        {buttons.map(({ id, icon, label, disabled, onClick }) => (
          <Tooltip key={id}>
            <TooltipTrigger asChild>
              <motion.div
                whileHover={disabled ? undefined : { scale: 1.1 }}
                whileTap={ disabled ? undefined : { scale: 0.95 }}
              >
                <Button
                  size="icon"
                  variant="ghost"
                  disabled={disabled}
                  className="md:size-8 size-10 rounded-full"
                  aria-label={label}
                  onClick={(e) => onClick(e)}
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
