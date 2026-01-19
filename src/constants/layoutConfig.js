// src/constants/layoutConfig.js
// =============================================================
// 🎛️ レイアウト数値の一本化
//  - NEG_POS: “中央(0,0)基準 ±px” を保持（昔の座標をそのまま保存）
//  - POS    : NEG_POS を「左上(0,0)基準」に変換して export
// =============================================================

export const TABLE_SCALE = 1;

// ---------- 1) ゲームボード基準サイズ ----------
export const BOARD_W = 1100; // .game-board の width と合わせる
export const BOARD_H = 1100; // .game-board の height と合わせる
const CENTER_X = BOARD_W / 2;
const CENTER_Y = BOARD_H / 2;

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
  bet: {
    ante: { top: -120, left: -410 },
    bonus: { top: -120, left: -330 },
    jackpot: { top: -120, left: -250 },
    flop: { top: -220, left: -230 },
    turn: { top: -220, left: -450 },
    river: { top: -220, left: -560 },
  },

  cardSlot: {
    dealer: [
      { top: -550, left: -415 },
      { top: -550, left: -310 },
    ],
    player: [
      { top: -15, left: -415 },
      { top: -15, left: -310 },
    ],
    community: [
      { top: -370, left: -140 },
      { top: -370, left: -250 },
      { top: -370, left: -360 },
      { top: -370, left: -470 },
      { top: -370, left: -580 },
    ],
  },

  ui: {
    start: { top: 0, left: -150 },
    fold: { top: 30, left: -150 },
    recharge: { top: -25, left: -600 },
    selector: { top: 130, left: -600 },
    playAgain: { top: 30, left: -190 },
    check: { top: 30, left: -150 },
    chips: { top: -500, left: -200 },
  },
};

/* =============================================================
   B) NEG_POS → 左上 (0,0) 基準へ変換して export する POS
   ============================================================= */

// タイトル分の上余白（必要なら後で調整）
const BOARD_PADDING_TOP = 150;

// 追加：全体を右に寄せる（まずはこれで重なりを解消）
const GLOBAL_SHIFT_X = 300; // ← まずは 260 で試す（後で調整）

const shift = ({ top, left }) => ({
  top: top + CENTER_Y + BOARD_PADDING_TOP,
  left: left + CENTER_X + GLOBAL_SHIFT_X,
});

export const POS = {
  bet: Object.fromEntries(
    Object.entries(NEG_POS.bet).map(([k, v]) => [k, shift(v)]),
  ),

  cardSlot: {
    dealer: NEG_POS.cardSlot.dealer.map(shift),
    player: NEG_POS.cardSlot.player.map(shift),
    community: NEG_POS.cardSlot.community.map(shift),
  },

  ui: Object.fromEntries(
    Object.entries(NEG_POS.ui).map(([k, v]) => [k, shift(v)]),
  ),
};
