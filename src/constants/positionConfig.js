export const TABLE_SCALE = 1; // ← 好きな倍率に

export const betPositions = {
  ante: { top: 470, left: 490 }, // ← 数字を ± で微調整
  bonus: { top: 470, left: 565 },
  jackpot: { top: 470, left: 640 },
  flop: { top: 570, left: 490 },
  turn: { top: 570, left: 565 },
  river: { top: 570, left: 640 },
};

export const cardSlotPositions = {
  dealer: [
    { top: 150, left: 495 },
    { top: 150, left: 605 },
  ],
  player: [
    { top: 700, left: 495 },
    { top: 700, left: 605 },
  ],
  community: [
    { top: 310, left: 350 },
    { top: 310, left: 460 },
    { top: 310, left: 570 },
    { top: 310, left: 680 },
    { top: 310, left: 790 },
  ],
};
