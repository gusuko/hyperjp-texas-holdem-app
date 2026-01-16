import React, { useState } from 'react';
import ShowdownResult from './ShowdownResult';
import HistoryList from './HistoryList';

export default function ResultPanel({
  showdown,
  folded,
  resultText,
  history,
  onPlayAgain,
}) {
  /* 🔀 タブ状態：'result' | 'history' */
  const [tab, setTab] = useState('result');

  /* ショーダウンになった瞬間 Result タブを前面にする */
  React.useEffect(() => {
    if (showdown) setTab('result');
  }, [showdown]);

  return (
    <div className="result-panel">
      {/* --- タブヘッダー --- */}
      <div className="tab-header">
        <button
          className={tab === 'result' ? 'active' : ''}
          onClick={() => setTab('result')}
        >
          RESULT
        </button>
        <button
          className={tab === 'history' ? 'active' : ''}
          onClick={() => setTab('history')}
        >
          HISTORY
        </button>
      </div>

      {/* --- タブ中身 --- */}
      {tab === 'result' ? (
        <ShowdownResult
          showdown={showdown}
          folded={folded}
          resultText={resultText}
          onPlayAgain={onPlayAgain} /* ← 既存 PLAY AGAIN ハンドラ */
        />
      ) : (
        <HistoryList history={history} />
      )}
    </div>
  );
}
