import { sampleTrades } from '../data/sampleTrades';
import { deleteLocalImage, saveLocalImage, saveLocalDataUrl } from './localImageStore';
import { normalizeTrade } from './tradeModel';
import { screenshotBucket, supabase } from './supabase';

const STORAGE_KEY = 'smc-ict-trading-journal';
const MAX_IMAGE_SIZE = 8 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];

const fromLocal = () => {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return sampleTrades;
  try {
    return JSON.parse(raw).map(normalizeTrade);
  } catch {
    return sampleTrades;
  }
};

const migrateLocalDataUrls = async (trades) => {
  let changed = false;
  const migrated = [];

  for (const trade of trades) {
    const nextTrade = { ...trade };
    for (const field of ['before_trade_screenshot_url', 'after_trade_screenshot_url']) {
      if (typeof nextTrade[field] === 'string' && nextTrade[field].startsWith('data:image/')) {
        const slot = field === 'before_trade_screenshot_url' ? 'before' : 'after';
        nextTrade[field] = await saveLocalDataUrl(`${trade.id}/${slot}-migrated-${Date.now()}`, nextTrade[field]);
        changed = true;
      }
    }
    migrated.push(nextTrade);
  }

  if (changed) toLocal(migrated);
  return migrated;
};

const toLocal = (trades) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trades));
  } catch (error) {
    if (error.name === 'QuotaExceededError') {
      throw new Error('Browser storage is full. Screenshots are now saved separately, but older large local screenshots may need to be deleted or the app storage cleared.');
    }
    throw error;
  }
};

export const repository = {
  async listTrades() {
    if (!supabase) return await migrateLocalDataUrls(fromLocal());
    const { data, error } = await supabase.from('trades').select('*').order('trade_date', { ascending: false });
    if (error) throw error;
    const { data: screenshots, error: screenshotError } = await supabase
      .from('trade_screenshots')
      .select('trade_id,screenshot_type,image_url');
    if (screenshotError) throw screenshotError;

    const screenshotsByTrade = new Map();
    screenshots.forEach((screenshot) => {
      const current = screenshotsByTrade.get(screenshot.trade_id) || {};
      current[screenshot.screenshot_type] = screenshot.image_url;
      screenshotsByTrade.set(screenshot.trade_id, current);
    });

    return data.map((trade) => {
      const storedScreenshots = screenshotsByTrade.get(trade.id) || {};
      return normalizeTrade({
        ...trade,
        before_trade_screenshot_url: trade.before_trade_screenshot_url || storedScreenshots.before || '',
        after_trade_screenshot_url: trade.after_trade_screenshot_url || storedScreenshots.after || '',
      });
    });
  },

  async upsertTrade(trade) {
    const payload = {
      ...trade,
      result: trade.result || null,
      profit_loss: trade.profit_loss === '' ? null : Number(trade.profit_loss),
      rr_achieved: trade.rr_achieved === '' ? null : Number(trade.rr_achieved),
      daily_reflection: trade.daily_reflection || '',
      updated_at: new Date().toISOString(),
    };

    if (!supabase) {
      const trades = fromLocal();
      const next = [payload, ...trades.filter((item) => item.id !== trade.id)];
      toLocal(next);
      return payload;
    }

    const { data, error } = await supabase.from('trades').upsert(payload).select().single();
    if (error) throw error;
    await upsertScreenshotRows(data);
    return normalizeTrade(data);
  },

  async deleteTrade(id) {
    if (!supabase) {
      const trade = fromLocal().find((item) => item.id === id);
      if (trade) {
        await deleteLocalImage(trade.before_trade_screenshot_url);
        await deleteLocalImage(trade.after_trade_screenshot_url);
      }
      toLocal(fromLocal().filter((trade) => trade.id !== id));
      return;
    }
    const { error } = await supabase.from('trades').delete().eq('id', id);
    if (error) throw error;
  },

  async uploadScreenshot(tradeId, slot, file) {
    if (!file) return '';
    validateImage(file);
    const extension = file.name.split('.').pop()?.toLowerCase() || 'jpg';

    if (!supabase) {
      return await saveLocalImage(`${tradeId}/${slot}-${Date.now()}.${extension}`, file);
    }

    const path = `${tradeId}/${slot}-${Date.now()}.${extension}`;
    const { error } = await supabase.storage.from(screenshotBucket).upload(path, file, {
      contentType: file.type,
      upsert: true,
    });
    if (error) throw error;
    const { data } = supabase.storage.from(screenshotBucket).getPublicUrl(path);
    return data.publicUrl;
  },
};

const validateImage = (file) => {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    throw new Error('Only PNG, JPG, JPEG, and WEBP screenshots are supported.');
  }
  if (file.size > MAX_IMAGE_SIZE) {
    throw new Error('Screenshot must be 8MB or smaller.');
  }
};

const upsertScreenshotRows = async (trade) => {
  if (!supabase) return;
  const rows = [
    {
      trade_id: trade.id,
      screenshot_type: 'before',
      image_url: trade.before_trade_screenshot_url || null,
    },
    {
      trade_id: trade.id,
      screenshot_type: 'after',
      image_url: trade.after_trade_screenshot_url || null,
    },
  ];
  const { error } = await supabase.from('trade_screenshots').upsert(rows, {
    onConflict: 'trade_id,screenshot_type',
  });
  if (error) throw error;
};
