// src/constants/layoutConfig.js
// =============================================================
// 🎛️ レイアウト関連の「数値だけ」をここに一本化
//    ├ TABLE_SCALE  … 全体倍率（レスポンシブ化もここで）
//    ├ DIM.*        … 各パーツの基準サイズ(px)
//    └ POS.*        … 画面中央 (left:50%, top:50vh) を原点と
//                     した差分オフセット(px)
//      → 実際に描画する際は × TABLE_SCALE で縮尺
// =============================================================

// ---------- 0) 全体拡大／縮小倍率 ----------
export const TABLE_SCALE = 1; // 1 = 等倍

// ---------- 1) パーツ基準サイズ ----------
export const DIM = {
  CARD_W: 100, // カード幅
  CARD_H: 140, // カード高さ
  BET_D: 70, // ベット円直径
};

// ---------- 2) 座標オフセット ----------
export const POS = {
  /* 2-A) ベット円（6個） */
  bet: {
    ante: { top: -460, left: -385 },
    bonus: { top: -460, left: -315 },
    jackpot: { top: -460, left: -245 },
    flop: { top: -360, left: -110 },
    turn: { top: -360, left: -35 },
    river: { top: -360, left: 40 },
  },

  /* 2-B) カード枠（Dealer2 + Community5 + Player2） */
  cardSlot: {
    dealer: [
      { top: -800, left: -400 }, // 1st
      { top: -800, left: -290 }, // 2nd
    ],
    player: [
      { top: -50, left: -635 },
      { top: -50, left: -525 },
    ],
    community: [
      { top: -400, left: -360 },
      { top: -400, left: -470 },
      { top: -400, left: -580 },
      { top: -400, left: -690 },
      { top: -400, left: -800 },
    ],
  },

  /* 2-C) UI ボタン類 & ChipSelector */
  ui: {
    start: { top: 80, left: 0 }, // ゲーム開始
    fold: { top: -60, left: 200 },
    recharge: { top: -60, left: -200 },
    selector: { top: 180, left: 0 }, // ChipSelector
  },
};

// =============================================================
// ▼ 互換エイリアス  ── 既存コードは“何も直さず”そのまま動く ▼
//    置換が完了したら下4行を削除してクリーンに。
// =============================================================
export const betPositions = POS.bet;
export const cardSlotPositions = POS.cardSlot;
export const chipSelectorPos = POS.ui.selector;
export const uiPositions = POS.ui;
