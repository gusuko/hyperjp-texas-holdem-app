// components/CommunityCards.jsx
import React from 'react';

/**
 * CommunityCards  ‑ 1 枚～5 枚をそのまま並べるだけの軽量コンポーネント
 *
 * @param {string[]} cards  - コミュニティカード配列（0‑5 枚）
 * @param {number}   scale  - 拡大率（親でまとめて指定できるようにオプション化）
 */
export default function CommunityCards({ cards = [], scale = 1 }) {
  return (
    <>
      {cards.map((card) => (
        <img
          key={card}
          src={`/cards/${card}.png`}
          alt={card}
          width={100}
          style={{ transform: `scale(${scale})` }}
        />
      ))}
    </>
  );
}
