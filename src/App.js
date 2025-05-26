// App.js
// 👉 アプリ全体の中枢コンポーネント。表示の切り替えやロジックの接着を担う

import React, { useState, useReducer } from 'react';
import { initialState, reducer } from './state';
import { handleStartGameWithChecks } from './utils/gameStart';
import {
  handleFlopBet,
  handleTurnBet,
  handleRiverBet,
  handleCheckTurn,
  handleCheckRiver,
  handleFold,
} from './utils/betActions';
import ShowdownResult from './components/ShowdownResult';
import useShowdownLogic from './hooks/useShowdownLogic'; // ← 勝敗判定ロジックのHook

import ChipSelector from './components/ChipSelector';
import './styles/App.css';
import BetCircle from './components/BetCircle';
import { POS } from './constants/layoutConfig';
import CardSlot from './components/CardSlot';
import { convertToChips, getTotalBet } from './utils/chipHelpers';
import CardGroup from './components/CardGroup';
import { restartRound } from './utils/gameReset';
import PayoutTable from './components/PayoutTable';
import { bonusPayouts, jackpotPayouts } from './constants/payouts';
import CurrentChips from './components/CurrentChips';
import { playBetSound, playPlaceYourBetsSound } from './utils/sound';
import sleep from './utils/sleep';
import { useLayoutEffect } from 'react';

/* 画面に合わせて “タイトル帯を除いた残りエリア” だけで拡縮 */
/* 画面サイズ変化に合わせて --game-scale と --title-gap を更新 */
/* 画面サイズに応じて
 *   ① --game-scale を更新
 *   ② 最小倍率を下回ったら <html> に too-small クラスを付ける
 */
