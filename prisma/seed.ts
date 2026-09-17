import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("admin123", 10);

  await prisma.user.upsert({
    where: { email: "admin@hotel.com" },
    update: {},
    create: { name: "Administrador", email: "admin@hotel.com", passwordHash }
  });

  const rooms = [
    ["101", "Solteiro", 1, 1500],
    ["102", "Casal", 2, 2500],
    ["201", "Suite", 2, 4500],
    ["202", "Familiar", 4, 5200],
    ["301", "Executivo", 2, 6000]
  ] as const;

  for (const [number, type, capacity, pricePerDay] of rooms) {
    await prisma.room.upsert({
      where: { number },
      update: {},
      create: { number, type, capacity, pricePerDay }
    });
  }

  await prisma.guest.upsert({
    where: { document: "110100001A" },
    update: {},
    create: {
      fullName: "Ana Mucavel",
      document: "110100001A",
      phone: "+258 84 111 2222",
      email: "ana.mucavel@example.com",
      address: "Maputo"
    }
  });

  await prisma.guest.upsert({
    where: { document: "050200002B" },
    update: {},
    create: {
      fullName: "Carlos Massango",
      document: "050200002B",
      phone: "+258 82 333 4444",
      email: "carlos.massango@example.com",
      address: "Beira"
    }
  });
}

main().finally(async () => prisma.$disconnect());
