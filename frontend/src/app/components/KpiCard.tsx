type KpiCardProps = {
  title: string;
  value: string;
  note?: string;
};

export function KpiCard({ title, value, note }: KpiCardProps) {
  return (
    <div className="glass-panel rounded-3xl p-4 shadow-glass">
      <p className="text-sm text-slate-300">{title}</p>
      <p className="mt-3 text-3xl font-semibold text-white">{value}</p>
      {note ? <p className="mt-2 text-sm text-slate-400">{note}</p> : null}
    </div>
  );
}
