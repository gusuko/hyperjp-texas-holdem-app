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
import { TABLE_SCALE, POS, DIM } from './constants/layoutConfig';
import CardSlot from './components/CardSlot';
import { convertToChips, getTotalBet } from './utils/chipHelpers';
import CardGroup from './components/CardGroup';
import { restartRound } from './utils/gameReset';
import PayoutTable from './components/PayoutTable';
import { bonusPayouts, jackpotPayouts } from './constants/payouts';
import CurrentChips from './components/CurrentChips';
import { playBetSound, playPlaceYourBetsSound } from './utils/sound';
import sleep from './utils/sleep';

function App() {
  // 🎯 状態（ステート）管理
  const [state, dispatch] = useReducer(reducer, initialState);
  const { chips } = state;
  const { deck, cards, bets, phase: gamePhase, folded, showdown } = state;
  const [resultText, setResultText] = useState('');
  const [selectedArea, setSelectedArea] = useState('ante');
  const { placedChips } = state;
  const [showPlaceYourBets, setShowPlaceYourBets] = useState(false);

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
      });
    }
  };

  return (
    <div className="table-canvas">
      <h1>🃏 HyperJP Texas Hold'em</h1>
      <CurrentChips
        chips={chips} // stateから渡す
        style={{
          position: 'absolute',
          top: `calc(50vh + ${POS.ui.chips.top * TABLE_SCALE}px)`,
          left: `calc(50%  + ${POS.ui.chips.left * TABLE_SCALE}px)`,
          zIndex: 20,
        }}
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
        cards={cards.dealer}
        positions={POS.cardSlot.dealer}
        facedown={!showdown}
      />
      <CardGroup cards={cards.board} positions={POS.cardSlot.community} />
      <CardGroup cards={cards.player} positions={POS.cardSlot.player} />

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
      <div
        className="chip-selector-panel"
        style={{
          top: `calc(50vh + ${POS.ui.selector.top * TABLE_SCALE}px)`,
          left: `calc(50%  + ${POS.ui.selector.left * TABLE_SCALE}px)`,
        }}
      >
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
        style={{
          position: 'absolute',
          top: `calc(50vh + ${POS.ui.recharge.top * TABLE_SCALE}px)`,
          left: `calc(50%  + ${POS.ui.recharge.left * TABLE_SCALE}px)`,
        }}
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
        style={{
          position: 'absolute',
          top: `calc(50vh + ${POS.ui.resultText.top * TABLE_SCALE}px)`,
          left: `calc(50%  + ${POS.ui.resultText.left * TABLE_SCALE}px)`,
          textAlign: 'left',
        }}
      />

      {/* ① フォールド（preflop でのみ表示） */}
      {!folded && gamePhase === 'preflop' && (
        <button
          className="fold-btn"
          onClick={() => handleFold({ dispatch, deck })}
          style={{
            position: 'absolute', // ① 絶対配置に
            top: `calc(50vh + ${POS.ui.fold.top * TABLE_SCALE}px)`,
            left: `calc(50%  + ${POS.ui.fold.left * TABLE_SCALE}px)`,
            width: DIM.BET_D * TABLE_SCALE, // = 70px * scale
            height: DIM.BET_D * TABLE_SCALE,
          }}
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
            top: `calc(50vh + ${POS.ui.start.top * TABLE_SCALE}px)`,
            left: `calc(50%  + ${POS.ui.start.left * TABLE_SCALE}px)`,
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
              style={{
                top: `calc(50vh + ${POS.ui.playAgain.top * TABLE_SCALE}px)`,
                left: `calc(50%  + ${POS.ui.playAgain.left * TABLE_SCALE}px)`,
              }}
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
              ? handleCheckTurn({ deck, dispatch })
              : handleCheckRiver({ deck, dispatch })
          }
          style={{
            top: `calc(50vh + ${POS.ui.check.top * TABLE_SCALE}px)`,
            left: `calc(50%  + ${POS.ui.check.left * TABLE_SCALE}px)`,
          }}
        >
          チェック
        </button>
      )}
    </div>
  );
}

export default App;
