import { useMemo, useState } from 'react';
import ImageLightbox from '../components/ImageLightbox';
import ProfitLoss from '../components/ProfitLoss';
import ScreenshotComparison from '../components/ScreenshotComparison';
import { FIELD_LABELS } from '../data/checklists';

export default function TradeReview({ trades }) {
  const [selectedId, setSelectedId] = useState(trades[0]?.id || '');
  const [lightbox, setLightbox] = useState('');
  const selected = useMemo(() => trades.find((trade) => trade.id === selectedId) || trades[0], [trades, selectedId]);

  if (!trades.length) {
    return <div className="panel p-8 text-center text-slate-500">No trades saved yet.</div>;
  }

  const checked = Object.entries(FIELD_LABELS).filter(([field]) => selected[field]).map(([, label]) => label);

  return (
    <div className="grid gap-5 lg:grid-cols-[320px_1fr]">
      <aside className="panel h-fit p-4">
        <p className="label">Trade Review</p>
        <div className="mt-3 space-y-2">
          {trades.map((trade) => (
            <button key={trade.id} className={`w-full rounded-lg border p-3 text-left text-sm transition ${selected?.id === trade.id ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40' : 'border-slate-200 dark:border-slate-800'}`} onClick={() => setSelectedId(trade.id)}>
              <span className="block font-bold">{trade.trade_date} | {trade.pair}</span>
              <span className="text-xs text-slate-500">{trade.direction} | {trade.result || 'Open'} | PnL </span>
              <ProfitLoss value={trade.profit_loss} className="text-xs font-semibold" />
            </button>
          ))}
        </div>
      </aside>
      <div className="space-y-5">
        <section className="panel p-4">
          <div className="grid gap-3 sm:grid-cols-4">
            <Mini label="Date" value={selected.trade_date} />
            <Mini label="Pair" value={selected.pair} />
            <Mini label="Direction" value={selected.direction} />
            <Mini label="Result" value={selected.result || 'Open'} />
          </div>
        </section>
        <ScreenshotComparison trade={selected} onOpen={setLightbox} />
        <section className="panel p-4">
          <h2 className="mb-3 text-lg font-bold">Checklist Evidence</h2>
          <div className="flex flex-wrap gap-2">
            {checked.length ? checked.map((item) => <span key={item} className="rounded-lg bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-200">{item}</span>) : <p className="text-sm text-slate-500">No checklist items selected.</p>}
          </div>
        </section>
        <section className="grid gap-5 lg:grid-cols-2">
          <Note title="Entry Thoughts / Reason for Entry" text={selected.entry_thoughts} />
          <Note title="Exit Thoughts / Trade Management Notes" text={selected.exit_thoughts} />
          <Note title="Daily Trading Reflection" text={selected.daily_reflection} />
        </section>
      </div>
      <ImageLightbox image={lightbox} onClose={() => setLightbox('')} />
    </div>
  );
}

function Mini({ label, value }) {
  return (
    <div>
      <p className="label">{label}</p>
      <p className="mt-1 font-bold">{value}</p>
    </div>
  );
}

function Note({ title, text }) {
  return (
    <article className="panel p-4">
      <h3 className="mb-2 text-sm font-bold">{title}</h3>
      <p className="whitespace-pre-wrap text-sm text-slate-600 dark:text-slate-300">{text || 'No notes added.'}</p>
    </article>
  );
}
