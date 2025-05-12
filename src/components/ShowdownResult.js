// components/ShowdownResult.js
import React from 'react';

/**
 * Showdownの勝敗結果テキストを表示するコンポーネント
 * @param {boolean} showdown - 勝負中かどうかのフラグ
 * @param {string} resultText - 勝敗や払い戻しのテキスト
 */
const ShowdownResult = ({ showdown, resultText }) => {
  if (!showdown) return null;

  return (
    <div
      style={{
        marginTop: '2em',
        fontWeight: 'bold',
        fontSize: '1.2em',
        whiteSpace: 'pre-line',
      }}
    >
      R E S U L T
      <br />
      {resultText}
    </div>
  );
};

export default ShowdownResult;
