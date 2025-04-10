import React from 'react';

/**
 * コミュニティカード（場に出る最大5枚）を表示するコンポーネント
 * @param {Array} communityCards - 場に出ているカードの配列
 */
const CommunityCards = ({ communityCards }) => {
  return (
    <div className="community-cards">
      <h2 style={{ textAlign: 'center', width: '100%' }}>🃍 Community Cards</h2>
      <div className="card-row">
        {communityCards.map((card) => (
          <img key={card} src={`/cards/${card}.png`} alt={card} width="100" />
        ))}
      </div>
    </div>
  );
};

export default CommunityCards;
