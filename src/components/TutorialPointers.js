import React from 'react';
import HandPointer from './HandPointer';
import RefPointer from './Refpointer';
import { getTotalBet } from '../utils/chipHelpers';

export default function TutorialPointers({
  showTutorial,
  tutorialStage,
  gamePhase,
  tutorialHidden,
  selectedArea,
  placedChips,
  centers,
  refs,
  showWelcomePointer,
  showStartPointer,
}) {
  const showStage5Nudge =
    showTutorial === true &&
    tutorialStage === 5 &&
    gamePhase === 'preflop' &&
    !tutorialHidden;

  const [nudgeIndex5, setNudgeIndex5] = React.useState(0);
  React.useEffect(() => {
    if (!showStage5Nudge) return;
    const id = setInterval(() => setNudgeIndex5((i) => (i ? 0 : 1)), 1000);
    return () => clearInterval(id);
  }, [showStage5Nudge]);

  const [nudgeIndex6, setNudgeIndex6] = React.useState(0);
  React.useEffect(() => {
    const showStage6Nudge =
      showTutorial === true && tutorialStage === 6 && gamePhase === 'flop';
    if (!showStage6Nudge) return;
    const id = setInterval(() => setNudgeIndex6((i) => (i ? 0 : 1)), 1000);
    return () => clearInterval(id);
  }, [showTutorial, tutorialStage, gamePhase]);

  const [nudgeIndex7, setNudgeIndex7] = React.useState(0);
  React.useEffect(() => {
    if (!(showTutorial && tutorialStage === 7 && gamePhase === 'turn')) return;
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

  return (
    <>
      {/* ===== 矢印アイコン（チュートリアルステージ1ガイド） ===== */}
      {showTutorial && tutorialStage === 1 && (
        <>
          {/* ① まだ円を選んでいない → ANTE 円の上に表示 */}
          {!selectedArea && (
            <HandPointer x={centers.ante.x} y={centers.ante.y} />
          )}

          {/* ② ANTE 円を選んだら → 25$ チップの上に表示 */}
          {selectedArea === 'ante' &&
            getTotalBet(placedChips, 'ante') === 0 && (
              <HandPointer x={centers.chip25.x} y={centers.chip25.y} />
            )}
        </>
      )}
      {/* ===== 矢印アイコン（チュートリアルステージ2ガイド） ===== */}
      {showTutorial && tutorialStage === 2 && (
        <>
          {/* ① 円をまだ選んでいない ⇒ BONUS 円に表示 */}
          {!selectedArea && (
            <HandPointer x={centers.bonus.x} y={centers.bonus.y} />
          )}

          {/* ② BONUS 円を選んだがチップ未配置 ⇒ 25$ チップに表示 */}
          {selectedArea === 'bonus' &&
            getTotalBet(placedChips, 'bonus') === 0 && (
              <HandPointer x={centers.chip25.x} y={centers.chip25.y} />
            )}
        </>
      )}
      {/* ===== 矢印アイコン（チュートリアルステージ3ガイド） ===== */}
      {showTutorial && tutorialStage === 3 && (
        <>
          {/* ① まだ円を選んでいない ⇒ JACKPOT 円に表示 */}
          {!selectedArea && (
            <HandPointer x={centers.jackpot.x} y={centers.jackpot.y} />
          )}

          {/* ② JACKPOT 円を選択・未ベット ⇒ 5$ チップに表示 */}
          {selectedArea === 'jackpot' &&
            getTotalBet(placedChips, 'jackpot') === 0 && (
              <HandPointer x={centers.chip5.x} y={centers.chip5.y} />
            )}
        </>
      )}

      {/* 初回だけ WELCOME を指す矢印（押すと自動で消える） */}
      {showWelcomePointer && (
        <div
          aria-hidden="true"
          style={{
            position: 'fixed',
            inset: 0,
            pointerEvents: 'none',
            zIndex: 2600,
          }}
        >
          <RefPointer targetRef={refs.welcomeBtnRef} corner="NE" durationMs={1600} />
        </div>
      )}

      {showTutorial && showStartPointer && (
        <div
          aria-hidden="true"
          style={{
            position: 'fixed',
            inset: 0,
            pointerEvents: 'none',
            zIndex: 2600,
          }}
        >
          <RefPointer targetRef={refs.startBtnRef} corner="NE" durationMs={1600} />
        </div>
      )}

      {showTutorial && gamePhase === 'showdown' && (
        <div
          aria-hidden="true"
          style={{
            position: 'fixed',
            inset: 0,
            pointerEvents: 'none',
            zIndex: 2600,
          }}
        >
          <RefPointer targetRef={refs.playAgainBtnRef} corner="NE" durationMs={1600} />
        </div>
      )}

      {showStage5Nudge && (
        <div
          aria-hidden="true"
          style={{
            position: 'fixed',
            inset: 0,
            pointerEvents: 'none',
            zIndex: 2600,
          }}
        >
          {/* FLOP を強調 / FOLD を薄く */}
          <div style={{ opacity: nudgeIndex5 === 0 ? 1 : 0.35 }}>
            <HandPointer
              x={centers.flop.x}
              y={centers.flop.y}
              corner="NE"
              durationMs={1200}
            />
          </div>
          {/* FOLD を強調 / FLOP を薄く */}
          <div style={{ opacity: nudgeIndex5 === 1 ? 1 : 0.35 }}>
            <RefPointer targetRef={refs.foldRef} corner="NE" durationMs={1200} />
          </div>
        </div>
      )}

      {/* ===== Stage6: TURN / CHECK のピンポン矢印 ===== */}
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
            {/* TURN を強調 / CHECK を薄く */}
            <div style={{ opacity: nudgeIndex6 === 0 ? 1 : 0.35 }}>
              <HandPointer
                x={centers.turn.x}
                y={centers.turn.y}
                corner="NE"
                durationMs={1200}
              />
            </div>
            {/* CHECK を強調 / TURN を薄く */}
            <div style={{ opacity: nudgeIndex6 === 1 ? 1 : 0.35 }}>
              <RefPointer
                targetRef={refs.checkBtnRef}
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
            {/* RIVER を強調 / CHECK を薄く */}
            <div style={{ opacity: nudgeIndex7 === 0 ? 1 : 0.35 }}>
              <HandPointer
                x={centers.river.x}
                y={centers.river.y}
                corner="NE"
                durationMs={1200}
              />
            </div>

            {/* CHECK を強調 / RIVER を薄く */}
            <div style={{ opacity: nudgeIndex7 === 1 ? 1 : 0.35 }}>
              <RefPointer
                targetRef={refs.checkBtnRef}
                corner="NE"
                durationMs={1200}
              />
            </div>
          </div>
        )}
    </>
  );
}
