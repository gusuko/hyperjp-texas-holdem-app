// jackpotUtils.js
// 👉 プレイヤーの2枚＋FLOP3枚のみで構成された役に対して、Jackpotの配当を返すユーティリティ関数

import { evaluateBestHand } from './evaluateHand';

// 🎯 固定ジャックポット金額（例：100万ドル）
export const JACKPOT_FIXED_AMOUNT = 1_000_000;

/**
 * ジャックポット配当を計算する
 * @param {string[]} hand - プレイヤーの手札2枚＋FLOPの3枚（合計5枚）
 * @param {number} jackpotBet - 賭けたJackpot金額
 * @returns {Object} - { rank, payout }
 */
export const getJackpotPayout = (hand, jackpotBet) => {
  const result = evaluateBestHand(hand);
  let winAmount = 0;

  switch (result.rank) {
    case 'Royal Flush':
      winAmount = JACKPOT_FIXED_AMOUNT;
      break;
    case 'Straight Flush':
      winAmount = JACKPOT_FIXED_AMOUNT * 0.1; // 10％
      break;
    case 'Four of a Kind':
      winAmount = jackpotBet * 400;
      break;
    case 'Full House':
      winAmount = jackpotBet * 80;
      break;
    case 'Flush':
      winAmount = jackpotBet * 40;
      break;
    case 'Straight':
      winAmount = jackpotBet * 20;
      break;
  }

  return {
    rank: result.rank,
    payout: winAmount,
  };
};
