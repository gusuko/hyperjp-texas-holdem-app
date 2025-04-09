// トランプの52枚のデッキを生成してシャッフルする関数
export const shuffleDeck = () => {
  // スートとランクの一覧（H: ハート, D: ダイヤ, C: クラブ, S: スペード）
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

  // すべての組み合わせを生成 → 例: "2H", "AD", etc.
  for (let suit of suits) {
    for (let rank of ranks) {
      deck.push(`${rank}${suit}`);
    }
  }

  // Fisher-Yatesアルゴリズムでデッキをシャッフル
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]]; // カードをスワップ
  }

  return deck;
};
