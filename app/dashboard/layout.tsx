import Link from "next/link";
import { logoutAction } from "@/lib/actions";
import { requireUserId } from "@/lib/auth";
import { NavLinks } from "./NavLinks";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  await requireUserId();

  return (
    <main className="min-h-screen">
      <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-4">
          <Link href="/dashboard" className="flex items-center gap-3 text-xl font-bold text-ink">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-slate-950 text-sm font-black text-white">HG</span>
            <span>
              HotelGuest Manager
              <span className="block text-xs font-medium text-slate-500">Operação local standalone</span>
            </span>
          </Link>
          <nav className="flex flex-wrap items-center gap-2">
            <NavLinks />
            <form action={logoutAction}>
              <button className="btn-secondary" type="submit">Sair</button>
            </form>
          </nav>
        </div>
      </header>
      <div className="mx-auto max-w-7xl px-4 py-6">{children}</div>
    </main>
  );
}

