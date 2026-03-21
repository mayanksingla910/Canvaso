import React from "react";
import { Popover, PopoverTrigger, PopoverContent } from "../ui/popover";
import { motion } from "motion/react";
import { Label } from "../ui/label";
import {
  SliderTypeSettings,
  ColorOptions,
  MoreOptions,
  StrokeOptions,
  ActionOptions,
} from "./ToolOptions";
import { LineSquiggle, Settings2 } from "lucide-react";
import ColorOption from "./colorOption";
import ToggleOptions from "./toggleOptions";
import SliderOption from "./sliderOption";
import ButtonOptions from "./buttonOptions";

function SmallScreenSidebar() {
  return (
    <div className="lg:hidden gap-2 flex flex-row md:flex-col min-w-60 md:min-w-0">
      <Popover>
        <PopoverTrigger asChild>
          <motion.div
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            transition={{
              type: "spring",
              stiffness: 400,
              damping: 20,
              duration: 0.1,
            }}
            className="block lg:hidden bg-background border border-dashed cursor-pointer w-10 h-10 rounded-full "
          />
        </PopoverTrigger>
        <PopoverContent
          side="right"
          sideOffset={10}
          className="space-y-2 w-fit block lg:hidden"
          align="start"
        >
          <Label>Fill</Label>
          <ColorOption items={ColorOptions} />
        </PopoverContent>
      </Popover>
      <Popover>
        <PopoverTrigger asChild>
          <motion.div
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            transition={{
              type: "spring",
              stiffness: 400,
              damping: 20,
              duration: 0.1,
            }}
            className="flex lg:hidden border items-center justify-center cursor-pointer p-2.5 w-10 h-10 rounded-full hover:bg-accent/80 transition-colors"
          >
            <LineSquiggle />
          </motion.div>
        </PopoverTrigger>
        <PopoverContent
          side="right"
          sideOffset={10}
          className="space-y-2 w-fit block lg:hidden"
          align="start"
        >
          {StrokeOptions.map((option) => (
            <div key={option.label} className="space-y-2">
              <Label>{option.label}</Label>
              {option.type === "color" && (
                <ColorOption items={option.options} />
              )}
              {option.type === "toggle" && (
                <ToggleOptions items={option.options} />
              )}
            </div>
          ))}
        </PopoverContent>
      </Popover>
      <Popover>
        <PopoverTrigger asChild>
          <motion.div
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            transition={{
              type: "spring",
              stiffness: 400,
              damping: 20,
              duration: 0.1,
            }}
            className="flex lg:hidden border items-center justify-center cursor-pointer p-2.5 w-10 h-10 rounded-full hover:bg-accent/80 transition-colors"
          >
            <Settings2 />
          </motion.div>
        </PopoverTrigger>
        <PopoverContent
          side="right"
          sideOffset={10}
          className="space-y-2 w-fit "
          align="start"
        >
          {MoreOptions.map((option) => (
            <div key={option.label} className="space-y-3 ">
              <div className="flex justify-between gap-2">
                <Label>{option.label}</Label>
                <div className="text-xs text-muted-foreground">
                  {option.settings?.min}-{option.settings?.max}
                </div>
              </div>
              <SliderOption items={option.settings as SliderTypeSettings} />
            </div>
          ))}
        </PopoverContent>
      </Popover>
      <ButtonOptions items={ActionOptions} />
    </div>
  );
}

export default SmallScreenSidebar;
