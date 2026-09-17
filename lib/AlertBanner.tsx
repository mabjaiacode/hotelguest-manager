"use client";

import { useState } from "react";

export function AlertBanner({
  type,
  message,
  detail
}: {
  type: "error" | "success" | "warning";
  message: string;
  detail?: string;
}) {
  const [visible, setVisible] = useState(true);

  if (!visible) return null;

  const styles = {
    error: "border-red-200 bg-red-50/95 text-red-900 ring-1 ring-red-200",
    warning: "border-amber-200 bg-amber-50/95 text-amber-900 ring-1 ring-amber-200",
    success: "border-emerald-200 bg-emerald-50/95 text-emerald-900 ring-1 ring-emerald-200"
  };

  const icons = {
    error: "⚠️",
    warning: "⚡",
    success: "✅"
  };

  return (
    <div
      role="alert"
      className={`flex items-start justify-between gap-3 rounded-xl border p-4 shadow-sm transition-all duration-200 ${styles[type]}`}
    >
      <div className="flex items-start gap-3">
        <span className="text-xl leading-none select-none">{icons[type]}</span>
        <div>
          <p className="font-semibold text-sm leading-tight">{message}</p>
          {detail && <p className="mt-1 text-xs opacity-90 leading-normal">{detail}</p>}
        </div>
      </div>
      <button
        type="button"
        onClick={() => setVisible(false)}
        className="!bg-transparent !p-1 !text-slate-500 hover:!text-slate-900 !shadow-none !ring-0 text-xs font-bold leading-none cursor-pointer"
        aria-label="Fechar alerta"
      >
        ✕
      </button>
    </div>
  );
}
