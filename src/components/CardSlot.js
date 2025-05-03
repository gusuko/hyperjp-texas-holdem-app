// src/components/CardSlot.jsx
import React from 'react';
import { TABLE_SCALE } from '../constants/positionConfig';

export default function CardSlot({ style }) {
  // style には {top, left} が入ってくる
  const { top, left } = style;

  return (
    <div
      className="card-slot-frame"
      style={{
        /* 画面中央を原点に計算 */
        left: `calc(50% + ${left * TABLE_SCALE}px)`,
        top: `calc(50vh + ${top * TABLE_SCALE}px)`,
        width: 100 * TABLE_SCALE,
        height: 140 * TABLE_SCALE,
        zIndex: 0,
      }}
    />
  );
}
