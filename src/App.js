import React, { useState, useEffect } from 'react';

const suits = ['S', 'H', 'D', 'C'];
const ranks = [
  'A',
  '2',
  '3',
  '4',
  '5',
  '6',
  '7',
  '8',
  '9',
  '10',
  'J',
  'Q',
  'K',
];

const shuffle = (array) => {
  const newArr = [...array];
  for (let i = newArr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
  }
  return newArr;
};
const evaluateBestHand = (cards) => {
  const combinations = (arr, k) => {
    const result = [];
    const backtrack = (start, combo) => {
      if (combo.length === k) {
        result.push([...combo]);
        return;
      }
      for (let i = start; i < arr.length; i++) {
        combo.push(arr[i]);
        backtrack(i + 1, combo);
        combo.pop();
      }
    };
    backtrack(0, []);
    return result;
  };

  const allCombos = combinations(cards, 5);
  let best = null;

  for (const combo of allCombos) {
    const result = evaluate5CardHand(combo); // ← 5枚専用評価関数（次で提供）
    if (!best || result.score > best.score) {
      best = result;
    } else if (result.score === best.score) {
      // キッカー比較（左から順に比較）
      for (let i = 0; i < 5; i++) {
        const r1 = best.hand[i];
        const r2 = result.hand[i];
        if (r1 > r2) break;
        if (r2 > r1) {
          best = result;
          break;
        }
      }
    }
  }

  return best; // { score: n, hand: [...] }
};

const evaluate5CardHand = (cards) => {
  const ranksOrder = [
    '2',
    '3',
    '4',
    '5',
    '6',
    '7',
    '8',
    '9',
    '10',
    'J',
    'Q',
    'K',
    'A',
  ];
  const rankCounts = {};
  const suitCounts = {};
  const getRank = (card) => card.slice(0, card.length - 1);
  const getSuit = (card) => card.slice(-1);

  cards.forEach((card) => {
    const rank = getRank(card);
    const suit = getSuit(card);
    rankCounts[rank] = (rankCounts[rank] || 0) + 1;
    suitCounts[suit] = (suitCounts[suit] || 0) + 1;
  });

  const counts = Object.entries(rankCounts).sort((a, b) => {
    if (b[1] === a[1]) {
      return ranksOrder.indexOf(b[0]) - ranksOrder.indexOf(a[0]);
    }
    return b[1] - a[1];
  });

  const getSortedRanks = () => {
    const sorted = cards
      .map(getRank)
      .map((r) => ranksOrder.indexOf(r))
      .sort((a, b) => b - a);
    return sorted;
  };

  const isFlush = Object.values(suitCounts).some((count) => count === 5);

  const uniqueRanks = [
    ...new Set(cards.map(getRank).map((r) => ranksOrder.indexOf(r))),
  ];
  if (uniqueRanks.includes(12)) uniqueRanks.unshift(-1); // A低ストレート対応
  uniqueRanks.sort((a, b) => a - b);

  let isStraight = false;
  for (let i = 0; i <= uniqueRanks.length - 5; i++) {
    if (uniqueRanks[i + 4] - uniqueRanks[i] === 4) {
      isStraight = true;
      break;
    }
  }

  const straightFlush = isFlush && isStraight;
  const hand = cards.slice().sort((a, b) => {
    const ra = ranksOrder.indexOf(getRank(a));
    const rb = ranksOrder.indexOf(getRank(b));
    return rb - ra;
  });

  if (straightFlush && hand.some((card) => getRank(card) === 'A'))
    return { rank: 'Royal Flush', score: 10, hand };
  if (straightFlush) return { rank: 'Straight Flush', score: 9, hand };
  if (counts[0][1] === 4) return { rank: 'Four of a Kind', score: 8, hand };
  if (counts[0][1] === 3 && counts[1][1] === 2)
    return { rank: 'Full House', score: 7, hand };
  if (isFlush) return { rank: 'Flush', score: 6, hand };
  if (isStraight) return { rank: 'Straight', score: 5, hand };
  if (counts[0][1] === 3) return { rank: 'Three of a Kind', score: 4, hand };
  if (counts[0][1] === 2 && counts[1][1] === 2)
    return { rank: 'Two Pair', score: 3, hand };
  if (counts[0][1] === 2) return { rank: 'One Pair', score: 2, hand };

  return { rank: 'High Card', score: 1, hand };
};

