// components/DealerHand.js
import React from 'react';

/**
 * ディーラーの手札を表示するコンポーネント
 * @param {Array} dealerCards - ディーラーの2枚のカード
 * @param {boolean} showdown - 表示するか裏のままにするかのフラグ
 */
const DealerHand = ({ dealerCards, showdown }) => {
  return (
    <div>
      <h2>🎲 Dealer</h2>
      {dealerCards.map((card, index) => (
        <img
          key={index}
          src={showdown ? `/cards/${card}.png` : `/cards/back.png`}
          alt={card}
          width="100"
        />
      ))}
    </div>
  );
};

export default DealerHand;
