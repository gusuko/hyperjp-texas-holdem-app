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
    ante: { top: -50, left: -410 },
    bonus: { top: -50, left: -330 },
    jackpot: { top: -50, left: -250 },
    flop: { top: -150, left: -230 },
    turn: { top: -150, left: -450 },
    river: { top: -150, left: -560 },
  },

  /* 2-B) カード枠（Dealer2 + Community5 + Player2） */
  cardSlot: {
    dealer: [
      { top: -480, left: -415 }, // 1st
      { top: -480, left: -310 }, // 2nd
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

  /* 2-C) UI ボタン類 & ChipSelector */
  ui: {
    start: { top: 100, left: -150 }, // ゲーム開始
    fold: { top: 100, left: -150 },
    recharge: { top: 100, left: -600 },
    selector: { top: 200, left: -600 }, // ChipSelector
    playAgain: { top: 100, left: -150 },
    check: { top: 100, left: -150 },
    resultText: { top: -500, left: 0 },
    bonusTable: { top: -550, left: -840 },
    jackpotTable: { top: -250, left: -840 },
  },
};
