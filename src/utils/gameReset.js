import { shuffleDeck } from './deckUtils';

/**
 * ゲーム全体を完全にリセットする関数
 * - デッキをシャッフル
 * - プレイヤー／ディーラーにカード配布
 * - 状態を初期化（BET含む）
 */
export const resetGame = ({ dispatch, setResultText }) => {
  const newDeck = shuffleDeck();
  dispatch({ type: 'SET_DECK', deck: newDeck });
  dispatch({
    type: 'SET_CARDS',
    who: 'player',
    cards: [newDeck[0], newDeck[2]],
  });
  dispatch({
    type: 'SET_CARDS',
    who: 'dealer',
    cards: [newDeck[1], newDeck[3]],
  });
  dispatch({ type: 'SET_CARDS', who: 'board', cards: [] });
  dispatch({ type: 'SET_FOLDED', value: false });
  dispatch({ type: 'SET_SHOWDOWN', value: false });
  dispatch({ type: 'RESET_BETS' });
  setResultText('');
};

/**
 * ラウンドを再スタートする関数（BET金額以外をリセット）
 * - プレイヤー／ディーラーの手札や状態だけ初期化
 * - チップ所持金はそのまま
 */
export const restartRound = ({ dispatch, setResultText }) => {
  dispatch({ type: 'SET_DECK', deck: [] });
  dispatch({ type: 'RESET_CARDS' });
  /* 🂢 ③ フェーズ & フラグを初期化 */
  dispatch({ type: 'SET_PHASE', phase: 'initial' });
  dispatch({ type: 'SET_FOLDED', value: false });
  dispatch({ type: 'SET_SHOWDOWN', value: false });
  /* 🂣 ④ ベット額をゼロに */
  dispatch({ type: 'RESET_BETS' });
  dispatch({ type: 'RESET_PLACED_CHIPS' });
  setResultText('');
};
