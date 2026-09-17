"use client";

import { useState, useRef, useTransition } from "react";
import { saveGuestAction } from "@/lib/actions";

export function GuestModalForm({ existingDocuments }: { existingDocuments: string[] }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [fullName, setFullName] = useState("");
  const [document, setDocument] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [isPending, startTransition] = useTransition();

  const isDuplicateDoc =
    document.trim() !== "" &&
    existingDocuments.some((d) => d.toLowerCase() === document.trim().toLowerCase());

  function openModal() {
    setFullName("");
    setDocument("");
    setPhone("");
    setEmail("");
    setAddress("");
    dialogRef.current?.showModal();
  }

  function closeModal() {
    dialogRef.current?.close();
  }

  function handleSubmit(formData: FormData) {
    if (isDuplicateDoc || !fullName.trim() || !document.trim() || !phone.trim()) return;
    startTransition(async () => {
      await saveGuestAction(formData);
      closeModal();
    });
  }

  return (
    <>
      <button type="button" onClick={openModal}>
        Criar hóspede
      </button>

      <dialog
        ref={dialogRef}
        className="modal-dialog w-[min(760px,92vw)] rounded-2xl border border-slate-200 p-0 shadow-2xl backdrop:bg-slate-950/50"
      >
        <div className="flex items-center justify-between gap-4 border-b border-slate-200 bg-slate-50 px-5 py-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-brand">Formulário</p>
            <h2 className="text-lg font-bold text-slate-950">Novo hóspede</h2>
          </div>
          <button className="btn-muted" type="button" onClick={closeModal}>
            Fechar
          </button>
        </div>

        <div className="bg-white p-5">
          <form action={handleSubmit} className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700">
                Nome completo <span className="text-red-500">*</span>
              </label>
              <input
                name="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Ex: Maria Fernandes"
                required
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700">
                Documento/BI <span className="text-red-500">*</span>
              </label>
              <input
                name="document"
                value={document}
                onChange={(e) => setDocument(e.target.value)}
                placeholder="Ex: 110100001A"
                required
                className={isDuplicateDoc ? "border-red-500 ring-2 ring-red-100" : ""}
              />
              {isDuplicateDoc && (
                <div className="mt-1.5 flex items-center gap-1.5 rounded-lg bg-red-50 p-2 text-xs font-medium text-red-700 ring-1 ring-red-200">
                  <span>⚠️</span>
                  <span>
                    Já existe um hóspede cadastrado com o documento <strong>{document}</strong>!
                  </span>
                </div>
              )}
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700">
                Telefone <span className="text-red-500">*</span>
              </label>
              <input
                name="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Ex: +258 84 123 4567"
                required
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700">Email</label>
              <input
                name="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Ex: maria@example.com"
              />
            </div>

            <div className="md:col-span-2">
              <label className="mb-1 block text-xs font-semibold text-slate-700">Endereço</label>
              <input
                name="address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Ex: Av. Eduardo Mondlane, Maputo"
              />
            </div>

            <div className="md:col-span-2 flex items-center justify-end gap-3 pt-2">
              <button className="btn-muted" type="button" onClick={closeModal}>
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isDuplicateDoc || !fullName.trim() || !document.trim() || !phone.trim() || isPending}
                className={isDuplicateDoc ? "opacity-50 cursor-not-allowed" : ""}
              >
                {isPending ? "A guardar..." : "Salvar hóspede"}
              </button>
            </div>
          </form>
        </div>
      </dialog>
    </>
  );
}
