import { ENTRY_MODEL_FIELDS, FIELD_LABELS, PSYCHOLOGY_FIELDS, RISK_FIELDS, SESSION_FIELDS } from '../data/checklists';
import { getWeekRange, parseNumber } from './tradeModel';

export const summarizeTrades = (trades) => {
  const total = trades.length;
  const wins = trades.filter((trade) => trade.result === 'Win').length;
  const losses = trades.filter((trade) => trade.result === 'Loss').length;
  const breakeven = trades.filter((trade) => trade.result === 'Breakeven').length;
  const totalPnl = trades.reduce((sum, trade) => sum + parseNumber(trade.profit_loss), 0);
  const averageRr = total ? trades.reduce((sum, trade) => sum + parseNumber(trade.rr_achieved), 0) / total : 0;

  return {
    total,
    wins,
    losses,
    breakeven,
    winRate: total ? Math.round((wins / total) * 100) : 0,
    totalPnl,
    averageRr,
  };
};

export const filterThisWeek = (trades) => {
  const { start, end } = getWeekRange();
  return trades.filter((trade) => {
    const date = new Date(trade.trade_date);
    return date >= start && date <= end;
  });
};

export const groupPerformance = (trades, key) => {
  const map = new Map();
  trades.forEach((trade) => {
    const label = trade[key] || 'Unspecified';
    const current = map.get(label) || { name: label, trades: 0, pnl: 0, wins: 0 };
    current.trades += 1;
    current.pnl += parseNumber(trade.profit_loss);
    current.wins += trade.result === 'Win' ? 1 : 0;
    map.set(label, current);
  });
  return Array.from(map.values()).map((row) => ({
    ...row,
    winRate: row.trades ? Math.round((row.wins / row.trades) * 100) : 0,
  }));
};

export const checkboxPerformance = (trades, fields) =>
  fields
    .map((field) => {
      const matched = trades.filter((trade) => trade[field]);
      return {
        name: FIELD_LABELS[field],
        trades: matched.length,
        pnl: matched.reduce((sum, trade) => sum + parseNumber(trade.profit_loss), 0),
        wins: matched.filter((trade) => trade.result === 'Win').length,
      };
    })
    .filter((row) => row.trades > 0)
    .map((row) => ({ ...row, winRate: Math.round((row.wins / row.trades) * 100) }));

export const weeklyAnalytics = (trades) => {
  const week = filterThisWeek(trades);
  return {
    trades: week,
    summary: summarizeTrades(week),
    pair: groupPerformance(week, 'pair'),
    session: checkboxPerformance(week, SESSION_FIELDS),
    psychology: checkboxPerformance(week, PSYCHOLOGY_FIELDS),
    entryModel: checkboxPerformance(week, ENTRY_MODEL_FIELDS),
    risk: checkboxPerformance(week, RISK_FIELDS),
  };
};

export const monthlyAnalytics = (trades) => {
  const byMonth = new Map();
  trades.forEach((trade) => {
    const month = trade.trade_date.slice(0, 7);
    const current = byMonth.get(month) || { name: month, trades: 0, pnl: 0, wins: 0 };
    current.trades += 1;
    current.pnl += parseNumber(trade.profit_loss);
    current.wins += trade.result === 'Win' ? 1 : 0;
    byMonth.set(month, current);
  });

  const monthly = Array.from(byMonth.values())
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((row) => ({ ...row, winRate: row.trades ? Math.round((row.wins / row.trades) * 100) : 0 }));

  const pair = groupPerformance(trades, 'pair').sort((a, b) => b.pnl - a.pnl);
  const session = checkboxPerformance(trades, SESSION_FIELDS).sort((a, b) => b.pnl - a.pnl);
  const entry = checkboxPerformance(trades, ENTRY_MODEL_FIELDS).sort((a, b) => b.pnl - a.pnl);
  const mistakes = [
    ['entry_not_chasing_price', 'Chasing price'],
    ['stop_loss_placed_correctly', 'Poor stop placement'],
    ['following_trading_plan', 'Plan not followed'],
    ['emotion_controlled', 'Emotional execution'],
    ['patient_entry', 'Impatient entry'],
    ['news_checked_before_entry', 'News not checked'],
  ].map(([field, label]) => ({
    name: label,
    count: trades.filter((trade) => !trade[field]).length,
  }));

  return {
    monthly,
    bestPair: pair[0]?.name || 'No trades yet',
    bestSession: session[0]?.name || 'No trades yet',
    bestEntryModel: entry[0]?.name || 'No trades yet',
    commonMistakes: mistakes.filter((item) => item.count > 0).sort((a, b) => b.count - a.count),
    pair,
    session,
    entry,
  };
};
