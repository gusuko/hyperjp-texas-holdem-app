import { shuffleDeck } from './deckUtils';

/**
 * Preflop開始時の処理（ANTEチェック付き）
 * - デッキシャッフル
 * - プレイヤー・ディーラーのカード配布
 * - ゲーム初期化（フォールドなどリセット）
 */
export const handleStartGameWithChecks = ({
  anteBet,
  setDeck,
  setPlayerCards,
  setDealerCards,
  setCommunityCards,
  setGamePhase,
  setFolded,
  setShowdown,
  setResultText,
}) => {
  if (anteBet < 25) {
    alert('ANTEベットは最低$25必要です！');
    return;
  }

  const newDeck = shuffleDeck();
  setDeck(newDeck);
  setPlayerCards([newDeck[0], newDeck[2]]);
  setDealerCards([newDeck[1], newDeck[3]]);
  setCommunityCards([]);
  setGamePhase('preflop');
  setFolded(false);
  setShowdown(false);
  setResultText('');
};
