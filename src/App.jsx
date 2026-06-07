import { Suspense, lazy, useEffect, useMemo, useState } from 'react';
import { NavLink, Route, Routes } from 'react-router-dom';
import { BarChart3, CalendarDays, LineChart, Moon, Plus, Sun } from 'lucide-react';
import { repository } from './lib/storage';

const DailyJournal = lazy(() => import('./pages/DailyJournal'));
const MonthlyDashboard = lazy(() => import('./pages/MonthlyDashboard'));
const TradeReview = lazy(() => import('./pages/TradeReview'));
const WeeklyDashboard = lazy(() => import('./pages/WeeklyDashboard'));

const navItems = [
  { to: '/', label: 'Journal', icon: CalendarDays },
  { to: '/weekly', label: 'Weekly', icon: BarChart3 },
  { to: '/monthly', label: 'Monthly', icon: LineChart },
  { to: '/review', label: 'Review', icon: Plus },
];

export default function App() {
  const [trades, setTrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('journal-dark-mode') !== 'false');

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
    localStorage.setItem('journal-dark-mode', String(darkMode));
  }, [darkMode]);

  useEffect(() => {
    repository
      .listTrades()
      .then(setTrades)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const refreshTrades = async () => {
    const next = await repository.listTrades();
    setTrades(next);
  };

  const sortedTrades = useMemo(
    () => [...trades].sort((a, b) => `${b.trade_date}${b.created_at}`.localeCompare(`${a.trade_date}${a.created_at}`)),
    [trades],
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950 dark:bg-slate-950 dark:text-slate-100">
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur dark:border-slate-800 dark:bg-slate-950/90">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-emerald-600 dark:text-emerald-400">SMC/ICT Journal</p>
            <h1 className="text-lg font-bold sm:text-xl">Trading Performance Desk</h1>
          </div>
          <button className="icon-btn" onClick={() => setDarkMode((value) => !value)} aria-label="Toggle dark mode">
            {darkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>
        <nav className="mx-auto flex max-w-7xl gap-2 overflow-x-auto px-4 pb-3 sm:px-6">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex min-w-fit items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition ${
                    isActive
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800'
                  }`
                }
              >
                <Icon size={16} />
                {item.label}
              </NavLink>
            );
          })}
        </nav>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:py-8">
        {error && <div className="mb-4 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700 dark:border-rose-900 dark:bg-rose-950 dark:text-rose-200">{error}</div>}
        {loading ? (
          <div className="panel p-8 text-center text-slate-500">Loading journal...</div>
        ) : (
          <Suspense fallback={<div className="panel p-8 text-center text-slate-500">Loading page...</div>}>
            <Routes>
              <Route path="/" element={<DailyJournal trades={sortedTrades} onSaved={refreshTrades} />} />
              <Route path="/weekly" element={<WeeklyDashboard trades={sortedTrades} />} />
              <Route path="/monthly" element={<MonthlyDashboard trades={sortedTrades} />} />
              <Route path="/review" element={<TradeReview trades={sortedTrades} onSaved={refreshTrades} />} />
            </Routes>
          </Suspense>
        )}
      </main>
    </div>
  );
}
