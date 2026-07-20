import { getDashboardCounts } from "@/lib/admin-queries";

export default async function AdminDashboard() {
  const counts = await getDashboardCounts();

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Stat label="Sezioni" value={counts.sections} />
        <Stat label="Contenuti" value={counts.entries} />
        <Stat label="Commenti" value={counts.comments} />
        <Stat label="Iscritti" value={counts.followers} />
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-black/[.08] p-4 dark:border-white/[.145]">
      <div className="text-2xl font-semibold">{value}</div>
      <div className="text-sm text-zinc-500 dark:text-zinc-400">{label}</div>
    </div>
  );
}
