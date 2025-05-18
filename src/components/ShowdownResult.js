// src/components/ShowdownResult.jsx
export default function ShowdownResult({ showdown, resultText, style = {} }) {
  if (!showdown) return null;

  /* ここで安全に分割代入 ─ 初期は空オブジェクトを想定 */
  const {
    hands = [],
    winnerText = '',
    payoutRows = [],
    total = '',
  } = resultText ?? {};

  /* データがまだ無い（ゲーム開始前）は描画しない */
  if (!payoutRows.length) return null;

  return (
    <div
      className="result-box"
      style={{
        fontFamily: '"Inter", sans-serif',
        fontSize: '1.25rem' /* ← 好きな大きさに */,
        lineHeight: 1.4,
        whiteSpace: 'pre-wrap',
        ...style /* 位置は App.js から受け取る */,
      }}
    >
      {/* ─ 役表示 ─ */}
      {hands.map((ln, i) => (
        <div key={i}>{ln}</div>
      ))}
      <strong>{winnerText}</strong>

      {/* ─ 払い戻し表 ─ */}
      <table className="payout">
        <thead>
          <tr>
            <th colSpan={2}>💰 払い戻し詳細</th>
          </tr>
        </thead>
        <tbody>
          {payoutRows.map(({ label, value }) => (
            <tr key={label}>
              <td className="cell-label">{label}</td>
              <td className="val">{value}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <td>
              <strong>TOTAL RETURN</strong>
            </td>
            <td className="val">{total}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
