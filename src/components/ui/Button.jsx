import React from "react";
import { cva } from "class-variance-authority";
import { cn } from "../../utils/cn";

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-base font-medium transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800 shadow-md hover:shadow-lg",
        secondary: "bg-apple-200 text-apple-900 hover:bg-apple-300 active:bg-apple-400",
        danger: "bg-red-600 text-white hover:bg-red-700 active:bg-red-800",
        outline: "border border-apple-300 text-apple-900 hover:bg-apple-50 active:bg-apple-100",
        ghost: "text-apple-900 hover:bg-apple-100 active:bg-apple-200",
      },
      size: {
        default: "px-6 py-2.5 text-base",
        sm: "px-4 py-1.5 text-sm",
        lg: "px-8 py-3 text-lg",
        icon: "p-2 h-auto w-auto",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

const Button = React.forwardRef(
  ({ className, variant, size, ...props }, ref) => (
    <button
      className={cn(buttonVariants({ variant, size, className }))}
      ref={ref}
      {...props}
    />
  )
);

Button.displayName = "Button";

export { Button, buttonVariants };
