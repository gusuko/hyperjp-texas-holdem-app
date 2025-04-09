// components/CommunityCards.js
import React from 'react';

/**
 * コミュニティカード（場に出る最大5枚）を表示するコンポーネント
 * @param {Array} communityCards - 場に出ているカードの配列
 */
const CommunityCards = ({ communityCards }) => {
  return (
    <div>
      <h2>🃍 Community Cards</h2>
      {communityCards.map((card) => (
        <img key={card} src={`/cards/${card}.png`} alt={card} width="100" />
      ))}
    </div>
  );
};

export default CommunityCards;
