import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex cursor-pointer items-center justify-center whitespace-nowrap rounded-[2px] text-sm font-bold tracking-[0.04em] ring-offset-white transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal disabled:pointer-events-none disabled:opacity-50 motion-reduce:transition-none",
  {
    variants: {
      variant: {
        default:
          "bg-accent text-white shadow-button hover:-translate-y-0.5 hover:bg-[#51362a] hover:shadow-none",
        secondary:
          "border border-black/25 bg-transparent text-black hover:-translate-y-0.5 hover:bg-black hover:text-body hover:shadow-button",
        ghost:
          "border border-transparent bg-transparent text-black hover:border-line hover:bg-white/50",
      },
      size: {
        default: "min-w-[166px] px-6 py-3.5",
        sm: "h-10 px-4",
        lg: "h-12 px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

const Button = React.forwardRef(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
