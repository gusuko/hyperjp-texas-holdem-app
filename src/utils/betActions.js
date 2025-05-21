/**
 * Flop ベットを処理する関数
 * - チップを引く
 * - Flopベット額をセット
 * - フェーズとコミュニティカードを更新
 */
import sleep from '../utils/sleep';
import playCardSound from './sound';

export const handleFlopBet = async ({ deck, dispatch }) => {
  for (let i = 4; i <= 6; i++) {
    dispatch({
      type: 'APPEND_BOARD_CARDS',
      cards: [deck[i]], // 1枚ずつ追加
    });
    playCardSound();
    await sleep(600); // 0.4秒ディレイ（お好みで）
  }
  dispatch({ type: 'SET_PHASE', phase: 'flop' });
};

/**
 * Turn ベットを処理する関数
 * - チップを引く
 * - Turnベット額をセット
 * - フェーズと場カードを更新
 */
export const handleTurnBet = ({ deck, dispatch }) => {
  dispatch({ type: 'APPEND_BOARD_CARDS', cards: [deck[7]] });
  playCardSound();
  dispatch({ type: 'SET_PHASE', phase: 'turn' });
};
/**
 * River ベットを処理する関数
 * - チップを引く
 * - Riverベット額をセット
 * - 最後のコミュニティカードを追加
 * - フェーズを "showdown" にして勝負に進む
 */
export const handleRiverBet = ({ deck, dispatch }) => {
  dispatch({ type: 'APPEND_BOARD_CARDS', cards: [deck[8]] });
  playCardSound();
  dispatch({ type: 'SET_PHASE', phase: 'showdown' }); // 最終フェーズへ
  dispatch({ type: 'SET_SHOWDOWN', value: true }); // Showdown画面に切り替える
};
/**
 * Turn フェーズでチェック（ベットせず進む）する処理
 * - Turnカードを1枚追加
 * - フェーズを "turn" に進める
 */
export const handleCheckTurn = ({ deck, dispatch }) => {
  dispatch({ type: 'APPEND_BOARD_CARDS', cards: [deck[7]] });
  playCardSound();
  dispatch({ type: 'SET_PHASE', phase: 'turn' });
};

/**
 * River フェーズでチェック（ベットせず進む）する処理
 * - Riverカードを1枚追加
 * - フェーズを "showdown" に進める
 */
export const handleCheckRiver = ({ deck, dispatch }) => {
  dispatch({ type: 'APPEND_BOARD_CARDS', cards: [deck[8]] });
  playCardSound();
  dispatch({ type: 'SET_PHASE', phase: 'showdown' });
  dispatch({ type: 'SET_SHOWDOWN', value: true });
};
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
