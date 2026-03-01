"use client";

import { MinusIcon, PlusIcon } from "lucide-react";
import { type HTMLMotionProps, motion, type SpringOptions } from "motion/react";
import * as React from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { SlidingNumber, SlidingNumberProps } from "./slidingNumber";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./tooltip";

export interface CounterProps extends Omit<HTMLMotionProps<"div">, "children"> {
  number: number;
  setNumber: (value: number) => void;
  transition?: SpringOptions;
  buttonProps?: Omit<React.ComponentProps<typeof Button>, "onClick">;
  slidingNumberProps?: Partial<SlidingNumberProps>;
}

export const Counter = React.forwardRef<HTMLDivElement, CounterProps>(
  (
    {
      number,
      setNumber,
      className,
      transition = { type: "spring", bounce: 0, stiffness: 300, damping: 30 },
      buttonProps,
      slidingNumberProps,
      ...props
    },
    ref,
  ) => {
    const handleDecrement = () => {
      setNumber(number > 10 ? number - 10 : 10);
    };

    const handleIncrement = () => {
      setNumber(number < 1000 ? number + 10 : 1000);
    };

    const resetCounter = () => {
      setNumber(100);
    };

    return (
      <TooltipProvider delayDuration={500}>
        <motion.div
          ref={ref}
          layout
          transition={transition}
          className={cn(
            "flex items-center gap-1 rounded-full border bg-card px-1.5 py-1",
            className,
          )}
          {...(props as any)}
        >
          <Tooltip>
            <TooltipTrigger asChild>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  size="icon"
                  variant="ghost"
                  className="size-8 rounded-full"
                  onClick={handleDecrement}
                  aria-label="Decrease"
                  {...buttonProps}
                >
                  <MinusIcon className="size-4" />
                </Button>
              </motion.div>
            </TooltipTrigger>
            <TooltipContent>
              <span className="text-xs">Zoom Out</span>
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={resetCounter}
                className="p-2 hover:bg-accent rounded cursor-pointer"
              >
                <SlidingNumber
                  number={number}
                  className="min-w-[2ch] text-center font-medium tabular-nums cursor-default"
                  {...slidingNumberProps}
                />
              </motion.div>
            </TooltipTrigger>
            <TooltipContent>
              <span className="text-xs">Reset</span>
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  size="icon"
                  variant="ghost"
                  className="size-8 rounded-full"
                  onClick={handleIncrement}
                  aria-label="Increase"
                  {...buttonProps}
                >
                  <PlusIcon className="size-4" />
                </Button>
              </motion.div>
            </TooltipTrigger>
            <TooltipContent>
              <span className="text-xs">Zoom In</span>
            </TooltipContent>
          </Tooltip>
        </motion.div>
      </TooltipProvider>
    );
  },
);

Counter.displayName = "Counter";

// Demo
export function Demo() {
  const [number, setNumber] = React.useState(42);

  return (
    <div className="fixed inset-0 flex items-center justify-center">
      <Counter number={number} setNumber={setNumber} />
    </div>
  );
}
