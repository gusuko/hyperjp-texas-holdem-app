// components/RenderCard.js
import React from 'react';
import { TABLE_SCALE } from '../constants/layoutConfig';

/**
 * カードを指定の位置に表示するコンポーネント
 * @param {string} card - 表示すカードのID ("9H" など)
 * @param {object} pos - 位置情報 {top, left, scale}
 * @param {boolean} faceDown - trueなら裏向き
 * @param {string} keyProp - React key (コンポーネント内で使用)
 */
const RenderCard = ({ card, pos, faceDown = false, keyProp }) => {
  return (
    <div
      key={keyProp}
      className="card-abs"
      style={{
        left: `calc(50% + ${pos.left * TABLE_SCALE}px)`,
        top: `calc(50vh + ${pos.top * TABLE_SCALE}px)`,
        width: 100 * TABLE_SCALE,
        height: 140 * TABLE_SCALE,
      }}
    >
      <img
        src={process.env.PUBLIC_URL + `/cards/${faceDown ? 'back' : card}.png`}
        alt={card}
        style={{ width: '100%', height: '100%' }}
      />
    </div>
  );
};

export default RenderCard;
