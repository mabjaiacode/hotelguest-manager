import { prisma } from "@/lib/prisma";
import { MetricCard, QuickLink, StatusBadge } from "@/lib/ui";

export default async function DashboardPage() {
  const [rooms, activeReservations, paidReservations, guests, latestReservations] = await Promise.all([
    prisma.room.findMany(),
    prisma.reservation.count({ where: { status: { in: ["CONFIRMADA", "CHECKIN"] } } }),
    prisma.reservation.findMany({ where: { status: { in: ["CONFIRMADA", "CHECKIN", "CHECKOUT"] } } }),
    prisma.guest.count(),
    prisma.reservation.findMany({
      include: { guest: true, room: true },
      orderBy: { createdAt: "desc" },
      take: 5
    })
  ]);

  const occupied = rooms.filter((room) => room.status === "OCUPADO").length;
  const free = rooms.filter((room) => room.status === "LIVRE").length;
  const maintenance = rooms.filter((room) => room.status === "MANUTENCAO").length;
  const revenue = paidReservations.reduce((sum, reservation) => sum + reservation.totalValue, 0);
  const occupancy = rooms.length ? Math.round((occupied / rooms.length) * 100) : 0;

  return (
    <section className="space-y-6">
      <div className="overflow-hidden rounded-2xl bg-slate-950 text-white shadow-xl shadow-slate-300/50">
        <div className="grid gap-6 p-6 md:grid-cols-[1.4fr_0.6fr] md:p-8">
          <div>
            <p className="text-sm font-bold uppercase tracking-wide text-cyan-200">Painel operacional</p>
            <h1 className="mt-2 text-3xl font-black md:text-4xl">Resumo da ocupacao e receitas</h1>
            <p className="mt-3 max-w-2xl text-sm text-slate-300">Acompanhe a disponibilidade dos quartos, reservas ativas, receitas previstas e movimentos recentes da unidade.</p>
          </div>
          <div className="rounded-2xl bg-white/10 p-5 ring-1 ring-white/15">
            <p className="text-sm text-slate-300">Ocupacao atual</p>
            <p className="mt-2 text-5xl font-black">{occupancy}%</p>
            <div className="mt-4 h-2 rounded-full bg-white/15">
              <div className="h-2 rounded-full bg-cyan-300" style={{ width: `${occupancy}%` }} />
            </div>
          </div>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-4">
        <MetricCard label="Taxa de ocupacao" value={`${occupancy}%`} detail={`${occupied} de ${rooms.length} quartos ocupados`} tone="blue" />
        <MetricCard label="Reservas ativas" value={activeReservations} detail="Confirmadas ou em check-in" tone="green" />
        <MetricCard label="Hospedes cadastrados" value={guests} detail="Base de clientes registados" tone="slate" />
        <MetricCard label="Receita prevista" value={`${revenue.toLocaleString("pt-MZ")} MZN`} detail="Reservas confirmadas e finalizadas" tone="amber" />
      </div>
      <div className="grid gap-4 lg:grid-cols-[0.75fr_1.25fr]">
        <div className="card">
          <h2 className="panel-title">Distribuicao dos quartos</h2>
          <div className="mt-5 space-y-4">
            {[
              ["Livres", free, "bg-emerald-500"],
              ["Ocupados", occupied, "bg-blue-500"],
              ["Manutencao", maintenance, "bg-amber-500"]
            ].map(([label, value, color]) => (
              <div key={String(label)}>
                <div className="mb-1 flex justify-between text-sm">
                  <span className="font-medium text-slate-700">{label}</span>
                  <span className="text-slate-500">{value} quartos</span>
                </div>
                <div className="h-2 rounded-full bg-slate-100">
                  <div className={`h-2 rounded-full ${color}`} style={{ width: `${rooms.length ? (Number(value) / rooms.length) * 100 : 0}%` }} />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 grid gap-3">
            <QuickLink href="/dashboard/reservas" title="Criar nova reserva" description="Registar entrada prevista e calcular valor automaticamente." />
            <QuickLink href="/dashboard/quartos" title="Atualizar quartos" description="Controlar disponibilidade e manutencao." />
          </div>
        </div>
        <div className="card overflow-x-auto">
          <h2 className="mb-4 panel-title">Reservas recentes</h2>
          <table className="w-full">
            <thead><tr><th>Hospede</th><th>Quarto</th><th>Periodo</th><th>Total</th><th>Estado</th></tr></thead>
            <tbody>
              {latestReservations.map((reservation) => (
                <tr key={reservation.id}>
                  <td className="font-semibold text-slate-900">{reservation.guest.fullName}</td>
                  <td>{reservation.room.number}</td>
                  <td>{reservation.checkIn.toLocaleDateString("pt-MZ")} - {reservation.checkOut.toLocaleDateString("pt-MZ")}</td>
                  <td>{reservation.totalValue.toLocaleString("pt-MZ")} MZN</td>
                  <td><StatusBadge value={reservation.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className="card overflow-x-auto">
        <h2 className="mb-4 panel-title">Mapa rapido dos quartos</h2>
        <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
          {rooms.map((room) => (
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4" key={room.id}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-bold uppercase text-slate-500">Quarto</p>
                  <p className="text-2xl font-black text-slate-950">{room.number}</p>
                </div>
                <StatusBadge value={room.status} />
              </div>
              <p className="mt-3 text-sm text-slate-600">{room.type} - {room.capacity} pessoa(s)</p>
              <p className="mt-1 text-sm font-semibold text-slate-900">{room.pricePerDay.toLocaleString("pt-MZ")} MZN/dia</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
