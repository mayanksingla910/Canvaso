"use client";
import { useToolStore } from "@/store/useToolStore";
import { AnimatePresence, motion } from "motion/react";
import { ScrollArea } from "../ui/scroll-area";
import ToggleOptions from "./toggleOptions";
import SliderOption from "./sliderOption";
import ButtonOptions from "./buttonOptions";
import ColorOption from "./colorOption";
import { Label } from "../ui/label";
import {
  ActionOptions,
  ColorOptions,
  MoreOptions,
  SliderTypeSettings,
  StrokeOptions,
} from "./ToolOptions";
import SmallScreenSidebar from "./smallScreenSidebar";
import Footer from "../boardFooter";

function ToolsSidebar() {
  const { openSidebar } = useToolStore();

  return (
    <>
      <AnimatePresence>
        {openSidebar && (
          <motion.div
            key="sidebar-mobile"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.15, ease: [0.32, 0.72, 0, 1] }}
            className="md:hidden fixed z-20 left-1/2 -translate-x-1/2 bottom-24 flex justify-between gap-4 items-center"
          >
            <div className="">
              <SmallScreenSidebar />
            </div>
            <Footer />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        <div className="h-[calc(100vh-5rem)] flex-col justify-between items-start hidden md:flex fixed z-20 top-16 left-4">
          {openSidebar && (
            <motion.div
              key="sidebar-desktop"
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              transition={{ duration: 0.15, ease: [0.32, 0.72, 0, 1] }}
              className="
              flex-col bg-card border border-border rounded-xl shadow-md
              lg:w-56 w-14
              max-h-[calc(100vh-5rem)] overflow-hidden"
            >
              <ScrollArea className="flex-1">
                <div className="flex flex-col gap-4 lg:gap-6 lg:items-start items-center lg:px-3 py-4 lg:py-6">
                  <div className="lg:hidden">
                    <SmallScreenSidebar />
                  </div>

                  <div className="space-y-2 lg:block hidden w-full">
                    <Label>Fill</Label>
                    <ColorOption items={ColorOptions} />
                  </div>

                  {StrokeOptions.map((option) => (
                    <div
                      key={option.label}
                      className="space-y-2 lg:block hidden w-full"
                    >
                      <Label>{option.label}</Label>
                      {option.type === "color" && (
                        <ColorOption items={option.options} />
                      )}
                      {option.type === "toggle" && (
                        <ToggleOptions items={option.options} />
                      )}
                    </div>
                  ))}

                  {MoreOptions.map((option) => (
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
                      />
                    </div>
                  ))}

                  <div className="hidden lg:block w-full space-y-2">
                    <Label>Actions</Label>
                    <ButtonOptions items={ActionOptions} />
                  </div>
                </div>
              </ScrollArea>
            </motion.div>
          )}
          <Footer />
        </div>
      </AnimatePresence>
    </>
  );
}

export default ToolsSidebar;
