// src/hooks/useWallet.js
import { useState, useEffect, useCallback } from 'react';
import { initWallet, getWallet, setWallet } from '../data/handHistoryRepo';

export default function useWallet() {
  const [wallet, setLocal] = useState({ chips: 0, welcomeClaimed: false });

  /* ❶ refresh は 1 回だけ定義 */
  const refresh = useCallback(() => getWallet().then(setLocal), []);

  /* ❷ 初回ロード */
  useEffect(() => {
    initWallet().then(refresh);
  }, [refresh]);

  /* ❸ credit / debit */
  const credit = useCallback(
    (n) => setWallet({ ...wallet, chips: wallet.chips + n }).then(refresh),
    [wallet, refresh]
  );

  const debit = useCallback(
    (n) => setWallet({ ...wallet, chips: wallet.chips - n }).then(refresh),
    [wallet, refresh]
  );

  return { wallet, credit, debit, refresh }; // wallet.chips, wallet.welcomeClaimed
}
