import { cardRanks } from '../constants/cards';

/**
 * カードを人間が見やすい文字に変換する関数
 * 例: "10H" → "10♥", "AS" → "A♠"
 */
export const formatCard = (card) => {
  const suitMap = {
    H: '♥',
    S: '♠',
    D: '♦',
    C: '♣',
  };
  const rank = card.slice(0, card.length - 1);
  const suit = card.slice(-1);
  return `${rank}${suitMap[suit] || suit}`;
};

/**
 * compareRanks の順番に合わせて hand のカードを並び替える関数
 * → 表示用に強い順に並べたいときに使う
 */
export const formatHandByCompareRanks = (hand, compareRanks) => {
  // カードのランクを数値に変換する関数
  const rankValue = (card) => cardRanks.indexOf(card.slice(0, card.length - 1));

  // ランクごとにカードをグループ分け
  const rankMap = {};
  for (const card of hand) {
    const val = rankValue(card);
    if (!rankMap[val]) rankMap[val] = [];
    rankMap[val].push(card);
  }

  // compareRanks の順にカードを選び、強い順に並べる
  const sorted = [];
  const usedCards = new Set();

  for (const val of compareRanks) {
    const group = rankMap[val] || [];
    for (const card of group) {
      if (!usedCards.has(card)) {
        sorted.push(card);
        usedCards.add(card);
        if (sorted.length === 5) return sorted;
      }
    }
  }

  // 5枚そろわなければ残りを補完
  for (const card of hand) {
    if (!usedCards.has(card)) {
      sorted.push(card);
      usedCards.add(card);
      if (sorted.length === 5) return sorted;
    }
  }

  return sorted; // 念のため（fallback）
};
