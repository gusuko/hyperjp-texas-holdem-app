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
    <pre
      style={{
        fontFamily: '"Fira Code", monospace', // 等幅フォント
        fontSize: '1.5em',
        fontWeight: 'bold',
        whiteSpace: 'pre', // 改行・空白を保持
        textAlign: 'left',
        ...style,
      }}
    >
      {resultText}
    </pre>
  );
};

export default ShowdownResult;
