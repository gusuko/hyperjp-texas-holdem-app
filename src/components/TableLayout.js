// TableLayout.js
import React, { useEffect, useState } from 'react';
import '../styles/TableLayout.css';
import Chip from './Chip';

const chipOptions = [
  { value: 25, src: '/chips/chip_25.png' },
  { value: 100, src: '/chips/chip_100.png' },
  { value: 500, src: '/chips/chip_500.png' },
  { value: 1000, src: '/chips/chip_1000.png' },
  { value: 10000, src: '/chips/chip_10000.png' },
];

const betAreas = ['ante', 'bonus', 'jackpot', 'flop', 'turn', 'river'];

const TableLayout = ({
  chips,
  setChips,
  placedChips,
  setPlacedChips,
  onChipsChange,
  gamePhase,
}) => {
  const [selectedArea, setSelectedArea] = useState('ante');

  // 💡 チップ配置が変わったら App 側にも通知
  useEffect(() => {
    if (onChipsChange) {
      onChipsChange(placedChips);
    }
  }, [placedChips, onChipsChange]);

  // 🧩 チップを選択したベットエリアに追加
  const handlePlaceChip = (area, chip) => {
    if (chips >= chip.value) {
      setPlacedChips((prev) => ({
        ...prev,
        [area]: [...prev[area], chip],
      }));
      setChips((prev) => prev - chip.value);
    }
  };

  const handleResetBets = () => {
    // 🎯 現在のゲーム進行中はリセットさせない
    if (gamePhase !== 'initial') return;

    // 🌀 チップを戻す
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

  return (
    <div className="table-container">
      <div className="table">
        {betAreas.map((area) => (
          <div
            key={area}
            className={`bet-area ${area} ${
              selectedArea === area ? 'selected' : ''
            }`}
            onClick={() => setSelectedArea(area)}
          >
            <div className="circle" />
            <div className="label">{area.toUpperCase()}</div>
            <div className="total">${getTotalBet(area)}</div>

            {getSortedVisibleChips(area).map((chip, i) => (
              <img
                key={i}
                src={chip.src}
                alt={`$${chip.value} chip`}
                style={{
                  position: 'absolute',
                  width: '95px',
                  height: '95px',
                  top: i * -3,
                  left: i * 3,
                  zIndex: i + 1,
                  pointerEvents: 'none',
                }}
              />
            ))}
          </div>
        ))}
      </div>

      {/* チップ選択とリセット */}
      <div className="chip-selector">
        <div className="chip-label">
          置く場所：<strong>{selectedArea.toUpperCase()}</strong>
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
