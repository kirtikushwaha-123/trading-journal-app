export default function StatCard({ label, value, tone = 'default' }) {
  const tones = {
    default: 'text-slate-950 dark:text-slate-100',
    good: 'text-emerald-600 dark:text-emerald-400',
    bad: 'text-rose-600 dark:text-rose-400',
    neutral: 'text-sky-600 dark:text-sky-400',
  };

  return (
    <div className="panel p-4">
      <p className="label">{label}</p>
      <p className={`mt-2 text-2xl font-bold ${tones[tone]}`}>{value}</p>
    </div>
  );
}
