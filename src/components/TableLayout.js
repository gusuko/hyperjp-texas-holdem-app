// TableLayout.js
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

const TableLayout = ({
  chips,
  setChips,
  placedChips,
  setPlacedChips,
  onChipsChange,
  gamePhase,
  onFlopClick,
  onTurnClick,
  onRiverClick,
  isFlopActive,
  isTurnActive,
  isRiverActive,
  selectedArea,
  setSelectedArea,
}) => {
  useEffect(() => {
    if (onChipsChange) {
      onChipsChange(placedChips);
    }
  }, [placedChips, onChipsChange]);

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

  const getTotalBet = (area) => {
    return placedChips[area].reduce((sum, chip) => sum + chip.value, 0);
  };

  const getSortedVisibleChips = (area) => {
    return [...placedChips[area]].sort((a, b) => b.value - a.value).slice(0, 5);
  };

  const isAreaActive = (area) => {
    if (['flop', 'turn', 'river'].includes(area)) {
      if (area === 'flop') return isFlopActive;
      if (area === 'turn') return isTurnActive;
      if (area === 'river') return isRiverActive;
    }
    // 💡 ゲーム前だけ ante/bonus/jackpot をアクティブに
    if (['ante', 'bonus', 'jackpot'].includes(area)) {
      return gamePhase === 'initial';
    }
    return true;
  };

  const getClickHandler = (area) => {
    if (area === 'flop') return isFlopActive ? onFlopClick : undefined;
    if (area === 'turn') return isTurnActive ? onTurnClick : undefined;
    if (area === 'river') return isRiverActive ? onRiverClick : undefined;
    return () => setSelectedArea(area);
  };

  return (
    <div className="table-layout-root">
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
    </div>
  );
};

export default TableLayout;