function App() {
  const [gamePhase, setGamePhase] = useState('preflop');
  const [flopBetPlaced, setFlopBetPlaced] = useState(false);
  const [turnBetPlaced, setTurnBetPlaced] = useState(false);
  const [riverBetPlaced, setRiverBetPlaced] = useState(false);
  const [folded, setFolded] = useState(false);
  const [showdown, setShowdown] = useState(false);
  const [resultText, setResultText] = useState('');

  const [jackpot, setJackpot] = useState(false);
  const [bonus, setBonus] = useState(false);
  const [ante, setAnte] = useState(10); // 固定
  const [bonusBet, setBonusBet] = useState(10); // 固定
  const [hasStarted, setHasStarted] = useState(false);

  const [deck, setDeck] = useState([]);
  const [playerCards, setPlayerCards] = useState([]);
  const [dealerCards, setDealerCards] = useState([]);
  const [communityCards, setCommunityCards] = useState([]);
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (showdown) {
      const playerResult = evaluateBestHand([
        ...playerCards,
        ...communityCards,
      ]);
      const dealerResult = evaluateBestHand([
        ...dealerCards,
        ...communityCards,
      ]);

      const playerRank = playerResult.rank;
      const dealerRank = dealerResult.rank;

      const playerHandText = `あなたの手：${playerRank}`;
      const dealerHandText = `ディーラーの手：${dealerRank}`;

      let winnerText = '';

      if (playerResult.score > dealerResult.score) {
        winnerText = '→ あなたの勝ち！';
      } else if (playerResult.score < dealerResult.score) {
        winnerText = '→ ディーラーの勝ち！';
      } else {
        // 同じ役ならキッカー勝負
        for (let i = 0; i < 5; i++) {
          const r1 = playerResult.hand[i];
          const r2 = dealerResult.hand[i];
          if (r1 > r2) {
            winnerText = '→ キッカー勝負！あなたの勝ち！';
            break;
          }
          if (r2 > r1) {
            winnerText = '→ キッカー勝負！ディーラーの勝ち！';
            break;
          }
        }
        if (winnerText === '') {
          winnerText = '→ 完全に引き分け！';
        }
      }

      setResultText(`${playerHandText}\n${dealerHandText}\n\n${winnerText}`);
    }
  }, [showdown]);

  const startGame = () => {
    const fullDeck = shuffle(
      suits.flatMap((suit) => ranks.map((rank) => `${rank}${suit}`))
    );
    setDeck(fullDeck);
    setPlayerCards(fullDeck.slice(0, 2));
    setDealerCards(fullDeck.slice(2, 4));
    setCommunityCards([]);
    setStep(0);
    setHasStarted(true);
  };

  return (
    <div>
      <h1>🃏 Megalink Texas Hold'em</h1>

      {!hasStarted && (
        <div
          style={{
            padding: '1em',
            border: '1px solid #ccc',
            borderRadius: '10px',
            width: '300px',
          }}
        >
          <h3>プリフロップのベット</h3>
          <p>Ante: ${ante}</p>

          <label>
            <input
              type="checkbox"
              checked={jackpot}
              onChange={() => setJackpot(!jackpot)}
            />
            Jackpot に参加（$5固定）
          </label>

          <br />

          <label>
            <input
              type="checkbox"
              checked={bonus}
              onChange={() => setBonus(!bonus)}
            />
            Bonus に参加（$10固定）
          </label>

          <br />
          <button onClick={startGame} style={{ marginTop: '1em' }}>
            ゲーム開始！
          </button>
        </div>
      )}

      {hasStarted && (
        <>
          <h2>🎴 Player</h2>
          {playerCards.map((card) => (
            <img key={card} src={`/cards/${card}.png`} alt={card} width="100" />
          ))}

          {gamePhase === 'preflop' && !folded && (
            <div style={{ marginTop: '1em' }}>
              <button
                onClick={() => {
                  setFlopBetPlaced(true);
                  setCommunityCards(deck.slice(4, 7)); // フロップ3枚
                  setGamePhase('flop');
                }}
              >
                Flop ベット（継続）
              </button>

              <button
                onClick={() => {
                  setFolded(true);
                  setGamePhase('folded');
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

          <h2>🎲 Dealer</h2>
          {dealerCards.map((card, i) => (
            <img
              key={i}
              src={showdown ? `/cards/${card}.png` : `/cards/back.png`}
              alt={card}
              width="100"
            />
          ))}

          <h2>🃍 Community Cards</h2>
          {communityCards.map((card) => (
            <img key={card} src={`/cards/${card}.png`} alt={card} width="100" />
          ))}

          {gamePhase === 'flop' && !turnBetPlaced && (
            <div style={{ marginTop: '1em' }}>
              <button
                onClick={() => {
                  setTurnBetPlaced(true);
                  setCommunityCards((prev) => [...prev, deck[7]]); // Turnカード追加
                  setGamePhase('turn');
                }}
              >
                Turn ベット（Anteと同額）
              </button>

              <button
                onClick={() => {
                  setTurnBetPlaced(true); // ベットなしでも進行
                  setCommunityCards((prev) => [...prev, deck[7]]);
                  setGamePhase('turn');
                }}
              >
                チェック
              </button>
            </div>
          )}
          {gamePhase === 'turn' && !riverBetPlaced && (
            <div style={{ marginTop: '1em' }}>
              <button
                onClick={() => {
                  setRiverBetPlaced(true);
                  setCommunityCards((prev) => [...prev, deck[8]]); // 5枚目追加
                  setGamePhase('showdown'); // 👈 ここでShowdownへ
                  setShowdown(true); // 👈 ディーラーカード開く
                }}
              >
                River ベット（Anteと同額）
              </button>

              <button
                onClick={() => {
                  setRiverBetPlaced(true);
                  setCommunityCards((prev) => [...prev, deck[8]]);
                  setGamePhase('showdown');
                  setShowdown(true);
                }}
              >
                チェック
              </button>
            </div>
          )}

          {showdown && (
            <div
              style={{
                marginTop: '2em',
                fontWeight: 'bold',
                fontSize: '1.2em',
                whiteSpace: 'pre-line',
              }}
            >
              Showdown！勝負！
              <br />
              {resultText}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default App;
