// src/data/handHistoryRepo.js
// ---------------------------
// ❶ Dexie を読み込み
import Dexie from 'dexie';

// ❷ データベースを作成（名前は自由だがわかりやすく）
const db = new Dexie('UthHandHistory');

// ❸ スキーマ定義：hands テーブルに
//    - 自動採番 id (`++id`)
//    - ソート用 createdAt
db.version(3).stores({
  hands: '++id, createdAt',
  wallet: 'id, chips, welcomeClaimed',
});
/**
 * hand : {
 *   playerCards: ['Ah', 'Kd'],
 *   dealerCards: ['Qh', 'Jh'],
 *   community: ['...', '...'],
 *   resultText: 'You win!',
 *   payout: 150,
 *   // …必要なら追加フィールド
 * }
 */
export async function saveHand(hand) {
  // ❶ save
  await db.hands.add({ ...hand, createdAt: Date.now() });

  // ❷ 500 件を超えていたら古い順に削除
  const total = await db.hands.count();
  if (total > 500) {
    const remove = await db.hands
      .orderBy('createdAt')
      .limit(total - 500)
      .toArray();
    await db.hands.bulkDelete(remove.map((h) => h.id));
  }
}

/** 新しい順で全件取得 */
export function getAllHands() {
  return db.hands.orderBy('createdAt').reverse().toArray();
}

/** （あとで使うかもしれないので）全部消す */
export function clearHistory() {
  return db.hands.clear();
}
/* --- wallet helpers ------------------------------------------------- */

export async function initWallet() {
  const count = await db.wallet.count();
  if (count === 0)
    await db.wallet.add({ id: 1, chips: 0, welcomeClaimed: false });
}
export const getWallet = () => db.wallet.get(1); // まとめて取得
export const setWallet = (data) => db.wallet.put({ id: 1, ...data });

// ❹ 当面は DB インスタンスだけ export
export default db;
