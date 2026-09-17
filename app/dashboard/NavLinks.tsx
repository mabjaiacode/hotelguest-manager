"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  ["/dashboard", "Dashboard"],
  ["/dashboard/quartos", "Quartos"],
  ["/dashboard/hospedes", "Hóspedes"],
  ["/dashboard/reservas", "Reservas"]
];

export function NavLinks() {
  const pathname = usePathname();

  return (
    <>
      {links.map(([href, label]) => {
        const isActive = href === "/dashboard" ? pathname === href : pathname.startsWith(href);
        return (
          <Link
            className={`rounded-lg px-3 py-2 text-sm font-semibold transition-colors duration-150 ${
              isActive
                ? "bg-brand/10 text-brand"
                : "text-slate-700 hover:bg-slate-100 hover:text-slate-950"
            }`}
            href={href}
            key={href}
          >
            {label}
          </Link>
        );
      })}
    </>
  );
}
