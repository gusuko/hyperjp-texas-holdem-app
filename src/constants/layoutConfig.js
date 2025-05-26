// src/constants/layoutConfig.js
// =============================================================
// 🎛️ レイアウト関連の「数値だけ」をここに一本化
//    – “NEG_POS” で中央±px を保持
//    – “POS” で左上 (0,0) 基準に変換して export
// =============================================================

// ---------- 0) グローバル倍率（今は使わないが残しておく） ----------
export const TABLE_SCALE = 1;

// ---------- 1) ゲームボード基準サイズ ----------
export const BOARD_W = 1800; // .game-board の width と同じ
export const BOARD_H = 1100; // .game-board の height と同じ
const CENTER_X = BOARD_W / 2; // 900
const CENTER_Y = BOARD_H / 2; // 550

// ---------- 2) パーツ基準寸法 ----------
export const DIM = {
  CARD_W: 100,
  CARD_H: 140,
  BET_D: 70,
};

/* =============================================================
   A) 旧来の “中央 (0,0) 基準 ±px” 座標を NEG_POS として保持
   ============================================================= */
const NEG_POS = {
  /* A-1) ベット円（6個） */
  bet: {
    ante: { top: -50, left: -410 },
    bonus: { top: -50, left: -330 },
    jackpot: { top: -50, left: -250 },
    flop: { top: -150, left: -230 },
    turn: { top: -150, left: -450 },
    river: { top: -150, left: -560 },
  },

  /* A-2) カード枠 */
  cardSlot: {
    dealer: [
      { top: -480, left: -415 },
      { top: -480, left: -310 },
    ],
    player: [
      { top: 50, left: -415 },
      { top: 50, left: -310 },
    ],
    community: [
      { top: -300, left: -140 },
      { top: -300, left: -250 },
      { top: -300, left: -360 },
      { top: -300, left: -470 },
      { top: -300, left: -580 },
    ],
  },

  /* A-3) UI ボタン類 & テーブル類 */
  ui: {
    start: { top: 100, left: -150 },
    fold: { top: 100, left: -150 },
    recharge: { top: 100, left: -600 },
    selector: { top: 200, left: -600 },
    playAgain: { top: 100, left: -150 },
    check: { top: 100, left: -150 },
    resultText: { top: -500, left: 0 },
    bonusTable: { top: -550, left: -840 },
    jackpotTable: { top: -250, left: -840 },
    chips: { top: -500, left: -200 },
  },
};

/* =============================================================
   B) NEG_POS → 左上 (0,0) 基準へ変換して export する POS
   ============================================================= */
const shift = ({ top, left }) => ({
  top: top + CENTER_Y,
  left: left + CENTER_X,
});

export const POS = {
  // ベット円
  bet: Object.fromEntries(
    Object.entries(NEG_POS.bet).map(([k, v]) => [k, shift(v)])
  ),

  // カード枠
  cardSlot: {
    dealer: NEG_POS.cardSlot.dealer.map(shift),
    player: NEG_POS.cardSlot.player.map(shift),
    community: NEG_POS.cardSlot.community.map(shift),
  },

  // UI ボタン・テーブル
  ui: Object.fromEntries(
    Object.entries(NEG_POS.ui).map(([k, v]) => [k, shift(v)])
  ),
};
