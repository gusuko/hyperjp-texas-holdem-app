// App.js
// 👉 アプリ全体の中枢コンポーネント。表示の切り替えやロジックの接着を担う

import React, { useState } from 'react';
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
import PlayerHand from './components/PlayerHand';
import DealerHand from './components/DealerHand';
import CommunityCards from './components/CommunityCards';
import ShowdownResult from './components/ShowdownResult';
import PlayAgainButton from './components/PlayAgainButton';
import useShowdownLogic from './hooks/useShowdownLogic'; // ← 勝敗判定ロジックのHook

import TableLayout from './components/TableLayout';

import './styles/App.css';

function App() {
  // 🎯 状態（ステート）管理
  const [chips, setChips] = useState(1000);
  const [anteBet, setAnteBet] = useState(0);
  const [bonusBet, setBonusBet] = useState(0);
  const [jackpotBet, setJackpotBet] = useState(0);
  const [flopBet, setFlopBet] = useState(0);
  const [turnBet, setTurnBet] = useState(0);
  const [riverBet, setRiverBet] = useState(0);
  const [gamePhase, setGamePhase] = useState('initial');
  const [folded, setFolded] = useState(false);
  const [showdown, setShowdown] = useState(false);
  const [resultText, setResultText] = useState('');
  const [deck, setDeck] = useState([]);
  const [playerCards, setPlayerCards] = useState([]);
  const [dealerCards, setDealerCards] = useState([]);
  const [communityCards, setCommunityCards] = useState([]);

  const [placedChips, setPlacedChips] = useState({
    ante: [],
    bonus: [],
    jackpot: [],
    flop: [],
    turn: [],
    river: [],
  });

  // 🧠 勝敗ロジックをカスタムHookで呼び出し
  useShowdownLogic({
    showdown,
    folded,
    playerCards,
    dealerCards,
    communityCards,
    anteBet,
    bonusBet,
    flopBet,
    turnBet,
    riverBet,
    setChips,
    setResultText,
  });

  const handleGameStart = () => {
    const sum = (chips) => chips.reduce((total, chip) => total + chip.value, 0);

    setAnteBet(sum(placedChips.ante));
    setBonusBet(sum(placedChips.bonus));
    setJackpotBet(sum(placedChips.jackpot));

    handleStartGameWithChecks({
      anteBet: sum(placedChips.ante), // 直接渡す値も更新
      setDeck,
      setPlayerCards,
      setDealerCards,
      setCommunityCards,
      setGamePhase,
      setFolded,
      setShowdown,
      setResultText,
    });
  };

  return (
    <div className="table-and-game">
      <h1>🃏 Megalink Texas Hold'em</h1>

      {gamePhase === 'initial' && (
        <>
          <ChipSummary
            chips={chips}
            anteBet={anteBet}
            bonusBet={bonusBet}
            jackpotBet={jackpotBet}
            flopBet={flopBet}
            turnBet={turnBet}
            riverBet={riverBet}
          />
          <div className="start-button-wrapper">
            <button onClick={handleGameStart}>🎮 ゲーム開始！</button>
          </div>
        </>
      )}

      {/* ✅ 横並びエリア：TableLayout + カード表示 */}
      <div className="play-area-row">
        <TableLayout
          chips={chips}
          setChips={setChips}
          placedChips={placedChips}
          setPlacedChips={setPlacedChips}
          gamePhase={gamePhase}
        />

        <ShowdownResult showdown={showdown} resultText={resultText} />
      </div>

      {/* 🔄 ベットボタンや勝敗、再プレイ */}
      {gamePhase !== 'initial' && (
        <>
          {gamePhase === 'preflop' && !folded && (
            <div style={{ marginTop: '1em' }}>
              <button
                onClick={() => {
                  const betAmount = anteBet * 2;
                  if (chips >= betAmount) {
                    handleFlopBet({
                      betAmount,
                      deck,
                      setChips,
                      setFlopBet,
                      setCommunityCards,
                      setGamePhase,
                    });
                  } else {
                    alert('チップが足りません！');
                  }
                }}
              >
                Flop ベット（${anteBet * 2}）
              </button>

              <button onClick={() => handleFold({ setFolded, setGamePhase })}>
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
                  const betAmount = anteBet;
                  if (chips >= betAmount) {
                    handleTurnBet({
                      betAmount,
                      deck,
                      setChips,
                      setTurnBet,
                      setCommunityCards,
                      setGamePhase,
                    });
                  } else {
                    alert('チップが足りません！');
                  }
                }}
              >
                Turn ベット（${anteBet}）
              </button>

              <button
                onClick={() =>
                  handleCheckTurn({ deck, setCommunityCards, setGamePhase })
                }
              >
                チェック
              </button>
            </div>
          )}

          {gamePhase === 'turn' && !folded && (
            <div style={{ marginTop: '1em' }}>
              <button
                onClick={() => {
                  const betAmount = anteBet;
                  if (chips >= betAmount) {
                    handleRiverBet({
                      betAmount,
                      deck,
                      setChips,
                      setRiverBet,
                      setCommunityCards,
                      setGamePhase,
                      setShowdown,
                    });
                  } else {
                    alert('チップが足りません！');
                  }
                }}
              >
                River ベット（${anteBet}）
              </button>

              <button
                onClick={() =>
                  handleCheckRiver({
                    deck,
                    setCommunityCards,
                    setGamePhase,
                    setShowdown,
                  })
                }
              >
                チェック
              </button>
            </div>
          )}

          <PlayAgainButton
            showdown={showdown}
            restartRound={() => {
              setDeck([]);
              setPlayerCards([]);
              setDealerCards([]);
              setCommunityCards([]);
              setGamePhase('initial');
              setFolded(false);
              setShowdown(false);
              setResultText('');
              setAnteBet(0);
              setBonusBet(0);
              setJackpotBet(0);
              setFlopBet(0);
              setTurnBet(0);
              setRiverBet(0);
              setPlacedChips({
                ante: [],
                bonus: [],
                jackpot: [],
                flop: [],
                turn: [],
                river: [],
              });
            }}
          />
        </>
      )}
    </div>
  );
}

export default App;
