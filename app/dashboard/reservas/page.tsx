import { changeReservationStatusAction, createReservationAction } from "@/lib/actions";
import { ModalForm } from "@/lib/ModalForm";
import { prisma } from "@/lib/prisma";
import { EmptyState, MetricCard, PageHeader, StatusBadge } from "@/lib/ui";

export default async function ReservationsPage() {
  const [reservations, rooms, guests] = await Promise.all([
    prisma.reservation.findMany({ include: { guest: true, room: true }, orderBy: { createdAt: "desc" } }),
    prisma.room.findMany({ orderBy: { number: "asc" } }),
    prisma.guest.findMany({ orderBy: { fullName: "asc" } })
  ]);
  const pending = reservations.filter((reservation) => reservation.status === "PENDENTE").length;
  const confirmed = reservations.filter((reservation) => reservation.status === "CONFIRMADA").length;
  const checkin = reservations.filter((reservation) => reservation.status === "CHECKIN").length;
  const revenue = reservations
    .filter((reservation) => ["CONFIRMADA", "CHECKIN", "CHECKOUT"].includes(reservation.status))
    .reduce((sum, reservation) => sum + reservation.totalValue, 0);

  return (
    <section className="space-y-6">
      <PageHeader
        eyebrow="Operacao"
        title="Reservas e estadias"
        description="Crie reservas, acompanhe o pipeline de hospedagem e execute check-in, checkout ou cancelamento."
        action={
          <ModalForm title="Nova reserva" buttonLabel="Criar reserva">
            <form action={createReservationAction} className="grid gap-4 md:grid-cols-2">
              <select name="guestId" required>
                <option value="">Hóspede</option>
                {guests.map((guest) => <option value={guest.id} key={guest.id}>{guest.fullName}</option>)}
              </select>
              <select name="roomId" required>
                <option value="">Quarto</option>
                {rooms.filter((r) => r.status !== "MANUTENCAO").map((room) => <option value={room.id} key={room.id}>{room.number} - {room.type} ({room.status === "LIVRE" ? "Livre" : "Ocupado"})</option>)}
              </select>
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-600">Check-in</label>
                <input name="checkIn" type="date" required />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-600">Checkout</label>
                <input name="checkOut" type="date" required />
              </div>
              <select name="status" defaultValue="CONFIRMADA">
                <option value="PENDENTE">Pendente</option>
                <option value="CONFIRMADA">Confirmada</option>
                <option value="CHECKIN">Check-in</option>
              </select>
              <textarea className="md:col-span-2" name="notes" placeholder="Observações" />
              <button className="md:col-span-2" type="submit">Salvar</button>
            </form>
          </ModalForm>
        }
      />
      <div className="grid gap-4 md:grid-cols-4">
        <MetricCard label="Pendentes" value={pending} detail="Aguardam confirmacao" tone="slate" />
        <MetricCard label="Confirmadas" value={confirmed} detail="Reservas aprovadas" tone="blue" />
        <MetricCard label="Check-in" value={checkin} detail="Hospedes alojados" tone="green" />
        <MetricCard label="Receita" value={`${revenue.toLocaleString("pt-MZ")} MZN`} detail="Valor previsto e realizado" tone="amber" />
      </div>
      <div className="card overflow-x-auto">
        {reservations.length === 0 ? (
          <EmptyState title="Nenhuma reserva registada" description="Crie uma reserva para comecar a controlar o movimento de hospedagem." />
        ) : (
          <table className="w-full">
            <thead><tr><th>Hospede</th><th>Quarto</th><th>Periodo</th><th>Total</th><th>Estado</th><th>Alterar estado</th></tr></thead>
            <tbody>
              {reservations.map((reservation) => (
                <tr key={reservation.id}>
                  <td>
                    <p className="font-semibold text-slate-950">{reservation.guest.fullName}</p>
                    <p className="text-xs text-slate-500">{reservation.guest.document}</p>
                  </td>
                  <td>
                    <p className="font-semibold text-slate-950">{reservation.room.number}</p>
                    <p className="text-xs text-slate-500">{reservation.room.type}</p>
                  </td>
                  <td>{reservation.checkIn.toLocaleDateString("pt-MZ")} - {reservation.checkOut.toLocaleDateString("pt-MZ")}</td>
                  <td className="font-semibold text-slate-950">{reservation.totalValue.toLocaleString("pt-MZ")} MZN</td>
                  <td><StatusBadge value={reservation.status} /></td>
                  <td>
                    <form action={changeReservationStatusAction} className="flex min-w-72 gap-2">
                      <input type="hidden" name="id" value={reservation.id} />
                      <select name="status" defaultValue={reservation.status}>
                        <option value="PENDENTE">Pendente</option>
                        <option value="CONFIRMADA">Confirmada</option>
                        <option value="CHECKIN">Check-in</option>
                        <option value="CHECKOUT">Checkout</option>
                        <option value="CANCELADA">Cancelada</option>
                      </select>
                      <button type="submit">Aplicar</button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </section>
  );
}
