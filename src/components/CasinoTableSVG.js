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

        {/* -------- ベットエリア: 上段を ANTE/BONUS/JACKPOT -------- */}
        <circle
          cx="650"
          cy="880"
          r="45"
          fill="#003300"
          stroke="#fff"
          strokeWidth="2"
        />
        <text x="650" y="887" textAnchor="middle" fill="#fff" fontSize="18">
          ANTE
        </text>

        <circle
          cx="800"
          cy="910"
          r="45"
          fill="#003300"
          stroke="#fff"
          strokeWidth="2"
        />
        <text x="800" y="917" textAnchor="middle" fill="#fff" fontSize="18">
          BONUS
        </text>

        <circle
          cx="950"
          cy="880"
          r="45"
          fill="#003300"
          stroke="#fff"
          strokeWidth="2"
        />
        <text x="950" y="887" textAnchor="middle" fill="#fff" fontSize="18">
          JACKPOT
        </text>

        {/* -------- 最下部に FLOP / TURN / RIVER -------- */}
        <circle
          cx="550"
          cy="1040"
          r="45"
          fill="#222"
          stroke="#fff"
          strokeWidth="2"
        />
        <text x="550" y="1047" textAnchor="middle" fill="#fff" fontSize="14">
          FLOP
        </text>

        <circle
          cx="800"
          cy="1070"
          r="45"
          fill="#222"
          stroke="#fff"
          strokeWidth="2"
        />
        <text x="800" y="1077" textAnchor="middle" fill="#fff" fontSize="14">
          TURN
        </text>

        <circle
          cx="1050"
          cy="1040"
          r="45"
          fill="#222"
          stroke="#fff"
          strokeWidth="2"
        />
        <text x="1050" y="1047" textAnchor="middle" fill="#fff" fontSize="14">
          RIVER
        </text>
      </g>
    </svg>
  );
};

export default CasinoTableSVG;
