// src/components/BetCircle.js
import React from 'react';
import { DIM, POS } from '../constants/layoutConfig';

/**
 * props
 * ─ area, total, chips, isSelected, isActive, onClick
 * ─ isDisabled     : boolean  … チュートリアル中などのクリック無効化
 * ─ tutorialActive : boolean  … true の間だけハイライト
 */
export default function BetCircle({
  area,
  total,
  chips = [],
  isSelected = false,
  isActive = false,
  isDisabled = false,
  tutorialActive = false, // ★ 追加
  onClick,
}) {
  const { top, left } = POS.bet[area];
  const clickable = isActive && !isDisabled;

  return (
    <div
      className={[
        'bet-area',
        isSelected ? 'selected' : '',
        clickable ? 'active' : 'inactive',
        isDisabled ? 'disabled' : '',
        tutorialActive ? 'highlight-circle' : '', // ハイライト
      ].join(' ')}
      onClick={clickable ? onClick : undefined}
      role="button"
      tabIndex={clickable ? 0 : -1}
      aria-pressed={isSelected}
      style={{
        width: DIM.BET_D,
        height: DIM.BET_D,
        left,
        top,
        pointerEvents: clickable ? 'auto' : 'none',
      }}
    >
      {/* 点線円 */}
      <div className={`circle ${clickable ? 'active' : 'inactive'}`} />

      {/* チップ画像（最大 5 枚）*/}
      <div className="chip-stack">
        {chips
          .slice(0, 5)
          .reverse()
          .map((chip, i) => (
            <img
              key={i}
              src={chip.src}
              className="bet-chip"
              alt={`$${chip.value}`}
              style={{
                transform: `translate(-50%, -50%) translate(${i * 2}px, ${
                  -i * 2
                }px)`,
                zIndex: i + 1,
              }}
            />
          ))}
      </div>

      {/* ラベル & 合計 */}
      <div className="label">{area.toUpperCase()}</div>
      <div className="total">${total}</div>
    </div>
  );
}
