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
import ChipSummary from './components/ChipSummary';
import ShowdownResult from './components/ShowdownResult';
import PlayAgainButton from './components/PlayAgainButton';
import useShowdownLogic from './hooks/useShowdownLogic'; // ← 勝敗判定ロジックのHook

import ChipSelector from './components/ChipSelector';
import './styles/App.css';
// import CasinoTableSVG from './components/CasinoTableSVG';
import BetCircle from './components/BetCircle';
import { betPositions, cardSlotPositions } from './constants/positionConfig';
import CardSlot from './components/CardSlot';
import { convertToChips, getTotalBet } from './utils/chipHelpers';
import CardGroup from './components/CardGroup';
import { restartRound } from './utils/gameReset';

function App() {
  // 🎯 状態（ステート）管理
  const [state, dispatch] = useReducer(reducer, initialState);
  const { chips } = state;
  const { deck, cards, bets, phase: gamePhase, folded, showdown } = state;
  const [resultText, setResultText] = useState('');
  const [selectedArea, setSelectedArea] = useState('ante');
  const { placedChips } = state;

  // 🧠 勝敗ロジックをカスタムHookで呼び出し
  useShowdownLogic({
    showdown,
    folded,
    cards,
    bets,
    dispatch,
    setResultText,
  });

  const handleGameStart = () => {
    handleStartGameWithChecks({
      placedChips: state.placedChips,
      dispatch,
      setResultText,
    });
  };

  // ✅ FLOP 円クリックで ANTE × 2 の自動ベット
  const handleFlopCircleClick = () => {
    const betAmount = bets.ante * 2;

    if (gamePhase === 'preflop' && bets.flop === 0 && chips >= betAmount) {
      const chipsToPlace = convertToChips(betAmount);
      chipsToPlace.sort((a, b) => a.value - b.value); // 小さい順！

      dispatch({
        type: 'SET_PLACED_CHIPS',
        area: 'flop',
        chips: chipsToPlace,
      });
      dispatch({ type: 'PLACE_BET', area: 'flop', amount: betAmount });
      handleFlopBet({
        betAmount,
        deck,
        dispatch,
      });
    }
  };

  // ✅ TURN 円クリックで ANTE × 1 の自動ベット
  const handleTurnCircleClick = () => {
    const betAmount = bets.ante;

    if (gamePhase === 'flop' && bets.turn === 0 && chips >= betAmount) {
      const chipsToPlace = convertToChips(betAmount);
      chipsToPlace.sort((a, b) => a.value - b.value); // 小さい順！

      dispatch({
        type: 'SET_PLACED_CHIPS',
        area: 'turn',
        chips: chipsToPlace,
      });
      dispatch({ type: 'PLACE_BET', area: 'turn', amount: betAmount });

      handleTurnBet({
        betAmount,
        deck,
        dispatch,
      });
    }
  };

  // ✅ RIVER 円クリックで ANTE × 1 の自動ベット
  const handleRiverCircleClick = () => {
    const betAmount = bets.ante;

    if (gamePhase === 'turn' && bets.river === 0 && chips >= betAmount) {
      const chipsToPlace = convertToChips(betAmount);
      chipsToPlace.sort((a, b) => a.value - b.value); // 小さい順！

      dispatch({
        type: 'SET_PLACED_CHIPS',
        area: 'river',
        chips: chipsToPlace,
      });
      dispatch({ type: 'PLACE_BET', area: 'river', amount: betAmount });

      handleRiverBet({
        betAmount,
        deck,
        dispatch,
      });
    }
  };

  return (
    <div className="table-and-game">
      <h1>🃏 Megalink Texas Hold'em</h1>
      <ChipSummary
        chips={chips}
        anteBet={bets.ante}
        bonusBet={bets.bonus}
        jackpotBet={bets.jackpot}
        flopBet={bets.flop}
        turnBet={bets.turn}
        riverBet={bets.river}
      />

      <div className="table-wrapper">
        {/* =========================================================
     テーブル上レイヤー : ①枠 → ②カード の順で描画
========================================================= */}
        {/* ---------- ① 枠を先に描画（CardSlot） ---------- */}
        {/* Dealer 2 枠 */}
        {cardSlotPositions.dealer.map((pos, idx) => (
          <CardSlot key={`slot-d${idx}`} style={pos} />
        ))}
        {/* Player 2 枠 */}
        {cardSlotPositions.player.map((pos, idx) => (
          <CardSlot key={`slot-p${idx}`} style={pos} />
        ))}
        {/* Community 5 枠 */}
        {cardSlotPositions.community.map((pos, idx) => (
          <CardSlot key={`slot-c${idx}`} style={pos} />
        ))}
        {/* Dealer 2 枚 */}
        <CardGroup
          cards={cards.dealer}
          positions={cardSlotPositions.dealer}
          facedown={!showdown}
        />
        {/* Community 5 枚 */}
        <CardGroup
          cards={cards.board}
          positions={cardSlotPositions.community}
        />
        {/* Player 2 枚 */}
        <CardGroup cards={cards.player} positions={cardSlotPositions.player} />

        {/* ---------- ベット円（6個） ---------- */}
        {/* ANTE */}
        <BetCircle
          area="ante"
          total={getTotalBet(placedChips, 'ante')}
          chips={placedChips.ante}
          isActive={gamePhase === 'initial'}
          isSelected={selectedArea === 'ante'}
          onClick={() => setSelectedArea('ante')}
          style={betPositions.ante}
        />
        {/* BONUS */}
        <BetCircle
          area="bonus"
          total={getTotalBet(placedChips, 'bonus')}
          chips={placedChips.bonus}
          isActive={gamePhase === 'initial'}
          isSelected={selectedArea === 'bonus'}
          onClick={() => setSelectedArea('bonus')}
          style={betPositions.bonus}
        />
        {/* JACKPOT */}
        <BetCircle
          area="jackpot"
          total={getTotalBet(placedChips, 'jackpot')}
          chips={placedChips.jackpot}
          isActive={gamePhase === 'initial'}
          isSelected={selectedArea === 'jackpot'}
          onClick={() => setSelectedArea('jackpot')}
          style={betPositions.jackpot}
        />
        {/* FLOP */}
        <BetCircle
          area="flop"
          total={getTotalBet(placedChips, 'flop')}
          chips={placedChips.flop}
          isActive={gamePhase === 'preflop'}
          isSelected={false}
          onClick={handleFlopCircleClick}
          style={betPositions.flop}
        />
        {/* TURN */}
        <BetCircle
          area="turn"
          total={getTotalBet(placedChips, 'turn')}
          chips={placedChips.turn}
          isActive={gamePhase === 'flop'}
          isSelected={false}
          onClick={handleTurnCircleClick}
          style={betPositions.turn}
        />
        {/* RIVER */}
        <BetCircle
          area="river"
          total={getTotalBet(placedChips, 'river')}
          chips={placedChips.river}
          isActive={gamePhase === 'turn'}
          isSelected={false}
          onClick={handleRiverCircleClick}
          style={betPositions.river}
        />
        {gamePhase === 'initial' && (
          <>
            <div className="start-button-wrapper">
              <button onClick={handleGameStart}>🎮 ゲーム開始！</button>
            </div>
          </>
        )}
        {/* ✅ 横並びエリア：TableLayout + カード表示 */}
        <div className="play-area-row">
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
        <ShowdownResult showdown={showdown} resultText={resultText} />
      </div>
      {/* 🔄 ベットボタンや勝敗、再プレイ */}
      {gamePhase !== 'initial' && (
        <>
          {gamePhase === 'preflop' && !folded && (
            <div style={{ marginTop: '1em' }}>
              <button
                onClick={() =>
                  handleFold({
                    dispatch,
                    deck,
                  })
                }
              >
                フォールド（降りる）
              </button>
            </div>
          )}

          {folded && (
            <div style={{ marginTop: '2em', color: 'red' }}>
              降りました！AnteとBonusは没収されます。
            </div>
          )}

          {gamePhase === 'flop' && !folded && (
            <div style={{ marginTop: '1em' }}>
              <button
                onClick={() => {
                  const betAmount = bets.ante;
                  if (chips >= betAmount) {
                    handleTurnBet({
                      betAmount,
                      deck,
                      dispatch,
                    });
                  } else {
                    alert('チップが足りません！');
                  }
                }}
              >
                Turn ベット（${bets.ante}）
              </button>

              <button onClick={() => handleCheckTurn({ deck, dispatch })}>
                チェック
              </button>
            </div>
          )}

          {gamePhase === 'turn' && !folded && (
            <div style={{ marginTop: '1em' }}>
              <button
                onClick={() => {
                  const betAmount = bets.ante;
                  if (chips >= betAmount) {
                    handleRiverBet({
                      betAmount,
                      deck,
                      dispatch,
                    });
                  } else {
                    alert('チップが足りません！');
                  }
                }}
              >
                River ベット（${bets.ante}）
              </button>

              <button
                onClick={() =>
                  handleCheckRiver({
                    deck,
                    dispatch,
                  })
                }
              >
                チェック
              </button>
            </div>
          )}

          {gamePhase === 'showdown' && (
            <div className="play-again-wrapper">
              <PlayAgainButton
                showdown={showdown}
                restartRound={() =>
                  restartRound({
                    dispatch,
                    setResultText,
                    placedChips: state.placedChips,
                  })
                }
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default App;
