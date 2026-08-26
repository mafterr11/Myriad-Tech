import * as React from "react";
import * as ToastPrimitives from "@radix-ui/react-toast";
import { cva } from "class-variance-authority";
import { X, Check, TriangleAlert, Info } from "lucide-react";

import { cn } from "@/lib/utils";

// Reworked off the stock shadcn toast, which arrived in slate/white with a
// `dark:` palette. The site declares `colorScheme: "light"` and has no dark
// theme, but Tailwind resolves `dark:` through `prefers-color-scheme` all the
// same -- so on a machine set to dark mode the toast turned near-black while
// every other surface stayed paper. No `dark:` variants here.
//
// The shape follows `.paper-panel`: hairline border, square corners, hard
// offset shadow. A coloured rail down the left edge and a matching glyph carry
// the status, so it reads at a glance without a shouting red box.

const ToastProvider = ToastPrimitives.Provider;

const ToastViewport = React.forwardRef(({ className, ...props }, ref) => (
  <ToastPrimitives.Viewport
    ref={ref}
    className={cn(
      "fixed top-0 z-100 flex max-h-screen w-full flex-col-reverse gap-3 p-4 sm:top-auto sm:right-0 sm:bottom-0 sm:flex-col sm:p-6 md:max-w-[26rem]",
      className,
    )}
    {...props}
  />
));
ToastViewport.displayName = ToastPrimitives.Viewport.displayName;

const toastVariants = cva(
  "group pointer-events-auto relative flex w-full items-start gap-4 overflow-hidden rounded-[2px] border bg-white p-5 pl-6 pr-10 text-ink shadow-[10px_10px_0_rgba(103,72,57,0.10)] transition-all data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=move]:transition-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-top-full sm:data-[state=open]:slide-in-from-bottom-full",
  {
    variants: {
      variant: {
        default: "border-line",
        success: "border-line",
        destructive: "border-red/45",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

const RAIL = {
  default: "bg-accent",
  success: "bg-teal",
  destructive: "bg-red",
};

const GLYPH_BOX = {
  default: "border-accent/25 bg-accent/10 text-accent",
  success: "border-teal/30 bg-teal/10 text-teal",
  destructive: "border-red/30 bg-red/10 text-red",
};

const GLYPH = {
  default: Info,
  success: Check,
  destructive: TriangleAlert,
};

const PROGRESS = {
  default: "bg-accent/30",
  success: "bg-teal/35",
  destructive: "bg-red/35",
};

const Toast = React.forwardRef(
  ({ className, variant, children, ...props }, ref) => {
    const key = variant ?? "default";
    const Glyph = GLYPH[key] ?? GLYPH.default;

    return (
      <ToastPrimitives.Root
        ref={ref}
        className={cn(toastVariants({ variant }), className)}
        {...props}
      >
        <span
          className={cn(
            "absolute inset-y-0 left-0 w-[3px]",
            RAIL[key] ?? RAIL.default,
          )}
          aria-hidden="true"
        />
        <span
          className={cn(
            "flex h-9 w-9 shrink-0 items-center justify-center rounded-[2px] border",
            GLYPH_BOX[key] ?? GLYPH_BOX.default,
          )}
          aria-hidden="true"
        >
          <Glyph size={17} strokeWidth={2.4} />
        </span>
        {children}
        {/* Runs down in step with Radix's own dismiss timer, which the Toaster
          pins to the same 5s. Radix pauses that timer on hover, so the bar
          pauses with it. */}
        <span
          className={cn(
            "toast-progress absolute bottom-0 left-0 h-[2px] w-full origin-left",
            PROGRESS[key] ?? PROGRESS.default,
          )}
          aria-hidden="true"
        />
      </ToastPrimitives.Root>
    );
  },
);
Toast.displayName = ToastPrimitives.Root.displayName;

const ToastAction = React.forwardRef(({ className, ...props }, ref) => (
  <ToastPrimitives.Action
    ref={ref}
    className={cn(
      "focus-ring font-recursive hover:text-body group-[.destructive]:border-red/40 hover:group-[.destructive]:bg-red inline-flex h-8 shrink-0 items-center justify-center rounded-[2px] border border-black/20 px-3 text-xs font-bold tracking-[0.14em] uppercase transition-colors hover:bg-black hover:group-[.destructive]:text-white disabled:pointer-events-none disabled:opacity-50",
      className,
    )}
    {...props}
  />
));
ToastAction.displayName = ToastPrimitives.Action.displayName;

const ToastClose = React.forwardRef(({ className, ...props }, ref) => (
  <ToastPrimitives.Close
    ref={ref}
    className={cn(
      // Stock kept this at opacity 0 until hover, which leaves no way to
      // dismiss a toast on a touch screen. It is always visible now.
      "focus-ring hover:text-accent absolute top-2.5 right-2.5 rounded-[2px] p-1.5 text-black/35 transition-colors",
      className,
    )}
    toast-close=""
    {...props}
  >
    <X className="h-4 w-4" />
  </ToastPrimitives.Close>
));
ToastClose.displayName = ToastPrimitives.Close.displayName;

const ToastTitle = React.forwardRef(({ className, ...props }, ref) => (
  <ToastPrimitives.Title
    ref={ref}
    className={cn(
      "font-recursive text-ink text-[0.95rem] leading-tight font-bold tracking-[-0.01em]",
      className,
    )}
    {...props}
  />
));
ToastTitle.displayName = ToastPrimitives.Title.displayName;

const ToastDescription = React.forwardRef(({ className, ...props }, ref) => (
  <ToastPrimitives.Description
    ref={ref}
    className={cn("text-sm leading-relaxed text-black/65", className)}
    {...props}
  />
));
ToastDescription.displayName = ToastPrimitives.Description.displayName;

export {
  ToastProvider,
  ToastViewport,
  Toast,
  ToastTitle,
  ToastDescription,
  ToastClose,
  ToastAction,
};
