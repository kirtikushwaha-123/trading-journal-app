export default function ChartPanel({ title, children }) {
  return (
    <section className="panel p-4">
      <h2 className="mb-4 text-sm font-bold text-slate-800 dark:text-slate-100">{title}</h2>
      <div className="h-72">{children}</div>
    </section>
  );
}
