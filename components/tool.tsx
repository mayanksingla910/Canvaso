"use client";

import { ToolType } from "@/types/tool";
import { Button } from "./ui/button";
import { useToolStore } from "@/store/useToolStore";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";
import { motion } from "motion/react";

interface ToolProps {
  id: ToolType;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  label: string;
}

const Tool = ({ id, icon: Icon, label }: ToolProps) => {
  const selectedTool = useToolStore((state) => state.selectedTool);
  const setSelectedTool = useToolStore((state) => state.setSelectedTool);

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button
            variant={selectedTool === id ? "default" : "ghost"}
            size="icon"
            aria-label={id}
            onClick={() => setSelectedTool(id)}
            className="size-10 md:size-8"
          >
            <Icon />
          </Button>
        </motion.div>
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
};

export default Tool;
