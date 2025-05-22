// -------------- CardGroup.jsx -----------------
import React from 'react';
import RenderCard from './RenderCard';

export default function CardGroup({
  cards,
  positions,
  facedown = false,
  onCardLoad,
}) {
  return cards.map((card, i) => (
    <RenderCard
      key={i}
      card={card}
      pos={positions[i]}
      faceDown={facedown}
      onLoad={onCardLoad} // ← ここで受け取ったonCardLoadをimgのonLoadに渡す
    />
  ));
}
