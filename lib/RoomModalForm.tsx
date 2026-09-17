"use client";

import { useState, useRef, useTransition } from "react";
import { saveRoomAction } from "@/lib/actions";
import { ROOM_TYPES } from "@/lib/constants";

export function RoomModalForm({ existingNumbers }: { existingNumbers: string[] }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [number, setNumber] = useState("");
  const [type, setType] = useState<string>(ROOM_TYPES[0]);
  const [capacity, setCapacity] = useState(2);
  const [pricePerDay, setPricePerDay] = useState("2500");
  const [status, setStatus] = useState("LIVRE");
  const [isPending, startTransition] = useTransition();

  const isDuplicate = number.trim() !== "" && existingNumbers.includes(number.trim());

  function handleNumberChange(e: React.ChangeEvent<HTMLInputElement>) {
    // Only allow numbers (strip any non-digit characters)
    const cleaned = e.target.value.replace(/\D/g, "");
    setNumber(cleaned);
  }

  function handleNumberKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    // Allow navigation keys, backspace, tab, delete
    if (
      ["Backspace", "Tab", "Delete", "ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Enter"].includes(
        e.key
      ) ||
      (e.ctrlKey || e.metaKey)
    ) {
      return;
    }
    // Block non-digits
    if (!/^\d$/.test(e.key)) {
      e.preventDefault();
    }
  }

  function openModal() {
    setNumber("");
    setType(ROOM_TYPES[0]);
    setCapacity(2);
    setPricePerDay("2500");
    setStatus("LIVRE");
    dialogRef.current?.showModal();
  }

  function closeModal() {
    dialogRef.current?.close();
  }

  function handleSubmit(formData: FormData) {
    if (isDuplicate || !number) return;
    startTransition(async () => {
      await saveRoomAction(formData);
      closeModal();
    });
  }

  return (
    <>
      <button type="button" onClick={openModal}>
        Criar quarto
      </button>

      <dialog
        ref={dialogRef}
        className="modal-dialog w-[min(760px,92vw)] rounded-2xl border border-slate-200 p-0 shadow-2xl backdrop:bg-slate-950/50"
      >
        <div className="flex items-center justify-between gap-4 border-b border-slate-200 bg-slate-50 px-5 py-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-brand">Formulário</p>
            <h2 className="text-lg font-bold text-slate-950">Novo quarto</h2>
          </div>
          <button className="btn-muted" type="button" onClick={closeModal}>
            Fechar
          </button>
        </div>

        <div className="bg-white p-5">
          <form action={handleSubmit} className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700">
                Número do quarto <span className="text-red-500">* (apenas números)</span>
              </label>
              <input
                name="number"
                value={number}
                onChange={handleNumberChange}
                onKeyDown={handleNumberKeyDown}
                placeholder="Ex: 101, 202"
                inputMode="numeric"
                pattern="[0-9]+"
                required
                className={isDuplicate ? "border-red-500 ring-2 ring-red-100" : ""}
              />
              {isDuplicate && (
                <div className="mt-1.5 flex items-center gap-1.5 rounded-lg bg-red-50 p-2 text-xs font-medium text-red-700 ring-1 ring-red-200">
                  <span>⚠️</span>
                  <span>
                    O quarto número <strong>{number}</strong> já existe no sistema! Escolha outro número.
                  </span>
                </div>
              )}
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700">
                Tipo de quarto <span className="text-red-500">*</span>
              </label>
              <select
                name="type"
                value={type}
                onChange={(e) => setType(e.target.value)}
                required
              >
                {ROOM_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700">
                Capacidade (pessoas) <span className="text-red-500">*</span>
              </label>
              <input
                name="capacity"
                type="number"
                min="1"
                max="20"
                value={capacity}
                onChange={(e) => setCapacity(Number(e.target.value))}
                required
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700">
                Preço por dia (MZN) <span className="text-red-500">*</span>
              </label>
              <input
                name="pricePerDay"
                type="number"
                min="1"
                step="0.01"
                value={pricePerDay}
                onChange={(e) => setPricePerDay(e.target.value)}
                required
              />
            </div>

            <div className="md:col-span-2">
              <label className="mb-1 block text-xs font-semibold text-slate-700">
                Estado inicial
              </label>
              <select
                name="status"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="LIVRE">Livre</option>
                <option value="OCUPADO">Ocupado</option>
                <option value="MANUTENCAO">Manutenção</option>
              </select>
            </div>

            <div className="md:col-span-2 flex items-center justify-end gap-3 pt-2">
              <button className="btn-muted" type="button" onClick={closeModal}>
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isDuplicate || !number || isPending}
                className={isDuplicate ? "opacity-50 cursor-not-allowed" : ""}
              >
                {isPending ? "A guardar..." : "Salvar quarto"}
              </button>
            </div>
          </form>
        </div>
      </dialog>
    </>
  );
}
