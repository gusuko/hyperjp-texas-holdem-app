// components/PlayAgainButton.js
import React from 'react';

/**
 * 「もう一度プレイ！」ボタンのコンポーネント
 * @param {boolean} showdown - 勝負が終わったかどうか
 * @param {Function} restartRound - 再プレイ時の処理
 */
const PlayAgainButton = ({ showdown, restartRound }) => {
  if (!showdown) return null;

  return (
    <button
      onClick={restartRound}
      style={{
        padding: '0.5em 1em',
        fontSize: '1.2em',
        backgroundColor: '#4CAF50',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
      }}
    >
      🔄 もう一度プレイ！
    </button>
  );
};

export default PlayAgainButton;
