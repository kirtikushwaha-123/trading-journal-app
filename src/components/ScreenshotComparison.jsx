import SafeImage from './SafeImage';

export default function ScreenshotComparison({ trade, onOpen }) {
  const notes = [
    'Setup matched the trading plan',
    'Entry respected the model',
    'Exit followed the original idea',
    'Execution mistakes are visible',
    'Improvement areas are clear',
  ];

  return (
    <section className="panel overflow-hidden">
      <div className="border-b border-slate-200 bg-slate-100 px-4 py-3 dark:border-slate-800 dark:bg-slate-900">
        <p className="label">Screenshot Comparison</p>
        <h2 className="text-lg font-bold">{'Before Trade Image -> Trade Notes -> After Trade Image'}</h2>
      </div>
      <div className="grid gap-4 p-4 lg:grid-cols-[1fr_0.8fr_1fr]">
        <ImageBlock title="Before Trade" src={trade.before_trade_screenshot_url} onOpen={onOpen} />
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-900 dark:bg-emerald-950/40">
          <p className="text-sm font-bold text-emerald-700 dark:text-emerald-300">Trade Notes</p>
          <p className="mt-3 text-sm text-slate-700 dark:text-slate-200">{trade.entry_thoughts || 'No entry notes yet.'}</p>
          <p className="mt-3 text-sm text-slate-700 dark:text-slate-200">{trade.exit_thoughts || 'No exit notes yet.'}</p>
          <ul className="mt-4 space-y-2 text-xs text-slate-600 dark:text-slate-300">
            {notes.map((note) => (
              <li key={note} className="rounded-md bg-white px-2 py-1 dark:bg-slate-900">{note}</li>
            ))}
          </ul>
        </div>
        <ImageBlock title="After Trade" src={trade.after_trade_screenshot_url} onOpen={onOpen} />
      </div>
    </section>
  );
}

function ImageBlock({ title, src, onOpen }) {
  return (
    <div>
      <p className="mb-2 text-sm font-bold">{title}</p>
      {src ? (
        <button className="block w-full overflow-hidden rounded-lg border border-slate-200 dark:border-slate-800" onClick={() => onOpen(src)}>
          <SafeImage src={src} alt={title} className="h-72 w-full object-cover" />
        </button>
      ) : (
        <div className="flex h-72 items-center justify-center rounded-lg border border-dashed border-slate-300 text-sm text-slate-400 dark:border-slate-700">No image uploaded</div>
      )}
    </div>
  );
}
