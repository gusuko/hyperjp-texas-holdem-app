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
    ante: { top: -60, left: -635 },
    bonus: { top: -60, left: -560 },
    jackpot: { top: -60, left: -485 },
    flop: { top: -150, left: -450 },
    turn: { top: -150, left: -670 },
    river: { top: -150, left: -780 },
  },

  /* 2-B) カード枠（Dealer2 + Community5 + Player2） */
  cardSlot: {
    dealer: [
      { top: -480, left: -635 }, // 1st
      { top: -480, left: -525 }, // 2nd
    ],
    player: [
      { top: 50, left: -635 },
      { top: 50, left: -525 },
    ],
    community: [
      { top: -300, left: -360 },
      { top: -300, left: -470 },
      { top: -300, left: -580 },
      { top: -300, left: -690 },
      { top: -300, left: -800 },
    ],
  },

  /* 2-C) UI ボタン類 & ChipSelector */
  ui: {
    start: { top: 50, left: -300 }, // ゲーム開始
    fold: { top: 50, left: -300 },
    recharge: { top: 50, left: -800 },
    selector: { top: 250, left: -800 }, // ChipSelector
    playAgain: { top: 50, left: -300 },
    check: { top: 50, left: -300 },
    resultText: { top: -500, left: -200 }, //ShowDownresult.js内
  },
};
