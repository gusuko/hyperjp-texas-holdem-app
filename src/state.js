// src/state.js
export const initialState = {
  chips: 1000,
  phase: 'initial',
  folded: false,
  showdown: false,
  bets: {
    ante: 0,
    bonus: 0,
    jackpot: 0,
    flop: 0,
    turn: 0,
    river: 0,
  },
  cards: { player: [], dealer: [], board: [] },
  deck: [],
  placedChips: {
    ante: [],
    bonus: [],
    jackpot: [],
    flop: [],
    turn: [],
    river: [],
  },
};

export function reducer(state, action) {
  switch (action.type) {
    case 'ADD_CHIPS':
      return { ...state, chips: state.chips + action.amount };
    case 'SUB_CHIPS':
      return { ...state, chips: state.chips - action.amount };
    case 'SET_PHASE':
      return { ...state, phase: action.phase };
    case 'SET_FOLDED':
      return { ...state, folded: action.value };
    case 'SET_SHOWDOWN':
      return { ...state, showdown: action.value };
    case 'PLACE_BET': // 既存の chips 減算と同時に使える
      return {
        ...state,
        bets: {
          ...state.bets,
          [action.area]: state.bets[action.area] + action.amount,
        },
        chips: state.chips - action.amount, // ← 同時に残高も減らす
      };
    case 'SET_BET': // 💡 chips は動かさない！
      return {
        ...state,
        bets: {
          ...state.bets,
          [action.area]: state.bets[action.area] + action.amount,
        },
      };

    case 'RESET_BETS': // プレイアゲインで一括クリア
      return { ...state, bets: initialState.bets };

    case 'SET_CARDS':
      return {
        ...state,
        cards: { ...state.cards, [action.who]: action.cards },
      };

    case 'RESET_CARDS':
      return { ...state, cards: initialState.cards };

    case 'SET_DECK':
      return { ...state, deck: action.deck };

    case 'APPEND_BOARD_CARDS':
      return {
        ...state,
        cards: {
          ...state.cards,
          board: [...state.cards.board, ...action.cards], // 末尾に追加
        },
      };
    case 'SET_PLACED_CHIPS':
      return {
        ...state,
        placedChips: {
          ...state.placedChips,
          [action.area]: action.chips, // ← flop / turn / … をピンポイント上書き
        },
      };

    case 'RESET_PLACED_CHIPS':
      return { ...state, placedChips: initialState.placedChips };

    default:
      return state; // どの case にも合わない時
  }
}
