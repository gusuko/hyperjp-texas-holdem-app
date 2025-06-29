import React from 'react';
import '../styles/TableLayout.css';
import Chip from './Chip';
import { playBetSound } from '../utils/sound';
const chipOptions = [
  { value: 5, src: process.env.PUBLIC_URL + '/chips/chip_5.png' },
  { value: 25, src: process.env.PUBLIC_URL + '/chips/chip_25.png' },
  { value: 100, src: process.env.PUBLIC_URL + '/chips/chip_100.png' },
  { value: 500, src: process.env.PUBLIC_URL + '/chips/chip_500.png' },
  { value: 1000, src: process.env.PUBLIC_URL + '/chips/chip_1000.png' },
  { value: 5000, src: process.env.PUBLIC_URL + '/chips/chip_5000.png' },
  { value: 10000, src: process.env.PUBLIC_URL + '/chips/chip_10000.png' },
];

/**
 * ChipSelector  ─ 残高・現在ベット額を内蔵した新バージョン
 *
 * @param {number} chips        ─ 所持チップ残高
 * @param {object} placedChips  ─ エリア別に置かれたチップ配列
 * @param {string} gamePhase    ─ 'initial' | 'preflop' | 'flop' | 'turn' | 'river' | 'showdown'
 * @param {string} selectedArea ─ 今選択中のエリア名
 * @param {function} dispatch   ─ useReducer の dispatch
 * @param {function} setSelectedArea ─ 円クリックでエリア切替用
 */
export default function ChipSelector({
  chips,
  placedChips,
  gamePhase,
  selectedArea,
  dispatch,
  credit,
  debit,
}) {
  /* ─────────── チップを置く ─────────── */
  const handlePlaceChip = (area, chip) => {
    /* initial 以外では ante / bonus / jackpot をロック */
    const restricted = ['ante', 'bonus', 'jackpot'];
    if (gamePhase !== 'initial' && restricted.includes(area)) return;

    if (chips >= chip.value) {
      const updated = [...placedChips[area], chip].sort(
        (a, b) => a.value - b.value
      );
      debit(chip.value);
      dispatch({ type: 'SET_PLACED_CHIPS', area, chips: updated });
      playBetSound();
      dispatch({ type: 'PLACE_BET', area, amount: chip.value });
    }
  };

  /* ─────────── リセット（初期フェーズのみ） ─────────── */
  const handleResetBets = () => {
    if (gamePhase !== 'initial') return;
    const refund = Object.values(placedChips)
      .flat()
      .reduce((sum, chip) => sum + chip.value, 0);
    credit(refund);
    dispatch({ type: 'RESET_BETS' });
    dispatch({ type: 'RESET_PLACED_CHIPS' });
  };

  /* ─────────── JSX ─────────── */
  return (
    <div className="chip-selector">
      <div className="chip-list">
        {chipOptions.map((chip) => (
          <Chip
            key={chip.value}
            value={chip.value}
            imageSrc={chip.src}
            onClick={() => handlePlaceChip(selectedArea, chip)}
          />
        ))}
      </div>
      {gamePhase === 'initial' && (
        <button className="reset-button" onClick={handleResetBets}>
          リセット
        </button>
      )}
    </div>
  );
}
