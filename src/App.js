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
function evaluateBestHand(cards) {
  const combinations = (arr, k) => {
    const result = [];
    const backtrack = (start, path) => {
      if (path.length === k) {
        result.push([...path]);
        return;
      }
      for (let i = start; i < arr.length; i++) {
        path.push(arr[i]);
        backtrack(i + 1, path);
        path.pop();
      }
    };
    backtrack(0, []);
    return result;
  };

  const all5CardCombos = combinations(cards, 5);

  let bestScore = -1;
  let bestRank = '';
  let bestHand = [];
  let bestCompareRanks = [];

  for (let hand of all5CardCombos) {
    const result = evaluate5CardHand(hand);
    const score = result.score;

    if (score > bestScore) {
      // より強い役が見つかったら更新
      bestScore = score;
      bestRank = result.rank;
      bestHand = result.hand;
      bestCompareRanks = result.compareRanks;
    } else if (score === bestScore) {
      // 同じ役なら compareRanks で詳細比較
      const currentCompare = result.compareRanks;
      for (let i = 0; i < currentCompare.length; i++) {
        if (currentCompare[i] > bestCompareRanks[i]) {
          bestScore = score;
          bestRank = result.rank;
          bestHand = result.hand;
          bestCompareRanks = currentCompare;
          break;
        }
        if (currentCompare[i] < bestCompareRanks[i]) {
          break;
        }
        // 同じなら次のループへ
      }
    }
  }
  bestHand.sort((a, b) => {
    const getRank = (card) => card.slice(0, card.length - 1);
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
    return ranksOrder.indexOf(getRank(b)) - ranksOrder.indexOf(getRank(a));
  });

  return {
    rank: bestRank,
    hand: bestHand,
    score: bestScore,
    compareRanks: bestCompareRanks,
  };
}

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
  const rankValue = (r) => ranksOrder.indexOf(r);
  const getRank = (card) => card.slice(0, card.length - 1);
  const getSuit = (card) => card.slice(-1);

  const rankCounts = {};
  const suitCounts = {};

  cards.forEach((card) => {
    const rank = getRank(card);
    const suit = getSuit(card);
    rankCounts[rank] = (rankCounts[rank] || 0) + 1;
    suitCounts[suit] = (suitCounts[suit] || 0) + 1;
  });

  const counts = Object.entries(rankCounts).sort((a, b) => {
    if (b[1] === a[1]) return rankValue(b[0]) - rankValue(a[0]);
    return b[1] - a[1];
  });

  const uniqueRanks = [...new Set(cards.map(getRank).map(rankValue))].sort(
    (a, b) => a - b
  );
  if (uniqueRanks.includes(12)) uniqueRanks.unshift(-1); // A低ストレート対応

  const isFlush = Object.values(suitCounts).some((c) => c >= 5);
  let isStraight = false;
  for (let i = 0; i <= uniqueRanks.length - 5; i++) {
    if (uniqueRanks[i + 4] - uniqueRanks[i] === 4) {
      isStraight = true;
      break;
    }
  }

  // 全カードをランク順に並べておく（汎用的に使用）
  const sortedCards = cards
    .slice()
    .sort((a, b) => rankValue(getRank(b)) - rankValue(getRank(a)));

  const flushSuit = Object.keys(suitCounts).find((s) => suitCounts[s] >= 5);
  const flushCards = flushSuit
    ? cards
        .filter((card) => getSuit(card) === flushSuit)
        .sort((a, b) => rankValue(getRank(b)) - rankValue(getRank(a)))
    : [];

  const isStraightFlush =
    flushCards.length >= 5 &&
    (() => {
      const flushRanks = [
        ...new Set(flushCards.map(getRank).map(rankValue)),
      ].sort((a, b) => a - b);
      if (flushRanks.includes(12)) flushRanks.unshift(-1);
      for (let i = 0; i <= flushRanks.length - 5; i++) {
        if (flushRanks[i + 4] - flushRanks[i] === 4) {
          const selected = flushCards
            .filter((card) => {
              const val = rankValue(getRank(card));
              return val >= flushRanks[i] && val <= flushRanks[i + 4];
            })
            .slice(0, 5);
          const isRoyal = flushRanks[i + 4] === 12;
          return {
            rank: isRoyal ? 'Royal Flush' : 'Straight Flush',
            score: isRoyal ? 10 : 9,
            hand: selected,
            compareRanks: selected.map((c) => rankValue(getRank(c))),
          };
        }
      }
      return false;
    })();

  if (isStraightFlush) return isStraightFlush;

  if (counts[0][1] === 4) {
    const fourRank = counts[0][0];
    const four = cards.filter((c) => getRank(c) === fourRank);
    const kicker = sortedCards.find((c) => getRank(c) !== fourRank);
    return {
      rank: 'Four of a Kind',
      score: 8,
      hand: [...four, kicker],
      compareRanks: [rankValue(fourRank), rankValue(getRank(kicker))],
    };
  }

  if (counts[0][1] === 3 && counts[1][1] >= 2) {
    const threeRank = counts[0][0];
    const pairRank = counts[1][0];
    const three = cards.filter((c) => getRank(c) === threeRank).slice(0, 3);
    const pair = cards.filter((c) => getRank(c) === pairRank).slice(0, 2);
    return {
      rank: 'Full House',
      score: 7,
      hand: [...three, ...pair],
      compareRanks: [rankValue(threeRank), rankValue(pairRank)],
    };
  }

  if (isFlush) {
    const topFlush = flushCards.slice(0, 5);
    return {
      rank: 'Flush',
      score: 6,
      hand: topFlush,
      compareRanks: topFlush.map((c) => rankValue(getRank(c))),
    };
  }

  if (isStraight) {
    for (let i = 0; i <= uniqueRanks.length - 5; i++) {
      if (uniqueRanks[i + 4] - uniqueRanks[i] === 4) {
        const values = uniqueRanks.slice(i, i + 5);
        const straight = [];
        for (const val of values) {
          const card = sortedCards.find(
            (c) => rankValue(getRank(c)) === (val === -1 ? 12 : val)
          );
          if (card) straight.push(card);
        }
        return {
          rank: 'Straight',
          score: 5,
          hand: straight,
          compareRanks: values.slice().reverse(),
        };
      }
    }
  }

  if (counts[0][1] === 3) {
    const tripsRank = counts[0][0];
    const trips = cards.filter((c) => getRank(c) === tripsRank).slice(0, 3);
    const kickers = sortedCards
      .filter((c) => getRank(c) !== tripsRank)
      .slice(0, 2);
    return {
      rank: 'Three of a Kind',
      score: 4,
      hand: [...trips, ...kickers],
      compareRanks: [
        rankValue(tripsRank),
        ...kickers.map((c) => rankValue(getRank(c))),
      ],
    };
  }

  if (counts[0][1] === 2 && counts[1][1] === 2) {
    const pair1 = counts[0][0];
    const pair2 = counts[1][0];
    const pair1Cards = cards.filter((c) => getRank(c) === pair1).slice(0, 2);
    const pair2Cards = cards.filter((c) => getRank(c) === pair2).slice(0, 2);
    const kicker = sortedCards.find((c) => {
      const r = getRank(c);
      return r !== pair1 && r !== pair2;
    });
    const [highPair, lowPair] =
      rankValue(pair1) > rankValue(pair2)
        ? [pair1Cards, pair2Cards]
        : [pair2Cards, pair1Cards];
    return {
      rank: 'Two Pair',
      score: 3,
      hand: [...highPair, ...lowPair, kicker],
      compareRanks: [
        rankValue(getRank(highPair[0])),
        rankValue(getRank(lowPair[0])),
        rankValue(getRank(kicker)),
      ],
    };
  }

  if (counts[0][1] === 2) {
    const pairRank = counts[0][0];
    const pair = cards.filter((c) => getRank(c) === pairRank).slice(0, 2);
    const kickers = sortedCards
      .filter((c) => getRank(c) !== pairRank)
      .slice(0, 3);
    return {
      rank: 'One Pair',
      score: 2,
      hand: [...pair, ...kickers],
      compareRanks: [
        rankValue(pairRank),
        ...kickers.map((c) => rankValue(getRank(c))),
      ],
    };
  }

  // High Card
  const top5 = sortedCards.slice(0, 5);
  return {
    rank: 'High Card',
    score: 1,
    hand: top5,
    compareRanks: top5.map((c) => rankValue(getRank(c))),
  };
};

