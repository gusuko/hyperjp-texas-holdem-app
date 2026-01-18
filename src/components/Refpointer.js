import React from 'react';
import HandPointer from './HandPointer';

/**
 * RefPointer
 * - targetRef の DOM 位置(getBoundingClientRect)から「画面(viewport)上の中心座標(px)」を取得
 * - HandPointer は viewport 座標(px)前提なので、座標変換はしない
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
      const el = targetRef.current;
      if (!el) return;

      const er = el.getBoundingClientRect();

      // ★ viewport 座標(px)の中心
      const cx = er.left + er.width / 2;
      const cy = er.top + er.height / 2;

      setXy({ x: cx, y: cy });
    };

    calc();

    const onResize = () => calc();
    const onScroll = () => calc();

    window.addEventListener('resize', onResize);
    window.addEventListener('scroll', onScroll, { passive: true });

    // 変化を拾いやすくするための ResizeObserver
    let ro = null;
    if (window.ResizeObserver) {
      ro = new ResizeObserver(() => calc());
      ro.observe(document.documentElement);
      ro.observe(targetRef.current);
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
