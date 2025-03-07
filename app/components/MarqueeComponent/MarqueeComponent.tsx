"use client";

import * as React from "react";
import { cn } from "../../lib/utils";

interface MarqueeProps extends React.HTMLAttributes<HTMLDivElement> {
  direction?: "left" | "right";
  speed?: "slow" | "normal" | "fast";
  pauseOnHover?: boolean;
}

const Marquee = React.forwardRef<HTMLDivElement, MarqueeProps>(
  (
    {
      children,
      direction = "left",
      speed = "normal",
      pauseOnHover = true,
      className,
      ...props
    },
    ref
  ) => {
    const speedMap = {
      slow: "20s",
      normal: "15s",
      fast: "10s",
    };

    const directionMap = {
      left: "marquee-left",
      right: "marquee-right",
    };

    return (
      <div
        ref={ref}
        className={cn(
          "group relative flex w-full overflow-hidden border-y-2 border-black bg-primary/10",
          className
        )}
        {...props}
      >
        <div
          className={cn(
            "animate-[marquee_linear_infinite] flex min-w-full shrink-0 items-center justify-around gap-4 py-3",
            directionMap[direction],
            pauseOnHover && "group-hover:[animation-play-state:paused]"
          )}
          style={{
            animationDuration: speedMap[speed],
          }}
        >
          {children}
        </div>
        <div
          className={cn(
            "animate-[marquee_linear_infinite] flex min-w-full shrink-0 items-center justify-around gap-4 py-3",
            directionMap[direction],
            pauseOnHover && "group-hover:[animation-play-state:paused]"
          )}
          style={{
            animationDuration: speedMap[speed],
          }}
        >
          {children}
        </div>
      </div>
    );
  }
);

Marquee.displayName = "Marquee";

export { Marquee };
