import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 active:scale-[0.97]",
  {
    variants: {
      variant: {
        default: "bg-gradient-to-r from-emerald-600 to-green-600 text-white hover:from-emerald-500 hover:to-green-500 shadow-[0_4px_16px_0_rgba(16,185,129,0.35)] hover:shadow-[0_8px_24px_0_rgba(16,185,129,0.5)] border border-emerald-400/30",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-sm",
        outline:
          "border border-input bg-background/80 backdrop-blur-md hover:bg-accent hover:text-accent-foreground",
        secondary:
          "backdrop-blur-xl bg-white/75 text-emerald-900 hover:bg-white/90 border border-white/60 shadow-sm",
        ghost: "hover:bg-emerald-50 hover:text-emerald-800",
        link: "text-primary underline-offset-4 hover:underline",
        glass: "backdrop-blur-2xl bg-white/70 hover:bg-white/90 text-emerald-900 border border-white/60 shadow-[0_8px_20px_0_rgba(0,0,0,0.06)]",
        glassPrimary: "relative overflow-hidden bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white border border-emerald-400/40 shadow-[0_8px_24px_-4px_rgba(16,185,129,0.45)] hover:shadow-[0_12px_28px_-2px_rgba(16,185,129,0.6)]",
        glassOutline: "backdrop-blur-xl bg-white/40 hover:bg-white/70 text-emerald-800 border border-emerald-600/30",
      },
      size: {
        default: "h-11 px-5 py-2.5",
        sm: "h-9 rounded-lg px-3.5 text-xs",
        lg: "h-13 rounded-2xl px-8 text-base",
        icon: "h-11 w-11 rounded-xl",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
