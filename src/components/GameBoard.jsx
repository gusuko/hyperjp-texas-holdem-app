// GameBoard.jsx
import React, { useState, useEffect } from 'react';
import CurrentChips from './CurrentChips';
import CardSlot from './CardSlot';
import CardGroup from './CardGroup';
import BetCircle from './BetCircle';
import ChipSelector from './ChipSelector';
import PayoutTable from './PayoutTable';
import ResultPanel from './ResultPanel';
import StatsPanel from './StatsPanel';
import HandPointer from './HandPointer';
import RefPointer from './RefPointer';
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
    onTopUp,
    onGameStart,
    onFold,
    onPlayAgain,
    onCheck,
    showPlaceYourBets,
    history,
    resultText,
    folded,
    flopRef,
    foldRef,
    checkBtnRef,
    playAgainBtnRef,
    welcomeBtnRef,
    showTutorial,
    tutorialStage,
    tutorialHidden,
    dealerCardLoadCallback,
    boardCardLoadCallback,
    playerCardLoadCallback,
  } = props;

  // Compute center points for tutorial HandPointer targets
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

  // Nudge indices for blinking tutorial arrows (Stage5,6,7)
  const [nudgeIndex5, setNudgeIndex5] = useState(0);
  const [nudgeIndex6, setNudgeIndex6] = useState(0);
  const [nudgeIndex7, setNudgeIndex7] = useState(0);

  // Effect to toggle FLOP/FOLD pointer (Stage5)
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

  // Effect to toggle TURN/CHECK pointer (Stage6)
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

  // Effect to toggle RIVER/CHECK pointer (Stage7)
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

  return (
    <div ref={boardRef} className="game-board">
      <h1 className="title-in-board">
        🃏 Ultimate Texas Hold'em Poker Simulator
      </h1>

      {/* Current chips display */}
      <CurrentChips
        chips={walletChips}
        style={{ position: 'absolute', ...POS.ui.chips }}
      />

      {/* Card slots (dealer, player, community) */}
      {POS.cardSlot.dealer.map((pos, i) => (
        <CardSlot key={`slot-d${i}`} style={pos} />
      ))}
      {POS.cardSlot.player.map((pos, i) => (
        <CardSlot key={`slot-p${i}`} style={pos} />
      ))}
      {POS.cardSlot.community.map((pos, i) => (
        <CardSlot key={`slot-c${i}`} style={pos} />
      ))}

      {/* Cards (dealer, community, player) */}
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

      {/* Betting circles (Ante, Bonus, Jackpot initial bets) */}
      {/* ANTE always enabled if chips > 0 */}
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

      {/* Betting circles for in-game bets: Flop, Turn, River */}
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

      {/* Tutorial hand pointers for stages 1, 2, 3 (bet placement guidance) */}
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

      {/* Chip selection panel */}
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

      {/* Top-up (recharge) button */}
      <button
        ref={welcomeBtnRef}
        className="recharge-btn"
        onClick={onTopUp}
        style={{ position: 'absolute', ...POS.ui.recharge }}
        disabled={showTutorial}
      >
        {!welcomeClaimed && walletChips === 0
          ? 'WELCOME\n＋$1,000'
          : '＋$1,000'}
      </button>
      {/* Pointer to WELCOME top-up button (only on first game) */}
      {gamePhase === 'initial' &&
        walletChips === 0 &&
        !welcomeClaimed &&
        !showTutorial && (
          <div
            aria-hidden="true"
            style={{
              position: 'fixed',
              inset: 0,
              pointerEvents: 'none',
              zIndex: 2600,
            }}
          >
            <RefPointer
              targetRef={welcomeBtnRef}
              corner="NE"
              durationMs={1600}
            />
          </div>
        )}

      {/* Payout tables for Bonus and Jackpot */}
      <PayoutTable uiKey="bonusTable" title="B O N U S" data={bonusPayouts} />
      <PayoutTable
        uiKey="jackpotTable"
        title="J A C K P O T"
        data={jackpotPayouts}
      />

      {/* Result text panel */}
      <ResultPanel
        showdown={showdown}
        folded={folded}
        resultText={resultText}
        history={history}
        onPlayAgain={onPlayAgain}
      />

      {/* Fold button (pre-flop only) */}
      {!folded && gamePhase === 'preflop' && (
        <button
          ref={foldRef}
          className="fold-btn"
          onClick={onFold}
          style={POS.ui.fold}
        >
          FOLD
        </button>
      )}

      {/* Check button (flop or turn phase) */}
      {!folded && (gamePhase === 'flop' || gamePhase === 'turn') && (
        <button
          ref={checkBtnRef}
          className="check-btn"
          onClick={onCheck}
          style={POS.ui.check}
        >
          チェック
        </button>
      )}

      {/* Play Again button (shown at showdown) */}
      {gamePhase === 'showdown' && (
        <>
          <button
            ref={playAgainBtnRef}
            className="playagain-btn"
            onClick={onPlayAgain}
            style={POS.ui.fold}
          >
            PLAY&nbsp;AGAIN
          </button>
          {/* Tutorial pointer to Play Again (if tutorial active during showdown) */}
          {showTutorial && (
            <div
              aria-hidden="true"
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
        </>
      )}

      {/* "Place Your Bets" overlay text after reset */}
      {showPlaceYourBets && (
        <div className="place-bets-overlay">PLACE YOUR BETS Please!</div>
      )}

      {/* Tutorial pointer overlays for stages 5, 6, 7 */}
      {showTutorial &&
        tutorialStage === 5 &&
        gamePhase === 'preflop' &&
        !tutorialHidden && (
          <div
            aria-hidden="true"
            style={{
              position: 'fixed',
              inset: 0,
              pointerEvents: 'none',
              zIndex: 2600,
            }}
          >
            {/* Blink between pointing at FLOP circle and FOLD button */}
            <div style={{ opacity: nudgeIndex5 === 0 ? 1 : 0.35 }}>
              <HandPointer
                x={flopCenter.x}
                y={flopCenter.y}
                corner="NE"
                durationMs={1200}
              />
            </div>
            <div style={{ opacity: nudgeIndex5 === 1 ? 1 : 0.35 }}>
              <RefPointer targetRef={foldRef} corner="NE" durationMs={1200} />
            </div>
          </div>
        )}
      {showTutorial &&
        tutorialStage === 6 &&
        gamePhase === 'flop' &&
        !tutorialHidden && (
          <div
            aria-hidden="true"
            style={{
              position: 'fixed',
              inset: 0,
              pointerEvents: 'none',
              zIndex: 2600,
            }}
          >
            {/* Blink between pointing at TURN circle and CHECK button */}
            <div style={{ opacity: nudgeIndex6 === 0 ? 1 : 0.35 }}>
              <HandPointer
                x={turnCenter.x}
                y={turnCenter.y}
                corner="NE"
                durationMs={1200}
              />
            </div>
            <div style={{ opacity: nudgeIndex6 === 1 ? 1 : 0.35 }}>
              <RefPointer
                targetRef={checkBtnRef}
                corner="NE"
                durationMs={1200}
              />
            </div>
          </div>
        )}
      {showTutorial &&
        tutorialStage === 7 &&
        (gamePhase === 'turn' || gamePhase === 'river') &&
        !tutorialHidden && (
          <div
            aria-hidden="true"
            style={{
              position: 'fixed',
              inset: 0,
              pointerEvents: 'none',
              zIndex: 2600,
            }}
          >
            {/* Blink between pointing at RIVER circle and CHECK button */}
            <div style={{ opacity: nudgeIndex7 === 0 ? 1 : 0.35 }}>
              <HandPointer
                x={riverCenter.x}
                y={riverCenter.y}
                corner="NE"
                durationMs={1200}
              />
            </div>
            <div style={{ opacity: nudgeIndex7 === 1 ? 1 : 0.35 }}>
              <RefPointer
                targetRef={checkBtnRef}
                corner="NE"
                durationMs={1200}
              />
            </div>
          </div>
        )}

      {/* Stats/History Panel */}
      <StatsPanel
        history={history}
        style={{ position: 'absolute', ...POS.ui.statsPanel }}
      />
    </div>
  );
}

export default GameBoard;
