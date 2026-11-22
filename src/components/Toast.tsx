"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { CheckCircle2, AlertCircle, X, Info } from "lucide-react";

type ToastType = "success" | "error" | "info";

interface ToastMessage {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
}

interface ToastContextValue {
  toast: (options: { message: string; title?: string; type?: ToastType }) => void;
  success: (message: string, title?: string) => void;
  error: (message: string, title?: string) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(
    ({
      message,
      title,
      type = "info",
    }: {
      message: string;
      title?: string;
      type?: ToastType;
    }) => {
      const id = Math.random().toString(36).substring(2, 9);
      setToasts((prev) => [...prev, { id, type, title, message }]);

      setTimeout(() => {
        removeToast(id);
      }, 4000);
    },
    [removeToast]
  );

  const value = {
    toast: addToast,
    success: (message: string, title?: string) =>
      addToast({ message, title, type: "success" }),
    error: (message: string, title?: string) =>
      addToast({ message, title, type: "error" }),
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            role="alert"
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl shadow-lg border transition-all duration-300 transform translate-y-0 opacity-100 ${
              t.type === "success"
                ? "bg-white border-green-200 text-neutral-900"
                : t.type === "error"
                ? "bg-white border-red-200 text-neutral-900"
                : "bg-white border-blue-200 text-neutral-900"
            }`}
          >
            {t.type === "success" && (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            )}
            {t.type === "error" && (
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            )}
            {t.type === "info" && (
              <Info className="w-5 h-5 text-[#307cff] shrink-0 mt-0.5" />
            )}
            <div className="flex-1 min-w-0">
              {t.title && (
                <h5 className="font-semibold text-sm leading-tight mb-0.5">
                  {t.title}
                </h5>
              )}
              <p className="text-sm text-neutral-600 leading-snug">{t.message}</p>
            </div>
            <button
              onClick={() => removeToast(t.id)}
              className="text-neutral-400 hover:text-neutral-600 p-1 rounded-md transition"
              aria-label="Tutup"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
