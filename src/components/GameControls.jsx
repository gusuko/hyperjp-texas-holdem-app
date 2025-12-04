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
  // ★ 追加: 親から受け取った各ボタンのref
  welcomeBtnRef,
  foldRef,
  checkBtnRef,
  playAgainBtnRef,
}) {
  return (
    <>
      {/* トップアップボタン（初回はWELCOME表示） */}
      <button
        ref={welcomeBtnRef}
        className="recharge-btn"
        onClick={handleTopUp}
        style={{ position: 'absolute', ...POS.ui.recharge }}
        // 必要に応じて: showTutorial中は無効化する場合
        // disabled={gamePhase === 'tutorial'} 等、適宜条件を追加可能
      >
        {!wallet.welcomeClaimed && wallet.chips === 0
          ? 'WELCOME\n＋$1,000'
          : '＋$1,000'}
      </button>

      {/* STARTボタン（ゲーム開始前のみ表示） */}
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
        <button
          ref={foldRef}
          className="fold-btn"
          onClick={handleFold}
          style={POS.ui.fold}
        >
          FOLD
        </button>
      )}

      {/* CHECKボタン（フロップまたはターン） */}
      {(gamePhase === 'flop' || gamePhase === 'turn') && (
        <button
          ref={checkBtnRef}
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
          ref={playAgainBtnRef}
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
