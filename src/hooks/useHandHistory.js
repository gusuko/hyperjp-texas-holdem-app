// src/hooks/useHandHistory.js
import { useState, useEffect, useCallback } from 'react';
import { saveHand, getAllHands, clearHistory } from '../data/handHistoryRepo';

/** 履歴を簡単に扱うカスタムフック */
export default function useHandHistory() {
  const [history, setHistory] = useState([]);

  // 履歴をリロード
  const refresh = useCallback(async () => {
    const all = await getAllHands();
    setHistory(all);
  }, []);

  // ハンドを追加
  const addHand = useCallback(
    async (hand) => {
      await saveHand(hand);
      refresh();
    },
    [refresh]
  );

  // 全クリア
  const wipe = useCallback(async () => {
    await clearHistory();
    refresh();
  }, [refresh]);

  // 初回ロード
  useEffect(() => {
    refresh();
  }, [refresh]);

  return { history, addHand, wipe };
}
