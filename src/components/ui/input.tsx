"use client";
import * as React from "react";

import { cn } from "@/lib/utils";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "input-enhanced flex h-10 w-full rounded-lg border border-input bg-background px-4 py-2 body-small",
          "ring-offset-background file:text-foreground placeholder:text-muted-foreground",
          "file:border-0 file:bg-transparent file:text-sm file:font-medium",
          "focus-ring transition-all duration-200",
          "hover:border-input-hover hover:bg-background/80",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "md:body-small",
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";

export { Input };
