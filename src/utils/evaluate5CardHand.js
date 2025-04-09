import { cardRanks } from '../constants/cards';
/**
 * 与えられた5枚のカードから役を判定し、
 * スコア、役名、構成カード、比較用ランク値を返す関数
 */
export const evaluate5CardHand = (cards) => {
  const rankValue = (r) => cardRanks.indexOf(r); // ランク→数値変換
  const getRank = (card) => card.slice(0, card.length - 1); // "10H" → "10"
  const getSuit = (card) => card.slice(-1); // "10H" → "H"

  // ランクごとの枚数カウント（例: A=2枚）
  const rankCounts = {};
  // スートごとの枚数カウント（例: H=3枚）
  const suitCounts = {};

  // カウント集計
  cards.forEach((card) => {
    const rank = getRank(card);
    const suit = getSuit(card);
    rankCounts[rank] = (rankCounts[rank] || 0) + 1;
    suitCounts[suit] = (suitCounts[suit] || 0) + 1;
  });

  // ランクを多い順・強い順に並べる（後の役判定に使用）
  const counts = Object.entries(rankCounts).sort((a, b) => {
    if (b[1] === a[1]) return rankValue(b[0]) - rankValue(a[0]);
    return b[1] - a[1];
  });

  // ランクの重複を排除して数値化・昇順ソート（ストレート判定用）
  const uniqueRanks = [...new Set(cards.map(getRank).map(rankValue))].sort(
    (a, b) => a - b
  );
  if (uniqueRanks.includes(12)) uniqueRanks.unshift(-1); // Aを1としても扱う（A-2-3-4-5）

  // フラッシュ判定（同じスートが5枚以上あるか）
  const isFlush = Object.values(suitCounts).some((c) => c >= 5);

  // ストレート判定（5連番があるか）
  let isStraight = false;
  for (let i = 0; i <= uniqueRanks.length - 5; i++) {
    if (uniqueRanks[i + 4] - uniqueRanks[i] === 4) {
      isStraight = true;
      break;
    }
  }

  // カードをランク順にソート（共通処理で使う）
  const sortedCards = cards
    .slice()
    .sort((a, b) => rankValue(getRank(b)) - rankValue(getRank(a)));

  // フラッシュのスートとカード一覧を取得
  const flushSuit = Object.keys(suitCounts).find((s) => suitCounts[s] >= 5);
  const flushCards = flushSuit
    ? cards
        .filter((card) => getSuit(card) === flushSuit)
        .sort((a, b) => rankValue(getRank(b)) - rankValue(getRank(a)))
    : [];

  // ストレートフラッシュ or ロイヤルフラッシュ 判定
  const isStraightFlush =
    flushCards.length >= 5 &&
    (() => {
      const flushRanks = [
        ...new Set(flushCards.map(getRank).map(rankValue)),
      ].sort((a, b) => a - b);
      if (flushRanks.includes(12)) flushRanks.unshift(-1); // Aを1としても判定
      for (let i = 0; i <= flushRanks.length - 5; i++) {
        if (flushRanks[i + 4] - flushRanks[i] === 4) {
          const selected = flushCards
            .filter((card) => {
              const val = rankValue(getRank(card));
              return val >= flushRanks[i] && val <= flushRanks[i + 4];
            })
            .slice(0, 5);
          const isRoyal = flushRanks[i + 4] === 12;
          return {
            rank: isRoyal ? 'Royal Flush' : 'Straight Flush',
            score: isRoyal ? 10 : 9,
            hand: selected,
            compareRanks: selected.map((c) => rankValue(getRank(c))),
          };
        }
      }
      return false;
    })();

  if (isStraightFlush) return isStraightFlush;

  // フォーカード（4枚同ランク）
  if (counts[0][1] === 4) {
    const fourRank = counts[0][0];
    const four = cards.filter((c) => getRank(c) === fourRank);
    const kicker = sortedCards.find((c) => getRank(c) !== fourRank);
    return {
      rank: 'Four of a Kind',
      score: 8,
      hand: [...four, kicker],
      compareRanks: [rankValue(fourRank), rankValue(getRank(kicker))],
    };
  }

  // フルハウス（3枚 + 2枚）
  if (counts[0][1] === 3 && counts[1][1] >= 2) {
    const threeRank = counts[0][0];
    const pairRank = counts[1][0];
    const three = cards.filter((c) => getRank(c) === threeRank).slice(0, 3);
    const pair = cards.filter((c) => getRank(c) === pairRank).slice(0, 2);
    return {
      rank: 'Full House',
      score: 7,
      hand: [...three, ...pair],
      compareRanks: [rankValue(threeRank), rankValue(pairRank)],
    };
  }

  // フラッシュ
  if (isFlush) {
    const topFlush = flushCards.slice(0, 5);
    return {
      rank: 'Flush',
      score: 6,
      hand: topFlush,
      compareRanks: topFlush.map((c) => rankValue(getRank(c))),
    };
  }

  // ストレート
  if (isStraight) {
    for (let i = 0; i <= uniqueRanks.length - 5; i++) {
      if (uniqueRanks[i + 4] - uniqueRanks[i] === 4) {
        const values = uniqueRanks.slice(i, i + 5);
        const straight = [];
        for (const val of values) {
          const card = sortedCards.find(
            (c) => rankValue(getRank(c)) === (val === -1 ? 12 : val)
          );
          if (card) straight.push(card);
        }
        return {
          rank: 'Straight',
          score: 5,
          hand: straight,
          compareRanks: values.slice().reverse(),
        };
      }
    }
  }

  // スリーカード（3枚）
  if (counts[0][1] === 3) {
    const tripsRank = counts[0][0];
    const trips = cards.filter((c) => getRank(c) === tripsRank).slice(0, 3);
    const kickers = sortedCards
      .filter((c) => getRank(c) !== tripsRank)
      .slice(0, 2);
    return {
      rank: 'Three of a Kind',
      score: 4,
      hand: [...trips, ...kickers],
      compareRanks: [
        rankValue(tripsRank),
        ...kickers.map((c) => rankValue(getRank(c))),
      ],
    };
  }

  // ツーペア
  if (counts[0][1] === 2 && counts[1][1] === 2) {
    const pair1 = counts[0][0];
    const pair2 = counts[1][0];
    const pair1Cards = cards.filter((c) => getRank(c) === pair1).slice(0, 2);
    const pair2Cards = cards.filter((c) => getRank(c) === pair2).slice(0, 2);
    const kicker = sortedCards.find((c) => {
      const r = getRank(c);
      return r !== pair1 && r !== pair2;
    });
    const [highPair, lowPair] =
      rankValue(pair1) > rankValue(pair2)
        ? [pair1Cards, pair2Cards]
        : [pair2Cards, pair1Cards];
    return {
      rank: 'Two Pair',
      score: 3,
      hand: [...highPair, ...lowPair, kicker],
      compareRanks: [
        rankValue(getRank(highPair[0])),
        rankValue(getRank(lowPair[0])),
        rankValue(getRank(kicker)),
      ],
    };
  }

  // ワンペア
  if (counts[0][1] === 2) {
    const pairRank = counts[0][0];
    const pair = cards.filter((c) => getRank(c) === pairRank).slice(0, 2);
    const kickers = sortedCards
      .filter((c) => getRank(c) !== pairRank)
      .slice(0, 3);
    return {
      rank: 'One Pair',
      score: 2,
      hand: [...pair, ...kickers],
      compareRanks: [
        rankValue(pairRank),
        ...kickers.map((c) => rankValue(getRank(c))),
      ],
    };
  }

  // ハイカード（どの役にも該当しない）
  const top5 = sortedCards.slice(0, 5);
  return {
    rank: 'High Card',
    score: 1,
    hand: top5,
    compareRanks: top5.map((c) => rankValue(getRank(c))),
  };
};
