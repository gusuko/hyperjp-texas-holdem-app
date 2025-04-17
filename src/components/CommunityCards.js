import React from 'react';
import '../styles/CommunityCards.css';

const CommunityCards = ({ communityCards = [] }) => {
  return (
    <div className="community-cards">
      <h2>🃍 Community Cards</h2>
      <div className="card-row">
        {[0, 1, 2, 3, 4].map((index) => (
          <div key={index} className="card-slot">
            {communityCards[index] && (
              <img
                src={`/cards/${communityCards[index]}.png`}
                alt={communityCards[index]}
                width="100"
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CommunityCards;
