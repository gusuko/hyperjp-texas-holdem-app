// src/components/TutorialOverlay.jsx
import React from 'react';
import HandPointer from './HandPointer';
import RefPointer from './Refpointer';
import { CENTERS } from '../constants/layoutConfig';

export default function TutorialOverlay({
  show, // boolean: 表示するか
  stage, // number: 現在のステージ
  gamePhase, // string: 'turn' か 'river' など
  hidden, // boolean: tutorialHidden
  selectedArea,
  anteBetTotal,
  jackpotBetTotal,
  nudgeIndex2,
  nudgeIndex3,
  nudgeIndex5,
  nudgeIndex6,
  nudgeIndex7, // 交互に 0 と 1
  foldRef,
  checkBtnRef, // React ref
  startBtnRef,
  showPlaceYourBets,
  welcomeBtnRef,
  showWelcomePointer,
  playAgainBtnRef,
}) {
  // チュートリアルが非表示のときでも「Welcome 矢印」だけは例外で表示
  if ((!show || hidden) && !showWelcomePointer) return null;

  // ========== 可視フラグ（条件を1か所に集約） ==========
  const vis = {
    stage1: stage === 1,
    stage2: stage === 2,
    stage3: stage === 3,
    stage5: stage === 5 && gamePhase === 'preflop',
    stage6: stage === 6 && gamePhase === 'flop',
    stage7: stage === 7 && (gamePhase === 'turn' || gamePhase === 'river'),
    start: stage >= 4 && gamePhase === 'initial' && !showPlaceYourBets,
    playAgain: show && !hidden && gamePhase === 'showdown',
  };

  // 固定オーバーレイの共通ラッパ
  const Layer = ({ children }) => (
    <div
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 2600,
      }}
    >
      {children}
    </div>
  );

  // nudge の共通ユーティリティ（偶数=濃く / 奇数=薄く）
  const Pulse = ({ index, on = true, strong = 1, weak = 0.35, children }) => {
    if (!on) return children;
    const opacity = index % 2 === 0 ? strong : weak;
    return <div style={{ opacity }}>{children}</div>;
  };

  return (
    <>
      {/* Stage1: ANTE 円 → $25チップ（二段階） */}
      {vis.stage1 && (
        <Layer>
          {/* ① 円未選択：ANTE 円を指す */}
          {!selectedArea && (
            <HandPointer
              x={CENTERS.ante.x}
              y={CENTERS.ante.y}
              corner="NE"
              durationMs={1200}
            />
          )}
          {/* ② ANTE 選択済み＆未ベット：$25チップを指す */}
          {selectedArea === 'ante' && anteBetTotal === 0 && (
            <HandPointer
              x={CENTERS.chip25.x}
              y={CENTERS.chip25.y}
              corner="NE"
              durationMs={1200}
            />
          )}
        </Layer>
      )}

      {/* Stage2: BONUS 円（HandPointer） */}
      {vis.stage2 && (
        <Layer>
          <Pulse index={nudgeIndex2}>
            <HandPointer
              x={CENTERS.bonus.x}
              y={CENTERS.bonus.y}
              corner="NE"
              durationMs={1200}
            />
          </Pulse>
        </Layer>
      )}

      {/* Stage3: JACKPOT 円 → $5チップ（二段階） */}
      {vis.stage3 && (
        <Layer>
          {/* ① 円未選択：JACKPOT 円を指す */}
          {!selectedArea && (
            <HandPointer
              x={CENTERS.jackpot.x}
              y={CENTERS.jackpot.y}
              corner="NE"
              durationMs={1200}
            />
          )}
          {/* ② JACKPOT 選択済み＆未ベット：$5チップを指す */}
          {selectedArea === 'jackpot' && jackpotBetTotal === 0 && (
            <HandPointer
              x={CENTERS.chip5.x}
              y={CENTERS.chip5.y}
              corner="NE"
              durationMs={1200}
            />
          )}
        </Layer>
      )}

      {/* Stage4: START ボタン */}
      {vis.start && (
        <Layer>
          <RefPointer targetRef={startBtnRef} corner="NE" durationMs={1600} />
        </Layer>
      )}

      {/* Stage5: ANTE/FOLD ピンポン */}
      {vis.stage5 && (
        <Layer>
          <Pulse index={nudgeIndex5}>
            <HandPointer
              x={CENTERS.flop.x}
              y={CENTERS.flop.y}
              corner="NE"
              durationMs={1200}
            />
          </Pulse>
          <Pulse index={nudgeIndex5}>
            <RefPointer targetRef={foldRef} corner="NE" durationMs={1200} />
          </Pulse>
        </Layer>
      )}

      {/* Stage6: TURN/CHECK ピンポン */}
      {vis.stage6 && (
        <Layer>
          <Pulse index={nudgeIndex6}>
            <HandPointer
              x={CENTERS.turn.x}
              y={CENTERS.turn.y}
              corner="NE"
              durationMs={1200}
            />
          </Pulse>
          <Pulse index={nudgeIndex6}>
            <RefPointer targetRef={checkBtnRef} corner="NE" durationMs={1200} />
          </Pulse>
        </Layer>
      )}

      {/* Stage7: RIVER/CHECK ピンポン */}
      {vis.stage7 && (
        <Layer>
          <Pulse index={nudgeIndex7}>
            <HandPointer
              x={CENTERS.river.x}
              y={CENTERS.river.y}
              corner="NE"
              durationMs={1200}
            />
          </Pulse>
          <Pulse index={nudgeIndex7}>
            <RefPointer targetRef={checkBtnRef} corner="NE" durationMs={1200} />
          </Pulse>
        </Layer>
      )}

      {/* Welcome ボタン矢印（チュートリアルOFFでも出す） */}
      {showWelcomePointer && (
        <Layer>
          <RefPointer targetRef={welcomeBtnRef} corner="NE" durationMs={1600} />
        </Layer>
      )}

      {/* Stage8: Play Again ボタン誘導（ショーダウン時） */}
      {vis.playAgain && (
        <Layer>
          <RefPointer
            targetRef={playAgainBtnRef}
            corner="NE"
            durationMs={1600}
          />
        </Layer>
      )}
    </>
  );
}
