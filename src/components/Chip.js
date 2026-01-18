// src/components/Chip.jsx
import React from 'react';

/**
 * props
 * - value      : チップ額面 (number)
 * - imageSrc   : 画像 URL
 * - onClick    : クリック時ハンドラ
 * - style      : 追加スタイル（任意）
 * - highlight  : boolean（true で光るクラス付与）
 *
 * ★ ref 対応：
 * ChipSelector から渡された ref を <img> に刺して、
 * TutorialPointers (RefPointer) が getBoundingClientRect で追えるようにする。
 */
const Chip = React.forwardRef(function Chip(
  { value, imageSrc, onClick, style = {}, highlight = false },
  ref
) {
  return (
    <img
      ref={ref} // ★追加：DOM(img)にrefを刺す
      src={imageSrc}
      alt={`$${value} chip`}
      onClick={onClick}
      className={highlight ? 'highlight-chip' : ''}
      style={{
        width: '70px',
        height: '70px',
        cursor: 'pointer',
        margin: 0,
        ...style,
      }}
      draggable={false}
    />
  );
});

export default Chip;
