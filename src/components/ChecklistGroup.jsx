export default function ChecklistGroup({ group, values, onChange }) {
  return (
    <section className="panel p-4">
      <h3 className="mb-3 text-sm font-bold text-slate-800 dark:text-slate-100">{group.title}</h3>
      <div className="grid gap-2 sm:grid-cols-2">
        {group.items.map(([field, label]) => (
          <label key={field} className="flex min-h-11 items-center gap-3 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 dark:border-slate-800 dark:text-slate-200">
            <input
              type="checkbox"
              checked={Boolean(values[field])}
              onChange={(event) => onChange(field, event.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
            />
            <span>{label}</span>
          </label>
        ))}
      </div>
    </section>
  );
}
