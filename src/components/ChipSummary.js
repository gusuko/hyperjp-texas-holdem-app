// src/components/ChipSummary.js
import React from 'react';

// 所持チップと現在のベット額を表示するシンプルなUI
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
    <>
      <div
        style={{ marginBottom: '1em', fontWeight: 'bold', fontSize: '1.2em' }}
      >
        💵 所持チップ：${chips}
      </div>

      <div style={{ fontSize: '0.9em', marginBottom: '1em' }}>
        ANTE: ${anteBet} / BONUS: ${bonusBet} / JACKPOT: ${jackpotBet}
        <br />
        FLOP: ${flopBet} / TURN: ${turnBet} / RIVER: ${riverBet}
      </div>
    </>
  );
};

export default ChipSummary;
