"use client";
import { DefaultStyles, useToolStore } from "@/store/useToolStore";
import { AnimatePresence, motion } from "motion/react";
import { ScrollArea } from "../../ui/scroll-area";
import ToggleOptions from "./toggleOptions";
import SliderOption from "./sliderOption";
import ButtonOptions from "./buttonOptions";
import ColorOption from "./colorOption";
import { Label } from "../../ui/label";
import {
  ActionOptions,
  ColorOptions,
  MoreOptions,
  SliderTypeSettings,
  StrokeOptions,
} from "./ToolOptions";
import SmallScreenSidebar from "./smallScreenSidebar";
import Footer from "./boardFooter";
import { useCanvasStore } from "@/store/useCanvasStore";

export const STYLE_KEY_MAP: Record<string, string> = {
  Fill: "fillColor",
  "Stroke Color": "strokeColor",
  "Stroke Width": "strokeWidth",
  "Stroke Style": "strokeStyle",
  Opacity: "opacity",
  "Rounded Edges": "cornerRadius",
};

function ToolsSidebar() {
  const { selectedTool, openSidebar } = useToolStore();
  const { elements, selectedIds } = useCanvasStore();
  const selectedElements = selectedIds
    .map((id) => elements[id])
    .filter(Boolean);

  return (
    <>
      <AnimatePresence>
        <motion.div
          className={`md:hidden fixed z-20 left-1/2 -translate-x-1/2 bottom-24 flex justify-between gap-4 items-center`}
        >
          {openSidebar && (
            <motion.div
              key="sidebar-mobile"
              layout
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{
                duration: 0.15,
                type: "spring",
                stiffness: 200,
                damping: 20,
              }}
              className=""
            >
              <div className="">
                <SmallScreenSidebar selectedElements={selectedElements} />
              </div>
            </motion.div>
          )}
          <motion.div layout className="">
            <Footer />
          </motion.div>
        </motion.div>
      </AnimatePresence>

      <div className="flex-col justify-between items-start hidden md:flex fixed z-20 left-4 h-[calc(100vh-5rem)] top-16 pointer-events-none">
        <AnimatePresence mode="wait">
          {openSidebar && (
            <motion.div
              key="sidebar-desktop"
              layout
              initial={{ maxHeight: 0, opacity: 0, y: -8 }}
              animate={{ maxHeight: "90%", opacity: 1, y: 0 }}
              exit={{ maxHeight: 0, opacity: 0, y: -8 }}
              transition={{
                duration: 0.1,
                type: "spring",
                stiffness: 200,
                damping: 20,
              }}
              className="pointer-events-auto flex-col bg-card border border-border rounded-xl shadow-md
              lg:w-56 w-14 overflow-hidden"
            >
              <ScrollArea className="flex-1 h-full">
                <div className="flex flex-col gap-4 lg:gap-6 lg:items-start items-center lg:px-3 py-4 lg:py-6">
                  <div className="lg:hidden">
                    <SmallScreenSidebar selectedElements={selectedElements} />
                  </div>
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
                    <div className="space-y-2 lg:block hidden w-full">
                      <Label>Fill</Label>
                      <ColorOption items={ColorOptions} styleKey="fillColor" />
                    </div>
                  )}

                  {StrokeOptions.map((option) => (
                    <div
                      key={option.label}
                      className="space-y-2 lg:block hidden w-full"
                    >
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

                  {MoreOptions.map((option) => {
                    const show =
                      option.label === "Opacity" ||
                      (option.label === "Rounded Edges" &&
                        (selectedTool === "rect" ||
                          selectedTool === "diamond" ||
                          selectedElements
                            .map(
                              (el) =>
                                el.type === "diamond" || el.type === "rect",
                            )
                            .filter(Boolean).length > 0));

                    if (!show) return null;

                    return (
                      <div
                        key={option.label}
                        className="space-y-3 lg:block hidden w-full"
                      >
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

                  <div className="hidden lg:block w-full space-y-2">
                    <Label>Actions</Label>
                    <ButtonOptions items={ActionOptions} />
                  </div>
                </div>
              </ScrollArea>
            </motion.div>
          )}
        </AnimatePresence>
        <div className={`mt-auto pointer-events-auto`}>
          <Footer />
        </div>
      </div>
    </>
  );
}

export default ToolsSidebar;
