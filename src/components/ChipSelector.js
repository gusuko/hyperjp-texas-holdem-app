// ChipSelector.js
import React, { useEffect, useState } from 'react';
import '../styles/TableLayout.css';
import Chip from './Chip';

const chipOptions = [
  { value: 5, src: '/chips/chip_5.png' },
  { value: 25, src: '/chips/chip_25.png' },
  { value: 100, src: '/chips/chip_100.png' },
  { value: 500, src: '/chips/chip_500.png' },
  { value: 1000, src: '/chips/chip_1000.png' },
  { value: 10000, src: '/chips/chip_10000.png' },
];

const ChipSelector = ({
  chips,
  setChips,
  placedChips,
  setPlacedChips,
  gamePhase,
  selectedArea,
}) => {
  const handlePlaceChip = (area, chip) => {
    // 🔒 ゲーム開始後は ante/bonus/jackpot に置けないようにする
    const isInitialPhase = gamePhase === 'initial';
    const restrictedAreas = ['ante', 'bonus', 'jackpot'];
    if (!isInitialPhase && restrictedAreas.includes(area)) {
      return;
    }

    if (chips >= chip.value) {
      setPlacedChips((prev) => {
        // ✅ チップを追加して、ソート（小さい順）！
        const updated = [...prev[area], chip];
        updated.sort((a, b) => a.value - b.value); // 小さい順！

        return {
          ...prev,
          [area]: updated,
        };
      });

      setChips((prev) => prev - chip.value);
    }
  };

  const handleResetBets = () => {
    if (gamePhase !== 'initial') return;

    const refund = Object.values(placedChips)
      .flat()
      .reduce((sum, chip) => sum + chip.value, 0);

    setChips((prev) => prev + refund);
    setPlacedChips({
      ante: [],
      bonus: [],
      jackpot: [],
      flop: [],
      turn: [],
      river: [],
    });
  };

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
