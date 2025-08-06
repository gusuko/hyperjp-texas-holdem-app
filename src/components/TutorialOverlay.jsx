// src/components/TutorialOverlay.jsx
import React from 'react';

/**
 * props
 * ─ stage      : 1 | 2  … 1=ANTE, 2=BONUS
 * ─ canClose   : boolean
 * ─ onClose    : () => void
 */
export default function TutorialOverlay({ stage, canClose, onClose }) {
  // ステージ別メッセージ（あとで文言だけ変えたい時はここだけ触る）
  const messages = {
    1: (
      <>
        まずは <strong>$25</strong> チップを <strong>ANTE</strong>{' '}
        に置いてみてください
      </>
    ),
    2: (
      <>
        つぎに <strong>$25</strong> チップを <strong>BONUS</strong>{' '}
        に置いてみてください
      </>
    ),
    3: (
      <>
        さいごに <strong>$25</strong> チップを <strong>JACKPOT</strong>{' '}
        に置いてみてください
      </>
    ),
  };

  return (
    <div style={styles.backdrop}>
      <div style={styles.card}>
        <h2 style={{ marginTop: 0 }}>Welcome!</h2>
        <p>{messages[stage]}</p>

        <button
          style={{
            ...styles.btn,
            opacity: canClose ? 1 : 0.4,
            cursor: canClose ? 'pointer' : 'not-allowed',
          }}
          disabled={!canClose}
          onClick={onClose}
        >
          OK
        </button>
      </div>
    </div>
  );
}

const styles = {
  backdrop: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.6)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2000,
    pointerEvents: 'none',
  },
  card: {
    background: '#fff',
    padding: '2rem 3rem',
    borderRadius: 12,
    textAlign: 'center',
    maxWidth: 320,
    boxShadow: '0 8px 20px rgba(0,0,0,0.25)',
    pointerEvents: 'auto',
  },
  btn: {
    marginTop: '1.5rem',
    padding: '0.5rem 1.2rem',
    fontSize: '1rem',
    border: 'none',
    borderRadius: 8,
  },
};
