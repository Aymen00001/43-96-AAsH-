import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "../../utils/cn";
import { Button } from "./Button";
import { X } from "lucide-react";

const Dialog = ({ children, open, onOpenChange }) => {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 z-40 bg-black/50"
            onClick={() => onOpenChange(false)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
          <motion.div
            className="fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-lg border border-slate-200 bg-white shadow-lg"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
          >
            {children}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

const DialogTrigger = ({ children, onClick }) => children({ onClick });

const DialogContent = ({ children, className, ...props }) => (
  <div className={cn("", className)} {...props}>
    {children}
  </div>
);

const DialogHeader = ({ children, className, ...props }) => (
  <div
    className={cn("flex items-center justify-between border-b border-slate-200 p-6 pb-4", className)}
    {...props}
  >
    {children}
  </div>
);

const DialogFooter = ({ children, className, ...props }) => (
  <div
    className={cn("flex flex-col-reverse gap-3 border-t border-slate-200 p-4 sm:flex-row sm:justify-end", className)}
    {...props}
  >
    {children}
  </div>
);

const DialogTitle = ({ children, className, ...props }) => (
  <h2 className={cn("text-lg font-semibold text-slate-900", className)} {...props}>
    {children}
  </h2>
);

const DialogDescription = ({ children, className, ...props }) => (
  <p className={cn("text-sm text-slate-600", className)} {...props}>
    {children}
  </p>
);

const DialogClose = ({ onClick, className, ...props }) => (
  <button
    onClick={onClick}
    className={cn(
      "inline-flex items-center justify-center rounded-lg p-2 hover:bg-slate-100 transition-colors",
      className
    )}
    {...props}
  >
    <X size={20} />
  </button>
);

export {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  DialogClose,
};
