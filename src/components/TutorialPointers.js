// src/components/TutorialPointers.js
import React from 'react';
import HandPointer from './HandPointer';
import RefPointer from './Refpointer';
import { getTotalBet } from '../utils/chipHelpers';

/**
 * ✅狙い
 * - これまで：centers（固定座標）で HandPointer → レイアウト変化でズレる
 * - これから：refs（DOM実座標）を優先して HandPointer → 画面変形しても追従
 *
 * ✅フォールバック
 * - refsがまだ無い場所は centers を使う（段階移行OK）
 */

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
  // refs が未定義でも落ちないように分解（ここ重要）
  const {
    anteRef,
    bonusRef,
    jackpotRef,
    flopRef,
    turnRef,
    riverRef,
    chip25Ref,
    chip5Ref,
    selectorRef, // 今は未使用でもOK（将来用）
    foldRef,
    checkBtnRef,
    startBtnRef,
    playAgainBtnRef,
    welcomeBtnRef,
  } = refs || {};

  // =============================
  // DOM実座標 → center(x,y) を返す
  // =============================
  const getCenter = React.useCallback((ref) => {
    const el = ref?.current;
    if (!el) return null;
    const r = el.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  }, []);

  // ✅ リサイズ/スクロールで座標更新（right-topスクロールも拾う）
  const [, forceTick] = React.useState(0);
  React.useEffect(() => {
    const onUpdate = () => forceTick((t) => t + 1);
    window.addEventListener('resize', onUpdate);
    window.addEventListener('scroll', onUpdate, true); // capture=true
    return () => {
      window.removeEventListener('resize', onUpdate);
      window.removeEventListener('scroll', onUpdate, true);
    };
  }, []);

  // ✅ ref優先、無ければcentersへフォールバック
  const pos = React.useCallback(
    (key, ref) => getCenter(ref) ?? centers?.[key] ?? null,
    [getCenter, centers]
  );

  // -----------------------------
  // Stage5/6/7 の点滅（そのまま）
  // -----------------------------
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

  const showStage6Nudge =
    showTutorial === true &&
    tutorialStage === 6 &&
    gamePhase === 'flop' &&
    !tutorialHidden;

  const [nudgeIndex6, setNudgeIndex6] = React.useState(0);
  React.useEffect(() => {
    if (!showStage6Nudge) return;
    const id = setInterval(() => setNudgeIndex6((i) => (i ? 0 : 1)), 1000);
    return () => clearInterval(id);
  }, [showStage6Nudge]);

  const showStage7Nudge =
    showTutorial === true &&
    tutorialStage === 7 &&
    (gamePhase === 'turn' || gamePhase === 'river') &&
    !tutorialHidden;

  const [nudgeIndex7, setNudgeIndex7] = React.useState(0);
  React.useEffect(() => {
    if (!showStage7Nudge) return;
    const id = setInterval(() => setNudgeIndex7((i) => (i ? 0 : 1)), 900);
    return () => {
      clearInterval(id);
      setNudgeIndex7(0);
    };
  }, [showStage7Nudge]);

  // =============================
  // ターゲット座標（ref優先）
  // =============================
  const antePos = pos('ante', anteRef);
  const bonusPos = pos('bonus', bonusRef);
  const jackpotPos = pos('jackpot', jackpotRef);

  const chip25Pos = pos('chip25', chip25Ref);
  const chip5Pos = pos('chip5', chip5Ref);

  const flopPos = pos('flop', flopRef);
  const turnPos = pos('turn', turnRef);
  const riverPos = pos('river', riverRef);

  return (
    <>
      {/* ===== Stage1 (ANTE) ===== */}
      {showTutorial && tutorialStage === 1 && (
        <>
          {/* ① まだ円を選んでいない → ANTE */}
          {!selectedArea && antePos && (
            <HandPointer x={antePos.x} y={antePos.y} />
          )}

          {/* ② ANTE選択済み・未ベット → 25$ */}
          {selectedArea === 'ante' &&
            getTotalBet(placedChips, 'ante') === 0 &&
            chip25Pos && <HandPointer x={chip25Pos.x} y={chip25Pos.y} />}
        </>
      )}

      {/* ===== Stage2 (BONUS) ===== */}
      {showTutorial && tutorialStage === 2 && (
        <>
          {!selectedArea && bonusPos && (
            <HandPointer x={bonusPos.x} y={bonusPos.y} />
          )}

          {selectedArea === 'bonus' &&
            getTotalBet(placedChips, 'bonus') === 0 &&
            chip25Pos && <HandPointer x={chip25Pos.x} y={chip25Pos.y} />}
        </>
      )}

      {/* ===== Stage3 (JACKPOT) ===== */}
      {showTutorial && tutorialStage === 3 && (
        <>
          {!selectedArea && jackpotPos && (
            <HandPointer x={jackpotPos.x} y={jackpotPos.y} />
          )}

          {selectedArea === 'jackpot' &&
            getTotalBet(placedChips, 'jackpot') === 0 &&
            chip5Pos && <HandPointer x={chip5Pos.x} y={chip5Pos.y} />}
        </>
      )}

      {/* ===== WELCOME（RefPointer方式） ===== */}
      {showWelcomePointer && welcomeBtnRef && (
        <div
          aria-hidden="true"
          style={{
            position: 'fixed',
            inset: 0,
            pointerEvents: 'none',
            zIndex: 2600,
          }}
        >
          <RefPointer targetRef={welcomeBtnRef} corner="NE" durationMs={1600} />
        </div>
      )}

      {/* ===== START（RefPointer方式） ===== */}
      {showTutorial && showStartPointer && startBtnRef && (
        <div
          aria-hidden="true"
          style={{
            position: 'fixed',
            inset: 0,
            pointerEvents: 'none',
            zIndex: 2600,
          }}
        >
          <RefPointer targetRef={startBtnRef} corner="NE" durationMs={1600} />
        </div>
      )}

      {/* ===== PLAY AGAIN（RefPointer方式） ===== */}
      {showTutorial && gamePhase === 'showdown' && playAgainBtnRef && (
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

      {/* ===== Stage5: FLOP / FOLD ===== */}
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
          {/* FLOP 強調 */}
          <div style={{ opacity: nudgeIndex5 === 0 ? 1 : 0.35 }}>
            {flopPos && (
              <HandPointer
                x={flopPos.x}
                y={flopPos.y}
                corner="NE"
                durationMs={1200}
              />
            )}
          </div>

          {/* FOLD 強調 */}
          <div style={{ opacity: nudgeIndex5 === 1 ? 1 : 0.35 }}>
            {foldRef && (
              <RefPointer targetRef={foldRef} corner="NE" durationMs={1200} />
            )}
          </div>
        </div>
      )}

      {/* ===== Stage6: TURN / CHECK ===== */}
      {showStage6Nudge && (
        <div
          aria-hidden="true"
          style={{
            position: 'fixed',
            inset: 0,
            pointerEvents: 'none',
            zIndex: 2600,
          }}
        >
          {/* TURN 強調 */}
          <div style={{ opacity: nudgeIndex6 === 0 ? 1 : 0.35 }}>
            {turnPos && (
              <HandPointer
                x={turnPos.x}
                y={turnPos.y}
                corner="NE"
                durationMs={1200}
              />
            )}
          </div>

          {/* CHECK 強調 */}
          <div style={{ opacity: nudgeIndex6 === 1 ? 1 : 0.35 }}>
            {checkBtnRef && (
              <RefPointer
                targetRef={checkBtnRef}
                corner="NE"
                durationMs={1200}
              />
            )}
          </div>
        </div>
      )}

      {/* ===== Stage7: RIVER / CHECK ===== */}
      {showStage7Nudge && (
        <div
          aria-hidden="true"
          style={{
            position: 'fixed',
            inset: 0,
            pointerEvents: 'none',
            zIndex: 2600,
          }}
        >
          {/* RIVER 強調 */}
          <div style={{ opacity: nudgeIndex7 === 0 ? 1 : 0.35 }}>
            {riverPos && (
              <HandPointer
                x={riverPos.x}
                y={riverPos.y}
                corner="NE"
                durationMs={1200}
              />
            )}
          </div>

          {/* CHECK 強調 */}
          <div style={{ opacity: nudgeIndex7 === 1 ? 1 : 0.35 }}>
            {checkBtnRef && (
              <RefPointer
                targetRef={checkBtnRef}
                corner="NE"
                durationMs={1200}
              />
            )}
          </div>
        </div>
      )}
    </>
  );
}
