import React, { useState, useEffect } from 'react';
import CardSlot from './CardSlot';
import CardGroup from './CardGroup';
import BetCircle from './BetCircle';
import ChipSelector from './ChipSelector';
import PayoutTable from './PayoutTable';
import ResultPanel from './ResultPanel';
import StatsPanel from './StatsPanel';
import HandPointer from './HandPointer';
import RefPointer from './RefPointer';
import CurrentChips from './CurrentChips'; // ★ Import the CurrentChips component
import { POS } from '../constants/layoutConfig';
import { getTotalBet } from '../utils/chipHelpers';
import { bonusPayouts, jackpotPayouts } from '../constants/payouts';

function GameBoard(props) {
  const {
    boardRef,
    walletChips,
    welcomeClaimed,
    dealerCards,
    boardCards,
    playerCards,
    showdown,
    placedChips,
    gamePhase,
    selectedArea,
    setSelectedArea,
    credit,
    debit,
    dispatch,
    onFlopClick,
    onTurnClick,
    onRiverClick,
    onTopUp, // イベントハンドラ（GameControls側でも使用）
    onGameStart, // （同上）
    onFold, // （同上）
    onPlayAgain, // （同上）
    onCheck, // （同上）
    showPlaceYourBets,
    history,
    resultText,
    folded,
    // チュートリアル関連のprops:
    showTutorial,
    tutorialStage,
    tutorialHidden,
    // 各種カードロードのコールバック:
    dealerCardLoadCallback,
    boardCardLoadCallback,
    playerCardLoadCallback,
    // ★ flop円＆各ボタン要素へのref（親から受け取る）
    flopRef,
    foldRef,
    checkBtnRef,
    playAgainBtnRef,
    welcomeBtnRef,
  } = props;

  // チュートリアル用の矢印点滅インデックス
  const [nudgeIndex5, setNudgeIndex5] = useState(0);
  const [nudgeIndex6, setNudgeIndex6] = useState(0);
  const [nudgeIndex7, setNudgeIndex7] = useState(0);

  // チュートリアルStage5 (FLOP/FOLD) 矢印トグル
  useEffect(() => {
    const showStage5 =
      showTutorial &&
      tutorialStage === 5 &&
      gamePhase === 'preflop' &&
      !tutorialHidden;
    if (!showStage5) return;
    const id = setInterval(() => setNudgeIndex5((i) => (i ? 0 : 1)), 1000);
    return () => clearInterval(id);
  }, [showTutorial, tutorialStage, gamePhase, tutorialHidden]);

  // チュートリアルStage6 (TURN/CHECK) 矢印トグル
  useEffect(() => {
    const showStage6 =
      showTutorial &&
      tutorialStage === 6 &&
      gamePhase === 'flop' &&
      !tutorialHidden;
    if (!showStage6) return;
    const id = setInterval(() => setNudgeIndex6((i) => (i ? 0 : 1)), 1000);
    return () => clearInterval(id);
  }, [showTutorial, tutorialStage, gamePhase, tutorialHidden]);

  // チュートリアルStage7 (RIVER/CHECK) 矢印トグル
  useEffect(() => {
    const showStage7 =
      showTutorial &&
      tutorialStage === 7 &&
      gamePhase === 'turn' &&
      !tutorialHidden;
    if (!showStage7) return;
    let flag = 0;
    const id = setInterval(() => {
      flag = flag ? 0 : 1;
      setNudgeIndex7(flag);
    }, 900);
    return () => {
      clearInterval(id);
      setNudgeIndex7(0);
    };
  }, [showTutorial, tutorialStage, gamePhase, tutorialHidden]);

  // 各種座標ポイント計算（省略）
  const anteCenter = { x: POS.bet.ante.left + 35, y: POS.bet.ante.top + 35 };
  const bonusCenter = { x: POS.bet.bonus.left + 35, y: POS.bet.bonus.top + 35 };
  const jackpotCenter = {
    x: POS.bet.jackpot.left + 35,
    y: POS.bet.jackpot.top + 35,
  };
  const chip5Center = {
    x: POS.ui.selector.left + 35,
    y: POS.ui.selector.top + 35,
  };
  const chip25Center = {
    x: POS.ui.selector.left + 70 + 8 + 35,
    y: POS.ui.selector.top + 35,
  };
  const flopCenter = { x: POS.bet.flop.left + 35, y: POS.bet.flop.top + 35 };
  const turnCenter = { x: POS.bet.turn.left + 35, y: POS.bet.turn.top + 35 };
  const riverCenter = { x: POS.bet.river.left + 35, y: POS.bet.river.top + 35 };

  return (
    <div ref={boardRef} className="game-board">
      <h1 className="title-in-board">
        🃏 Ultimate Texas Hold'em Poker Simulator
      </h1>

      {/* 現在のチップ残高表示 */}
      <CurrentChips
        chips={walletChips}
        style={{ position: 'absolute', ...POS.ui.chips }}
      />

      {/* カードスロット配置 */}
      {POS.cardSlot.dealer.map((pos, i) => (
        <CardSlot key={`slot-d${i}`} style={pos} />
      ))}
      {POS.cardSlot.player.map((pos, i) => (
        <CardSlot key={`slot-p${i}`} style={pos} />
      ))}
      {POS.cardSlot.community.map((pos, i) => (
        <CardSlot key={`slot-c${i}`} style={pos} />
      ))}

      {/* 各カード描画 */}
      <CardGroup
        onCardLoad={dealerCardLoadCallback}
        cards={dealerCards}
        positions={POS.cardSlot.dealer}
        facedown={!showdown}
      />
      <CardGroup
        onCardLoad={boardCardLoadCallback}
        cards={boardCards}
        positions={POS.cardSlot.community}
      />
      <CardGroup
        onCardLoad={playerCardLoadCallback}
        cards={playerCards}
        positions={POS.cardSlot.player}
      />

      {/* 初期ベット円 (Ante, Bonus, Jackpot) */}
      <BetCircle
        area="ante"
        total={getTotalBet(placedChips, 'ante')}
        chips={placedChips.ante}
        isActive={gamePhase === 'initial'}
        isSelected={selectedArea === 'ante'}
        onClick={() => setSelectedArea('ante')}
        style={POS.bet.ante}
        tutorialActive={showTutorial && tutorialStage === 1}
        isDisabled={walletChips === 0 ? true : false}
      />
      <BetCircle
        area="bonus"
        total={getTotalBet(placedChips, 'bonus')}
        chips={placedChips.bonus}
        isActive={gamePhase === 'initial'}
        isSelected={selectedArea === 'bonus'}
        onClick={() => setSelectedArea('bonus')}
        style={POS.bet.bonus}
        tutorialActive={showTutorial && tutorialStage === 2}
        isDisabled={walletChips === 0 || (showTutorial && tutorialStage !== 2)}
      />
      <BetCircle
        area="jackpot"
        total={getTotalBet(placedChips, 'jackpot')}
        chips={placedChips.jackpot}
        isActive={gamePhase === 'initial'}
        isSelected={selectedArea === 'jackpot'}
        onClick={() => setSelectedArea('jackpot')}
        style={POS.bet.jackpot}
        tutorialActive={showTutorial && tutorialStage === 3}
        isDisabled={walletChips === 0 || (showTutorial && tutorialStage !== 3)}
      />

      {/* インゲームベット円 (Flop, Turn, River) */}
      <div ref={flopRef}>
        <BetCircle
          area="flop"
          total={getTotalBet(placedChips, 'flop')}
          chips={placedChips.flop}
          isActive={gamePhase === 'preflop'}
          isSelected={false}
          onClick={onFlopClick}
          style={POS.bet.flop}
          isDisabled={
            walletChips === 0 || (showTutorial && tutorialStage !== 5)
          }
        />
      </div>
      <BetCircle
        area="turn"
        total={getTotalBet(placedChips, 'turn')}
        chips={placedChips.turn}
        isActive={gamePhase === 'flop'}
        isSelected={false}
        onClick={onTurnClick}
        style={POS.bet.turn}
        isDisabled={walletChips === 0 || (showTutorial && tutorialStage !== 6)}
      />
      <BetCircle
        area="river"
        total={getTotalBet(placedChips, 'river')}
        chips={placedChips.river}
        isActive={gamePhase === 'turn'}
        isSelected={false}
        onClick={onRiverClick}
        style={POS.bet.river}
        isDisabled={walletChips === 0 || (showTutorial && tutorialStage !== 7)}
      />

      {/* チュートリアル用ハンドポインタ (賭けチップ誘導 Stage1-3) */}
      {showTutorial && tutorialStage === 1 && (
        <>
          {!selectedArea && <HandPointer x={anteCenter.x} y={anteCenter.y} />}
          {selectedArea === 'ante' &&
            getTotalBet(placedChips, 'ante') === 0 && (
              <HandPointer x={chip25Center.x} y={chip25Center.y} />
            )}
        </>
      )}
      {showTutorial && tutorialStage === 2 && (
        <>
          {!selectedArea && <HandPointer x={bonusCenter.x} y={bonusCenter.y} />}
          {selectedArea === 'bonus' &&
            getTotalBet(placedChips, 'bonus') === 0 && (
              <HandPointer x={chip25Center.x} y={chip25Center.y} />
            )}
        </>
      )}
      {showTutorial && tutorialStage === 3 && (
        <>
          {!selectedArea && (
            <HandPointer x={jackpotCenter.x} y={jackpotCenter.y} />
          )}
          {selectedArea === 'jackpot' &&
            getTotalBet(placedChips, 'jackpot') === 0 && (
              <HandPointer x={chip5Center.x} y={chip5Center.y} />
            )}
        </>
      )}

      {/* チップ選択パネル */}
      <div className="chip-selector-panel" style={POS.ui.selector}>
        <ChipSelector
          chips={walletChips}
          dispatch={dispatch}
          placedChips={placedChips}
          gamePhase={gamePhase}
          onFlopClick={onFlopClick}
          onTurnClick={onTurnClick}
          onRiverClick={onRiverClick}
          isFlopActive={gamePhase === 'preflop'}
          isTurnActive={gamePhase === 'flop'}
          isRiverActive={gamePhase === 'turn'}
          selectedArea={selectedArea}
          setSelectedArea={setSelectedArea}
          credit={credit}
          debit={debit}
          tutorialActive={showTutorial}
          tutorialStage={tutorialStage}
        />
      </div>

      {/* ★GameBoardではボタンUIを描画しない（GameControlsに任せる） */}

      {/* ボーナス/ジャックポットの配当表 */}
      <PayoutTable uiKey="bonusTable" title="B O N U S" data={bonusPayouts} />
      <PayoutTable
        uiKey="jackpotTable"
        title="J A C K P O T"
        data={jackpotPayouts}
      />

      {/* 結果表示パネル */}
      <ResultPanel
        showdown={showdown}
        folded={folded}
        resultText={resultText}
        history={history}
        onPlayAgain={onPlayAgain}
      />

      {/* ★フォールド/チェック/プレイアゲインのボタンは削除済 */}

      {/* "Place Your Bets"オーバーレイ */}
      {showPlaceYourBets && (
        <div className="place-bets-overlay">PLACE YOUR BETS Please!</div>
      )}

      {/* チュートリアル用ポインタオーバーレイ (Stage5: FLOP⇄FOLD) */}
      {showTutorial &&
        tutorialStage === 5 &&
        gamePhase === 'preflop' &&
        !tutorialHidden && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              pointerEvents: 'none',
              zIndex: 2600,
            }}
          >
            {/* FLOP円への指差し */}
            <div style={{ opacity: nudgeIndex5 === 0 ? 1 : 0.35 }}>
              <HandPointer
                x={flopCenter.x}
                y={flopCenter.y}
                corner="NE"
                durationMs={1200}
              />
            </div>
            {/* 外部のFOLDボタンへの指差し (GameControls内のボタン) */}
            <div style={{ opacity: nudgeIndex5 === 1 ? 1 : 0.35 }}>
              <RefPointer targetRef={foldRef} corner="NE" durationMs={1200} />
            </div>
          </div>
        )}

      {/* チュートリアル用ポインタオーバーレイ (Stage6: TURN⇄CHECK) */}
      {showTutorial &&
        tutorialStage === 6 &&
        gamePhase === 'flop' &&
        !tutorialHidden && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              pointerEvents: 'none',
              zIndex: 2600,
            }}
          >
            {/* TURN円への指差し */}
            <div style={{ opacity: nudgeIndex6 === 0 ? 1 : 0.35 }}>
              <HandPointer
                x={turnCenter.x}
                y={turnCenter.y}
                corner="NE"
                durationMs={1200}
              />
            </div>
            {/* 外部のCHECKボタンへの指差し */}
            <div style={{ opacity: nudgeIndex6 === 1 ? 1 : 0.35 }}>
              <RefPointer
                targetRef={checkBtnRef}
                corner="NE"
                durationMs={1200}
              />
            </div>
          </div>
        )}

      {/* チュートリアル用ポインタオーバーレイ (Stage7: RIVER⇄CHECK) */}
      {showTutorial &&
        tutorialStage === 7 &&
        (gamePhase === 'turn' || gamePhase === 'river') &&
        !tutorialHidden && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              pointerEvents: 'none',
              zIndex: 2600,
            }}
          >
            {/* RIVER円への指差し */}
            <div style={{ opacity: nudgeIndex7 === 0 ? 1 : 0.35 }}>
              <HandPointer
                x={riverCenter.x}
                y={riverCenter.y}
                corner="NE"
                durationMs={1200}
              />
            </div>
            {/* 外部のCHECKボタンへの指差し */}
            <div style={{ opacity: nudgeIndex7 === 1 ? 1 : 0.35 }}>
              <RefPointer
                targetRef={checkBtnRef}
                corner="NE"
                durationMs={1200}
              />
            </div>
          </div>
        )}

      {/* チュートリアル用ポインタ (SHOWDOWN時のPlay Againボタン) */}
      {showTutorial && gamePhase === 'showdown' && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            pointerEvents: 'none',
            zIndex: 2600,
          }}
        >
          <RefPointer
            targetRef={playAgainBtnRef}
            corner="NE"
            durationMs={1600}
          />
        </div>
      )}

      {/* 統計/履歴パネル */}
      <StatsPanel
        history={history}
        style={{ position: 'absolute', ...POS.ui.statsPanel }}
      />
    </div>
  );
}

export default GameBoard;
