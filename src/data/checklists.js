export const CHECKLIST_GROUPS = [
  {
    id: 'bias',
    title: 'Higher Timeframe Bias (Daily / H4)',
    items: [
      ['bias_bullish_identified', 'Bullish bias identified'],
      ['bias_bearish_identified', 'Bearish bias identified'],
      ['premium_zone_marked', 'Premium zone marked'],
      ['discount_zone_marked', 'Discount zone marked'],
      ['major_liquidity_target_identified', 'Major liquidity target identified'],
    ],
  },
  {
    id: 'liquidity',
    title: 'Liquidity',
    items: [
      ['equal_highs_identified', 'Equal highs identified'],
      ['equal_lows_identified', 'Equal lows identified'],
      ['previous_day_high_identified', 'Previous day high identified'],
      ['previous_day_low_identified', 'Previous day low identified'],
      ['session_liquidity_identified', 'Session liquidity identified'],
      ['liquidity_swept', 'Liquidity swept'],
      ['liquidity_likely_to_be_swept', 'Liquidity likely to be swept'],
    ],
  },
  {
    id: 'session',
    title: 'Session',
    items: [
      ['session_london', 'London Session'],
      ['session_new_york', 'New York Session'],
      ['session_asian', 'Asian Session'],
      ['avoiding_low_liquidity_session', 'Avoiding low-liquidity session'],
    ],
  },
  {
    id: 'market_structure',
    title: 'Market Structure',
    items: [
      ['mss_occurred', 'MSS occurred'],
      ['bos_occurred', 'BOS occurred'],
      ['displacement_candle_present', 'Displacement candle present'],
    ],
  },
  {
    id: 'entry_model',
    title: 'Entry Model',
    items: [
      ['entry_fvg', 'Fair Value Gap (FVG)'],
      ['entry_order_block', 'Order Block (OB)'],
      ['entry_breaker_block', 'Breaker Block'],
      ['entry_mitigation_block', 'Mitigation Block'],
      ['entry_not_chasing_price', 'Entry is not chasing price'],
    ],
  },
  {
    id: 'risk_management',
    title: 'Risk Management',
    items: [
      ['stop_loss_placed_correctly', 'Stop loss placed correctly'],
      ['risk_fixed_0_5_percent', 'Risk fixed at 0.5%'],
      ['risk_fixed_1_percent', 'Risk fixed at 1%'],
      ['minimum_rr_1_2', 'Minimum RR 1:2'],
      ['rr_1_3_plus', 'RR 1:3+'],
      ['rr_1_4_plus', 'RR 1:4+'],
    ],
  },
  {
    id: 'news_filter',
    title: 'News Filter',
    items: [
      ['no_major_high_impact_news', 'No major high-impact news'],
      ['aware_of_usd_news', 'Aware of USD news'],
      ['news_checked_before_entry', 'News checked before entry'],
    ],
  },
  {
    id: 'psychology',
    title: 'Psychology',
    items: [
      ['not_revenge_trading', 'Not revenge trading'],
      ['not_recovering_losses', 'Not trying to recover losses'],
      ['following_trading_plan', 'Following trading plan'],
      ['emotion_controlled', 'Emotion controlled'],
      ['patient_entry', 'Patient entry'],
    ],
  },
];

export const CHECKBOX_FIELDS = CHECKLIST_GROUPS.flatMap((group) => group.items.map(([field]) => field));

export const PAIRS = ['EUR/USD', 'Gold (XAU/USD)','ETH', 'BTC','SOL', 'Other'];
export const DIRECTIONS = ['Buy', 'Sell'];
export const RESULTS = ['Win', 'Loss', 'Breakeven'];

export const SESSION_FIELDS = ['session_london', 'session_new_york', 'session_asian', 'avoiding_low_liquidity_session'];
export const ENTRY_MODEL_FIELDS = ['entry_fvg', 'entry_order_block', 'entry_breaker_block', 'entry_mitigation_block'];
export const RISK_FIELDS = ['stop_loss_placed_correctly', 'risk_fixed_0_5_percent', 'risk_fixed_1_percent', 'minimum_rr_1_2', 'rr_1_3_plus', 'rr_1_4_plus'];
export const PSYCHOLOGY_FIELDS = ['not_revenge_trading', 'not_recovering_losses', 'following_trading_plan', 'emotion_controlled', 'patient_entry'];

export const FIELD_LABELS = CHECKLIST_GROUPS.reduce((labels, group) => {
  group.items.forEach(([field, label]) => {
    labels[field] = label;
  });
  return labels;
}, {});
