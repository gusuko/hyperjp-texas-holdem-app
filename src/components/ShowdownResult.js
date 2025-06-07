// src/components/ShowdownResult.jsx
import { miniCardSrc } from '../utils/cardImages';

const renderMini = (ids) =>
  ids.map((id) => (
    <img key={id} src={miniCardSrc(id)} className="mini" alt={id} />
  ));

export default function ShowdownResult({
  showdown,
  folded,
  resultText,
  style = {},
}) {
  /* --------- フォールド時だけ早期リターン --------- */
  if (folded) {
    return (
      <div
        className="result-box"
        style={{
          fontFamily: '"Inter", sans-serif',
          fontSize: '1.4rem',
          color: 'crimson',
          fontWeight: 'bold',
          ...style,
        }}
      >
        FOLD...！AnteとBonusは没収されます。
      </div>
    );
  }
  if (!showdown) return null;

  /* --------- 受け取るデータ --------- */
  const {
    winnerText = '',
    payoutRows = [],
    total = '',
    playerBest = [], // ["9H","KD",…] 5枚
    dealerBest = [], // ["QS","QC",…] 5枚
    playerRank = '',
    dealerRank = '',
  } = resultText ?? {};

  if (!payoutRows.length) return null; // データ無ければ描画しない

  /* --------- 描画 --------- */
  return (
    <div
      className="result-box"
      style={{
        fontFamily: '"Inter", sans-serif',
        fontSize: '1.25rem',
        lineHeight: 1.4,
        whiteSpace: 'pre-wrap',
        ...style,
      }}
    >
      {/* あなた / ディーラーの 5 枚をミニカードで表示 */}
      <div style={{ marginBottom: '0.3em' }}>
        あなた : {renderMini(playerBest)}
      </div>
      <div style={{ marginBottom: '0.1em', fontWeight: '600' }}>
        役 : {playerRank}
      </div>
      <div style={{ marginBottom: '0.5em' }}>
        ディーラー : {renderMini(dealerBest)}
      </div>
      <div style={{ marginBottom: '0.3em', fontWeight: '600' }}>
        役 : {dealerRank}
      </div>

      {/* 勝敗テキスト */}
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
