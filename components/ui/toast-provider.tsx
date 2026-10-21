"use client";

import * as React from "react";
import * as ToastPrimitive from "@radix-ui/react-toast";
import { X } from "lucide-react";

import { cn } from "@/lib/utils";

type ToastVariant = "default" | "destructive";

interface ToastData {
  id: string;
  title?: string;
  description?: string;
  variant: ToastVariant;
}

interface ToastContextValue {
  toasts: ToastData[];
  addToast: (t: Omit<ToastData, "id" | "variant"> & { variant?: ToastVariant }) => void;
  dismiss: (id: string) => void;
}

const ToastContext = React.createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<ToastData[]>([]);

  const addToast = React.useCallback(
    (t: Omit<ToastData, "id" | "variant"> & { variant?: ToastVariant }) => {
      const id = crypto.randomUUID();
      setToasts((prev) => [...prev, { id, variant: "default", ...t }]);
    },
    [],
  );

  const dismiss = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, addToast, dismiss }}>
      {children}
      <ToastPrimitive.Provider>
        {toasts.map((toast) => (
          <ToastPrimitive.Root
            key={toast.id}
            open
            onOpenChange={(open) => {
              if (!open) dismiss(toast.id);
            }}
            className={cn(
              "group pointer-events-auto relative flex w-full items-center justify-between gap-3 rounded-md border bg-background p-4 text-sm shadow-lg",
              toast.variant === "destructive" && "border-destructive/30",
            )}
          >
            <div className="grid gap-1">
              {toast.title && (
                <ToastPrimitive.Title className="text-sm font-semibold">
                  {toast.title}
                </ToastPrimitive.Title>
              )}
              {toast.description && (
                <ToastPrimitive.Description className="text-sm opacity-90">
                  {toast.description}
                </ToastPrimitive.Description>
              )}
            </div>
            <ToastPrimitive.Close className="rounded-md p-1 text-foreground/50 hover:text-foreground">
              <X className="h-4 w-4" />
            </ToastPrimitive.Close>
          </ToastPrimitive.Root>
        ))}
        <ToastPrimitive.Viewport className="fixed top-0 right-0 z-[100] flex max-h-screen w-full flex-col gap-2 p-4 sm:max-w-[380px]" />
      </ToastPrimitive.Provider>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = React.useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return ctx;
}
