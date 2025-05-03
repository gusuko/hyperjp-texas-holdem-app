// 5枚の役判定用関数をインポート（evaluate5CardHandは別ファイル）
import { evaluate5CardHand } from './evaluate5CardHand';
import { cardRanks } from '../constants/cards';

/**
 * 7枚のカード（プレイヤーの手札＋場のカード）から
 * 最強の5枚を選び、役・強さなどを返す関数
 */
export const evaluateBestHand = (cards) => {
  // 配列からk個の組み合わせをすべて列挙する関数
  const combinations = (arr, k) => {
    const result = [];
    const backtrack = (start, path) => {
      if (path.length === k) {
        result.push([...path]); // 5枚揃ったら結果に追加
        return;
      }
      for (let i = start; i < arr.length; i++) {
        path.push(arr[i]);
        backtrack(i + 1, path);
        path.pop(); // 戻って別の組み合わせへ
      }
    };
    backtrack(0, []);
    return result;
  };

  // 7枚から5枚の組み合わせを全列挙（21通り）
  const all5CardCombos = combinations(cards, 5);

  // 最強の役を探すための初期値
  let bestScore = -1;
  let bestRank = '';
  let bestHand = [];
  let bestCompareRanks = [];

  // 全ての5枚組に対して役を判定し、最強の手を見つける
  for (let hand of all5CardCombos) {
    const result = evaluate5CardHand(hand); // 役判定
    const score = result.score;

    if (score > bestScore) {
      // より強い役が見つかったら更新
      bestScore = score;
      bestRank = result.rank;
      bestHand = result.hand;
      bestCompareRanks = result.compareRanks;
    } else if (score === bestScore) {
      // 同じ役の強さなら、キッカーなどで詳細比較
      const currentCompare = result.compareRanks;
      for (let i = 0; i < currentCompare.length; i++) {
        if (currentCompare[i] > bestCompareRanks[i]) {
          bestScore = score;
          bestRank = result.rank;
          bestHand = result.hand;
          bestCompareRanks = currentCompare;
          break;
        }
        if (currentCompare[i] < bestCompareRanks[i]) {
          break; // 相手の方が強かったらそのまま
        }
        // 同じなら次へ
      }
    }
  }

  // 結果として選ばれた5枚の手札をランク順に並べ直す
  bestHand.sort((a, b) => {
    const getRank = (card) => card.slice(0, card.length - 1); // ランクだけ取り出す
    const ranksOrder = cardRanks;
    return ranksOrder.indexOf(getRank(b)) - ranksOrder.indexOf(getRank(a));
  });

  // 最強の役情報を返す
  return {
    rank: bestRank, // 役の名前（例：Full House）
    hand: bestHand, // 5枚のカード（ランク順）
    score: bestScore, // 役のスコア（1〜10）
    compareRanks: bestCompareRanks, // キッカーやペアの順位比較用
  };
};
