/**
 * プレイヤーの2枚のカードに応じたボーナス倍率を返す関数
 * → MBSルール
 */
export const getBonusMultiplierForPlayer = (playerCards) => {
  // プレイヤーの2枚のカードを分解
  const [card1, card2] = playerCards;
  const rank1 = card1.slice(0, card1.length - 1); // 例: "A" or "10"
  const rank2 = card2.slice(0, card2.length - 1);
  const suit1 = card1.slice(-1); // 例: "H"
  const suit2 = card2.slice(-1);

  // スート一致＝スーテッド、ランク一致＝ペア
  const isSuited = suit1 === suit2;
  const pair = rank1 === rank2;

  // 🎯 特別ルール：Aのペアは最高倍率
  if (pair && rank1 === 'A') return 30;

  // 🎯 スーテッドの特定コンビネーション
  if (isSuited) {
    if ((rank1 === 'A' && rank2 === 'K') || (rank1 === 'K' && rank2 === 'A'))
      return 30;
    if (
      (rank1 === 'A' && rank2 === 'Q') ||
      (rank1 === 'Q' && rank2 === 'A') ||
      (rank1 === 'A' && rank2 === 'J') ||
      (rank1 === 'J' && rank2 === 'A')
    )
      return 20;
  }

  // 🎯 オフスート（スート違い）のAK, AQ, AJ
  if ((rank1 === 'A' && rank2 === 'K') || (rank1 === 'K' && rank2 === 'A'))
    return 15;
  if (
    (rank1 === 'A' && rank2 === 'Q') ||
    (rank1 === 'Q' && rank2 === 'A') ||
    (rank1 === 'A' && rank2 === 'J') ||
    (rank1 === 'J' && rank2 === 'A')
  )
    return 5;

  // 🎯 その他のペア（KQJ, それ以下）
  const highPairs = ['K', 'Q', 'J'];
  const lowPairs = ['10', '9', '8', '7', '6', '5', '4', '3', '2'];

  if (pair && highPairs.includes(rank1)) return 10;
  if (pair && lowPairs.includes(rank1)) return 3;

  // 上記に該当しなければボーナスなし
  return 0;
};

/**
 * プレイヤーとディーラーが共にAA（エースのペア）を持っていた場合に
 * BONUS BET を1000倍にする特別ボーナスを適用する関数
 *
 * → MBSルールの特例処理
 */
export const checkDoubleAceBonus = (playerCards, dealerCards) => {
  const isAA = ([c1, c2]) => {
    const r1 = c1.slice(0, c1.length - 1);
    const r2 = c2.slice(0, c2.length - 1);
    return r1 === 'A' && r2 === 'A';
  };

  // 両方がAAなら 1000 倍
  if (isAA(playerCards) && isAA(dealerCards)) {
    return 1000;
  }

  return 0;
};
