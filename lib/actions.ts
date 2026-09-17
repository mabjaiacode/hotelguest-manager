"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createSession, destroySession, requireUserId } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

import { ROOM_TYPES } from "@/lib/constants";

const roomSchema = z.object({
  id: z.string().optional(),
  number: z
    .string()
    .trim()
    .min(1, "O número do quarto é obrigatório.")
    .regex(/^\d+$/, "O número do quarto deve conter apenas dígitos numéricos (0-9)."),
  type: z.enum(ROOM_TYPES as unknown as [string, ...string[]], {
    errorMap: () => ({ message: "Selecione um tipo de quarto válido." })
  }),
  capacity: z.coerce.number().int().positive("A capacidade deve ser um número inteiro positivo."),
  pricePerDay: z.coerce.number().positive("O preço por dia deve ser um valor positivo."),
  status: z.enum(["LIVRE", "OCUPADO", "MANUTENCAO"])
});

const guestSchema = z.object({
  id: z.string().optional(),
  fullName: z.string().trim().min(3, "O nome deve ter pelo menos 3 caracteres."),
  document: z.string().trim().min(4, "O documento/BI deve ter pelo menos 4 caracteres."),
  phone: z.string().trim().min(7, "O telefone deve ter pelo menos 7 caracteres."),
  email: z.string().email().optional().or(z.literal("")),
  address: z.string().optional()
});

const reservationSchema = z.object({
  guestId: z.string().min(1),
  roomId: z.string().min(1),
  checkIn: z.coerce.date(),
  checkOut: z.coerce.date(),
  status: z.enum(["PENDENTE", "CONFIRMADA", "CHECKIN", "CHECKOUT", "CANCELADA"]),
  notes: z.string().optional()
});

export async function loginAction(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    redirect("/login?erro=credenciais");
  }

  await createSession(user.id);
  redirect("/dashboard");
}

export async function logoutAction() {
  await destroySession();
  redirect("/login");
}

export async function saveRoomAction(formData: FormData) {
  await requireUserId();
  const parsed = roomSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    const errorMsg = parsed.error.errors[0]?.message || "Dados do quarto inválidos.";
    redirect(`/dashboard/quartos?erro=${encodeURIComponent(errorMsg)}`);
  }

  const { id, ...data } = parsed.data;

  // Check if room number already exists for another room
  const existing = await prisma.room.findUnique({
    where: { number: data.number }
  });

  if (existing && existing.id !== id) {
    redirect(`/dashboard/quartos?erro=duplicado&num=${encodeURIComponent(data.number)}`);
  }

  try {
    if (id) {
      await prisma.room.update({ where: { id }, data });
    } else {
      await prisma.room.create({ data });
    }
  } catch {
    redirect(`/dashboard/quartos?erro=duplicado&num=${encodeURIComponent(data.number)}`);
  }

  revalidatePath("/dashboard/quartos");
  revalidatePath("/dashboard");
  redirect(
    `/dashboard/quartos?sucesso=${encodeURIComponent(
      id ? `Quarto ${data.number} atualizado com sucesso!` : `Quarto ${data.number} criado com sucesso!`
    )}`
  );
}

export async function deleteRoomAction(formData: FormData) {
  await requireUserId();
  const id = String(formData.get("id"));

  try {
    await prisma.room.delete({ where: { id } });
  } catch {
    redirect(
      `/dashboard/quartos?erro=${encodeURIComponent(
        "Não é possível eliminar este quarto porque ele possui reservas associadas no sistema."
      )}`
    );
  }

  revalidatePath("/dashboard/quartos");
  revalidatePath("/dashboard");
  redirect(`/dashboard/quartos?sucesso=${encodeURIComponent("Quarto eliminado com sucesso.")}`);
}

export async function saveGuestAction(formData: FormData) {
  await requireUserId();
  const parsed = guestSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    const errorMsg = parsed.error.errors[0]?.message || "Dados do hóspede inválidos.";
    redirect(`/dashboard/hospedes?erro=${encodeURIComponent(errorMsg)}`);
  }

  const { id, ...data } = parsed.data;

  // Check if document already exists for another guest
  const existing = await prisma.guest.findUnique({
    where: { document: data.document }
  });

  if (existing && existing.id !== id) {
    redirect(`/dashboard/hospedes?erro=duplicado&doc=${encodeURIComponent(data.document)}`);
  }

  try {
    if (id) {
      await prisma.guest.update({ where: { id }, data });
    } else {
      await prisma.guest.create({ data });
    }
  } catch {
    redirect(`/dashboard/hospedes?erro=duplicado&doc=${encodeURIComponent(data.document)}`);
  }

  revalidatePath("/dashboard/hospedes");
  redirect(
    `/dashboard/hospedes?sucesso=${encodeURIComponent(
      id ? `Hóspede ${data.fullName} atualizado com sucesso!` : `Hóspede ${data.fullName} registado com sucesso!`
    )}`
  );
}

export async function deleteGuestAction(formData: FormData) {
  await requireUserId();
  const id = String(formData.get("id"));

  try {
    await prisma.guest.delete({ where: { id } });
  } catch {
    redirect(`/dashboard/hospedes?erro=${encodeURIComponent("Erro ao eliminar hóspede.")}`);
  }

  revalidatePath("/dashboard/hospedes");
  redirect(`/dashboard/hospedes?sucesso=${encodeURIComponent("Hóspede eliminado com sucesso.")}`);
}

export async function createReservationAction(formData: FormData) {
  const userId = await requireUserId();
  const data = reservationSchema.parse(Object.fromEntries(formData));
  if (data.checkOut <= data.checkIn) throw new Error("A data de checkout deve ser posterior ao check-in.");

  const room = await prisma.room.findUniqueOrThrow({ where: { id: data.roomId } });
  if (room.status === "MANUTENCAO") throw new Error("Quarto em manutencao nao pode ser reservado.");

  const days = Math.max(1, Math.ceil((data.checkOut.getTime() - data.checkIn.getTime()) / 86400000));
  await prisma.reservation.create({
    data: { ...data, userId, totalValue: days * room.pricePerDay }
  });
  revalidatePath("/dashboard/reservas");
  revalidatePath("/dashboard");
}

export async function changeReservationStatusAction(formData: FormData) {
  await requireUserId();
  const id = String(formData.get("id"));
  const status = z.enum(["PENDENTE", "CONFIRMADA", "CHECKIN", "CHECKOUT", "CANCELADA"]).parse(formData.get("status"));
  const reservation = await prisma.reservation.update({ where: { id }, data: { status } });

  if (status === "CHECKIN") await prisma.room.update({ where: { id: reservation.roomId }, data: { status: "OCUPADO" } });
  if (status === "CHECKOUT" || status === "CANCELADA") {
    await prisma.room.update({ where: { id: reservation.roomId }, data: { status: "LIVRE" } });
  }

  revalidatePath("/dashboard/reservas");
  revalidatePath("/dashboard");
}
