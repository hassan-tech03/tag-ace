"use client";

import { createContext, useCallback, useContext, useMemo, useState, useEffect } from "react";

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const push = useCallback((opts) => {
    const id = Math.random().toString(36).slice(2);
    const toast = { id, type: "info", duration: 3500, ...opts };
    setToasts((cur) => [...cur, toast]);
    if (toast.duration > 0) {
      setTimeout(() => {
        setToasts((cur) => cur.filter((t) => t.id !== id));
      }, toast.duration);
    }
  }, []);

  const api = useMemo(
    () => ({
      success: (message) => push({ type: "success", message }),
      error: (message) => push({ type: "error", message }),
      info: (message) => push({ type: "info", message }),
    }),
    [push]
  );

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`px-3.5 py-2.5 rounded-md shadow-md text-sm border ${
              t.type === "success"
                ? "bg-emerald-50 border-emerald-200 text-emerald-900"
                : t.type === "error"
                ? "bg-red-50 border-red-200 text-red-900"
                : "bg-slate-50 border-slate-200 text-slate-900"
            }`}
          >
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    // Don't crash if used outside a provider (e.g. in storybook); return a no-op.
    return { success: () => {}, error: () => {}, info: () => {} };
  }
  return ctx;
}

// Helpful when migrating from window-level toasts.
export function useUnmountFlash(flash, deps = []) {
  const toast = useToast();
  useEffect(() => {
    if (flash) toast[flash.type || "info"](flash.message);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
