// components/CardSlot.jsx
import React from 'react';
import { TABLE_SCALE } from '../constants//positionConfig'; // パスは環境に合わせて

export default function CardSlot({ style }) {
  const { top, left } = style;
  return (
    <div
      className="card-slot-frame"
      style={{
        position: 'absolute',
        top: top * TABLE_SCALE,
        left: left * TABLE_SCALE,
        width: 100 * TABLE_SCALE,
        height: 140 * TABLE_SCALE,

        border: '2px solid white', // ←デバッグが終わったら薄色に
        borderRadius: 6,
        zIndex: 9999,
        pointerEvents: 'none',
      }}
    />
  );
}
