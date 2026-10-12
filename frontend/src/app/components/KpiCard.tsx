type KpiCardProps = {
  label: string;
  value: string;
  context: string;
};

export function KpiCard({ label, value, context }: KpiCardProps) {
  return (
    <div className="rounded-card border border-line bg-surface p-5 lg:p-6">
      <p className="text-caption font-semibold text-fg-secondary">{label}</p>
      <p className="ms-num mt-2 whitespace-nowrap text-kpi text-fg">{value}</p>
      <p className="mt-2 text-fine text-fg-tertiary">{context}</p>
    </div>
  );
}
