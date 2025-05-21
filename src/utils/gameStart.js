import { getDebugDeck } from './deckUtils';
import sleep from '../utils/sleep';
import playCardSound from './sound';

export const handleStartGameWithChecks = async ({
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
  // プレイヤー1枚目
  dispatch({
    type: 'SET_CARDS',
    who: 'player',
    cards: [newDeck[0]],
  });
  playCardSound();
  await sleep(600);
  // ③ プレイヤー2枚目
  dispatch({
    type: 'SET_CARDS',
    who: 'player',
    cards: [newDeck[0], newDeck[2]],
  });
  playCardSound();
  await sleep(600);

  // ② ディーラー1枚
  dispatch({ type: 'SET_CARDS', who: 'dealer', cards: [newDeck[1]] });
  playCardSound();
  await sleep(400);
  // ④ ディーラー2枚目
  dispatch({
    type: 'SET_CARDS',
    who: 'dealer',
    cards: [newDeck[1], newDeck[3]],
  });
  playCardSound();
  await sleep(200);

  dispatch({ type: 'SET_CARDS', who: 'board', cards: [] });
  dispatch({ type: 'SET_PHASE', phase: 'preflop' });
  dispatch({ type: 'SET_FOLDED', value: false });
  setResultText('');
};
