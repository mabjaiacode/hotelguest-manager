"use client";

import { ReactNode, useRef, useEffect, useCallback } from "react";

export function ModalForm({ title, buttonLabel, children }: { title: string; buttonLabel: string; children: ReactNode }) {
  const ref = useRef<HTMLDialogElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const closeDialog = useCallback(() => ref.current?.close(), []);

  useEffect(() => {
    const container = contentRef.current;
    if (!container) return;
    const form = container.querySelector("form");
    if (!form) return;

    const handler = () => {
      // Close dialog shortly after submit to allow revalidation
      setTimeout(closeDialog, 150);
    };
    form.addEventListener("formdata", handler);
    return () => form.removeEventListener("formdata", handler);
  }, [closeDialog]);

  return (
    <>
      <button type="button" onClick={() => ref.current?.showModal()}>{buttonLabel}</button>
      <dialog ref={ref} className="modal-dialog w-[min(760px,92vw)] rounded-2xl border border-slate-200 p-0 shadow-2xl backdrop:bg-slate-950/50">
        <div className="flex items-center justify-between gap-4 border-b border-slate-200 bg-slate-50 px-5 py-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-brand">Formulário</p>
            <h2 className="text-lg font-bold text-slate-950">{title}</h2>
          </div>
          <button className="btn-muted" type="button" onClick={closeDialog}>Fechar</button>
        </div>
        <div className="bg-white p-5" ref={contentRef}>{children}</div>
      </dialog>
    </>
  );
}
