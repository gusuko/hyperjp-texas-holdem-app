// App.js
// 👉 アプリ全体の中枢コンポーネント。表示の切り替えやロジックの接着を担う

import React, { useState, useEffect } from 'react';
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

import ChipSelector from './components/ChipSelector';
import './styles/App.css';
// import CasinoTableSVG from './components/CasinoTableSVG';
import BetCircle from './components/BetCircle';
import {
  TABLE_SCALE,
  betPositions,
  cardSlotPositions,
} from './constants/positionConfig';
import CardSlot from './components/CardSlot';

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

  // 🎯 状態（ステート）管理  …… の直後あたりに ↓ を追加
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

  const [cards, setCards] = useState({
    player: [,],
    dealer: ['back', 'back'],
    community: [],
  });

  // 🧠 cardsの見た目用状態を他の状態から作る
  useEffect(() => {
    setCards({
      player: playerCards.length ? playerCards : [,],
      dealer: dealerCards.length ? dealerCards : ['back', 'back'],
      community: communityCards,
    });
  }, [playerCards, dealerCards, communityCards]);

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

  // ✅ 任意の金額を最適なチップ構成に変換する関数（$5チップ対応）
  const chipDenominations = [10000, 5000, 1000, 500, 100, 25, 5];

  const convertToChips = (amount) => {
    const result = [];
    let remaining = amount;

    for (const value of chipDenominations) {
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
      console.log('FLOP chipsToPlace (after sort):', chipsToPlace);

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

  /** -----------------------------------------------------------
   *  renderCard  ― どの枠(pos)にも “ピッタリ” 合わせて描画する共通関数
   *
   * @param {string} card      例: 'AH', '7C' … 画像ファイル名のランク+スート
   * @param {object} pos       { top, left, scale } ― positionConfig で定義
   * @param {string} key       React の key
   * @param {boolean} faceDown true なら裏向き(back.png)で表示
   * ---------------------------------------------------------- */
  const renderCard = (card, pos, key, faceDown = false) => (
    <div
      key={key}
      className="card-abs"
      style={{
        left: `calc(50% + ${pos.left * TABLE_SCALE}px)`,
        top: `calc(50vh + ${pos.top * TABLE_SCALE}px)`,
        width: 100 * TABLE_SCALE,
        height: 140 * TABLE_SCALE,
      }}
    >
      <img
        src={`/cards/${faceDown ? 'back' : card}.png`}
        alt={card}
        style={{ width: '100%', height: '100%' }}
      />
    </div>
  );
  console.log('playerCards:', playerCards);
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
        {/* ===== 中央ガイド（デバッグ用）===== */}
        <div className="center-guide" />
        {/* =========================================================
     テーブル上レイヤー : ①枠 → ②カード の順で描画
========================================================= */}
        {/* SVG テーブル本体 */}
        {/* <CasinoTableSVG /> */}
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
        {dealerCards.map((c, i) =>
          renderCard(c, cardSlotPositions.dealer[i], `d-${i}`, !showdown)
        )}
        {/* Player 2 枚 */}
        {playerCards.map((c, i) =>
          renderCard(c, cardSlotPositions.player[i], `p-${i}`)
        )}
        {/* Community 5 枚 */}
        {communityCards.map((c, i) =>
          renderCard(c, cardSlotPositions.community[i], `c-${i}`)
        )}
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
        Dealer のカード（枠の上に重ねる）
        {/* <div
          className="card-abs"
          style={{
            top: cardSlotPositions.dealer.top,
            left: cardSlotPositions.dealer.left,
            transform: `scale(${cardSlotPositions.dealer.scale})`,
          }}
        >
          <DealerHand dealerCards={dealerCards} showdown={showdown} />
        </div> */}
        {/* ─────── Community 5 枚まとめて ─────── */}
        <div
          className="card-abs"
          style={{
            top: cardSlotPositions.community[0].top, // １枚目の枠と同じ Y
            left: cardSlotPositions.community[0].left, // １枚目の枠と同じ X
            /* ５枚横並びなので scale を少し小さくすると収まりやすい */
            transform: `scale(${cardSlotPositions.community[0].scale})`,
          }}
        >
          <CommunityCards communityCards={communityCards} />
        </div>
        {/* ─────── Player のカード ─────── */}
        <div
          className="card-abs"
          style={{
            top: cardSlotPositions.player.top,
            left: cardSlotPositions.player.left,
            transform: `scale(${cardSlotPositions.player.scale})`,
          }}
        >
          <PlayerHand playerCards={playerCards} />
        </div>
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
          )}
        </>
      )}
    </div>
  );
}

export default App;
