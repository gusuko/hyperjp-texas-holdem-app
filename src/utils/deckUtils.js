// deckUtils.js

// 52枚のデッキを生成してシャッフル
export const shuffleDeck = () => {
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

  // Fisher-Yates シャッフル
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }

  return deck;
};

/**
 * ?cards=Ah,Kd,Qs のようなクエリで
 * そのカード順にデッキを生成（無ければランダム）
 * 例: http://localhost:3000/?cards=Ah,Kd,Qs
 */
export const getDebugDeck = () => {
  const params = new URLSearchParams(window.location.search);
  const list = params.get('cards');
  if (!list) return shuffleDeck(); // クエリが無ければ通常通り

  const targets = list.split(',').map((c) => c.trim()); // ["Ah","Kd","Qs"]

  // 全52枚生成
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
  const fullDeck = [];
  for (let suit of suits) {
    for (let rank of ranks) {
      fullDeck.push(`${rank}${suit}`);
    }
  }

  // 指定カード以外のカードを抽出
  const rest = fullDeck.filter((card) => !targets.includes(card));

  // 指定カードが実際に52枚の中にあるかのバリデーションも一応
  // 不正カードは除外
  const validTargets = targets.filter((card) => fullDeck.includes(card));

  // 残りをシャッフル
  for (let i = rest.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [rest[i], rest[j]] = [rest[j], rest[i]];
  }

  // 先頭に指定順、そのあと残り
  return [...validTargets, ...rest];
};
