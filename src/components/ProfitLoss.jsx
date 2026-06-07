import { formatCurrency, pnlClass } from '../lib/formatters';

export default function ProfitLoss({ value, className = '' }) {
  return <span className={`${pnlClass(value)} ${className}`}>{formatCurrency(value)}</span>;
}
