// components/ControlsLayer.jsx
import React from 'react';

/**
 * ControlsLayer  ─ 位置指定だけの極小ラッパー
 *   pos : { top, left }   ← positionConfig.uiPositions と同形式
 */
export default function ControlsLayer({ pos, children }) {
  const style = {
    position: 'absolute',
    top: `calc(${pos.top}px  * var(--table-scale))`,
    left: `calc(${pos.left}px * var(--table-scale))`,
    transform: 'translate(-50%, -50%)',
    zIndex: 20,
  };

  return <div style={style}>{children}</div>;
}
