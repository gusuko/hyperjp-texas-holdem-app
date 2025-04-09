import { shuffleDeck } from './deckUtils';

/**
 * ゲーム全体を完全にリセットする関数
 * - デッキをシャッフル
 * - プレイヤー／ディーラーにカード配布
 * - 状態を初期化（BET含む）
 */
export const resetGame = ({
  setDeck,
  setPlayerCards,
  setDealerCards,
  setCommunityCards,
  setGamePhase,
  setFolded,
  setShowdown,
  setResultText,
  setAnteBet,
  setBonusBet,
  setJackpotBet,
}) => {
  const newDeck = shuffleDeck();
  setDeck(newDeck);
  setPlayerCards([newDeck[0], newDeck[2]]);
  setDealerCards([newDeck[1], newDeck[3]]);
  setCommunityCards([]);
  setGamePhase('initial');
  setFolded(false);
  setShowdown(false);
  setResultText('');
  setAnteBet(0);
  setBonusBet(0);
  setJackpotBet(0);
};

/**
 * ラウンドを再スタートする関数（BET金額以外をリセット）
 * - プレイヤー／ディーラーの手札や状態だけ初期化
 * - チップ所持金はそのまま
 */
export const restartRound = ({
  setDeck,
  setPlayerCards,
  setDealerCards,
  setCommunityCards,
  setGamePhase,
  setFolded,
  setShowdown,
  setResultText,
  setAnteBet,
  setBonusBet,
  setJackpotBet,
}) => {
  const newDeck = shuffleDeck();
  setDeck(newDeck);
  setPlayerCards([]);
  setDealerCards([]);
  setCommunityCards([]);
  setGamePhase('initial');
  setFolded(false);
  setShowdown(false);
  setResultText('');
  setAnteBet(0);
  setBonusBet(0);
  setJackpotBet(0);
};