const shuffleDeck = () => {
  const suits = ['H', 'D', 'C', 'S'];
  const ranks = [
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
  const deck = [];

  for (let suit of suits) {
    for (let rank of ranks) {
      deck.push(`${rank}${suit}`);
    }
  }

  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }

  return deck;
};

const getBonusMultiplierForPlayer = (playerCards) => {
  const [card1, card2] = playerCards;
  const rank1 = card1.slice(0, card1.length - 1);
  const rank2 = card2.slice(0, card2.length - 1);
  const suit1 = card1.slice(-1);
  const suit2 = card2.slice(-1);

  const isSuited = suit1 === suit2;
  const pair = rank1 === rank2;

  // 特別枠：A-A
  if (pair && rank1 === 'A') return 30;

  // スーテッド
  if (isSuited) {
    if ((rank1 === 'A' && rank2 === 'K') || (rank1 === 'K' && rank2 === 'A'))
      return 25;
    if (
      (rank1 === 'A' && rank2 === 'Q') ||
      (rank1 === 'Q' && rank2 === 'A') ||
      (rank1 === 'A' && rank2 === 'J') ||
      (rank1 === 'J' && rank2 === 'A')
    )
      return 20;
  }

  // オフスート
  if ((rank1 === 'A' && rank2 === 'K') || (rank1 === 'K' && rank2 === 'A'))
    return 15;
  if (
    (rank1 === 'A' && rank2 === 'Q') ||
    (rank1 === 'Q' && rank2 === 'A') ||
    (rank1 === 'A' && rank2 === 'J') ||
    (rank1 === 'J' && rank2 === 'A')
  )
    return 5;

  // その他のペア
  const highPairs = ['K', 'Q', 'J'];
  const lowPairs = ['10', '9', '8', '7', '6', '5', '4', '3', '2'];

  if (pair && highPairs.includes(rank1)) return 10;
  if (pair && lowPairs.includes(rank1)) return 3;

  // 何もなければ対象外
  return 0;
};

