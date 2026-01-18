// src/components/HistoryList.js
import React from 'react';
import { miniCardSrc } from '../utils/cardImages';

/**
 * props:
 *   history : [{ playerCards, dealerCards, community, payout, endedBy, playerWins, tie }]
 */
const MiniCards = ({ ids = [] }) => (
  <div className="history-mini-cards">
    {ids.map((id) => (
      <img key={id} src={miniCardSrc(id)} className="history-mini" alt={id} />
    ))}
  </div>
);

export default function HistoryList({ history }) {
  return (
    <div className="history-list">
      <h3 className="history-title">ハンド履歴（{history.length}）</h3>

      <div className="history-head">
        <div className="h-col h-meta">#</div>
        <div className="h-col h-cards">Player</div>
        <div className="h-col h-cards">Dealer</div>
        <div className="h-col h-board">Board</div>
        <div className="h-col h-pay">Payout</div>
      </div>

      <div className="history-body">
        {history.map((h, idx) => {
          let res = 'LOSE';
          if (h.endedBy === 'fold') res = 'FOLD';
          else if (h.tie) res = 'TIE';
          else if (h.playerWins) res = 'WIN';

          const rowClass =
            res === 'WIN'
              ? 'win'
              : res === 'LOSE'
              ? 'lose'
              : res === 'FOLD'
              ? 'fold'
              : 'tie';

          const payoutNum = Number(h.payout ?? 0);
          const payoutText = payoutNum >= 0 ? `+${payoutNum}` : `${payoutNum}`;
          const payoutClass = payoutNum >= 0 ? 'plus' : 'minus';

          return (
            <div key={idx} className={`history-row ${rowClass}`}>
              <div className="h-col h-meta">
                <div className="h-no">{history.length - idx}</div>
                <div className="h-res">{res}</div>
              </div>

              <div className="h-col h-cards">
                <MiniCards ids={h.playerCards} />
              </div>

              <div className="h-col h-cards">
                <MiniCards ids={h.dealerCards} />
              </div>

              <div className="h-col h-board">
                <MiniCards ids={h.community} />
              </div>

              <div className={`h-col h-pay ${payoutClass}`}>{payoutText}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
