// src/components/HistoryList.js
import React from 'react';
import { miniCardSrc } from '../utils/cardImages';
/**
 * props:
 *   history : [{ playerCards, dealerCards, community, resultText, payout, endedBy, createdAt }]
 */
const renderMini = (ids = []) =>
  ids.map((id) => (
    <img key={id} src={miniCardSrc(id)} className="mini" alt={id} />
  ));

export default function HistoryList({ history, style }) {
  return (
    <div className="history-list" style={style}>
      <h3 className="history-title">ハンド履歴（{history.length}）</h3>

      <table className="history-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Player</th>
            <th>Dealer</th>
            <th>Board</th>
            <th>Result</th>
            <th>Payout</th>
          </tr>
        </thead>
        <tbody>
          {history.map((h, idx) => {
            // 勝敗 1 文字化
            let res = 'T'; // Tie
            if (h.endedBy === 'fold') res = 'F';
            else if (h.playerWins) res = 'W';
            else if (h.tie) res = 'T';
            else res = 'L';
            return (
              <tr key={idx}>
                <td>{history.length - idx}</td>
                {/* 新しい順で番号 */}
                <td>{renderMini(h.playerCards)}</td>
                <td>{renderMini(h.dealerCards)}</td>
                <td className="board">{renderMini(h.community)}</td>
                <td>{res}</td>
                <td className={h.payout >= 0 ? 'plus' : 'minus'}>
                  {h.payout >= 0 ? `+${h.payout}` : h.payout}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
