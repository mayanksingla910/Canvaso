"use client";

import {
  Pen,
  MousePointer2,
  Circle,
  MoveRight,
  Minus,
  Hand,
  RectangleHorizontal,
  Diamond,
} from "lucide-react";
import { Card } from "../ui/card";
import Tool from "./tool";
import { ToolType } from "@/types/tool";
import { TooltipProvider } from "../ui/tooltip";
import { motion } from "motion/react";

const tools: {
  id: ToolType;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  label: string;
}[] = [
  { id: "hand", icon: Hand, label: "Hand" },
  { id: "select", icon: MousePointer2, label: "Select" },
  { id: "rect", icon: RectangleHorizontal, label: "Rectangle" },
  { id: "circle", icon: Circle, label: "Circle" },
  { id: "diamond", icon: Diamond, label: "Diamond" },
  { id: "arrow", icon: MoveRight, label: "Arrow" },
  { id: "line", icon: Minus, label: "Line" },
  { id: "pen", icon: Pen, label: "Pen" },
];

const Toolbar = () => {
  return (
    <TooltipProvider delayDuration={500}>
      <Card
        className="fixed z-20 w-fit h-fit p-1
        bottom-8 left-1/2 -translate-x-1/2
        md:bottom-auto md:top-5 md:left-1/2 md:-translate-x-1/2"
      >
        <motion.div
          layout
          transition={{
            type: "spring",
            bounce: 0,
            stiffness: 300,
            damping: 30,
          }}
          className="flex gap-1"
        >
          {tools.map(({ id, icon: Icon, label }) => (
            <Tool key={id} id={id} icon={Icon} label={label} />
          ))}
        </motion.div>
      </Card>
    </TooltipProvider>
  );
};

export default Toolbar;
