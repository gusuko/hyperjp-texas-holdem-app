// src/components/ChipSummary.js
import React from 'react';
import '../styles/App.css'; // もしここで読み込んでない場合は明示的に読み込み

const ChipSummary = ({
  chips,
  anteBet,
  bonusBet,
  jackpotBet,
  flopBet,
  turnBet,
  riverBet,
}) => {
  return (
    <div className="chip-summary">
      <div className="chip-summary-title">💵 所持チップ：${chips}</div>

      <div className="chip-summary-values">
        ANTE: ${anteBet} / BONUS: ${bonusBet} / JACKPOT: ${jackpotBet}
        <br />
        FLOP: ${flopBet} / TURN: ${turnBet} / RIVER: ${riverBet}
      </div>
    </div>
  );
};

export default ChipSummary;
