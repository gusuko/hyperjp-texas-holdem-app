// ModeSelector.js（とりあえず新規）
export default function ModeSelector({ mode, dispatch }) {
  const set = (m) => () => dispatch({ type: 'SET_MODE', payload: m });

  return (
    <div style={{ padding: '.5rem' }}>
      {['normal', 'tutorial', 'sim'].map((m) => (
        <button
          key={m}
          onClick={set(m)}
          style={{
            marginRight: 8,
            fontWeight: mode === m ? 'bold' : 'normal',
          }}
        >
          {m}
        </button>
      ))}
    </div>
  );
}
