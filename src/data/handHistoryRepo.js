// src/data/handHistoryRepo.js
// -------------------------------------------------------------
// Dexie セットアップ
import Dexie from 'dexie';

const db = new Dexie('UthHandHistory');

/**
 * ▼ スキーマ履歴
 * v3 ... hands / wallet（chips, welcomeClaimed）
 * v4 ... wallet に tutorialCompleted 追加（今回）
 */
db.version(3).stores({
  hands: '++id, createdAt',
  wallet: 'id, chips, welcomeClaimed',
});

db.version(4)
  .stores({
    hands: '++id, createdAt',
    wallet: 'id, chips, welcomeClaimed, tutorialCompleted',
  })
  .upgrade((tx) =>
    tx
      .table('wallet')
      .toCollection()
      .modify((row) => {
        if (row.tutorialCompleted === undefined) {
          row.tutorialCompleted = false; // 既存レコードを初期化
        }
      })
  );

/* ========== Hand History helpers ========== */

/**
 * hand オブジェクトを保存（500件ローテ）
 */
export async function saveHand(hand) {
  await db.hands.add({ ...hand, createdAt: Date.now() });

  const total = await db.hands.count();
  if (total > 500) {
    const remove = await db.hands
      .orderBy('createdAt')
      .limit(total - 500)
      .toArray();
    await db.hands.bulkDelete(remove.map((h) => h.id));
  }
}

/** 新しい順に全履歴取得 */
export function getAllHands() {
  return db.hands.orderBy('createdAt').reverse().toArray();
}

/** 履歴をすべて削除 */
export function clearHistory() {
  return db.hands.clear();
}

/* ========== Wallet helpers ========== */

/**
 * 初回起動時に wallet レコードを生成
 */
export async function initWallet() {
  const count = await db.wallet.count();
  if (count === 0) {
    await db.wallet.add({
      id: 1,
      chips: 0,
      welcomeClaimed: false,
      tutorialCompleted: false,
    });
  }
}

/** wallet まるごと取得 */
export const getWallet = () => db.wallet.get(1);

/**
 * 部分更新。渡されたフィールドだけ上書き
 * （tutorialCompleted を上書きし忘れないよう current とマージ）
 */
export const setWallet = async (partial) => {
  const current = (await db.wallet.get(1)) || {};
  await db.wallet.put({ id: 1, ...current, ...partial });
};

export default db;
