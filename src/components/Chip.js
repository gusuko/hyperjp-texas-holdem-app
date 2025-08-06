// src/components/Chip.jsx
import React from 'react';

/**
 * props
 * - value      : チップ額面 (number)
 * - imageSrc   : 画像 URL
 * - onClick    : クリック時ハンドラ
 * - style      : 追加スタイル（任意）
 * - highlight  : boolean  ← ★ 追加（true で光るクラス付与）
 */
const Chip = ({ value, imageSrc, onClick, style = {}, highlight = false }) => {
  return (
    <img
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
    />
  );
};

export default Chip;
