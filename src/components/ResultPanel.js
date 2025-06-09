import React, { useState } from 'react';
import ShowdownResult from './ShowdownResult';
import HistoryList from './HistoryList';
import StatsPanel from './StatsPanel';
import { POS } from '../constants/layoutConfig'; // 位置指定

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
    <div
      className="result-panel"
      style={{ position: 'absolute', ...POS.ui.resultText }}
    >
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
