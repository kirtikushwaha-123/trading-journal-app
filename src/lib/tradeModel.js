import { CHECKBOX_FIELDS } from '../data/checklists';

export const emptyTrade = () => {
  const today = new Date().toISOString().slice(0, 10);
  const checkboxes = CHECKBOX_FIELDS.reduce((acc, field) => {
    acc[field] = false;
    return acc;
  }, {});

  return {
    ...checkboxes,
    id: crypto.randomUUID(),
    trade_date: today,
    pair: 'EUR/USD',
    custom_pair: '',
    direction: 'Buy',
    result: '',
    profit_loss: '',
    rr_achieved: '',
    entry_thoughts: '',
    exit_thoughts: '',
    daily_reflection: '',
    before_trade_screenshot_url: '',
    after_trade_screenshot_url: '',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
};

export const normalizeTrade = (trade) => {
  const base = emptyTrade();
  return {
    ...base,
    ...trade,
    profit_loss: trade?.profit_loss ?? '',
    rr_achieved: trade?.rr_achieved ?? '',
  };
};

export const isReflectionComplete = (trade) => trade.daily_reflection.trim().length > 0;

export const getWeekRange = (date = new Date()) => {
  const copy = new Date(date);
  const day = copy.getDay() || 7;
  copy.setDate(copy.getDate() - day + 1);
  copy.setHours(0, 0, 0, 0);
  const start = new Date(copy);
  const end = new Date(copy);
  end.setDate(start.getDate() + 6);
  end.setHours(23, 59, 59, 999);
  return { start, end };
};

export const parseNumber = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};
