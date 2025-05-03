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
import ShowdownResult from './components/ShowdownResult';
import PlayAgainButton from './components/PlayAgainButton';
import useShowdownLogic from './hooks/useShowdownLogic'; // ← 勝敗判定ロジックのHook

import ChipSelector from './components/ChipSelector';
import './styles/App.css';
// import CasinoTableSVG from './components/CasinoTableSVG';
import BetCircle from './components/BetCircle';
import { betPositions, cardSlotPositions } from './constants/positionConfig';
import CardSlot from './components/CardSlot';
import { chipValues } from './constants/chips';
import RenderCard from './components/RenderCard';

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
  const [selectedArea, setSelectedArea] = useState('ante');

  const getTotalBet = (area) =>
    placedChips[area].reduce((sum, chip) => sum + chip.value, 0);

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
    jackpotBet,
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

  const convertToChips = (amount) => {
    const result = [];
    let remaining = amount;

    for (const value of chipValues) {
      while (remaining >= value) {
        result.push({
          value,
          src: `/chips/chip_${value}.png`, // ✅ public/chips に保存されている画像パス
        });
        remaining -= value;
      }
    }

    return result;
  };

  // ✅ FLOP 円クリックで ANTE × 2 の自動ベット
  const handleFlopCircleClick = () => {
    const betAmount = anteBet * 2;

    if (gamePhase === 'preflop' && flopBet === 0 && chips >= betAmount) {
      const chipsToPlace = convertToChips(betAmount);
      chipsToPlace.sort((a, b) => a.value - b.value); // 小さい順！

      setPlacedChips((prev) => ({
        ...prev,
        flop: chipsToPlace,
      }));

      setChips((prev) => prev - betAmount);

      handleFlopBet({
        betAmount,
        deck,
        setChips,
        setFlopBet,
        setCommunityCards,
        setGamePhase,
      });
    }
  };

  // ✅ TURN 円クリックで ANTE × 1 の自動ベット
  const handleTurnCircleClick = () => {
    const betAmount = anteBet;

    if (gamePhase === 'flop' && turnBet === 0 && chips >= betAmount) {
      const chipsToPlace = convertToChips(betAmount);
      chipsToPlace.sort((a, b) => a.value - b.value); // 小さい順！

      setPlacedChips((prev) => ({
        ...prev,
        turn: chipsToPlace,
      }));

      setChips((prev) => prev - betAmount);

      handleTurnBet({
        betAmount,
        deck,
        setChips,
        setTurnBet,
        setCommunityCards,
        setGamePhase,
      });
    }
  };

  // ✅ RIVER 円クリックで ANTE × 1 の自動ベット
  const handleRiverCircleClick = () => {
    const betAmount = anteBet;

    if (gamePhase === 'turn' && riverBet === 0 && chips >= betAmount) {
      const chipsToPlace = convertToChips(betAmount);
      chipsToPlace.sort((a, b) => a.value - b.value); // 小さい順！

      setPlacedChips((prev) => ({
        ...prev,
        river: chipsToPlace,
      }));

      setChips((prev) => prev - betAmount);

      handleRiverBet({
        betAmount,
        deck,
        setChips,
        setRiverBet,
        setCommunityCards,
        setGamePhase,
        setShowdown,
      });
    }
  };

  return (
    <div className="table-and-game">
      <h1>🃏 Megalink Texas Hold'em</h1>
      <ChipSummary
        chips={chips}
        anteBet={anteBet}
        bonusBet={bonusBet}
        jackpotBet={jackpotBet}
        flopBet={flopBet}
        turnBet={turnBet}
        riverBet={riverBet}
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

        {/* Dealer 2 枚 ─ showdown 前は裏向き */}
        {dealerCards.map((c, i) => (
          <RenderCard
            card={c}
            pos={cardSlotPositions.dealer[i]}
            faceDown={!showdown}
            keyProp={`d-${i}`}
          />
        ))}
        {/* Player 2 枚 */}
        {playerCards.map((c, i) => (
          <RenderCard
            card={c}
            pos={cardSlotPositions.player[i]}
            faceDown={false}
            keyProp={`p-${i}`}
          />
        ))}
        {/* Community 5 枚 */}
        {communityCards.map((c, i) => (
          <RenderCard
            card={c}
            pos={cardSlotPositions.community[i]}
            faceDown={false}
            keyProp={`c-${i}`}
          />
        ))}

        {/* ---------- ベット円（6個） ---------- */}
        {/* ANTE */}
        <BetCircle
          area="ante"
          total={getTotalBet('ante')}
          chips={placedChips.ante}
          isActive={gamePhase === 'initial'}
          isSelected={selectedArea === 'ante'}
          onClick={() => setSelectedArea('ante')}
          style={betPositions.ante}
        />
        {/* BONUS */}
        <BetCircle
          area="bonus"
          total={getTotalBet('bonus')}
          chips={placedChips.bonus}
          isActive={gamePhase === 'initial'}
          isSelected={selectedArea === 'bonus'}
          onClick={() => setSelectedArea('bonus')}
          style={betPositions.bonus}
        />
        {/* JACKPOT */}
        <BetCircle
          area="jackpot"
          total={getTotalBet('jackpot')}
          chips={placedChips.jackpot}
          isActive={gamePhase === 'initial'}
          isSelected={selectedArea === 'jackpot'}
          onClick={() => setSelectedArea('jackpot')}
          style={betPositions.jackpot}
        />
        {/* FLOP */}
        <BetCircle
          area="flop"
          total={getTotalBet('flop')}
          chips={placedChips.flop}
          isActive={gamePhase === 'preflop'}
          isSelected={false}
          onClick={handleFlopCircleClick}
          style={betPositions.flop}
        />
        {/* TURN */}
        <BetCircle
          area="turn"
          total={getTotalBet('turn')}
          chips={placedChips.turn}
          isActive={gamePhase === 'flop'}
          isSelected={false}
          onClick={handleTurnCircleClick}
          style={betPositions.turn}
        />
        {/* RIVER */}
        <BetCircle
          area="river"
          total={getTotalBet('river')}
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
            setChips={setChips}
            placedChips={placedChips}
            setPlacedChips={setPlacedChips}
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
                    setFolded,
                    setGamePhase,
                    setShowdown,
                    setCommunityCards,
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

          {gamePhase === 'showdown' && (
            <div className="play-again-wrapper">
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
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default App;
