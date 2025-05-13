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

  flop: { top: -360, left: -110 },
  turn: { top: -360, left: -35 },
  river: { top: -360, left: 40 },
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
    { top: -50, left: -635 },
    { top: -50, left: -525 },
  ],

  /* Community 5 枚 */
  community: [
    { top: -400, left: -360 },
    { top: -400, left: -470 },
    { top: -400, left: -580 },
    { top: -400, left: -690 },
    { top: -400, left: -800 },
  ],
};
/* ===== ③ ChipSelector 1 か所 ===== */
export const chipSelectorPos = { top: 0, left: 0 };

export const uiPositions = {
  startBtn: { top: 80, left: 0 },
  foldBtn: { top: -60, left: 200 },
  recharge: { top: -60, left: -200 },
  selector: { top: 180, left: 0 },
};
