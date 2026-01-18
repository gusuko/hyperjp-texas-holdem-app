import React from 'react';
import ReactDOM from 'react-dom';
import HandPointer from './HandPointer';
import RefPointer from './Refpointer';
import { getTotalBet } from '../utils/chipHelpers';

const OVERLAY_STYLE = {
  position: 'fixed',
  inset: 0,
  pointerEvents: 'none',
  zIndex: 2600,
};

export default function TutorialPointers({
  showTutorial,
  tutorialStage,
  gamePhase,
  tutorialHidden,
  selectedArea,
  placedChips,
  centers = {},
  refs = {},
  showWelcomePointer,
  showStartPointer,
}) {
  const [nudgeIndex5, setNudgeIndex5] = React.useState(0);
  const [nudgeIndex6, setNudgeIndex6] = React.useState(0);
  const [nudgeIndex7, setNudgeIndex7] = React.useState(0);

  const showStage5Nudge =
    showTutorial &&
    tutorialStage === 5 &&
    gamePhase === 'preflop' &&
    !tutorialHidden;
  const showStage6Nudge =
    showTutorial &&
    tutorialStage === 6 &&
    gamePhase === 'flop' &&
    !tutorialHidden;
  const showStage7Nudge =
    showTutorial &&
    tutorialStage === 7 &&
    (gamePhase === 'turn' || gamePhase === 'river') &&
    !tutorialHidden;

  React.useEffect(() => {
    if (!showStage5Nudge) return undefined;
    const id = setInterval(() => setNudgeIndex5((i) => (i ? 0 : 1)), 1000);
    return () => clearInterval(id);
  }, [showStage5Nudge]);

  React.useEffect(() => {
    if (!showStage6Nudge) return undefined;
    const id = setInterval(() => setNudgeIndex6((i) => (i ? 0 : 1)), 1000);
    return () => clearInterval(id);
  }, [showStage6Nudge]);

  React.useEffect(() => {
    // Stage7はturn中だけピンポン
    if (!(showTutorial && tutorialStage === 7 && gamePhase === 'turn')) {
      setNudgeIndex7(0);
      return undefined;
    }
    let alive = true;
    let flag = 0;
    const id = setInterval(() => {
      if (!alive) return;
      flag = flag ? 0 : 1;
      setNudgeIndex7(flag);
    }, 900);
    return () => {
      alive = false;
      clearInterval(id);
      setNudgeIndex7(0);
    };
  }, [showTutorial, tutorialStage, gamePhase]);

  const showStage1 = showTutorial && tutorialStage === 1;
  const showStage2 = showTutorial && tutorialStage === 2;
  const showStage3 = showTutorial && tutorialStage === 3;
  const showPlayAgainPointer = showTutorial && gamePhase === 'showdown';

  const hasStage1Pointer =
    showStage1 &&
    ((!selectedArea && (refs.anteRef || centers.ante)) ||
      (selectedArea === 'ante' &&
        getTotalBet(placedChips, 'ante') === 0 &&
        (refs.chip25BtnRef || centers.chip25)));

  const hasStage2Pointer =
    showStage2 &&
    ((!selectedArea && (refs.bonusRef || centers.bonus)) ||
      (selectedArea === 'bonus' &&
        getTotalBet(placedChips, 'bonus') === 0 &&
        (refs.chip25BtnRef || centers.chip25)));

  const hasStage3Pointer =
    showStage3 &&
    ((!selectedArea && (refs.jackpotRef || centers.jackpot)) ||
      (selectedArea === 'jackpot' &&
        getTotalBet(placedChips, 'jackpot') === 0 &&
        (refs.chip5BtnRef || centers.chip5)));

  const shouldRenderOverlay =
    showWelcomePointer ||
    showStartPointer ||
    hasStage1Pointer ||
    hasStage2Pointer ||
    hasStage3Pointer ||
    showStage5Nudge ||
    showStage6Nudge ||
    showStage7Nudge ||
    showPlayAgainPointer;

  if (!shouldRenderOverlay) return null;

  const overlay = (
    <div aria-hidden="true" style={OVERLAY_STYLE}>
      {/* Welcome / Start / PlayAgain などの ref追従 */}
      {showWelcomePointer && refs.welcomeBtnRef && (
        <RefPointer
          targetRef={refs.welcomeBtnRef}
          corner="NE"
          durationMs={1600}
        />
      )}
      {showStartPointer && refs.startBtnRef && (
        <RefPointer
          targetRef={refs.startBtnRef}
          corner="NE"
          durationMs={1600}
        />
      )}

      {/* Stage1: ANTE → 25チップ */}
      {showStage1 && (
        <>
          {!selectedArea && refs.anteRef && (
            <RefPointer
              targetRef={refs.anteRef}
              corner="NE"
              durationMs={1600}
            />
          )}
          {!selectedArea && !refs.anteRef && centers.ante && (
            <HandPointer x={centers.ante.x} y={centers.ante.y} />
          )}

          {selectedArea === 'ante' &&
            getTotalBet(placedChips, 'ante') === 0 &&
            refs.chip25BtnRef && (
              <RefPointer
                targetRef={refs.chip25BtnRef}
                corner="NE"
                durationMs={1600}
              />
            )}
          {selectedArea === 'ante' &&
            getTotalBet(placedChips, 'ante') === 0 &&
            !refs.chip25BtnRef &&
            centers.chip25 && (
              <HandPointer x={centers.chip25.x} y={centers.chip25.y} />
            )}
        </>
      )}

      {/* Stage2: BONUS → 25チップ */}
      {showStage2 && (
        <>
          {!selectedArea && refs.bonusRef && (
            <RefPointer
              targetRef={refs.bonusRef}
              corner="NE"
              durationMs={1600}
            />
          )}
          {!selectedArea && !refs.bonusRef && centers.bonus && (
            <HandPointer x={centers.bonus.x} y={centers.bonus.y} />
          )}

          {selectedArea === 'bonus' &&
            getTotalBet(placedChips, 'bonus') === 0 &&
            refs.chip25BtnRef && (
              <RefPointer
                targetRef={refs.chip25BtnRef}
                corner="NE"
                durationMs={1600}
              />
            )}
          {selectedArea === 'bonus' &&
            getTotalBet(placedChips, 'bonus') === 0 &&
            !refs.chip25BtnRef &&
            centers.chip25 && (
              <HandPointer x={centers.chip25.x} y={centers.chip25.y} />
            )}
        </>
      )}

      {/* Stage3: JACKPOT → 5チップ */}
      {showStage3 && (
        <>
          {!selectedArea && refs.jackpotRef && (
            <RefPointer
              targetRef={refs.jackpotRef}
              corner="NE"
              durationMs={1600}
            />
          )}
          {!selectedArea && !refs.jackpotRef && centers.jackpot && (
            <HandPointer x={centers.jackpot.x} y={centers.jackpot.y} />
          )}

          {selectedArea === 'jackpot' &&
            getTotalBet(placedChips, 'jackpot') === 0 &&
            refs.chip5BtnRef && (
              <RefPointer
                targetRef={refs.chip5BtnRef}
                corner="NE"
                durationMs={1600}
              />
            )}
          {selectedArea === 'jackpot' &&
            getTotalBet(placedChips, 'jackpot') === 0 &&
            !refs.chip5BtnRef &&
            centers.chip5 && (
              <HandPointer x={centers.chip5.x} y={centers.chip5.y} />
            )}
        </>
      )}

      {/* Stage5: FLOP(circle) ⇄ FOLD(button) */}
      {showStage5Nudge && (
        <>
          <div style={{ opacity: nudgeIndex5 === 0 ? 1 : 0.35 }}>
            {refs.flopRef ? (
              <RefPointer
                targetRef={refs.flopRef}
                corner="NE"
                durationMs={1200}
              />
            ) : centers.flop ? (
              <HandPointer
                x={centers.flop.x}
                y={centers.flop.y}
                corner="NE"
                durationMs={1200}
              />
            ) : null}
          </div>
          <div style={{ opacity: nudgeIndex5 === 1 ? 1 : 0.35 }}>
            {refs.foldRef && (
              <RefPointer
                targetRef={refs.foldRef}
                corner="NE"
                durationMs={1200}
              />
            )}
          </div>
        </>
      )}

      {/* Stage6: TURN(circle) ⇄ CHECK(button) */}
      {showStage6Nudge && (
        <>
          <div style={{ opacity: nudgeIndex6 === 0 ? 1 : 0.35 }}>
            {refs.turnRef ? (
              <RefPointer
                targetRef={refs.turnRef}
                corner="NE"
                durationMs={1200}
              />
            ) : centers.turn ? (
              <HandPointer
                x={centers.turn.x}
                y={centers.turn.y}
                corner="NE"
                durationMs={1200}
              />
            ) : null}
          </div>
          <div style={{ opacity: nudgeIndex6 === 1 ? 1 : 0.35 }}>
            {refs.checkBtnRef && (
              <RefPointer
                targetRef={refs.checkBtnRef}
                corner="NE"
                durationMs={1200}
              />
            )}
          </div>
        </>
      )}

      {/* Stage7: RIVER(circle) ⇄ CHECK(button) */}
      {showStage7Nudge && (
        <>
          <div style={{ opacity: nudgeIndex7 === 0 ? 1 : 0.35 }}>
            {refs.riverRef ? (
              <RefPointer
                targetRef={refs.riverRef}
                corner="NE"
                durationMs={1200}
              />
            ) : centers.river ? (
              <HandPointer
                x={centers.river.x}
                y={centers.river.y}
                corner="NE"
                durationMs={1200}
              />
            ) : null}
          </div>
          <div style={{ opacity: nudgeIndex7 === 1 ? 1 : 0.35 }}>
            {refs.checkBtnRef && (
              <RefPointer
                targetRef={refs.checkBtnRef}
                corner="NE"
                durationMs={1200}
              />
            )}
          </div>
        </>
      )}

      {showPlayAgainPointer && refs.playAgainBtnRef && (
        <RefPointer
          targetRef={refs.playAgainBtnRef}
          corner="NE"
          durationMs={1600}
        />
      )}
    </div>
  );

  return ReactDOM.createPortal(overlay, document.body);
}
