// src/components/HandPointer.jsx
import React from 'react';

/**
 * props
 * - x, y : ボード上での絶対座標（px, 画面縮尺前の値）
 */
export default function HandPointer({ x, y }) {
  return (
    <svg
      viewBox="0 0 64 64"
      width={60}
      height={60}
      style={{
        position: 'absolute',
        left: x,
        top: y,
        transform: 'translate(-50%, -50%)',
        animation: 'tapBounce 1.1s ease-in-out infinite',
        pointerEvents: 'none',
        zIndex: 2500,
      }}
    >
      {/* 手のひら */}
      <path
        d="M20 26v16c0 7 5 12 12 12s12-5 12-12V18a4 4 0 1 0-8 0v14-16a4 4 0 1 0-8 0v16-12a4 4 0 1 0-8 0z"
        fill="#fff"
        stroke="#000"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* 影を少し */}
      <ellipse cx="32" cy="58" rx="12" ry="4" fill="rgba(0,0,0,0.25)" />
    </svg>
  );
}
