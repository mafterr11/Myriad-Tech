import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";

import { cn } from "@/lib/utils";

const Tabs = TabsPrimitive.Root;

const TabsList = React.forwardRef(({ className, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn(
      "flex w-full flex-wrap items-stretch justify-start gap-2 bg-transparent p-0",
      className,
    )}
    {...props}
  />
));
TabsList.displayName = TabsPrimitive.List.displayName;

const TabsTrigger = React.forwardRef(({ className, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(
      "focus-ring group relative inline-flex min-h-12 flex-1 items-center justify-center gap-2 overflow-hidden rounded-[2px] border border-line bg-white/45 px-4 py-3 text-xs font-bold tracking-[0.08em] whitespace-nowrap text-black/60 uppercase shadow-[2px_2px_0_rgba(103,72,57,0.08)] transition-[color,background-color,border-color,box-shadow,transform] duration-200 before:absolute before:inset-x-0 before:bottom-0 before:h-[3px] before:origin-left before:scale-x-0 before:bg-teal before:transition-transform before:duration-200 before:content-[''] hover:-translate-y-0.5 hover:border-accent/55 hover:bg-white/85 hover:text-accent hover:shadow-[4px_4px_0_rgba(103,72,57,0.12)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal disabled:pointer-events-none disabled:opacity-50 data-[state=active]:-translate-y-0.5 data-[state=active]:border-accent data-[state=active]:bg-accent data-[state=active]:text-white data-[state=active]:shadow-[4px_4px_0_rgba(103,72,57,0.2)] data-[state=active]:before:scale-x-100 motion-reduce:transform-none motion-reduce:transition-none motion-reduce:before:transition-none sm:text-sm",
      className,
    )}
    {...props}
  />
));
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName;

const TabsContent = React.forwardRef(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      "mt-6 ring-offset-white data-[state=active]:animate-in data-[state=active]:fade-in-0 data-[state=active]:slide-in-from-bottom-1 data-[state=active]:duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal motion-reduce:animate-none",
      className,
    )}
    {...props}
  />
));
TabsContent.displayName = TabsPrimitive.Content.displayName;

export { Tabs, TabsList, TabsTrigger, TabsContent };
