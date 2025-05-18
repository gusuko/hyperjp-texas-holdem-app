// src/utils/ChipHelpers.js
export const CHIP_VALUES = [10000, 5000, 1000, 500, 100, 25, 5];

/** 金額 → [{ value, src }] の配列へ変換 */
export function convertToChips(amount) {
  const chips = [];
  let rest = amount;

  for (const value of CHIP_VALUES) {
    while (rest >= value) {
      chips.push({
        value,
        src: process.env.PUBLIC_URL + `/chips/chip_${value}.png`,
      });
      rest -= value;
    }
  }
  return chips;
}

/** 指定エリアの合計チップ額を計算 */
export function getTotalBet(placedChips, area) {
  return (placedChips[area] ?? []).reduce((sum, chip) => sum + chip.value, 0);
}
