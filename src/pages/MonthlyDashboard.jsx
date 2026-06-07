import { Bar, BarChart, CartesianGrid, Cell, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import ChartPanel from '../components/ChartPanel';
import DashboardScreenshotGallery from '../components/DashboardScreenshotGallery';
import StatCard from '../components/StatCard';
import { monthlyAnalytics } from '../lib/analytics';

const colors = ['#059669', '#0284c7', '#f59e0b', '#e11d48', '#7c3aed', '#14b8a6'];

export default function MonthlyDashboard({ trades }) {
  const analytics = monthlyAnalytics(trades);
  const pairPieData = analytics.pair.map((row) => ({ ...row, absolutePnl: Math.abs(row.pnl) }));

  return (
    <div className="space-y-5">
      <div>
        <p className="label">Monthly Dashboard</p>
        <h2 className="text-2xl font-bold">Advanced analytics</h2>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Best Pair" value={analytics.bestPair} tone="good" />
        <StatCard label="Best Session" value={analytics.bestSession} tone="neutral" />
        <StatCard label="Most Profitable Entry Model" value={analytics.bestEntryModel} />
        <StatCard label="Most Common Mistake" value={analytics.commonMistakes[0]?.name || 'No pattern yet'} tone="bad" />
      </div>
      <DashboardScreenshotGallery trades={trades} />
      <div className="grid gap-5 xl:grid-cols-2">
        <ChartPanel title="Monthly PnL Trend">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={analytics.monthly}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.2} />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value) => [`$${Number(value).toFixed(2)}`, 'PnL']} />
              <Line
                type="monotone"
                dataKey="pnl"
                stroke="#059669"
                strokeWidth={3}
                dot={(props) => <circle cx={props.cx} cy={props.cy} r={5} fill={props.payload.pnl < 0 ? '#e11d48' : '#059669'} />}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartPanel>
        <ChartPanel title="Monthly Win Rate">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={analytics.monthly}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.2} />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="winRate" fill="#0284c7" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartPanel>
        <ChartPanel title="Best Pair Breakdown">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={pairPieData} dataKey="absolutePnl" nameKey="name" outerRadius={95} label>
                {pairPieData.map((row, index) => <Cell key={index} fill={row.pnl < 0 ? '#e11d48' : colors[index % colors.length]} />)}
              </Pie>
              <Tooltip formatter={(_, __, item) => [`$${Number(item.payload.pnl).toFixed(2)}`, 'PnL']} />
            </PieChart>
          </ResponsiveContainer>
        </ChartPanel>
        <ChartPanel title="Most Common Mistakes">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={analytics.commonMistakes}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.2} />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} interval={0} angle={-18} textAnchor="end" height={70} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#e11d48" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartPanel>
      </div>
    </div>
  );
}
