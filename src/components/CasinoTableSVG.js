// CasinoTableSVG.js
// 👉 FLOP / TURN / RIVER を最下部に、ANTE / BONUS / JACKPOT をその少し上へ

import React from 'react';

const CasinoTableSVG = () => {
  return (
    <svg
      viewBox="0 0 1600 1200"
      width="100%"
      height="1000px"
      preserveAspectRatio="xMidYMid meet"
    >
      <g transform="translate(0,-120)">
        {/* 木製外周：上直線、下円弧 */}
        <path
          d="M 100 600 A 500 500 0 0 0 1500 600 L 1500 200 L 100 200 Z"
          fill="#5c3b1e"
        />

        {/* 緑フェルト領域 */}
        <path
          d="M 140 600 A 460 460 0 0 0 1460 600 L 1460 240 L 140 240 Z"
          fill="#006400"
          stroke="#ffffff"
          strokeWidth="4"
        />
      </g>
    </svg>
  );
};

export default CasinoTableSVG;
