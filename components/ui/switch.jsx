import * as React from "react";
import * as SwitchPrimitives from "@radix-ui/react-switch";

import { cn } from "@/lib/utils";

const Switch = React.forwardRef(({ className, ...props }, ref) => (
  <SwitchPrimitives.Root
    className={cn(
      "peer data-[state=checked]:bg-grey-light border-accent data-[state=unchecked]:bg-body inline-flex h-6 w-[3.2rem] shrink-0 cursor-pointer items-center rounded-[4px] border transition-colors focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 focus-visible:ring-offset-white focus-visible:outline-hidden disabled:cursor-not-allowed disabled:opacity-50",
      className,
    )}
    {...props}
    ref={ref}
  >
    <SwitchPrimitives.Thumb
      className={cn(
        "bg-accent pointer-events-none block h-5 w-5 rounded-[4px] ring-0 shadow-lg transition-transform data-[state=checked]:translate-x-[1.70rem] data-[state=unchecked]:translate-x-[0.10rem]",
      )}
    />
  </SwitchPrimitives.Root>
));
Switch.displayName = SwitchPrimitives.Root.displayName;

export { Switch };
