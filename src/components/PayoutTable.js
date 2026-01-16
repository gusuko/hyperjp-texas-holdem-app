// src/components/PayoutTable.jsx
import React from 'react';
import { POS } from '../constants/layoutConfig';

export default function PayoutTable({ uiKey, title, data, inBoard = false }) {
  const rows = Object.entries(data);

  // ✅ 盤面内で使うときだけ POS から座標を取る
  const pos = inBoard && uiKey ? POS.ui?.[uiKey] : null;

  return (
    <table
      className="payout-board"
      style={
        inBoard && pos
          ? { position: 'absolute', top: pos.top, left: pos.left }
          : undefined
      }
    >
      <thead>
        <tr>
          <th colSpan={2}>{title}</th>
        </tr>
      </thead>
      <tbody>
        {rows.map(([hand, val]) => (
          <tr key={hand}>
            <td className="hand">{hand}</td>
            <td className="val">
              {typeof val === 'number' ? `${val}:1` : val}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
