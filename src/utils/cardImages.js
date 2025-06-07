// src/utils/cardImages.js
/**
 * <Rank><Suit> 形式のカード ID を
 * /public/minicards/ への絶対パスに変換
 *   例: "AD" → "<PUBLIC_URL>/minicards/AD.png"
 */
export const miniCardSrc = (id) =>
  `${process.env.PUBLIC_URL}/minicards/${id}.png`;
