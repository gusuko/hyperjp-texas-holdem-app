import React from 'react';

// プレイヤーのカード表示コンポーネント
const PlayerHand = ({ playerCards }) => {
  return (
    <div className="player-hand">
      <h2 style={{ textAlign: 'center', width: '100%' }}>🎴 Player</h2>
      <div className="card-row">
        {playerCards.map((card) => (
          <img key={card} src={`/cards/${card}.png`} alt={card} width="100" />
        ))}
      </div>
    </div>
  );
};

export default PlayerHand;
