import SafeImage from './SafeImage';
import ProfitLoss from './ProfitLoss';

export default function DashboardScreenshotGallery({ trades }) {
  const visibleTrades = trades.filter((trade) => trade.before_trade_screenshot_url || trade.after_trade_screenshot_url).slice(0, 6);

  return (
    <section className="panel p-4">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <p className="label">Dashboard Screenshots</p>
          <h2 className="text-lg font-bold">Recent before / after evidence</h2>
        </div>
      </div>
      {visibleTrades.length ? (
        <div className="grid gap-4 lg:grid-cols-2">
          {visibleTrades.map((trade) => (
            <article key={trade.id} className="rounded-lg border border-slate-200 p-3 dark:border-slate-800">
              <div className="mb-3 flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-bold">{trade.trade_date} | {trade.pair}</p>
                  <p className="text-xs text-slate-500">{trade.direction} | {trade.result || 'Open'}</p>
                </div>
                <ProfitLoss value={trade.profit_loss} className="text-sm font-bold" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <ImagePreview label="Before" src={trade.before_trade_screenshot_url} />
                <ImagePreview label="After" src={trade.after_trade_screenshot_url} />
              </div>
            </article>
          ))}
        </div>
      ) : (
        <p className="text-sm text-slate-500 dark:text-slate-400">No uploaded trade screenshots yet.</p>
      )}
    </section>
  );
}

function ImagePreview({ label, src }) {
  return (
    <div>
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
      <SafeImage src={src} alt={`${label} trade screenshot`} className="h-32 w-full rounded-lg object-cover" />
    </div>
  );
}
