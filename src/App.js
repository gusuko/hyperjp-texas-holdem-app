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
import PlayAgainButton from './components/PlayAgainButton';
import useShowdownLogic from './hooks/useShowdownLogic'; // ← 勝敗判定ロジックのHook

import ChipSelector from './components/ChipSelector';
import './styles/App.css';
import BetCircle from './components/BetCircle';
import {
  TABLE_SCALE,
  betPositions,
  cardSlotPositions,
  chipSelectorPos,
  uiPositions,
} from './constants/positionConfig';
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
      <h1>🃏 HyperJP Texas Hold'em</h1>

      {/* ─────────────────────────────────────────────
        2-カラム：左＝テーブル  右＝サイドバー
    ───────────────────────────────────────────── */}
      <div className="casino-grid">
        {/* === 左列：テーブル全体（今までのまま） === */}
        <div className="table-cell">
          <div className="table-wrapper">
            {/* ① 枠（CardSlot） */}
            {cardSlotPositions.dealer.map((pos, i) => (
              <CardSlot key={`slot-d${i}`} style={pos} />
            ))}
            {cardSlotPositions.player.map((pos, i) => (
              <CardSlot key={`slot-p${i}`} style={pos} />
            ))}
            {cardSlotPositions.community.map((pos, i) => (
              <CardSlot key={`slot-c${i}`} style={pos} />
            ))}

            {/* ② カード */}
            <CardGroup
              cards={cards.dealer}
              positions={cardSlotPositions.dealer}
              facedown={!showdown}
            />
            <CardGroup
              cards={cards.board}
              positions={cardSlotPositions.community}
            />
            <CardGroup
              cards={cards.player}
              positions={cardSlotPositions.player}
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

            {/* チップ選択パネル */}
            <div
              className="chip-selector-panel"
              style={{
                top: chipSelectorPos.top * TABLE_SCALE,
                left: chipSelectorPos.left * TABLE_SCALE,
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
            >
              ＋$1,000
            </button>
          </div>
        </div>
        {/* ========= ここで table-wrapper を閉じる ========= */}

        {/* 勝敗テキスト */}
        <ShowdownResult showdown={showdown} resultText={resultText} />

        {/* === 右列：操作サイドバー === */}
        <aside className="sidebar">
          {/* ① フォールド（preflop でのみ表示） */}
          {!folded && gamePhase === 'preflop' && (
            <button
              className="fold-btn"
              onClick={() => handleFold({ dispatch, deck })}
            >
              FOLD
            </button>
          )}

          {/* ゲーム開始ボタンは初期フェーズだけ表示 */}
          {gamePhase === 'initial' && (
            <div className="start-button-wrapper">
              <button onClick={handleGameStart}>🎮 ゲーム開始！</button>
            </div>
          )}
        </aside>
      </div>
      {/* ========= ここで casino-grid を閉じる ========= */}

      {gamePhase !== 'initial' && (
        <>
          {folded && (
            <div style={{ marginTop: '2em', color: 'red' }}>
              降りました！AnteとBonusは没収されます。
            </div>
          )}

          {/* 再プレイボタン */}
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
      {/* 円形チェックボタン：flop または turn フェーズのみ */}
      {!folded && (gamePhase === 'flop' || gamePhase === 'turn') && (
        <button
          className="check-btn"
          onClick={() =>
            gamePhase === 'flop'
              ? handleCheckTurn({ deck, dispatch })
              : handleCheckRiver({ deck, dispatch })
          }
        >
          チェック
        </button>
      )}
    </div>
  );
}

export default App;
