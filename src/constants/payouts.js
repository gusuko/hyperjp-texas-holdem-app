// payouts.js
// ボーナスハンドに対する払い戻し倍率（MBSルールに準拠）

export const bonusPayouts = {
  'A-A vs A-A': 1000,
  'A-A': 30,
  'A-K Suited': 30,
  'A-Q, A-J Suited': 20,
  'A-K Unsuited': 15,
  'K-K, Q-Q, J-J': 10,
  'A-Q, A-J Unsuited': 5,
  '10-10 to 2-2': 3,
};

/* ジャックポットも同じ書式で並べると後で流用しやすい */
export const jackpotPayouts = {
  'Royal Flush': '$1,000,000',
  'Straight Flush': '$100,000',
  'Four of a Kind': 400,
  'Full House': 80,
  Flush: 40,
  Straight: 20,
};
