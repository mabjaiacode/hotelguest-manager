import { deleteGuestAction, saveGuestAction } from "@/lib/actions";
import { AlertBanner } from "@/lib/AlertBanner";
import { ConfirmForm } from "@/lib/ConfirmForm";
import { GuestModalForm } from "@/lib/GuestModalForm";
import { prisma } from "@/lib/prisma";
import { EmptyState, MetricCard, PageHeader } from "@/lib/ui";

export default async function GuestsPage({
  searchParams
}: {
  searchParams: { q?: string; erro?: string; doc?: string; sucesso?: string };
}) {
  const q = searchParams.q?.trim();
  const [guests, allGuests] = await Promise.all([
    prisma.guest.findMany({
      where: q
        ? { OR: [{ document: { contains: q } }, { fullName: { contains: q } }] }
        : undefined,
      orderBy: { fullName: "asc" }
    }),
    prisma.guest.findMany({ select: { document: true } })
  ]);

  return (
    <section className="space-y-6">
      {searchParams?.erro && (
        <AlertBanner
          type="error"
          message={
            searchParams.erro === "duplicado"
              ? `O documento "${searchParams.doc || ""}" já está registado!`
              : "Erro na operação com hóspedes"
          }
          detail={
            searchParams.erro === "duplicado"
              ? "Cada hóspede deve ter um documento/BI único no sistema. Verifique os dados introduzidos."
              : searchParams.erro
          }
        />
      )}

      {searchParams?.sucesso && (
        <AlertBanner type="success" message={searchParams.sucesso} />
      )}

      <PageHeader
        eyebrow="Clientes"
        title="Gestão de hóspedes"
        description="Mantenha dados de identificação, contacto e origem dos hóspedes para acelerar reservas e check-in."
        action={<GuestModalForm existingDocuments={allGuests.map((g) => g.document)} />}
      />

      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard label="Hóspedes" value={guests.length} detail={q ? "Resultado da pesquisa" : "Registos cadastrados"} tone="slate" />
        <MetricCard label="Com email" value={guests.filter((guest) => guest.email).length} detail="Contactos digitais disponíveis" tone="blue" />
        <MetricCard label="Com endereço" value={guests.filter((guest) => guest.address).length} detail="Dados de origem completos" tone="green" />
      </div>

      <form className="card flex flex-col gap-3 md:flex-row">
        <input name="q" placeholder="Pesquisar por documento/BI ou nome" defaultValue={q} />
        <button type="submit">Pesquisar</button>
      </form>

      <div className="card overflow-x-auto">
        {guests.map((guest) => (
          <form action={saveGuestAction} id={`guest-form-${guest.id}`} key={`form-${guest.id}`}>
            <input type="hidden" name="id" value={guest.id} />
          </form>
        ))}
        {guests.length === 0 ? (
          <EmptyState title="Nenhum hóspede encontrado" description="Ajuste a pesquisa ou cadastre um novo hóspede." />
        ) : (
          <table className="w-full">
            <thead>
              <tr>
                <th>Nome</th>
                <th className="w-36">Documento</th>
                <th className="w-36">Telefone</th>
                <th>Email</th>
                <th>Endereço</th>
                <th className="w-36 text-center">Ações</th>
              </tr>
            </thead>
            <tbody>
              {guests.map((guest) => (
                <tr key={guest.id}>
                  <td><input form={`guest-form-${guest.id}`} name="fullName" defaultValue={guest.fullName} required /></td>
                  <td><input form={`guest-form-${guest.id}`} name="document" defaultValue={guest.document} required /></td>
                  <td><input form={`guest-form-${guest.id}`} name="phone" defaultValue={guest.phone} required /></td>
                  <td><input form={`guest-form-${guest.id}`} name="email" defaultValue={guest.email ?? ""} /></td>
                  <td><input form={`guest-form-${guest.id}`} name="address" defaultValue={guest.address ?? ""} /></td>
                  <td className="whitespace-nowrap">
                    <div className="flex items-center justify-center gap-1.5 whitespace-nowrap">
                      <button
                        form={`guest-form-${guest.id}`}
                        className="btn-sm"
                        type="submit"
                        title="Guardar alterações neste hóspede"
                      >
                        Salvar
                      </button>
                      <ConfirmForm
                        action={deleteGuestAction}
                        message={`Tem certeza? Eliminar ${guest.fullName} apagará também TODAS as suas reservas associadas.`}
                      >
                        <input type="hidden" name="id" value={guest.id} />
                        <button
                          className="btn-danger btn-sm"
                          type="submit"
                          title="Eliminar hóspede"
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

