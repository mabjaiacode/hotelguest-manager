import Link from "next/link";

const statusStyles: Record<string, string> = {
  LIVRE: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  OCUPADO: "bg-blue-50 text-blue-700 ring-blue-200",
  MANUTENCAO: "bg-amber-50 text-amber-700 ring-amber-200",
  PENDENTE: "bg-slate-100 text-slate-700 ring-slate-200",
  CONFIRMADA: "bg-indigo-50 text-indigo-700 ring-indigo-200",
  CHECKIN: "bg-blue-50 text-blue-700 ring-blue-200",
  CHECKOUT: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  CANCELADA: "bg-red-50 text-red-700 ring-red-200"
};

export function StatusBadge({ value }: { value: string }) {
  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ring-1 ring-inset ${statusStyles[value] ?? statusStyles.PENDENTE}`}>
      {value}
    </span>
  );
}

export function PageHeader({
  eyebrow,
  title,
  description,
  action
}: {
  eyebrow: string;
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:flex-row md:items-center md:justify-between">
      <div>
        <p className="text-xs font-bold uppercase tracking-wide text-brand">{eyebrow}</p>
        <h1 className="mt-1 text-2xl font-bold text-slate-950">{title}</h1>
        <p className="mt-1 max-w-3xl text-sm text-slate-600">{description}</p>
      </div>
      {action}
    </div>
  );
}

export function MetricCard({
  label,
  value,
  detail,
  tone = "blue"
}: {
  label: string;
  value: string | number;
  detail: string;
  tone?: "blue" | "green" | "amber" | "slate";
}) {
  const tones = {
    blue: "from-blue-600 to-cyan-500",
    green: "from-emerald-600 to-teal-500",
    amber: "from-amber-500 to-orange-500",
    slate: "from-slate-800 to-slate-600"
  };

  return (
    <article className="card relative overflow-hidden">
      <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${tones[tone]}`} />
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <strong className="mt-3 block text-3xl font-bold text-slate-950">{value}</strong>
      <p className="mt-2 text-sm text-slate-500">{detail}</p>
    </article>
  );
}

export function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
      <p className="font-semibold text-slate-900">{title}</p>
      <p className="mt-1 text-sm text-slate-500">{description}</p>
    </div>
  );
}

export function QuickLink({ href, title, description }: { href: string; title: string; description: string }) {
  return (
    <Link href={href} className="block rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md">
      <p className="font-semibold text-slate-950">{title}</p>
      <p className="mt-1 text-sm text-slate-500">{description}</p>
    </Link>
  );
}
