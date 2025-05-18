// src/components/PayoutTable.jsx
import React from 'react';
import { TABLE_SCALE, POS } from '../constants/layoutConfig';

export default function PayoutTable({ uiKey, title, data }) {
  const { top, left } = POS.ui[uiKey]; // bonusTable / jackpotTable
  const rows = Object.entries(data); // [["Royal Flush",500], …]

  return (
    <table
      className="payout-board"
      style={{
        position: 'absolute',
        top: `calc(50vh + ${top * TABLE_SCALE}px)`,
        left: `calc(50%  + ${left * TABLE_SCALE}px)`,
        transform: `scale(${TABLE_SCALE})`,
      }}
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
