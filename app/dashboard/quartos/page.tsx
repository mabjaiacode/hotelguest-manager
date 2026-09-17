import { deleteRoomAction, saveRoomAction } from "@/lib/actions";
import { AlertBanner } from "@/lib/AlertBanner";
import { ConfirmForm } from "@/lib/ConfirmForm";
import { ROOM_TYPES } from "@/lib/constants";
import { prisma } from "@/lib/prisma";
import { RoomModalForm } from "@/lib/RoomModalForm";
import { EmptyState, MetricCard, PageHeader, StatusBadge } from "@/lib/ui";

export default async function RoomsPage({
  searchParams
}: {
  searchParams?: { erro?: string; num?: string; sucesso?: string };
}) {
  const rooms = await prisma.room.findMany({ orderBy: { number: "asc" } });
  const free = rooms.filter((room) => room.status === "LIVRE").length;
  const occupied = rooms.filter((room) => room.status === "OCUPADO").length;
  const maintenance = rooms.filter((room) => room.status === "MANUTENCAO").length;

  return (
    <section className="space-y-6">
      {searchParams?.erro && (
        <AlertBanner
          type="error"
          message={
            searchParams.erro === "duplicado"
              ? `O quarto número "${searchParams.num || ""}" já está cadastrado!`
              : "Erro na operação com quartos"
          }
          detail={
            searchParams.erro === "duplicado"
              ? "Cada quarto deve ter um número único no sistema. Introduza um número diferente."
              : searchParams.erro
          }
        />
      )}

      {searchParams?.sucesso && (
        <AlertBanner type="success" message={searchParams.sucesso} />
      )}

      <PageHeader
        eyebrow="Alojamento"
        title="Gestão de quartos"
        description="Controle disponibilidade, capacidade, preços e manutenção dos quartos da unidade."
        action={<RoomModalForm existingNumbers={rooms.map((r) => r.number)} />}
      />

      <div className="grid gap-4 md:grid-cols-4">
        <MetricCard label="Total" value={rooms.length} detail="Quartos cadastrados" tone="slate" />
        <MetricCard label="Livres" value={free} detail="Disponíveis para reserva" tone="green" />
        <MetricCard label="Ocupados" value={occupied} detail="Em uso neste momento" tone="blue" />
        <MetricCard label="Manutenção" value={maintenance} detail="Indisponíveis temporariamente" tone="amber" />
      </div>

      <div className="card overflow-x-auto">
        {rooms.map((room) => (
          <form action={saveRoomAction} id={`room-form-${room.id}`} key={`form-${room.id}`}>
            <input type="hidden" name="id" value={room.id} />
          </form>
        ))}
        {rooms.length === 0 ? (
          <EmptyState title="Nenhum quarto cadastrado" description="Crie o primeiro quarto para iniciar a gestão de reservas." />
        ) : (
          <table className="w-full">
            <thead>
              <tr>
                <th className="w-24">Número</th>
                <th className="w-36">Tipo</th>
                <th className="w-20">Cap.</th>
                <th className="w-28">Preço/dia</th>
                <th className="w-24">Estado atual</th>
                <th className="w-32">Novo estado</th>
                <th className="w-36 text-center">Ações</th>
              </tr>
            </thead>
            <tbody>
              {rooms.map((room) => (
                <tr key={room.id}>
                  <td>
                    <input
                      form={`room-form-${room.id}`}
                      name="number"
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]+"
                      defaultValue={room.number}
                      required
                      className="font-bold text-slate-950"
                      title="Apenas dígitos numéricos permitidos"
                    />
                  </td>
                  <td>
                    <select
                      form={`room-form-${room.id}`}
                      name="type"
                      defaultValue={room.type}
                      required
                    >
                      {ROOM_TYPES.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <input
                      form={`room-form-${room.id}`}
                      name="capacity"
                      type="number"
                      min="1"
                      max="20"
                      defaultValue={room.capacity}
                      required
                    />
                  </td>
                  <td>
                    <input
                      form={`room-form-${room.id}`}
                      name="pricePerDay"
                      type="number"
                      min="1"
                      step="0.01"
                      defaultValue={room.pricePerDay}
                      required
                    />
                  </td>
                  <td>
                    <StatusBadge value={room.status} />
                  </td>
                  <td>
                    <select form={`room-form-${room.id}`} name="status" defaultValue={room.status}>
                      <option value="LIVRE">Livre</option>
                      <option value="OCUPADO">Ocupado</option>
                      <option value="MANUTENCAO">Manutenção</option>
                    </select>
                  </td>
                  <td className="whitespace-nowrap">
                    <div className="flex items-center justify-center gap-1.5 whitespace-nowrap">
                      <button
                        form={`room-form-${room.id}`}
                        className="btn-sm"
                        type="submit"
                        title="Guardar alterações neste quarto"
                      >
                        Salvar
                      </button>
                      <ConfirmForm
                        action={deleteRoomAction}
                        message={`Tem certeza que deseja eliminar o quarto ${room.number}? Esta acção não pode ser desfeita.`}
                      >
                        <input type="hidden" name="id" value={room.id} />
                        <button
                          className="btn-danger btn-sm"
                          type="submit"
                          title="Eliminar este quarto"
                        >
                          Eliminar
                        </button>
                      </ConfirmForm>
                    </div>
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

