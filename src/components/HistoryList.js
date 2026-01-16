// src/components/HistoryList.js
import React from 'react';
import { miniCardSrc } from '../utils/cardImages';

/**
 * history item の想定（どれか入ってれば拾う）:
 * - return合計: totalReturn / returnTotal / payout / returned / totalPayout ...
 * - bet合計   : totalBet / betTotal / wager / totalWager ...
 * - bet内訳   : bets { ante, bonus, jackpot, flop, turn, river, ... } または ante/bonus/... が直にある
 * - 勝敗フラグ: endedBy, playerWins, tie
 */

const MiniCards = ({ ids = [] }) => (
  <div className="mini-cards">
    {ids.map((id) => (
      <img key={id} src={miniCardSrc(id)} className="mini" alt={id} />
    ))}
  </div>
);

// 数値化（null/undefined/NaN を弾く）
const toNum = (v) => {
  if (v === null || v === undefined) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
};

// bet合計を “いろんな形” から推測して合算
const calcBetTotal = (h) => {
  // 1) もう合計があるなら最優先
  const direct =
    toNum(h.totalBet) ??
    toNum(h.betTotal) ??
    toNum(h.wager) ??
    toNum(h.totalWager) ??
    toNum(h.totalStake);
  if (direct !== null) return direct;

  // 2) bets オブジェクトがあれば合算
  if (h.bets && typeof h.bets === 'object') {
    const sum = Object.values(h.bets).reduce(
      (acc, v) => acc + (toNum(v) ?? 0),
      0
    );
    return sum;
  }

  // 3) 直に ante/bonus/flop... を持ってる可能性
  const keys = [
    'ante',
    'bonus',
    'jackpot',
    'flop',
    'turn',
    'river',
    'play', // 呼び方違い対策
    'raise',
    'trip', // UTH系で使うことがある
    'blind',
  ];

  let sum = 0;
  let hit = false;
  for (const k of keys) {
    const n = toNum(h[k]);
    if (n !== null) {
      sum += n;
      hit = true;
    }
  }
  return hit ? sum : 0; // 見つからなければ 0（不明）
};

// return合計を拾う（負けて 0 になる “return” の可能性がある）
const calcReturnTotal = (h) => {
  return (
    toNum(h.totalReturn) ??
    toNum(h.returnTotal) ??
    toNum(h.totalPayout) ??
    toNum(h.returned) ??
    toNum(h.payout) ?? // ← 最後にこれ
    toNum(h.delta) ??
    toNum(h.net) ??
    toNum(h.profit) ??
    0
  );
};

// 「純損益(net)」を出す：基本は return - bet
const calcNet = (h) => {
  const bet = calcBetTotal(h);
  const ret = calcReturnTotal(h);

  // もし history が “純損益” を別名で既に持ってるなら、それを優先してもいい
  const explicitNet =
    toNum(h.net) ?? toNum(h.delta) ?? toNum(h.netProfit) ?? toNum(h.profit);

  // explicitNet が “それっぽい値” で入ってるならそれを使う（bet/return不明の時に特に有効）
  if (explicitNet !== null && bet === 0 && ret === 0) return explicitNet;

  // 普通はこれで昔の「負けがマイナス表示」に戻る
  return ret - bet;
};

export default function HistoryList({ history = [] }) {
  return (
    <div className="history-list">
      <h3 className="history-title">ハンド履歴（{history.length}）</h3>

      {/* ヘッダ */}
      <div className="history-head">
        <div className="h-col h-meta">#</div>
        <div className="h-col">Player</div>
        <div className="h-col">Dealer</div>
        <div className="h-col">Board</div>
        <div className="h-col h-pay">Payout</div>
      </div>

      {/* 本体 */}
      <div className="history-body">
        {history.map((h, idx) => {
          // 勝敗文字
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

          // ✅ ここが肝：net（純損益）表示
          const net = calcNet(h);

          const payoutText = net >= 0 ? `+${net}` : `${net}`;
          const payoutClass = net >= 0 ? 'plus' : 'minus';

          return (
            <div key={idx} className={`history-row ${rowClass}`}>
              <div className="h-col h-meta">
                <div className="h-no">{history.length - idx}</div>
                <div className="h-res">{res}</div>
              </div>

              <div className="h-col">
                <MiniCards ids={h.playerCards} />
              </div>

              <div className="h-col">
                <MiniCards ids={h.dealerCards} />
              </div>

              <div className="h-col">
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
