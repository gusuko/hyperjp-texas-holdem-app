// payouts.js
// ボーナスハンドに対する払い戻し倍率（MBSルールに準拠）

export const bonusPayouts = {
  'Royal Flush': 500,
  'Straight Flush': 50,
  'Four of a Kind': 10,
  'Full House': 3,
  Flush: 2,
  Straight: 1,
  'Three of a Kind': 0, // MBSでは対象外
};