const formatCard = (card) => {
  const suitMap = {
    H: '♥',
    S: '♠',
    D: '♦',
    C: '♣',
  };
  const rank = card.slice(0, card.length - 1);
  const suit = card.slice(-1);
  return `${rank}${suitMap[suit] || suit}`;
};

const formatHandByCompareRanks = (hand, compareRanks) => {
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
  const rankValue = (card) =>
    ranksOrder.indexOf(card.slice(0, card.length - 1));

  // カードをランクごとに分類
  const rankMap = {};
  for (const card of hand) {
    const val = rankValue(card);
    if (!rankMap[val]) rankMap[val] = [];
    rankMap[val].push(card);
  }

  // 優先度順に並べる
  const sorted = [];
  const usedCards = new Set();

  for (const val of compareRanks) {
    const group = rankMap[val] || [];
    for (const card of group) {
      if (!usedCards.has(card)) {
        sorted.push(card);
        usedCards.add(card);
        if (sorted.length === 5) return sorted;
      }
    }
  }

  // 必要なら hand 内から残りを補完（compareRanks以外）
  for (const card of hand) {
    if (!usedCards.has(card)) {
      sorted.push(card);
      usedCards.add(card);
      if (sorted.length === 5) return sorted;
    }
  }

  return sorted; // 保険
};

