import { parseNumber } from './tradeModel';

export const pnlTone = (value) => {
  const parsed = parseNumber(value);
  if (parsed < 0) return 'bad';
  if (parsed > 0) return 'good';
  return 'default';
};

export const pnlClass = (value) => {
  const tone = pnlTone(value);
  if (tone === 'bad') return 'text-rose-600 dark:text-rose-400';
  if (tone === 'good') return 'text-emerald-600 dark:text-emerald-400';
  return 'text-slate-700 dark:text-slate-200';
};

export const formatCurrency = (value) => {
  const parsed = parseNumber(value);
  const sign = parsed < 0 ? '-' : '';
  return `${sign}$${Math.abs(parsed).toFixed(2)}`;
};
