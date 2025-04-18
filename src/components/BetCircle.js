// BetCircle.jsx
// １つのベット円コンポーネント（直径 70px）
import React from 'react';

export default function BetCircle({
  area, // 'ante' など
  total, // 合計金額
  chips = [], // [{ value, src }, ...] 置かれたチップ
  isSelected, // true なら黄色に光る
  isActive, // true ならクリック可
  onClick, // クリック時ハンドラ
  style, // { top, left }
}) {
  return (
    <div
      className={`bet-area ${isSelected ? 'selected' : ''}`}
      onClick={onClick}
      style={style}
    >
      {/* 点線円 */}
      <div className={`circle ${isActive ? 'active' : 'inactive'}`} />

      {/* 円中央を基点にチップをスタック */}
      <div className="chip-stack">
        {chips.slice(0, 5).map((chip, i) => (
          <img
            key={i}
            src={chip.src}
            className="bet-chip"
            alt={`$${chip.value}`}
            style={{
              transform: `translate(-50%, -50%) translate(${i * 2}px, ${
                i * -2
              }px)`,
              zIndex: i + 1,
            }}
          />
        ))}
      </div>

      <div className="label">{area.toUpperCase()}</div>
      <div className="total">${total}</div>
    </div>
  );
}
