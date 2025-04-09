// BettingControls.js
// 👉 ANTE, BONUS, JACKPOT のチップ選択UIを提供するコンポーネント

import React from 'react';
import { chipValues } from '../constants/chips';

const BettingControls = ({
  anteBet,
  bonusBet,
  jackpotBet,
  chips,
  onAnteChange,
  onBonusChange,
  onJackpotChange,
  onChipsChange,
}) => {
  // ベット追加時の共通処理
  const handleBet = (type, val) => {
    if (chips < val) return; // チップ残高チェック

    onChipsChange((prev) => prev - val); // チップから引く

    // 種類ごとに追加処理
    if (type === 'ante') {
      onAnteChange((prev) => prev + val);
    } else if (type === 'bonus') {
      onBonusChange((prev) => prev + val);
    } else if (type === 'jackpot') {
      onJackpotChange((prev) => {
        const newVal = prev + val;
        return newVal <= 25 ? newVal : prev; // JACKPOT上限は25
      });
    }
  };

  return (
    <div>
      {/* ANTE ベット表示とチップボタン */}
      <div>
        <h4>ANTE ベット（最低$25）: ${anteBet}</h4>
        {chipValues.map((val) => (
          <button key={`ante-${val}`} onClick={() => handleBet('ante', val)}>
            +${val}
          </button>
        ))}
      </div>

      {/* BONUS ベット */}
      <div>
        <h4>BONUS ベット（最低$5〜）: ${bonusBet}</h4>
        {chipValues.map((val) => (
          <button key={`bonus-${val}`} onClick={() => handleBet('bonus', val)}>
            +${val}
          </button>
        ))}
      </div>

      {/* JACKPOT ベット */}
      <div>
        <h4>JACKPOT ベット（5〜25ドルまで、5刻み）: ${jackpotBet}</h4>
        {[5, 10, 15, 20, 25].map((val) => (
          <button
            key={`jackpot-${val}`}
            onClick={() => handleBet('jackpot', val)}
          >
            +${val}
          </button>
        ))}
      </div>
    </div>
  );
};

export default BettingControls;
