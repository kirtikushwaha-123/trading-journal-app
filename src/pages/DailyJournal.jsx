import { useMemo, useState } from 'react';
import { Save, Trash2 } from 'lucide-react';
import ChecklistGroup from '../components/ChecklistGroup';
import ImageLightbox from '../components/ImageLightbox';
import ScreenshotComparison from '../components/ScreenshotComparison';
import ScreenshotUploader from '../components/ScreenshotUploader';
import { CHECKLIST_GROUPS, DIRECTIONS, PAIRS, RESULTS } from '../data/checklists';
import { deleteLocalImage } from '../lib/localImageStore';
import { repository } from '../lib/storage';
import { emptyTrade, isReflectionComplete, normalizeTrade } from '../lib/tradeModel';

export default function DailyJournal({ trades, onSaved }) {
  const [selectedId, setSelectedId] = useState('');
  const [form, setForm] = useState(() => emptyTrade());
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [lightbox, setLightbox] = useState('');

  const todaysTrades = useMemo(() => trades.filter((trade) => trade.trade_date === form.trade_date), [trades, form.trade_date]);

  const update = (field, value) => setForm((current) => ({ ...current, [field]: value }));
  const updateCheckbox = (field, value) => update(field, value);

  const loadTrade = (id) => {
    setSelectedId(id);
    const trade = trades.find((item) => item.id === id);
    if (trade) setForm(normalizeTrade(trade));
  };

  const startNew = () => {
    setSelectedId('');
    setForm(emptyTrade());
    setMessage('');
  };

  const handleScreenshot = async (slot, file) => {
    setSaving(true);
    setMessage('');
    try {
      const url = await repository.uploadScreenshot(form.id, slot, file);
      const field = slot === 'before' ? 'before_trade_screenshot_url' : 'after_trade_screenshot_url';
      const nextForm = { ...form, [field]: url };
      setForm(nextForm);
      await repository.upsertTrade(nextForm);
      await onSaved();
      setSelectedId(nextForm.id);
      setMessage(`${slot === 'before' ? 'Before' : 'After'} trade screenshot uploaded and saved.`);
    } catch (error) {
      setMessage(error.message);
    } finally {
      setSaving(false);
    }
  };

  const deleteScreenshot = async (field) => {
    setSaving(true);
    setMessage('');
    try {
      await deleteLocalImage(form[field]);
      const nextForm = { ...form, [field]: '' };
      setForm(nextForm);
      await repository.upsertTrade(nextForm);
      await onSaved();
      setMessage('Screenshot removed.');
    } catch (error) {
      setMessage(error.message);
    } finally {
      setSaving(false);
    }
  };

  const saveTrade = async (event) => {
    event.preventDefault();
    setMessage('');
    if (!isReflectionComplete(form)) {
      setMessage('Daily Trading Reflection is mandatory before saving.');
      return;
    }
    setSaving(true);
    try {
      await repository.upsertTrade(form);
      await onSaved();
      setSelectedId(form.id);
      setMessage('Journal entry saved.');
    } catch (error) {
      setMessage(error.message);
    } finally {
      setSaving(false);
    }
  };

  const deleteTrade = async () => {
    if (!selectedId) return;
    setSaving(true);
    await repository.deleteTrade(selectedId);
    await onSaved();
    startNew();
    setSaving(false);
  };

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
      <form className="space-y-5" onSubmit={saveTrade}>
        <section className="panel p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="label">Daily Trade Journal</p>
              <h2 className="text-2xl font-bold">Record today&apos;s execution</h2>
            </div>
            <button type="button" className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold dark:border-slate-700" onClick={startNew}>
              New Entry
            </button>
          </div>
          <div className="mt-5 grid gap-4 sm:grid-cols-3">
            <Field label="Date Picker">
              <input className="input" type="date" value={form.trade_date} onChange={(event) => update('trade_date', event.target.value)} />
            </Field>
            <Field label="Trading Pair">
              <select className="input" value={form.pair} onChange={(event) => update('pair', event.target.value)}>
                {PAIRS.map((pair) => <option key={pair}>{pair}</option>)}
              </select>
            </Field>
            {form.pair === 'Other' && (
              <Field label="Other Pair">
                <input className="input" value={form.custom_pair} onChange={(event) => update('custom_pair', event.target.value)} placeholder="GBP/USD" />
              </Field>
            )}
            <Field label="Trade Direction">
              <div className="grid grid-cols-2 gap-2">
                {DIRECTIONS.map((direction) => (
                  <RadioPill key={direction} active={form.direction === direction} label={direction} onClick={() => update('direction', direction)} />
                ))}
              </div>
            </Field>
          </div>
        </section>

        <div className="grid gap-4 xl:grid-cols-2">
          {CHECKLIST_GROUPS.map((group) => (
            <ChecklistGroup key={group.id} group={group} values={form} onChange={updateCheckbox} />
          ))}
        </div>

        <section className="panel p-4">
          <h3 className="mb-4 text-lg font-bold">Entry Rule Section</h3>
          <Field label="Entry Thoughts / Reason for Entry">
            <textarea className="input min-h-40 resize-y" value={form.entry_thoughts} onChange={(event) => update('entry_thoughts', event.target.value)} />
          </Field>
        </section>

        <section className="panel p-4">
          <h3 className="mb-4 text-lg font-bold">Exit Rule Section</h3>
          <Field label="Exit Thoughts / Trade Management Notes">
            <textarea className="input min-h-40 resize-y" value={form.exit_thoughts} onChange={(event) => update('exit_thoughts', event.target.value)} />
          </Field>
        </section>

        <section className="panel p-4">
          <h3 className="mb-4 text-lg font-bold">Screenshot Support</h3>
          <div className="grid gap-4 lg:grid-cols-2">
            <ScreenshotUploader
              label="Before Trade Screenshot"
              value={form.before_trade_screenshot_url}
              onFile={(file) => handleScreenshot('before', file)}
              onDelete={() => deleteScreenshot('before_trade_screenshot_url')}
              onOpen={setLightbox}
            />
            <ScreenshotUploader
              label="After Trade Screenshot"
              value={form.after_trade_screenshot_url}
              onFile={(file) => handleScreenshot('after', file)}
              onDelete={() => deleteScreenshot('after_trade_screenshot_url')}
              onOpen={setLightbox}
            />
          </div>
        </section>

        <ScreenshotComparison trade={form} onOpen={setLightbox} />

        <section className="panel p-4">
          <h3 className="mb-4 text-lg font-bold">Trade Result</h3>
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Result">
              <div className="grid grid-cols-3 gap-2">
                {RESULTS.map((result) => (
                  <RadioPill key={result} active={form.result === result} label={result} onClick={() => update('result', result)} />
                ))}
              </div>
            </Field>
            <Field label="Profit/Loss">
              <input className="input" type="number" step="0.01" value={form.profit_loss} onChange={(event) => update('profit_loss', event.target.value)} placeholder="0.00" />
            </Field>
            <Field label="RR Achieved">
              <input className="input" type="number" step="0.1" value={form.rr_achieved} onChange={(event) => update('rr_achieved', event.target.value)} placeholder="2.5" />
            </Field>
          </div>
        </section>

        <section className="panel p-4">
          <h3 className="mb-2 text-lg font-bold">Daily Comment Section</h3>
          <p className="mb-4 text-sm text-slate-500 dark:text-slate-400">What went well today? What mistakes did I make? What should I improve tomorrow?</p>
          <Field label="Daily Trading Reflection">
            <textarea className="input min-h-44 resize-y" required value={form.daily_reflection} onChange={(event) => update('daily_reflection', event.target.value)} />
          </Field>
        </section>

        {message && <div className="rounded-lg border border-slate-200 bg-white p-3 text-sm font-semibold text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200">{message}</div>}

        <div className="sticky bottom-3 z-20 flex gap-3">
          <button type="submit" disabled={saving} className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-emerald-600 px-5 py-3 font-bold text-white shadow-lg shadow-emerald-600/20 transition hover:bg-emerald-700 disabled:opacity-60">
            <Save size={18} />
            {saving ? 'Saving...' : 'Save Journal Entry'}
          </button>
          {selectedId && (
            <button type="button" onClick={deleteTrade} className="icon-btn h-12 w-12 text-rose-600" aria-label="Delete trade">
              <Trash2 size={18} />
            </button>
          )}
        </div>
      </form>

      <aside className="space-y-4">
        <section className="panel p-4">
          <p className="label">Entries For Selected Day</p>
          <div className="mt-3 space-y-2">
            {todaysTrades.length ? (
              todaysTrades.map((trade) => (
                <button key={trade.id} className="w-full rounded-lg border border-slate-200 p-3 text-left text-sm transition hover:border-emerald-400 dark:border-slate-800" onClick={() => loadTrade(trade.id)}>
                  <span className="font-bold">{trade.pair}</span>
                  <span className="ml-2 text-slate-500">{trade.direction}</span>
                  <span className="block text-xs text-slate-500">{trade.result || 'Open'} | RR {trade.rr_achieved || '-'}</span>
                </button>
              ))
            ) : (
              <p className="text-sm text-slate-500">No trades recorded for this day yet.</p>
            )}
          </div>
        </section>
        <section className="panel p-4">
          <p className="label">Future Ready</p>
          <div className="mt-3 space-y-2 text-sm text-slate-600 dark:text-slate-300">
            <p>AI Trade Review</p>
            <p>AI Psychology Analysis</p>
            <p>Weekly AI Report</p>
            <p>Monthly AI Performance Review</p>
          </div>
        </section>
      </aside>
      <ImageLightbox image={lightbox} onClose={() => setLightbox('')} />
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="label mb-2 block">{label}</span>
      {children}
    </label>
  );
}

function RadioPill({ active, label, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`min-h-10 rounded-lg border px-3 text-sm font-semibold transition ${
        active
          ? 'border-emerald-600 bg-emerald-600 text-white'
          : 'border-slate-200 bg-white text-slate-700 hover:border-emerald-300 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200'
      }`}
    >
      {label}
    </button>
  );
}
