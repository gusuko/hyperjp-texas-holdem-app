// src/hooks/useTutorial.js
import React from 'react';
import { useState, useEffect } from 'react';

export default function useTutorial(
  gamePhase,
  initial = { show: false, stage: 0 }
) {
  const [showTutorial, setShowTutorial] = useState(initial.show);
  const [tutorialStage, setTutorialStage] = useState(initial.stage);
  const [nudgeIndex2, setNudgeIndex2] = React.useState(0);
  const [nudgeIndex3, setNudgeIndex3] = React.useState(0);

  const [nudgeIndex5, setNudgeIndex5] = useState(0);
  const [nudgeIndex6, setNudgeIndex6] = useState(0);
  const [nudgeIndex7, setNudgeIndex7] = useState(0);

  // 矢印の一時非表示（「押した瞬間に隠す」用）
  const [tutorialHidden, setTutorialHidden] = useState(false);

  const [tutorialCompleted, setTutorialCompleted] = React.useState(false);
  // 「チュートリアル中にFOLDした」事実を次ゲームまで保持
  const foldedRef = React.useRef(false);

  // チュートリアル中にFOLDしたら、次ゲームで再開するフラグを立てる
  const onFoldInTutorial = React.useCallback(() => {
    if (showTutorial && !tutorialCompleted) {
      foldedRef.current = true;
    }
  }, [showTutorial, tutorialCompleted]);

  // gamePhase が 'initial' に戻ったタイミングで、必要なら Stage1 から再開
  const handlePhaseChange = React.useCallback(
    (gamePhase) => {
      if (
        gamePhase === 'initial' &&
        foldedRef.current &&
        showTutorial &&
        !tutorialCompleted
      ) {
        setTutorialHidden(false);
        setTutorialStage(1);
        foldedRef.current = false; // 使い切り
      }
    },
    [showTutorial, tutorialCompleted, setTutorialHidden, setTutorialStage]
  );

  // Tutorial開始時に Stage1 へ（ANTE 解放）
  useEffect(() => {
    if (showTutorial && tutorialStage === 0 && gamePhase === 'initial') {
      setTutorialStage(1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showTutorial, tutorialStage, gamePhase]);

  React.useEffect(() => {
    if (!showTutorial || tutorialHidden) return;
    const cycle = 16; // 既存に合わせる
    const id = setInterval(() => {
      setNudgeIndex3((v) => (v + 1) % cycle);
    }, 400); // 既存に合わせる
    return () => clearInterval(id);
  }, [showTutorial, tutorialHidden]);

  React.useEffect(() => {
    if (!showTutorial || tutorialHidden) return;
    const cycle = 16; // 既存に合わせて（8なら8に）
    const id = setInterval(() => {
      setNudgeIndex2((v) => (v + 1) % cycle);
    }, 400); // 既存のテンポに合わせて
    return () => clearInterval(id);
  }, [showTutorial, tutorialHidden]);

  useEffect(() => {
    const on =
      showTutorial &&
      tutorialStage === 5 &&
      !tutorialHidden &&
      gamePhase === 'preflop'; // ← preflop だけ点滅

    if (!on) {
      setNudgeIndex5(0);
      return;
    }

    const id = setInterval(() => {
      setNudgeIndex5((i) => (i ? 0 : 1));
    }, 1000);

    return () => clearInterval(id);
  }, [showTutorial, tutorialStage, tutorialHidden, gamePhase]);

  // ★ Stage7 のピンポン制御を hook 内で行う
  useEffect(() => {
    if (!(showTutorial && tutorialStage === 7)) return;
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
  }, [showTutorial, tutorialStage]);

  useEffect(() => {
    const on =
      showTutorial &&
      tutorialStage === 6 &&
      gamePhase === 'flop' &&
      !tutorialHidden;

    if (!on) {
      setNudgeIndex6(0);
      return;
    }

    const id = setInterval(() => {
      setNudgeIndex6((i) => (i ? 0 : 1));
    }, 1000);

    return () => clearInterval(id);
  }, [showTutorial, tutorialStage, gamePhase, tutorialHidden]);

  return {
    showTutorial,
    setShowTutorial,
    tutorialStage,
    setTutorialStage,
    tutorialHidden,
    setTutorialHidden,
    tutorialCompleted,
    setTutorialCompleted,
    onFoldInTutorial,
    handlePhaseChange,
    nudgeIndex2,
    nudgeIndex3,
    nudgeIndex5,
    nudgeIndex6,
    nudgeIndex7,
    setNudgeIndex7,
  };
}
