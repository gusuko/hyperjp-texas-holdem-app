// components/RenderCard.js
import React from 'react';

/**
 * カードを指定の位置に表示するコンポーネント
 * @param {string} card - 表示すカードのID ("9H" など)
 * @param {object} pos - 位置情報 {top, left, scale}
 * @param {boolean} faceDown - trueなら裏向き
 * @param {string} keyProp - React key (コンポーネント内で使用)
 * @param {function} onLoad - 画像が描画されたときのコールバック（追加！）
 */
const RenderCard = ({ card, pos, faceDown = false, keyProp, onLoad }) => {
  return (
    <div
      key={keyProp}
      className="card-abs"
      style={{
        left: pos.left, // ← 数値だけ渡せば px になる
        top: pos.top,
        width: 100, // DIM.CARD_W と同じ
        height: 140, // DIM.CARD_H と同じ
        position: 'absolute',
      }}
    >
      <img
        src={process.env.PUBLIC_URL + `/cards/${faceDown ? 'back' : card}.png`}
        alt={card}
        style={{ width: '100%', height: '100%' }}
        onLoad={onLoad}
      />
    </div>
  );
};

export default RenderCard;
