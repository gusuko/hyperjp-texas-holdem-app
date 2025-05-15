// components/ShowdownResult.js
import React from 'react';

/**
 * Showdownの勝敗結果テキストを表示するコンポーネント
 * @param {boolean} showdown - 勝負中かどうかのフラグ
 * @param {string} resultText - 勝敗や払い戻しのテキスト
 */
const ShowdownResult = ({ showdown, resultText, style = {} }) => {
  if (!showdown) return null;

  return (
    <div
      style={{
        fontWeight: 'bold',
        fontSize: '1.2em',
        whiteSpace: 'pre-line',
        ...style,
      }}
    >
      R E S U L T
      <br />
      {resultText}
    </div>
  );
};

export default ShowdownResult;
