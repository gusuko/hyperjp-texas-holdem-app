// components/PlayerHand.jsx
export default function PlayerHand({ cards = [] }) {
  return (
    <>
      {cards.map((c, i) => (
        <img key={i} src={`/cards/${c}.png`} alt={c} width={100} />
      ))}
    </>
  );
}
