"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "@/lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
  variant?: "default" | "ghost";
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(
          "inline-flex items-center justify-center font-semibold transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed",
          variant === "default" &&
            "w-full rounded-xl bg-gradient-to-r from-[#4f46e5] to-[#7c3aed] text-white text-base py-3.5 px-5 hover:opacity-90",
          variant === "ghost" &&
            "text-[13px] text-[#6366f1] font-semibold hover:underline",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button };