function useAutoScale() {
  const BOARD_W = 1800;
  const BOARD_H = 1100;
  const TITLE_H = 80; // .title-global の高さと同じ
  const MIN_SCALE = 0.4; // ボードはここまで縮小してもOK
  const MIN_SCALE_PLAYABLE = 0.55; // これより小さいと警告を出す

  React.useLayoutEffect(() => {
    const update = () => {
      /* タイトル帯を除いた残り高さ */
      const availH = window.innerHeight - TITLE_H;

      /* 横・縦(残り) の比率で小さい方 */
      let s = Math.min(window.innerWidth / BOARD_W, availH / BOARD_H);

      /* 下限を保証（これ以上は縮めない） */
      s = Math.max(s, MIN_SCALE);

      /* ① 縮小率を CSS 変数へ */
      document.documentElement.style.setProperty('--game-scale', s);

      /* ② タイトルの実高さ（余白）も同じ倍率で書き込む */
      document.documentElement.style.setProperty(
        '--title-gap',
        TITLE_H * s + 'px'
      );

      /* ③ プレイ不可判定 & クラス付け外し */
      if (s < MIN_SCALE_PLAYABLE) {
        document.documentElement.classList.add('too-small');
      } else {
        document.documentElement.classList.remove('too-small');
      }
    };

    update(); // 初回実行
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);
}

function App() {
  useAutoScale();
  // 🎯 状態（ステート）管理
  const [state, dispatch] = useReducer(reducer, initialState);
  const { chips } = state;
  const { deck, cards, bets, phase: gamePhase, folded, showdown } = state;
  const [resultText, setResultText] = useState('');
  const [selectedArea, setSelectedArea] = useState('ante');
  const { placedChips } = state;
  const [showPlaceYourBets, setShowPlaceYourBets] = useState(false);
  const [playerCardLoadCallback, setPlayerCardLoadCallback] = useState(
    () => () => {}
  );
  const [dealerCardLoadCallback, setDealerCardLoadCallback] = useState(
    () => () => {}
  );
  const [boardCardLoadCallback, setBoardCardLoadCallback] = useState(
    () => () => {}
  );

  // 🧠 勝敗ロジックをカスタムHookで呼び出し
  useShowdownLogic({
    showdown,
    folded,
    cards,
    bets,
    dispatch,
    setResultText,
  });

  const handlePlayAgain = async () => {
    restartRound({
      dispatch,
      setResultText,
      placedChips: state.placedChips,
    });
    await sleep(600); // 0.6秒ディレイ
    playPlaceYourBetsSound(); // SE再生
    setShowPlaceYourBets(true);
    // 1.5秒後ぐらいに消す
    setTimeout(() => setShowPlaceYourBets(false), 1500);
  };

  const handleGameStart = () => {
    handleStartGameWithChecks({
      placedChips: state.placedChips,
      dispatch,
      setResultText,
      setPlayerCardLoadCallback,
      setDealerCardLoadCallback,
    });
  };

  // ✅ FLOP 円クリックで ANTE × 2 の自動ベット
  const handleFlopCircleClick = async () => {
    const betAmount = bets.ante * 2;

    if (gamePhase === 'preflop' && bets.flop === 0 && chips >= betAmount) {
      const chipsToPlace = convertToChips(betAmount);
      chipsToPlace.sort((a, b) => a.value - b.value); // 小さい順！

      dispatch({
        type: 'SET_PLACED_CHIPS',
        area: 'flop',
        chips: chipsToPlace,
      });
      playBetSound();
      dispatch({ type: 'PLACE_BET', area: 'flop', amount: betAmount });
      await sleep(220);
      await handleFlopBet({
        betAmount,
        deck,
        dispatch,
        setBoardCardLoadCallback,
        cards,
      });
    }
  };

  // ✅ TURN 円クリックで ANTE × 1 の自動ベット
  const handleTurnCircleClick = async () => {
    const betAmount = bets.ante;

    if (gamePhase === 'flop' && bets.turn === 0 && chips >= betAmount) {
      const chipsToPlace = convertToChips(betAmount);
      chipsToPlace.sort((a, b) => a.value - b.value); // 小さい順！

      dispatch({
        type: 'SET_PLACED_CHIPS',
        area: 'turn',
        chips: chipsToPlace,
      });
      playBetSound();
      dispatch({ type: 'PLACE_BET', area: 'turn', amount: betAmount });
      await sleep(220);
      await handleTurnBet({
        betAmount,
        deck,
        dispatch,
        setBoardCardLoadCallback,
        cards,
      });
    }
  };

  // ✅ RIVER 円クリックで ANTE × 1 の自動ベット
  const handleRiverCircleClick = async () => {
    const betAmount = bets.ante;

    if (gamePhase === 'turn' && bets.river === 0 && chips >= betAmount) {
      const chipsToPlace = convertToChips(betAmount);
      chipsToPlace.sort((a, b) => a.value - b.value); // 小さい順！

      dispatch({
        type: 'SET_PLACED_CHIPS',
        area: 'river',
        chips: chipsToPlace,
      });
      playBetSound();
      dispatch({ type: 'PLACE_BET', area: 'river', amount: betAmount });
      await sleep(220);
      await handleRiverBet({
        betAmount,
        deck,
        dispatch,
        setBoardCardLoadCallback,
        cards,
      });
    }
  };

  return (
    <div className="table-canvas">
      <h1 className="title-global">🃏 HyperJP Texas Hold'em</h1>
      <div className="game-board">
        <CurrentChips
          chips={chips} // stateから渡す
          style={{ position: 'absolute', ...POS.ui.chips }}
        />

        {/* ① 枠（CardSlot） */}
        {POS.cardSlot.dealer.map((pos, i) => (
          <CardSlot key={`slot-d${i}`} style={pos} />
        ))}
        {POS.cardSlot.player.map((pos, i) => (
          <CardSlot key={`slot-p${i}`} style={pos} />
        ))}
        {POS.cardSlot.community.map((pos, i) => (
          <CardSlot key={`slot-c${i}`} style={pos} />
        ))}

        {/* ② カード */}
        <CardGroup
          onCardLoad={dealerCardLoadCallback}
          cards={cards.dealer}
          positions={POS.cardSlot.dealer}
          facedown={!showdown}
        />
        <CardGroup
          onCardLoad={boardCardLoadCallback}
          cards={cards.board}
          positions={POS.cardSlot.community}
        />
        <CardGroup
          onCardLoad={playerCardLoadCallback}
          cards={cards.player}
          positions={POS.cardSlot.player}
        />

        {/* ---------- ベット円（6個） ---------- */}
        {/* ANTE */}
        <BetCircle
          area="ante"
          total={getTotalBet(placedChips, 'ante')}
          chips={placedChips.ante}
          isActive={gamePhase === 'initial'}
          isSelected={selectedArea === 'ante'}
          onClick={() => setSelectedArea('ante')}
          style={POS.bet.ante}
        />
        {/* BONUS */}
        <BetCircle
          area="bonus"
          total={getTotalBet(placedChips, 'bonus')}
          chips={placedChips.bonus}
          isActive={gamePhase === 'initial'}
          isSelected={selectedArea === 'bonus'}
          onClick={() => setSelectedArea('bonus')}
          style={POS.bet.bonus}
        />
        {/* JACKPOT */}
        <BetCircle
          area="jackpot"
          total={getTotalBet(placedChips, 'jackpot')}
          chips={placedChips.jackpot}
          isActive={gamePhase === 'initial'}
          isSelected={selectedArea === 'jackpot'}
          onClick={() => setSelectedArea('jackpot')}
          style={POS.bet.jackpot}
        />
        {/* FLOP */}
        <BetCircle
          area="flop"
          total={getTotalBet(placedChips, 'flop')}
          chips={placedChips.flop}
          isActive={gamePhase === 'preflop'}
          isSelected={false}
          onClick={handleFlopCircleClick}
          style={POS.bet.flop}
        />
        {/* TURN */}
        <BetCircle
          area="turn"
          total={getTotalBet(placedChips, 'turn')}
          chips={placedChips.turn}
          isActive={gamePhase === 'flop'}
          isSelected={false}
          onClick={handleTurnCircleClick}
          style={POS.bet.turn}
        />
        {/* RIVER */}
        <BetCircle
          area="river"
          total={getTotalBet(placedChips, 'river')}
          chips={placedChips.river}
          isActive={gamePhase === 'turn'}
          isSelected={false}
          onClick={handleRiverCircleClick}
          style={POS.bet.river}
        />

        {/* チップ選択パネル */}
        <div className="chip-selector-panel" style={POS.ui.selector}>
          <ChipSelector
            chips={chips}
            dispatch={dispatch}
            placedChips={placedChips}
            gamePhase={gamePhase}
            onFlopClick={handleFlopCircleClick}
            onTurnClick={handleTurnCircleClick}
            onRiverClick={handleRiverCircleClick}
            isFlopActive={gamePhase === 'preflop'}
            isTurnActive={gamePhase === 'flop'}
            isRiverActive={gamePhase === 'turn'}
            selectedArea={selectedArea}
            setSelectedArea={setSelectedArea}
          />
        </div>
        {/* === 下段：補充ボタン === */}
        <button
          className="recharge-btn"
          onClick={() => dispatch({ type: 'ADD_CHIPS', amount: 1000 })}
          style={{ position: 'absolute', ...POS.ui.recharge }}
        >
          ＋$1,000
        </button>

        {/* BONUS 払い戻し表 */}
        <PayoutTable uiKey="bonusTable" title="B O N U S" data={bonusPayouts} />

        {/* JACKPOT 払い戻し表 */}
        <PayoutTable
          uiKey="jackpotTable"
          title="J A C K P O T"
          data={jackpotPayouts}
        />
        {/* ========= ここで table-wrapper を閉じる ========= */}

        {/* 勝敗テキスト */}
        <ShowdownResult
          showdown={showdown}
          folded={folded}
          resultText={resultText}
          style={{ position: 'absolute', ...POS.ui.resultText }}
        />

        {/* ① フォールド（preflop でのみ表示） */}
        {!folded && gamePhase === 'preflop' && (
          <button
            className="fold-btn"
            onClick={() => handleFold({ dispatch, deck })}
            style={POS.ui.fold}
          >
            FOLD
          </button>
        )}

        {/* ゲーム開始ボタンは初期フェーズだけ表示 */}
        {gamePhase === 'initial' && (
          <button
            className="btn-start"
            onClick={handleGameStart}
            style={{
              position: 'absolute',
              ...POS.ui.start,
            }}
          >
            🎮 <br />S T A R T
          </button>
        )}

        {gamePhase !== 'initial' && (
          <>
            {/* 再プレイボタン */}
            {gamePhase === 'showdown' && (
              <button
                className="playagain-btn"
                onClick={handlePlayAgain}
                style={POS.ui.playAgain}
              >
                PLAY&nbsp;AGAIN
              </button>
            )}
          </>
        )}

        {/* 再プレイボタン押した後の文字 */}
        {showPlaceYourBets && (
          <div className="place-bets-overlay">PLACE YOUR BETS Please!</div>
        )}
        {/* 円形チェックボタン：flop または turn フェーズのみ */}
        {!folded && (gamePhase === 'flop' || gamePhase === 'turn') && (
          <button
            className="check-btn"
            onClick={() =>
              gamePhase === 'flop'
                ? handleCheckTurn({
                    deck,
                    dispatch,
                    setBoardCardLoadCallback, // ←追加！
                    cards,
                  })
                : handleCheckRiver({
                    deck,
                    dispatch,
                    setBoardCardLoadCallback, // ←追加！
                    cards,
                  })
            }
            style={POS.ui.check}
          >
            チェック
          </button>
        )}
      </div>
    </div>
  );
}

export default App;
