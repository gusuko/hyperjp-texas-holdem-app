import React from 'react';
import HandPointer from './HandPointer';

/**
 * RefPointer
 * - DOM 要素の ref から中心座標を取得し、ボード座標(1800x1100)に変換して HandPointer へ渡すラッパ
 * - HandPointer 本体は一切いじらない（x,y のまま）
 */
export default function RefPointer({
  targetRef,
  corner = 'NE',
  radius = 35,
  offset = 30,
  tipInset = 2,
  durationMs = 1600,
  color = '#00eaff',
  stroke = 6,
  arrowLength,
}) {
  const [xy, setXy] = React.useState(null);

  React.useLayoutEffect(() => {
    if (!targetRef || !targetRef.current) return;

    const calc = () => {
      const board = document.querySelector('.game-board');
      const el = targetRef.current;
      if (!board || !el) return;

      const br = board.getBoundingClientRect();
      const er = el.getBoundingClientRect();

      // 画面上の中心(px)
      const cx = er.left + er.width / 2;
      const cy = er.top + er.height / 2;

      // px → ボード座標(0..1800, 0..1100)へ変換
      const x = ((cx - br.left) / br.width) * 1800;
      const y = ((cy - br.top) / br.height) * 1100;

      setXy({ x, y });
    };

    calc();

    const onResize = () => calc();
    const onScroll = () => calc();

    window.addEventListener('resize', onResize);
    window.addEventListener('scroll', onScroll, { passive: true });

    // 変化を拾いやすくするための ResizeObserver（対応ブラウザなら動作）
    let ro = null;
    if (window.ResizeObserver) {
      ro = new ResizeObserver(() => calc());
      ro.observe(document.documentElement);
      ro.observe(targetRef.current);
      const board = document.querySelector('.game-board');
      if (board) ro.observe(board);
    }

    return () => {
      window.removeEventListener('resize', onResize);
      window.removeEventListener('scroll', onScroll);
      if (ro) ro.disconnect();
    };
  }, [targetRef]);

  if (!xy) return null;

  return (
    <HandPointer
      x={xy.x}
      y={xy.y}
      corner={corner}
      radius={radius}
      offset={offset}
      tipInset={tipInset}
      durationMs={durationMs}
      color={color}
      stroke={stroke}
      arrowLength={arrowLength}
    />
  );
}
