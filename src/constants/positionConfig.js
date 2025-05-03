// src/constants/positionConfig.js
// ────────────────────────────────────────────────
// 画面中央 (left:50% / top:50vh) を原点 (=0,0) とし
// そこからの差分(px) だけを持たせる設定ファイル
// ────────────────────────────────────────────────

/* 好きな倍率で一括拡大縮小（1 = 等倍） */
export const TABLE_SCALE = 1;

/* ===== ① ベット円 6 個 ===== */
export const betPositions = {
  ante: { top: -480, left: -110 },
  bonus: { top: -480, left: -35 },
  jackpot: { top: -480, left: 40 },

  flop: { top: -350, left: -110 },
  turn: { top: -350, left: -35 },
  river: { top: -350, left: 40 },
};

/* ===== ② カード枠 2 + 5 + 2 ===== */
export const cardSlotPositions = {
  /* Dealer 2 枚 */
  dealer: [
    { top: -800, left: -105 }, // 1st
    { top: -800, left: +5 }, // 2nd
  ],

  /* Player 2 枚 */
  player: [
    { top: -200, left: -105 },
    { top: -200, left: +5 },
  ],

  /* Community 5 枚 */
  community: [
    { top: -640, left: -250 },
    { top: -640, left: -140 },
    { top: -640, left: -30 },
    { top: -640, left: +80 },
    { top: -640, left: +190 },
  ],
};
