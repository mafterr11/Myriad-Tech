import * as React from "react";

import { cn } from "@/lib/utils";

const Input = React.forwardRef(({ className, type, ...props }, ref) => {
  return (
    <input
      type={type}
      className={cn(
        "border-slate-200 file:bg-transparent placeholder:text-slate-500  flex h-[54px] w-full rounded-[8px] border bg-white px-4 py-2 text-base ring-offset-white file:border-0 file:text-sm file:font-medium disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      ref={ref}
      {...props}
    />
  );
});
Input.displayName = "Input";

export { Input };
