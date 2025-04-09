import React, { useState } from 'react';
import { evaluateBestHand } from './utils/evaluateHand';
import {
  getBonusMultiplierForPlayer,
  checkDoubleAceBonus,
} from './utils/bonusUtils';
import { formatCard, formatHandByCompareRanks } from './utils/formatUtils';
import { handleStartGameWithChecks } from './utils/gameStart';
import { resetGame, restartRound } from './utils/gameReset';
import {
  handleFlopBet,
  handleTurnBet,
  handleRiverBet,
  handleCheckTurn,
  handleCheckRiver,
  handleFold,
} from './utils/betActions';
import { handRanks } from './constants/rankorder';
import { chipValues } from './constants/chips';
import ChipSummary from './components/ChipSummary';
import PlayerHand from './components/PlayerHand';
import DealerHand from './components/DealerHand';
import CommunityCards from './components/CommunityCards';
import ShowdownResult from './components/ShowdownResult';
import PlayAgainButton from './components/PlayAgainButton';
import BettingControls from './components/BettingControls';
import useShowdownLogic from './hooks/useShowdownLogic';

function App() {
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

  const handleRestartRound = () => {
    restartRound({
      setDeck,
      setPlayerCards,
      setDealerCards,
      setCommunityCards,
      setGamePhase,
      setFolded,
      setShowdown,
      setResultText,
      setAnteBet,
      setBonusBet,
      setJackpotBet,
    });
  };

  const [jackpot, setJackpot] = useState(false);
  const [deck, setDeck] = useState([]);
  const [playerCards, setPlayerCards] = useState([]);
  const [dealerCards, setDealerCards] = useState([]);
  const [communityCards, setCommunityCards] = useState([]);

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

  return (
    <div>
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

      {gamePhase === 'initial' && (
        <div>
          <h3>チップ残高：${chips}</h3>

          <BettingControls
            anteBet={anteBet}
            bonusBet={bonusBet}
            jackpotBet={jackpotBet}
            chips={chips}
            onAnteChange={setAnteBet}
            onBonusChange={setBonusBet}
            onJackpotChange={setJackpotBet}
            onChipsChange={setChips}
          />

          <div style={{ marginTop: '1em' }}>
            <button
              onClick={() => {
                handleStartGameWithChecks({
                  anteBet,
                  setDeck,
                  setPlayerCards,
                  setDealerCards,
                  setCommunityCards,
                  setGamePhase,
                  setFolded,
                  setShowdown,
                  setResultText,
                });
              }}
            >
              ゲーム開始！
            </button>
          </div>
        </div>
      )}

      {gamePhase !== 'initial' && (
        <>
          <PlayerHand playerCards={playerCards} />
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

              <button
                onClick={() => {
                  handleFold({
                    setFolded,
                    setGamePhase,
                  });
                }}
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
          <DealerHand dealerCards={dealerCards} showdown={showdown} />
          <CommunityCards communityCards={communityCards} />
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
                onClick={() => {
                  handleCheckTurn({
                    deck,
                    setCommunityCards,
                    setGamePhase,
                  });
                }}
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
                onClick={() => {
                  handleCheckRiver({
                    deck,
                    setCommunityCards,
                    setGamePhase,
                    setShowdown,
                  });
                }}
              >
                チェック
              </button>
            </div>
          )}
          <ShowdownResult showdown={showdown} resultText={resultText} />
          {
            // prettier-ignore
            <PlayAgainButton showdown={showdown} restartRound={handleRestartRound} />
          }
        </>
      )}
    </div>
  );
}

export default App;
