// ChipSelector.jsx
import React from 'react';
import '../styles/TableLayout.css';
import Chip from './Chip';

const chipOptions = [
  { value: 5, src: '/chips/chip_5.png' },
  { value: 25, src: '/chips/chip_25.png' },
  { value: 100, src: '/chips/chip_100.png' },
  { value: 500, src: '/chips/chip_500.png' },
  { value: 1000, src: '/chips/chip_1000.png' },
  { value: 5000, src: '/chips/chip_5000.png' },
  { value: 10000, src: '/chips/chip_10000.png' },
];

const ChipSelector = ({
  chips,
  dispatch,
  placedChips,
  gamePhase,
  selectedArea,
  setSelectedArea, // ← ハイライト用に残す
}) => {
  /* ─────────── チップを置く ─────────── */
  const handlePlaceChip = (area, chip) => {
    /* initial 以外では ante/bonus/jackpot をロック */
    const restricted = ['ante', 'bonus', 'jackpot'];
    if (gamePhase !== 'initial' && restricted.includes(area)) return;

    if (chips >= chip.value) {
      /* 新しいスタックを生成（小さい順にソート）*/
      const updated = [...placedChips[area], chip].sort(
        (a, b) => a.value - b.value
      );

      /* UI 用: placedChips をピンポイント更新 */
      dispatch({
        type: 'SET_PLACED_CHIPS',
        area: area, // 'ante' | 'flop' | …
        chips: updated,
      });

      /* 内部ロジック用: bets と残高を確定 */
      dispatch({
        type: 'PLACE_BET',
        area: area,
        amount: chip.value,
      });
    }
  };

  /* ─────────── リセット（初期フェーズのみ） ─────────── */
  const handleResetBets = () => {
    if (gamePhase !== 'initial') return;

    /* 払い戻し額を計算して所持チップに戻す */
    const refund = Object.values(placedChips)
      .flat()
      .reduce((sum, chip) => sum + chip.value, 0);

    dispatch({ type: 'ADD_CHIPS', amount: refund });

    /* bets と placedChips をいっきに初期化 */
    dispatch({ type: 'RESET_BETS' });
    dispatch({ type: 'RESET_PLACED_CHIPS' });
  };

  /* ───────────  JSX  ─────────── */
  return (
    <div className="chip-selector">
      <div className="chip-label">
        {gamePhase === 'initial' ? (
          <strong>{selectedArea.toUpperCase()}</strong>
        ) : (
          <strong>🎮 ゲーム中</strong>
        )}
      </div>

      {chipOptions.map((chip) => (
        <Chip
          key={chip.value}
          value={chip.value}
          imageSrc={chip.src}
          onClick={() => handlePlaceChip(selectedArea, chip)}
        />
      ))}

      <button className="reset-button" onClick={handleResetBets}>
        リセット
      </button>
    </div>
  );
};

export default ChipSelector;
