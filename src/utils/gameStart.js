import { getDebugDeck } from './deckUtils';

export const handleStartGameWithChecks = ({
  placedChips, // 追加：円に置いたチップ配列
  dispatch,
  setResultText,
}) => {
  /* ---- ① Ante の合計を計算 ---- */
  const anteAmount = placedChips.ante.reduce((t, c) => t + c.value, 0);

  /* ---- ② 最低額チェック ---- */
  if (anteAmount < 25) {
    alert('ANTEベットは最低$25必要です！');
    return;
  }

  /* ---- ④ デッキ配布と状態リセット ---- */
  const newDeck = getDebugDeck();
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
  dispatch({ type: 'SET_PHASE', phase: 'preflop' });
  dispatch({ type: 'SET_FOLDED', value: false });
  setResultText('');
};