function App() {
  const [chips, setChips] = useState(1000);
  const [anteBet, setAnteBet] = useState(0);
  const [bonusBet, setBonusBet] = useState(0);
  const [jackpotBet, setJackpotBet] = useState(0);

  const [flopBet, setFlopBet] = useState(0);
  const [turnBet, setTurnBet] = useState(0);
  const [riverBet, setRiverBet] = useState(0);

  const [gamePhase, setGamePhase] = useState('initial');
  const [flopBetPlaced, setFlopBetPlaced] = useState(false);
  const [turnBetPlaced, setTurnBetPlaced] = useState(false);
  const [riverBetPlaced, setRiverBetPlaced] = useState(false);
  const [folded, setFolded] = useState(false);
  const [showdown, setShowdown] = useState(false);
  const [resultText, setResultText] = useState('');

  const chipValues = [5, 25, 50, 100, 500, 1000, 5000, 10000];

  const resetGame = () => {
    const newDeck = shuffleDeck();
    setDeck(newDeck);
    setPlayerCards([newDeck[0], newDeck[2]]);
    setDealerCards([newDeck[1], newDeck[3]]);
    setCommunityCards([]);
    setGamePhase('initial');
    setFolded(false);
    setFlopBetPlaced(false);
    setTurnBetPlaced(false);
    setRiverBetPlaced(false);
    setShowdown(false);
    setResultText('');
    setAnteBet(0);
    setBonusBet(0);
    setJackpotBet(0);
  };
  const restartRound = () => {
    const newDeck = shuffleDeck();
    setDeck(newDeck);
    setPlayerCards([]);
    setDealerCards([]);
    setCommunityCards([]);
    setGamePhase('initial'); // BET選択フェーズに戻す（フロント側も対応）
    setFolded(false);
    setFlopBetPlaced(false);
    setTurnBetPlaced(false);
    setRiverBetPlaced(false);
    setShowdown(false);
    setResultText('');

    // 👇 BETだけ0に戻す
    setAnteBet(0);
    setBonusBet(0);
    setJackpotBet(0);

    // 💰 チップ（所持金）はリセットしない！
    setHasStarted(false); // BET選択UIが表示されるようにする
  };

  const bonusPayouts = {
    'Royal Flush': 500,
    'Straight Flush': 50,
    'Four of a Kind': 10,
    'Full House': 3,
    Flush: 2,
    Straight: 1,
    'Three of a Kind': 0, // MBSのルール次第で入れる
  };

  const [jackpot, setJackpot] = useState(false);
  const [bonus, setBonus] = useState(false);
  const [ante, setAnte] = useState(10); // 固定
  const [hasStarted, setHasStarted] = useState(false);

  const [deck, setDeck] = useState([]);
  const [playerCards, setPlayerCards] = useState([]);
  const [dealerCards, setDealerCards] = useState([]);
  const [communityCards, setCommunityCards] = useState([]);
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (showdown) {
      let payout = 0;
      let anteWin = 0;
      let betWin = 0;
      let bonusWin = 0;
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

      // 🎯 ここでボーナス倍率をチェック！
      const bonusRate = getBonusMultiplierForPlayer(playerCards);

      if (bonusRate > 0 && bonusBet > 0) {
        bonusWin = bonusBet * bonusRate;
        payout += bonusWin;
      }

      const playerSortedHand = formatHandByCompareRanks(
        playerResult.hand,
        playerResult.compareRanks
      );
      const dealerSortedHand = formatHandByCompareRanks(
        dealerResult.hand,
        dealerResult.compareRanks
      );

      const playerUsedCards = playerSortedHand.map(formatCard).join(' ');
      const dealerUsedCards = dealerSortedHand.map(formatCard).join(' ');

      const playerHandText = `あなたの手：${playerRank}（${playerUsedCards}）`;
      const dealerHandText = `ディーラーの手：${dealerRank}（${dealerUsedCards}）`;

      let winnerText = '';
      let playerWins = false;
      let tie = false;

      // 💰 ここで初期化しておく
      let anteText = '';
      let jackpotWin = 0;
      if (playerResult.score > dealerResult.score) {
        playerWins = true;
        winnerText = '→ あなたの勝ち！';
      } else if (playerResult.score < dealerResult.score) {
        winnerText = '→ ディーラーの勝ち！';
      } else {
        // スコアが同じ → 数値で詳細比較（キッカーやペアの強さ）

        const pRanks = playerResult.compareRanks;
        const dRanks = dealerResult.compareRanks;

        let compared = false;
        let kickerUsed = false;

        // キッカー開始インデックスを役によって決定
        let kickerStartIndex = 0;
        if (['High Card'].includes(playerRank)) kickerStartIndex = 0;
        else if (['One Pair'].includes(playerRank)) kickerStartIndex = 1;
        else if (['Two Pair'].includes(playerRank)) kickerStartIndex = 2;
        else if (['Three of a Kind'].includes(playerRank)) kickerStartIndex = 1;
        else if (['Four of a Kind'].includes(playerRank)) kickerStartIndex = 1;

        for (let i = 0; i < pRanks.length; i++) {
          if (pRanks[i] > dRanks[i]) {
            playerWins = true;
            kickerUsed = i >= kickerStartIndex;
            compared = true;
            break;
          }
          if (dRanks[i] > pRanks[i]) {
            kickerUsed = i >= kickerStartIndex;
            compared = true;
            break;
          }
        }

        if (compared) {
          if (playerWins) {
            winnerText = kickerUsed
              ? '→ キッカー勝負！あなたの勝ち！'
              : '→ あなたの勝ち！';
          } else {
            winnerText = kickerUsed
              ? '→ キッカー勝負！ディーラーの勝ち！'
              : '→ ディーラーの勝ち！';
          }
        } else {
          tie = true;
          winnerText = '→ 完全に引き分け！';
        }
      }

      const rankOrder = [
        'High Card',
        'One Pair',
        'Two Pair',
        'Three of a Kind',
        'Straight',
        'Flush',
        'Full House',
        'Four of a Kind',
        'Straight Flush',
        'Royal Flush',
      ];

      const handStrengthIndex = rankOrder.indexOf(playerRank);

      if (folded) {
        payout = 0;
        anteWin = 0;
        betWin = 0;
        anteText = `$0（降りたため没収）`;
      } else {
        if (playerWins) {
          anteWin = anteBet;
          betWin = flopBet + turnBet + riverBet;

          if (handStrengthIndex >= 4) {
            payout += anteWin * 2;
            anteText = `$${anteBet * 2}（勝利＋ストレート以上の役）`;
          } else {
            payout += anteWin;
            anteText = `$${anteBet}（勝利だがストレート未満 → ANTE同額返却）`;
          }

          payout += betWin * 2;
        } else if (tie) {
          anteWin = anteBet;
          betWin = flopBet + turnBet + riverBet;
          payout += anteWin + betWin;
          anteText = `$${anteBet}（引き分け → ANTE同額返却）`;
        } else {
          anteWin = 0;
          betWin = 0;
          anteText = `$0（敗北 → ANTE没収）`;
        }
      }

      setChips((prev) => prev + payout);

      setResultText(
        `${playerHandText}
    ${dealerHandText}

    ${winnerText}

    💰 払い戻し詳細:
    ANTE: ${anteText}
    BET: $${playerWins || tie ? betWin * 2 : 0}
    BONUS: $${bonusRate > 0 ? bonusWin : 0}（${
          bonusRate > 0 ? `倍率：x${bonusRate}` : '対象外'
        }）


    💰 合計：$${payout}`
      );

      console.log('プレイヤー手札:', playerCards);
      console.log('ディーラー手札:', dealerCards);
      console.log('場:', communityCards);
      console.log('プレイヤー役構成5枚:', playerResult.hand);
      console.log('ディーラー役構成5枚:', dealerResult.hand);
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

      <div
        style={{ marginBottom: '1em', fontWeight: 'bold', fontSize: '1.2em' }}
      >
        💵 所持チップ：${chips}
      </div>

      <div style={{ fontSize: '0.9em', marginBottom: '1em' }}>
        ANTE: ${anteBet} / BONUS: ${bonusBet} / JACKPOT: ${jackpotBet}
        <br />
        FLOP: ${flopBet} / TURN: ${turnBet} / RIVER: ${riverBet}
      </div>

      {gamePhase === 'initial' && (
        <div>
          <h3>チップ残高：${chips}</h3>

          <div>
            <h4>ANTE ベット（最低$25）: ${anteBet}</h4>
            {chipValues.map((val) => (
              <button
                key={`ante-${val}`}
                onClick={() => {
                  const newBet = anteBet + val;
                  if (chips >= val) {
                    setAnteBet(newBet);
                    setChips((prev) => prev - val);
                  }
                }}
              >
                +${val}
              </button>
            ))}
          </div>

          <div>
            <h4>BONUS ベット（最低$5〜）: ${bonusBet}</h4>
            {chipValues.map((val) => (
              <button
                key={`bonus-${val}`}
                onClick={() => {
                  const newBet = bonusBet + val;
                  if (chips >= val) {
                    setBonusBet(newBet);
                    setChips((prev) => prev - val);
                  }
                }}
              >
                +${val}
              </button>
            ))}
          </div>

          <div>
            <h4>JACKPOT ベット（5〜25ドルまで、5刻み）: ${jackpotBet}</h4>
            {[5, 10, 15, 20, 25].map((val) => (
              <button
                key={`jackpot-${val}`}
                onClick={() => {
                  const newBet = jackpotBet + val;
                  if (newBet <= 25 && chips >= val) {
                    setJackpotBet(newBet);
                    setChips((prev) => prev - val);
                  }
                }}
              >
                +${val}
              </button>
            ))}
          </div>

          <div style={{ marginTop: '1em' }}>
            <button
              onClick={() => {
                if (anteBet < 25) {
                  alert('ANTEベットは最低$25必要です！');
                  return;
                }

                const newDeck = shuffleDeck();
                setDeck(newDeck);
                setPlayerCards([newDeck[0], newDeck[2]]);
                setDealerCards([newDeck[1], newDeck[3]]);
                setCommunityCards([]);
                setGamePhase('preflop');
                setFolded(false);
                setFlopBetPlaced(false);
                setTurnBetPlaced(false);
                setRiverBetPlaced(false);
                setShowdown(false);
                setResultText('');
              }}
            >
              ゲーム開始！
            </button>
          </div>
        </div>
      )}

      {gamePhase !== 'initial' && (
        <>
          <h2>🎴 Player</h2>
          {playerCards.map((card) => (
            <img key={card} src={`/cards/${card}.png`} alt={card} width="100" />
          ))}

          {gamePhase === 'preflop' && !folded && (
            <div style={{ marginTop: '1em' }}>
              <button
                onClick={() => {
                  const betAmount = anteBet * 2;
                  if (chips >= betAmount) {
                    setChips((prev) => prev - betAmount);
                    setFlopBet(betAmount);
                    setFlopBetPlaced(true);
                    setCommunityCards(deck.slice(4, 7));
                    setGamePhase('flop');
                  } else {
                    alert('チップが足りません！');
                  }
                }}
              >
                Flop ベット（${anteBet * 2}）
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
                  const betAmount = anteBet;
                  if (chips >= betAmount) {
                    setChips((prev) => prev - betAmount);
                    setTurnBet(betAmount);
                    setTurnBetPlaced(true);
                    setCommunityCards((prev) => [...prev, deck[7]]);
                    setGamePhase('turn');
                  } else {
                    alert('チップが足りません！');
                  }
                }}
              >
                Turn ベット（${anteBet}）
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
          {gamePhase === 'turn' && !folded && (
            <div style={{ marginTop: '1em' }}>
              <button
                onClick={() => {
                  const betAmount = anteBet;
                  if (chips >= betAmount) {
                    setChips((prev) => prev - betAmount);
                    setRiverBet(betAmount);
                    setRiverBetPlaced(true);
                    setCommunityCards((prev) => [...prev, deck[8]]); // Riverカード追加
                    setGamePhase('showdown');
                    setShowdown(true);
                  } else {
                    alert('チップが足りません！');
                  }
                }}
              >
                River ベット（${anteBet}）
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
          {showdown && (
            <div style={{ marginTop: '2em' }}>
              <button
                onClick={restartRound}
                style={{
                  padding: '0.5em 1em',
                  fontSize: '1.2em',
                  backgroundColor: '#4CAF50',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                }}
              >
                🔄 もう一度プレイ！
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default App;
