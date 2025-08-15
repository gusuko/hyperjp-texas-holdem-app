// src/components/HandPointer.js
import React from 'react';

/**
 * x, y        : 指したい対象（円/チップ）の中心座標(px)
 * corner      : 起点の角 ("NE" | "NW" | "SE" | "SW")
 * radius      : 対象半径（直径70なら 35）
 * offset      : 起点までの距離（大きいほど右上に離れる）
 * color       : 矢印色
 * stroke      : 軸線の太さ
 * tipInset    : 先端を中心から内側へ寄せる量（縁で止める微調整）
 * durationMs  : 往復アニメの片道時間（ms）
 * arrowLength : 矢印の全長（固定）。未指定なら自動計算で良い長さに。
 */
export default function HandPointer({
  x,
  y,
  corner = 'NE',
  radius = 35,
  offset = 30,
  color = '#00eaff',
  stroke = 6,
  tipInset = 2,
  durationMs = 800,
  arrowLength, // 例: 80 など。未指定なら自動
}) {
  if (typeof x !== 'number' || typeof y !== 'number') return null;

  // 起点（右上など）を決める
  const map = {
    NE: [radius + offset, -radius - offset],
    NW: [-radius - offset, -radius - offset],
    SE: [radius + offset, radius + offset],
    SW: [-radius - offset, radius + offset],
  };
  const [dx, dy] = map[corner] || map.NE;
  const ax = x + dx; // anchorX
  const ay = y + dy; // anchorY

  // ベクトル（起点→中心）
  const vx = x - ax;
  const vy = y - ay;
  const len = Math.hypot(vx, vy) || 1;
  const ux = vx / len; // 単位ベクトル
  const uy = vy / len;

  // 矢印が触れる先端（円の「縁」で止める）
  const tipX = x - ux * Math.max(0, radius - tipInset);
  const tipY = y - uy * Math.max(0, radius - tipInset);

  // 起点→縁までの距離
  const distAT = Math.hypot(tipX - ax, tipY - ay);

  // 矢印の固定長（未指定なら自動：進路の 60% を基準に 30〜120 にクランプ）
  const L = Math.max(30, Math.min(arrowLength ?? distAT * 0.6, 120));

  // 往復移動の開始・終了位置（グループ原点＝矢印の"根本"位置）
  const startX = ax;
  const startY = ay;
  const endX = tipX - ux * L; // 先端が縁に触れるよう、全長ぶんだけ戻す
  const endY = tipY - uy * L;

  // 進行方向の角度（右向き0°）
  const angleDeg = (Math.atan2(vy, vx) * 180) / Math.PI;

  // ヘッド（三角）のサイズ
  const headLen = 18;
  const headW = 14;

  return (
    <div
      className="guide-arrow"
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 2600,
      }}
    >
      <svg
        viewBox="0 0 1800 1100"
        width="100%"
        height="100%"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <defs>
          <filter id="hp_glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="1.5" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* 1) まず「移動」だけをアニメするグループ（平行移動） */}
        <g id="hp_translate" transform={`translate(${startX}, ${startY})`}>
          <animateTransform
            attributeName="transform"
            type="translate"
            dur={`${durationMs}ms`}
            repeatCount="indefinite"
            keyTimes="0;0.5;1"
            values={`
              ${startX},${startY};
              ${endX},${endY};
              ${startX},${startY}
            `}
          />

          {/* 2) 進行方向に固定回転させる（一定角） */}
          <g transform={`rotate(${angleDeg})`} filter="url(#hp_glow)">
            {/* 軸線（一定長） */}
            <line
              x1="0"
              y1="0"
              x2={L - headLen}
              y2="0"
              stroke={color}
              strokeWidth={stroke}
              strokeLinecap="round"
            />
            {/* ヘッド（三角） */}
            <polygon
              points={`${L},0 ${L - headLen},${headW / 2} ${L - headLen},${
                -headW / 2
              }`}
              fill={color}
            />
          </g>
        </g>
      </svg>
    </div>
  );
}
