// components/DealerHand.jsx
export default function DealerHand({ cards = [], showdown }) {
  return (
    <>
      {cards.map((c, i) => (
        <img
          key={i}
          src={showdown ? `/cards/${c}.png` : '/cards/back.png'}
          alt={c}
          width={100}
        />
      ))}
    </>
  );
}
