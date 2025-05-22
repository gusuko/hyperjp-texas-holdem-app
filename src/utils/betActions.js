/**
 * Flop ベットを処理する関数
 * - チップを引く
 * - Flopベット額をセット
 * - フェーズとコミュニティカードを更新
 */
import sleep from '../utils/sleep';
import playCardSound from './sound';

export const handleFlopBet = async ({
  deck,
  dispatch,
  setBoardCardLoadCallback,
  cards, // 必要なら現在のboard配列（App.jsから渡す）
}) => {
  let currentBoard = cards?.board ? [...cards.board] : [];
  for (let i = 4; i <= 6; i++) {
    const updatedBoard = [...currentBoard, deck[i]];
    await new Promise((resolve) => {
      dispatch({
        type: 'SET_CARDS',
        who: 'board',
        cards: updatedBoard,
      });
      setBoardCardLoadCallback(() => resolve);
    });
    playCardSound();
    await sleep(300);
    currentBoard = updatedBoard; // ← Promiseの外で必ず代入
  }
  dispatch({ type: 'SET_PHASE', phase: 'flop' });
};

/**
 * Turn ベットを処理する関数
 * - チップを引く
 * - Turnベット額をセット
 * - フェーズと場カードを更新
 */
export const handleTurnBet = async ({
  deck,
  dispatch,
  setBoardCardLoadCallback,
  cards,
}) => {
  const updatedBoard = [...(cards?.board || []), deck[7]];
  await new Promise((resolve) => {
    dispatch({
      type: 'SET_CARDS',
      who: 'board',
      cards: updatedBoard,
    });
    setBoardCardLoadCallback(() => resolve);
  });
  playCardSound();
  await sleep(300);
  dispatch({ type: 'SET_PHASE', phase: 'turn' });
};

export const handleCheckTurn = handleTurnBet; // 完全に同じならエイリアス化も可！

/**
 * River ベットを処理する関数
 * - チップを引く
 * - Riverベット額をセット
 * - 最後のコミュニティカードを追加
 * - フェーズを "showdown" にして勝負に進む
 */
export const handleRiverBet = async ({
  deck,
  dispatch,
  setBoardCardLoadCallback,
  cards,
}) => {
  const updatedBoard = [...(cards?.board || []), deck[8]];
  await new Promise((resolve) => {
    dispatch({
      type: 'SET_CARDS',
      who: 'board',
      cards: updatedBoard,
    });
    setBoardCardLoadCallback(() => resolve);
  });
  playCardSound();
  await sleep(300);
  dispatch({ type: 'SET_PHASE', phase: 'showdown' });
  dispatch({ type: 'SET_SHOWDOWN', value: true });
};

export const handleCheckRiver = handleRiverBet; // 完全に同じならエイリアス化も可！

/**
 * フォールド（降りる）処理
 * - フォールド状態にする
 * - フェーズを "folded" に変更する
 */
export const handleFold = ({ dispatch, deck }) => {
  dispatch({ type: 'SET_FOLDED', value: true });
  // 💡 フォールドしても場カード（5枚）をすべて出す
  dispatch({
    type: 'SET_CARDS', // “上書き” で OK
    who: 'board',
    cards: [
      // Flop3 + Turn + River
      deck[4],
      deck[5],
      deck[6],
      deck[7],
      deck[8],
    ],
  });

  dispatch({ type: 'SET_PHASE', phase: 'showdown' });
  dispatch({ type: 'SET_SHOWDOWN', value: true });
};
