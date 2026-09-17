import { loginAction } from "@/lib/actions";

export default function LoginPage({ searchParams }: { searchParams: { erro?: string } }) {
  return (
    <main className="grid min-h-screen bg-slate-950 lg:grid-cols-[1.05fr_0.95fr]">
      <section className="relative flex min-h-[42vh] items-end overflow-hidden p-8 text-white lg:min-h-screen lg:p-12">
        <div className="absolute inset-0 bg-[linear-gradient(135deg,#0f172a_0%,#1d4ed8_52%,#14b8a6_100%)]" />
        <div className="absolute inset-0 opacity-20 [background-image:linear-gradient(#fff_1px,transparent_1px),linear-gradient(90deg,#fff_1px,transparent_1px)] [background-size:48px_48px]" />
        <div className="relative max-w-2xl">
          <span className="inline-flex rounded-full bg-white/15 px-3 py-1 text-sm font-semibold ring-1 ring-white/20">Sistema academico standalone</span>
          <h1 className="mt-5 text-4xl font-black leading-tight md:text-6xl">HotelGuest Manager</h1>
          <p className="mt-4 max-w-xl text-base text-blue-50">Gestao moderna de quartos, hospedes, reservas, check-in, checkout e indicadores para hoteis e pensoes.</p>
          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            {["SQLite local", "Prisma ORM", "Next.js App Router"].map((item) => (
              <div className="rounded-xl bg-white/10 p-4 ring-1 ring-white/15" key={item}>
                <p className="text-sm font-bold">{item}</p>
                <p className="mt-1 text-xs text-blue-50">Sem servicos externos</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="flex items-center justify-center bg-slate-50 px-4 py-10">
        <div className="card w-full max-w-md">
          <div className="grid h-12 w-12 place-items-center rounded-xl bg-slate-950 text-sm font-black text-white">HG</div>
          <h2 className="mt-5 text-2xl font-bold text-slate-950">Entrar no painel</h2>
          <p className="mt-2 text-sm text-slate-600">Acesso administrativo ao sistema de gestao hoteleira.</p>
          {searchParams.erro && <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm font-medium text-red-700 ring-1 ring-red-100">Credenciais invalidas.</p>}
          <form action={loginAction} className="mt-6 space-y-4">
            <label className="block text-sm font-semibold text-slate-700">
              Email
              <input className="mt-1" name="email" type="email" defaultValue="admin@hotel.com" required />
            </label>
            <label className="block text-sm font-semibold text-slate-700">
              Palavra-passe
              <input className="mt-1" name="password" type="password" defaultValue="admin123" required />
            </label>
            <button className="w-full" type="submit">Entrar</button>
          </form>
          <p className="mt-5 rounded-lg bg-slate-100 p-3 text-xs text-slate-600">Credenciais de teste: admin@hotel.com / admin123</p>
        </div>
      </section>
    </main>
  );
}
