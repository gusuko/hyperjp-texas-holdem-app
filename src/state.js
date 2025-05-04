// src/state.js
export const initialState = {
  chips: 1000,
  phase: 'initial',
  folded: false,
  // ← 慣れたら bets, cards なども追加
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
    default:
      return state; // どの case にも合わない時
  }
}
