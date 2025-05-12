import React from 'react';
import Draggable from 'react-draggable';

/**
 * ControlsLayer — テーブル中央(0,0) 基準で UI コンポーネントを絶対配置する共通ラッパー。
 *
 * `pos` : { top:number, left:number }  …… positionConfig と同じ差分(px)
 * `children` : 配置したいボタン / パネル
 *
 * 開発モード（process.env.NODE_ENV!=='production'）では Draggable が有効になり、
 * ドラッグ時に console.log で現在座標が表示されるのでレイアウト調整が容易。
 */
export default function ControlsLayer({ pos, children }) {
  const isDev = process.env.NODE_ENV !== 'production';

  const style = {
    position: 'absolute',
    top: `calc(${pos.top}px * var(--table-scale))`,
    left: `calc(${pos.left}px * var(--table-scale))`,
    transform: 'translate(-50%, -50%)', // 中央基準
    zIndex: 20,
  };

  if (isDev) {
    return (
      <Draggable
        defaultPosition={{ x: pos.left, y: pos.top }}
        onStop={(_, data) => {
          // 座標をコンソールに出力して positionConfig へコピペ
          console.info(`Drag result → { top: ${data.y}, left: ${data.x} }`);
        }}
      >
        <div style={style}>{children}</div>
      </Draggable>
    );
  }

  return <div style={style}>{children}</div>;
}
