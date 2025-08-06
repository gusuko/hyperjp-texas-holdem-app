// src/components/ChipSelector.jsx
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
 * ChipSelector
 *  ─ 残高・ベット配置を扱うパネル
 *
 * props
 * ─ chips, placedChips, gamePhase, selectedArea
 * ─ dispatch, credit, debit
 * ─ tutorialActive : boolean   ★追加（true → $25 を 1 枚だけ許可）
 */
export default function ChipSelector({
  chips,
  placedChips,
  gamePhase,
  selectedArea,
  dispatch,
  credit,
  debit,
  tutorialActive = false,
  tutorialStage = 1,
}) {
  /* --- すでに ANTE に置いた合計 $ --- */
  const anteTotal = placedChips.ante.reduce((s, c) => s + c.value, 0);
  /* --- チュートリアル中で $25 以上置いたらロック --- */
  const tutorialLock = tutorialActive && tutorialStage === 1 && anteTotal >= 25;

  /* チップを置く処理 */
  const handlePlaceChip = (area, chip) => {
    if (area === 'jackpot') {
      // すでに置いてある JACKPOT の合計を計算
      const currentTotal = placedChips.jackpot.reduce((s, c) => s + c.value, 0);
      // 25 を超えるなら何もしない
      if (currentTotal + chip.value > 25) return;
      const restricted = ['ante', 'bonus', 'jackpot'];
      if (gamePhase !== 'initial' && restricted.includes(area)) return;
    }
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

  /* リセット（初期フェーズ限定） */
  const handleResetBets = () => {
    if (gamePhase !== 'initial') return;
    const refund = Object.values(placedChips)
      .flat()
      .reduce((sum, chip) => sum + chip.value, 0);
    credit(refund);
    dispatch({ type: 'RESET_BETS' });
    dispatch({ type: 'RESET_PLACED_CHIPS' });
  };

  /* ------------- JSX ------------- */
  return (
    <div className="chip-selector">
      <div className="chip-list">
        {chipOptions.map((chip) => {
          /* disabled 判定 */
          const disabled =
            tutorialLock || // ★ $25 1枚置いたら全チップ無効
            chip.value > chips ||
            (tutorialActive && chip.value !== 25);

          return (
            <Chip
              key={chip.value}
              value={chip.value}
              imageSrc={chip.src}
              highlight={
                tutorialActive && tutorialStage === 1 && chip.value === 25
              }
              onClick={() => !disabled && handlePlaceChip(selectedArea, chip)}
              style={{
                opacity: disabled ? 0.3 : 1,
                cursor: disabled ? 'not-allowed' : 'pointer',
                pointerEvents: disabled ? 'none' : 'auto',
                transition: 'opacity .2s',
              }}
            />
          );
        })}
      </div>

      {gamePhase === 'initial' && (
        <button className="reset-button" onClick={handleResetBets}>
          リセット
        </button>
      )}
    </div>
  );
}
