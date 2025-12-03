import React from 'react';
import { POS } from '../constants/layoutConfig';

function GameControls({
  gamePhase,
  wallet,
  handleGameStart,
  handleFold,
  handleCheckTurn,
  handleCheckRiver,
  handlePlayAgain,
  handleTopUp,
}) {
  return (
    <>
      {/* 常時表示されるトップアップボタン（初回はWELCOME表示） */}
      <button
        className="recharge-btn"
        onClick={handleTopUp}
        style={{ position: 'absolute', ...POS.ui.recharge }}
      >
        {!wallet.welcomeClaimed && wallet.chips === 0
          ? 'WELCOME\n＋$1,000'
          : '＋$1,000'}
      </button>

      {/* STARTボタン（初期フェーズ） */}
      {gamePhase === 'initial' && (
        <button
          className="btn-start"
          onClick={handleGameStart}
          style={{ position: 'absolute', ...POS.ui.start }}
        >
          🎮 <br />S T A R T
        </button>
      )}

      {/* FOLDボタン（プリフロップ） */}
      {gamePhase === 'preflop' && (
        <button className="fold-btn" onClick={handleFold} style={POS.ui.fold}>
          FOLD
        </button>
      )}

      {/* CHECKボタン（フロップ or ターン） */}
      {(gamePhase === 'flop' || gamePhase === 'turn') && (
        <button
          className="check-btn"
          onClick={() => {
            if (gamePhase === 'flop') {
              handleCheckTurn();
            } else if (gamePhase === 'turn') {
              handleCheckRiver();
            }
          }}
          style={POS.ui.check}
        >
          チェック
        </button>
      )}

      {/* PLAY AGAINボタン（ショーダウン時） */}
      {gamePhase === 'showdown' && (
        <button
          className="playagain-btn"
          onClick={handlePlayAgain}
          style={POS.ui.fold}
        >
          PLAY&nbsp;AGAIN
        </button>
      )}
    </>
  );
}

export default GameControls;
