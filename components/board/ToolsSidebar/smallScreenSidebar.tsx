"use client";
import { Popover, PopoverTrigger, PopoverContent } from "../../ui/popover";
import { AnimatePresence, motion } from "motion/react";
import { Label } from "../../ui/label";
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
import { DefaultStyles, useToolStore } from "@/store/useToolStore";
import { CanvasElement } from "@/types/canvas";
import { STYLE_KEY_MAP } from ".";
import TransparentIcon from "./transparentIcon";
import { useIsMobile } from "@/hooks/use-mobile";

function SmallScreenSidebar({
  selectedElements,
}: {
  selectedElements: CanvasElement[];
}) {
  const isMobile = useIsMobile();
  const selectedTool = useToolStore((state) => state.selectedTool);

  return (
    <AnimatePresence>
      <motion.div className="lg:hidden gap-2 flex flex-row md:flex-col min-w-60 md:min-w-0">
        {(selectedTool === "diamond" ||
          selectedTool === "rect" ||
          selectedTool === "circle" ||
          selectedElements
            .map(
              (el) =>
                el.type === "diamond" ||
                el.type === "rect" ||
                el.type === "circle",
            )
            .filter(Boolean).length > 0) && (
          <Popover>
            <PopoverTrigger asChild>
              <motion.div
                layout
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                transition={{
                  type: "spring",
                  stiffness: 200,
                  damping: 20,
                  duration: 0.1,
                }}
                className="block lg:hidden overflow-hidden bg-transparent border border-dashed cursor-pointer w-10 h-10 rounded-full "
              >
                <TransparentIcon />
              </motion.div>
            </PopoverTrigger>
            <PopoverContent
              side={isMobile ? "top" : "right"}
              sideOffset={10}
              className="space-y-2 w-fit block lg:hidden"
              align={isMobile ? "center" : "start"}
            >
              <Label>Fill</Label>
              <ColorOption items={ColorOptions} styleKey={"fillColor"} />
            </PopoverContent>
          </Popover>
        )}
        <Popover>
          <PopoverTrigger asChild>
            <motion.div
              layout
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              transition={{
                type: "spring",
                stiffness: 200,
                damping: 20,
                duration: 0.1,
              }}
              className="flex lg:hidden border items-center justify-center cursor-pointer p-2.5 w-10 h-10 rounded-full hover:bg-accent/80 transition-colors"
            >
              <LineSquiggle />
            </motion.div>
          </PopoverTrigger>
          <PopoverContent
            side={isMobile ? "top" : "right"}
            sideOffset={10}
            className="space-y-2 w-fit block lg:hidden"
            align={isMobile ? "center" : "start"}
          >
            {StrokeOptions.map((option) => (
              <div key={option.label} className="space-y-2">
                <Label>{option.label}</Label>
                {option.type === "color" && (
                  <ColorOption
                    items={option.options}
                    styleKey={
                      STYLE_KEY_MAP[option.label] as keyof DefaultStyles
                    }
                  />
                )}
                {option.type === "toggle" && (
                  <ToggleOptions
                    items={option.options}
                    styleKey={
                      STYLE_KEY_MAP[option.label] as keyof DefaultStyles
                    }
                  />
                )}
              </div>
            ))}
          </PopoverContent>
        </Popover>
        <Popover>
          <PopoverTrigger asChild>
            <motion.div
              layout
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              transition={{
                type: "spring",
                stiffness: 200,
                damping: 20,
                duration: 0.1,
              }}
              className="flex lg:hidden border items-center justify-center cursor-pointer p-2.5 w-10 h-10 rounded-full hover:bg-accent/80 transition-colors"
            >
              <Settings2 />
            </motion.div>
          </PopoverTrigger>
          <PopoverContent
            side={isMobile ? "top" : "right"}
            sideOffset={10}
            className="space-y-2 w-fit "
            align={isMobile ? "center" : "start"}
          >
            {MoreOptions.map((option) => {
              const show =
                option.label === "Opacity" ||
                (option.label === "Rounded Edges" &&
                  (selectedTool === "rect" ||
                    selectedTool === "diamond" ||
                    selectedElements
                      .map((el) => el.type === "diamond" || el.type === "rect")
                      .filter(Boolean).length > 0));

              if (!show) return null;
              return (
                <div key={option.label} className="space-y-3 ">
                  <div className="flex justify-between gap-2">
                    <Label>{option.label}</Label>
                    <div className="text-xs text-muted-foreground">
                      {option.settings?.min}-{option.settings?.max}
                    </div>
                  </div>
                  <SliderOption
                    items={option.settings as SliderTypeSettings}
                    styleKey={
                      STYLE_KEY_MAP[option.label] as keyof DefaultStyles
                    }
                  />
                </div>
              );
            })}
          </PopoverContent>
        </Popover>
        <motion.div layout>
          <ButtonOptions items={ActionOptions} />
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default SmallScreenSidebar;
