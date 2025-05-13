// BetCircle.jsx  ─ 直径 70px のベット円
import React from 'react';
import { betPositions } from '../constants/positionConfig';
import { TABLE_SCALE, DIM, POS } from '../constants/layoutConfig';

export default function BetCircle({
  area, // 'ante' | 'bonus' | …
  total, // 合計金額
  chips = [], // 可視チップ [{ value, src }, …]
  isSelected, // 選択中?
  isActive, // クリック可?
  onClick, // クリックハンドラ
}) {
  /* ① 中央線(50%) を原点としたオフセットを取得 */
  const { top, left } = betPositions[area]; // ← positionConfig で定義した差分(px)

  return (
    <div
      className={`bet-area ${isSelected ? 'selected' : ''}`}
      onClick={isActive ? onClick : undefined} // ← inactive のとき無効化
      role="button"
      tabIndex={isActive ? 0 : -1}
      aria-pressed={isSelected}
      style={{
        left: `calc(50%  + ${left * TABLE_SCALE}px)`,
        top: `calc(50vh + ${top * TABLE_SCALE}px)`,
        transform: `scale(${TABLE_SCALE})`,
      }}
    >
      {/* ───────── 点線の円 ───────── */}
      <div className={`circle ${isActive ? 'active' : 'inactive'}`} />

      {/* ──────── チップ画像（最大5枚）──────── */}
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
                /* 中央基点からわずかに右下へスタック */
                transform: `translate(-50%, -50%)                   /* 中央に合わせる */ 
                  translate(${i * 2}px, ${
                  -i * 2
                }px)` /* その上で少し右下へ重ねる */,
                zIndex: i + 1,
              }}
            />
          ))}
      </div>

      {/* ───── ラベル & 合計金額 ───── */}
      <div className="label">{area.toUpperCase()}</div>
      <div className="total">${total}</div>
    </div>
  );
}
