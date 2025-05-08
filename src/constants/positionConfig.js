// src/constants/positionConfig.js
// ────────────────────────────────────────────────
// 画面中央 (left:50% / top:50vh) を原点 (=0,0) とし
// そこからの差分(px) だけを持たせる設定ファイル
// ────────────────────────────────────────────────

/* 好きな倍率で一括拡大縮小（1 = 等倍） */
export const TABLE_SCALE = 1;

/* ===== ① ベット円 6 個 ===== */
export const betPositions = {
  ante: { top: -460, left: -385 },
  bonus: { top: -460, left: -315 },
  jackpot: { top: -460, left: -245 },

  flop: { top: -460, left: -110 },
  turn: { top: -460, left: -35 },
  river: { top: -460, left: 40 },
};

/* ===== ② カード枠 2 + 5 + 2 ===== */
export const cardSlotPositions = {
  /* Dealer 2 枚 */
  dealer: [
    { top: -800, left: -400 }, // 1st
    { top: -800, left: -290 }, // 2nd
  ],

  /* Player 2 枚 */
  player: [
    { top: -350, left: -400 },
    { top: -350, left: -290 },
  ],

  /* Community 5 枚 */
  community: [
    { top: -640, left: -565 },
    { top: -640, left: -455 },
    { top: -640, left: -345 },
    { top: -640, left: -235 },
    { top: -640, left: -125 },
  ],
};
/* ===== ③ ChipSelector 1 か所 ===== */
export const chipSelectorPos = { top: 440, left: -300 };
