// src/components/ChipSelector.jsx
import React from 'react';
import '../styles/TableLayout.css';
import Chip from './Chip';
import { playBetSound } from '../utils/sound';

/* 使用するチップ画像と額面 */
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
 * ---------------------------------------------
 * props
 * ─ chips, placedChips, gamePhase, selectedArea
 * ─ dispatch, credit, debit
 * ─ tutorialActive : boolean
 * ─ tutorialStage  : 1 | 2 | 3
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
  /* すでに置いた合計を計算 */
  const anteTotal = placedChips.ante.reduce((s, c) => s + c.value, 0);
  const bonusTotal = placedChips.bonus.reduce((s, c) => s + c.value, 0);
  const jackpotTotal = placedChips.jackpot.reduce((s, c) => s + c.value, 0);

  /* チュートリアル中に許可するチップ額 */
  let allowedValue = 25; // デフォルト
  if (tutorialActive && tutorialStage === 3) allowedValue = 5;

  /* チュートリアルで 1 枚置いたらロック */
  let tutorialLock = false;
  if (tutorialActive) {
    if (tutorialStage === 1) tutorialLock = anteTotal >= 25;
    if (tutorialStage === 2) tutorialLock = bonusTotal >= 25;
    if (tutorialStage === 3) tutorialLock = jackpotTotal >= 5;
  }

  /* --------------------------------- */
  /* チップを置く処理                  */
  /* --------------------------------- */
  const handlePlaceChip = (area, chip) => {
    if (tutorialActive) {
      if (
        (tutorialStage === 1 && area !== 'ante') ||
        (tutorialStage === 2 && area !== 'bonus') ||
        (tutorialStage === 3 && area !== 'jackpot')
      )
        return; // 正しい円でなければ何もしない
    }
    // 選択エリアが無い場合は無視
    if (!area) return;

    // ゲームフェーズによるロック（初期フェーズ以外は特定円のみ可）
    const restricted = ['ante', 'bonus', 'jackpot'];
    if (gamePhase !== 'initial' && restricted.includes(area)) return;

    // JACKPOT は常に合計 25 まで
    if (area === 'jackpot') {
      const currentTotal = placedChips.jackpot.reduce((s, c) => s + c.value, 0);
      if (currentTotal + chip.value > 25) return;
    }

    // 残高不足なら無視
    if (chips < chip.value) return;

    /* 実際に置く */
    const updated = [...placedChips[area], chip].sort(
      (a, b) => a.value - b.value
    );
    debit(chip.value);
    dispatch({ type: 'SET_PLACED_CHIPS', area, chips: updated });
    playBetSound();
    dispatch({ type: 'PLACE_BET', area, amount: chip.value });
  };

  /* --------------------------------- */
  /*  ベットリセット（初期フェーズのみ）*/
  /* --------------------------------- */
  const handleResetBets = () => {
    if (gamePhase !== 'initial') return;
    if (tutorialActive) return;
    const refund = Object.values(placedChips)
      .flat()
      .reduce((sum, chip) => sum + chip.value, 0);
    credit(refund);
    dispatch({ type: 'RESET_BETS' });
    dispatch({ type: 'RESET_PLACED_CHIPS' });
  };

  /* --------------------------------- */
  /*  JSX                              */
  /* --------------------------------- */
  return (
    <div className="chip-selector">
      <div className="chip-list">
        {chipOptions.map((chip) => {
          /* 置けるかどうかの判定 */
          const disabled =
            tutorialLock ||
            chip.value > chips ||
            (tutorialActive && chip.value !== allowedValue) ||
            (tutorialActive && tutorialStage === 1 && !selectedArea);

          return (
            <Chip
              key={chip.value}
              value={chip.value}
              imageSrc={chip.src}
              highlight={false}
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
        <button
          className="reset-button"
          onClick={handleResetBets}
          disabled={tutorialActive} // ★ 無効化
          style={{
            opacity: tutorialActive ? 0.4 : 1,
            cursor: tutorialActive ? 'not-allowed' : 'pointer',
          }}
        >
          リセット
        </button>
      )}
    </div>
  );
}
