// src/components/PlayerHand.js
import React from 'react';

// プレイヤーのカード表示コンポーネント
const PlayerHand = ({ playerCards }) => {
  return (
    <div>
      <h2>🎴 Player</h2>
      {playerCards.map((card) => (
        <img key={card} src={`/cards/${card}.png`} alt={card} width="100" />
      ))}
    </div>
  );
};

export default PlayerHand;
