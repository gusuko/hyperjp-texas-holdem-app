import DealerHand from './DealerHand';
import CommunityCards from './CommunityCards';
import PlayerHand from './PlayerHand';

export default function CardTable({ gamePhase, cards, showdown }) {
  if (gamePhase === 'initial') return null;

  return (
    <div className="card-table">
      <DealerHand dealerCards={cards.dealer} showdown={showdown} />
      <CommunityCards communityCards={cards.community} />
      <PlayerHand playerCards={cards.player} />
    </div>
  );
}
