// src/components/StatsPanel.jsx
import React, { useMemo } from 'react';

export default function StatsPanel({ history, style = {} }) {
  const stats = useMemo(() => {
    const total = history.length || 1; // 0除算回避
    const win = history.filter((h) => h.playerWins).length;
    const tie = history.filter((h) => h.tie).length;
    const fold = history.filter((h) => h.endedBy === 'fold').length;

    const betSum = history.reduce((s, h) => s + (h.totalBet ?? 0), 0);
    const paySum = history.reduce((s, h) => s + (h.payout ?? 0), 0);
    const bonusHit = history.filter((h) => (h.bonusWin ?? 0) > 0).length;
    const jpHit = history.filter((h) => (h.jackpotWin ?? 0) > 0).length;

    return {
      winRate: ((win / total) * 100).toFixed(1),
      tieRate: ((tie / total) * 100).toFixed(1),
      foldRate: ((fold / total) * 100).toFixed(1),
      rtp: betSum ? ((paySum / betSum) * 100).toFixed(1) : '—',
      bonusRate: ((bonusHit / total) * 100).toFixed(1),
      jpRate: ((jpHit / total) * 100).toFixed(2),
    };
  }, [history]);

  return (
    <div className="stats-box" style={style}>
      <h3>📊 Your Stats</h3>
      <ul>
        <li>Win&nbsp;Rate&nbsp;: {stats.winRate}%</li>
        <li>Tie&nbsp;Rate&nbsp;: {stats.tieRate}%</li>
        <li>Fold Rate : {stats.foldRate}%</li>
        <li>RTP&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;: {stats.rtp}%</li>
        <li>Bonus&nbsp;Hit : {stats.bonusRate}%</li>
        <li>Jackpot&nbsp;Hit: {stats.jpRate}%</li>
      </ul>
    </div>
  );
}
