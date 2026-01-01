"use client";

import type { FC } from "react";
import { useState, useEffect, createContext, useContext, useCallback } from "react";
import { TickCircle, CloseCircle, InfoCircle, Warning2, CloseSquare } from "iconsax-react";
import { cx } from "@/utils/cx";

// Toast types
export type ToastType = "success" | "error" | "warning" | "info";

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

interface ToastContextType {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, "id">) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};

// Toast item component
const ToastItem: FC<{ toast: Toast; onRemove: (id: string) => void }> = ({ toast, onRemove }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onRemove(toast.id);
    }, toast.duration || 5000);
    return () => clearTimeout(timer);
  }, [toast.id, toast.duration, onRemove]);

  const icons = {
    success: <TickCircle size={20} color="#12B76A" variant="Bold" />,
    error: <CloseCircle size={20} color="#F04438" variant="Bold" />,
    warning: <Warning2 size={20} color="#F79009" variant="Bold" />,
    info: <InfoCircle size={20} color="#0BA5EC" variant="Bold" />,
  };

  const bgColors = {
    success: "bg-utility-success-50 border-utility-success-200",
    error: "bg-utility-error-50 border-utility-error-200",
    warning: "bg-utility-warning-50 border-utility-warning-200",
    info: "bg-utility-blue-light-50 border-utility-blue-light-200",
  };

  return (
    <div
      className={cx(
        "flex items-start gap-3 rounded-xl border p-4 shadow-lg animate-in slide-in-from-bottom-5 fade-in duration-300",
        bgColors[toast.type]
      )}
    >
      <div className="flex-shrink-0 mt-0.5">{icons[toast.type]}</div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-primary">{toast.title}</p>
        {toast.message && (
          <p className="text-sm text-tertiary mt-0.5">{toast.message}</p>
        )}
      </div>
      <button
        onClick={() => onRemove(toast.id)}
        className="flex-shrink-0 text-quaternary hover:text-secondary transition-colors"
      >
        <CloseSquare size={18} color="currentColor" variant="Outline" />
      </button>
    </div>
  );
};

// Toast container
export const ToastContainer: FC = () => {
  const { toasts, removeToast } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-md w-full pointer-events-none">
      {toasts.map((toast) => (
        <div key={toast.id} className="pointer-events-auto">
          <ToastItem toast={toast} onRemove={removeToast} />
        </div>
      ))}
    </div>
  );
};

// Toast provider
export const ToastProvider: FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((toast: Omit<Toast, "id">) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { ...toast, id }]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <ToastContainer />
    </ToastContext.Provider>
  );
};

// Convenience functions for direct use
export const toast = {
  success: (title: string, message?: string, duration?: number) => {
    // This will be overridden by the hook
    console.warn("Toast not initialized. Use useToast hook instead.");
  },
  error: (title: string, message?: string, duration?: number) => {
    console.warn("Toast not initialized. Use useToast hook instead.");
  },
  warning: (title: string, message?: string, duration?: number) => {
    console.warn("Toast not initialized. Use useToast hook instead.");
  },
  info: (title: string, message?: string, duration?: number) => {
    console.warn("Toast not initialized. Use useToast hook instead.");
  },
};
