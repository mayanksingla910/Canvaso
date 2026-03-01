"use client";

import {
  Pen,
  Eraser,
  MousePointer2,
  Circle,
  MoveRight,
  Minus,
  Image,
  Frame,
  Hand,
  Type,
  RectangleHorizontal,
} from "lucide-react";
import { Card } from "./ui/card";
import Tool from "./tool";
import { ToolType } from "@/types/tool";
import {
  TooltipProvider,
} from "./ui/tooltip";
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
  { id: "arrow", icon: MoveRight, label: "Arrow" },
  { id: "line", icon: Minus, label: "Line" },
  { id: "pen", icon: Pen, label: "Pen" },
  { id: "text", icon: Type, label: "Text" },
  { id: "image", icon: Image, label: "Image" },
  { id: "frame", icon: Frame, label: "Frame" },
  { id: "eraser", icon: Eraser, label: "Eraser" },
];

const Toolbar = () => {
  return (
    <TooltipProvider delayDuration={500}>
      <Card className="sticky top-5 z-10 max-w-3xl w-fit mx-auto p-1">
        <motion.div
          layout
          transition={{
            type: "spring",
            bounce: 0,
            stiffness: 300,
            damping: 30,
          }}
          className="flex gap-1 "
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
