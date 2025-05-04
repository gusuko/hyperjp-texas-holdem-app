// -------------- CardGroup.jsx -----------------
import React from 'react';
import RenderCard from './RenderCard'; // パスは既存 RenderCard に合わせて調整

export default function CardGroup({ cards, positions, facedown = false }) {
  return cards.map((card, i) => (
    <RenderCard key={i} card={card} pos={positions[i]} faceDown={facedown} />
  ));
}
