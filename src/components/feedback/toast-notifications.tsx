"use client";

import type { FC } from "react";
import { useState, createContext, useContext, useCallback } from "react";
import { IconNotification } from "@/components/application/notifications/notifications";

export type ToastType = "success" | "error" | "warning" | "info";

export interface ToastData {
  id: string;
  type: ToastType;
  title: string;
  message: string;
  duration?: number;
}

interface ToastContextType {
  showToast: (type: ToastType, title: string, message: string, duration?: number) => void;
  hideToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToastNotification = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToastNotification must be used within a ToastNotificationProvider");
  }
  return context;
};

const ToastItem: FC<{ toast: ToastData; onClose: () => void }> = ({ toast, onClose }) => {
  const colorMap: Record<ToastType, "success" | "error" | "warning" | "brand"> = {
    success: "success",
    error: "error",
    warning: "warning",
    info: "brand",
  };

  return (
    <div 
      className="animate-in slide-in-from-right-5 fade-in duration-300"
      style={{ "--width": "400px", "--z-index": "9999" } as React.CSSProperties}
    >
      <IconNotification
        title={toast.title}
        description={toast.message}
        color={colorMap[toast.type]}
        onClose={onClose}
        hideDismissLabel
      />
    </div>
  );
};

export const ToastNotificationProvider: FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastData[]>([]);

  const showToast = useCallback((type: ToastType, title: string, message: string, duration = 5000) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newToast: ToastData = { id, type, title, message, duration };
    
    setToasts((prev) => [...prev, newToast]);

    // Auto-remove after duration
    if (duration > 0) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, duration);
    }
  }, []);

  const hideToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast, hideToast }}>
      {children}
      {/* Toast Container */}
      {toasts.length > 0 && (
        <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-3">
          {toasts.map((toast) => (
            <ToastItem 
              key={toast.id} 
              toast={toast} 
              onClose={() => hideToast(toast.id)} 
            />
          ))}
        </div>
      )}
    </ToastContext.Provider>
  );
};
