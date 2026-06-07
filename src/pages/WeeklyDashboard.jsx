import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import ChartPanel from '../components/ChartPanel';
import DashboardScreenshotGallery from '../components/DashboardScreenshotGallery';
import StatCard from '../components/StatCard';
import { weeklyAnalytics } from '../lib/analytics';

const colors = ['#059669', '#0284c7', '#f59e0b', '#e11d48', '#7c3aed', '#14b8a6'];

export default function WeeklyDashboard({ trades }) {
  const analytics = weeklyAnalytics(trades);
  const { summary } = analytics;

  return (
    <div className="space-y-5">
      <div>
        <p className="label">Weekly Dashboard</p>
        <h2 className="text-2xl font-bold">Current week performance</h2>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Trades" value={summary.total} />
        <StatCard label="Wins" value={summary.wins} tone="good" />
        <StatCard label="Losses" value={summary.losses} tone="bad" />
        <StatCard label="Breakeven Trades" value={summary.breakeven} tone="neutral" />
        <StatCard label="Win Rate %" value={`${summary.winRate}%`} tone="good" />
        <StatCard label="Total PnL" value={`$${summary.totalPnl.toFixed(2)}`} tone={summary.totalPnl >= 0 ? 'good' : 'bad'} />
        <StatCard label="Average RR" value={summary.averageRr.toFixed(2)} tone={summary.averageRr < 0 ? 'bad' : 'good'} />
      </div>
      <DashboardScreenshotGallery trades={analytics.trades} />
      <div className="grid gap-5 xl:grid-cols-2">
        <BarPerformance title="Pair Performance" data={analytics.pair} />
        <BarPerformance title="Session Performance" data={analytics.session} />
        <PiePerformance title="Psychology Analysis" data={analytics.psychology} />
        <BarPerformance title="Entry Model Performance" data={analytics.entryModel} />
        <BarPerformance title="Risk Management Analysis" data={analytics.risk} />
      </div>
    </div>
  );
}

function BarPerformance({ title, data }) {
  return (
    <ChartPanel title={title}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.2} />
          <XAxis dataKey="name" tick={{ fontSize: 11 }} interval={0} angle={-18} textAnchor="end" height={70} />
          <YAxis />
          <Tooltip formatter={(value) => [`$${Number(value).toFixed(2)}`, 'PnL']} />
          <Bar dataKey="pnl" radius={[6, 6, 0, 0]}>
            {data.map((row) => <Cell key={row.name} fill={row.pnl < 0 ? '#e11d48' : '#059669'} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartPanel>
  );
}

function PiePerformance({ title, data }) {
  return (
    <ChartPanel title={title}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={data} dataKey="trades" nameKey="name" outerRadius={95} label>
            {data.map((_, index) => <Cell key={index} fill={colors[index % colors.length]} />)}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </ChartPanel>
  );
}
