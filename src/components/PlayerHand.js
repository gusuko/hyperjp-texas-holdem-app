// components/PlayerHand.jsx
export default function PlayerHand({ cards = [] }) {
  console.log('cards:', cards);
  return (
    <>
      {cards.map((c, i) => (
        <img key={i} src={`/cards/${c}.png`} alt={c} width={100} />
      ))}
    </>
  );
}
