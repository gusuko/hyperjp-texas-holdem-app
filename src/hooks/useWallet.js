import { useState, useEffect, useCallback } from 'react';
import { initWallet, getChips, addChips } from '../data/handHistoryRepo';

export default function useWallet() {
  const [chips, setLocal] = useState(0);

  const refresh = useCallback(() => getChips().then(setLocal), []);

  useEffect(() => {
    initWallet().then(refresh);
  }, [refresh]);

  const credit = useCallback((n) => addChips(n).then(refresh), [refresh]);
  const debit = useCallback((n) => addChips(-n).then(refresh), [refresh]);

  return { chips, credit, debit };
}
