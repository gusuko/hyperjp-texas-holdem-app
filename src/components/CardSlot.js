// src/components/CardSlot.jsx
import React from 'react';
import { DIM } from '../constants/layoutConfig';

export default function CardSlot({ style }) {
  // style には {top, left} が入ってくる
  const { top, left } = style;

  return (
    <div
      className="card-slot-frame"
      style={{
        left: left, // ← 受け取った px をそのまま
        top: top,
        width: DIM.CARD_W, // ← 基準サイズのまま
        height: DIM.CARD_H,
        zIndex: 0,
      }}
    />
  );
}
