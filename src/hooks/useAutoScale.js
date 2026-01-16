// src/hooks/useAutoScale.js
import { useLayoutEffect } from 'react';
import { BOARD_W, BOARD_H } from '../constants/layoutConfig';

export default function useAutoScale() {
  useLayoutEffect(() => {
    const upd = () => {
      const s = Math.min(
        window.innerWidth / BOARD_W,
        window.innerHeight / BOARD_H,
        1
      );
      document.documentElement.style.setProperty('--game-scale', s);
      document.documentElement.classList.remove('too-small');
    };

    upd();
    window.addEventListener('resize', upd);
    return () => window.removeEventListener('resize', upd);
  }, []);
}
