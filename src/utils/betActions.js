/**
 * Flop ベットを処理する関数
 * - チップを引く
 * - Flopベット額をセット
 * - フェーズとコミュニティカードを更新
 */
export const handleFlopBet = ({
  betAmount,
  deck,
  setChips,
  setFlopBet,
  setCommunityCards,
  setGamePhase,
}) => {
  setChips((prev) => prev - betAmount);
  setFlopBet(betAmount);
  setCommunityCards(deck.slice(4, 7)); // Flopカード3枚
  setGamePhase('flop');
};

/**
 * Turn ベットを処理する関数
 * - チップを引く
 * - Turnベット額をセット
 * - フェーズと場カードを更新
 */
export const handleTurnBet = ({
  betAmount,
  deck,
  setChips,
  setTurnBet,
  setTurnBetPlaced,
  setCommunityCards,
  setGamePhase,
}) => {
  setChips((prev) => prev - betAmount);
  setTurnBet(betAmount);
  setCommunityCards((prev) => [...prev, deck[7]]); // Turnカード1枚追加
  setGamePhase('turn');
};
/**
 * River ベットを処理する関数
 * - チップを引く
 * - Riverベット額をセット
 * - 最後のコミュニティカードを追加
 * - フェーズを "showdown" にして勝負に進む
 */
export const handleRiverBet = ({
  betAmount,
  deck,
  setChips,
  setRiverBet,
  setRiverBetPlaced,
  setCommunityCards,
  setGamePhase,
  setShowdown,
}) => {
  setChips((prev) => prev - betAmount);
  setRiverBet(betAmount);
  setCommunityCards((prev) => [...prev, deck[8]]); // Riverカードは9枚目（index 8）
  setGamePhase('showdown'); // 最終フェーズへ
  setShowdown(true); // Showdown画面に切り替える
};
/**
 * Turn フェーズでチェック（ベットせず進む）する処理
 * - Turnカードを1枚追加
 * - フェーズを "turn" に進める
 */
export const handleCheckTurn = ({
  deck,
  setTurnBetPlaced,
  setCommunityCards,
  setGamePhase,
}) => {
  setCommunityCards((prev) => [...prev, deck[7]]); // Turnカードを追加
  setGamePhase('turn');
};

/**
 * River フェーズでチェック（ベットせず進む）する処理
 * - Riverカードを1枚追加
 * - フェーズを "showdown" に進める
 */
export const handleCheckRiver = ({
  deck,
  setRiverBetPlaced,
  setCommunityCards,
  setGamePhase,
  setShowdown,
}) => {
  setCommunityCards((prev) => [...prev, deck[8]]); // Riverカードを追加
  setGamePhase('showdown');
  setShowdown(true);
};
/**
 * フォールド（降りる）処理
 * - フォールド状態にする
 * - フェーズを "folded" に変更する
 */
export const handleFold = ({ setFolded, setGamePhase }) => {
  setFolded(true); // フォールド状態にする
  setGamePhase('folded'); // フェーズも "folded" に切り替える
};
