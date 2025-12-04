import React, { useState, useReducer, useRef, useEffect } from 'react';
import HandPointer from './components/HandPointer';
import RefPointer from './components/RefPointer';
import GameBoard from './components/GameBoard';
import GameControls from './components/GameControls';
import StatsPanel from './components/StatsPanel';
import { initialState, reducer } from './state';
import useHandHistory from './hooks/useHandHistory';
import useShowdownLogic from './hooks/useShowdownLogic';
import useWallet from './hooks/useWallet';
import { setWallet, initWallet } from './data/handHistoryRepo';
import { handleStartGameWithChecks } from './utils/gameStart';
import {
  handleFlopBet,
  handleTurnBet,
  handleRiverBet,
  handleCheckTurn,
  handleCheckRiver,
  handleFold,
} from './utils/betActions';
import { convertToChips, getTotalBet } from './utils/chipHelpers';
import { restartRound } from './utils/gameReset';
import { playBetSound, playPlaceYourBetsSound } from './utils/sound';
import sleep from './utils/sleep';
import { POS } from './constants/layoutConfig';
import './styles/App.css';

/* 画面サイズに応じてゲームボード表示をスケーリング */
function useAutoScale() {
  const BOARD_W = 1800,
    BOARD_H = 1100;
  const MIN_SCALE = 0.4;
  const MIN_PLAYABLE = 0.55;
  React.useLayoutEffect(() => {
    const upd = () => {
      let s = Math.min(
        window.innerWidth / BOARD_W,
        window.innerHeight / BOARD_H
      );
      s = Math.max(s, MIN_SCALE);
      document.documentElement.style.setProperty('--game-scale', s);
      if (s < MIN_PLAYABLE) {
        document.documentElement.classList.add('too-small');
      } else {
        document.documentElement.classList.remove('too-small');
      }
    };
    upd();
    window.addEventListener('resize', upd);
    return () => window.removeEventListener('resize', upd);
  }, []);
}

function App() {
  useAutoScale();

  // 初回起動時にウォレットを初期化
  useEffect(() => {
    initWallet();
  }, []);

  // ゲーム状態管理
  const [state, dispatch] = useReducer(reducer, initialState);
  const { deck, cards, bets, phase: gamePhase, folded, showdown } = state;
  const [tutorialStage, setTutorialStage] = useState(1);
  const [showTutorial, setShowTutorial] = useState(false);
  const [tutorialHidden, setTutorialHidden] = useState(false);
  const [resultText, setResultText] = useState('');
  const [selectedArea, setSelectedArea] = useState(null);
  const { placedChips } = state;
  const { history, addHand, wipe } = useHandHistory();
  const { wallet, credit, debit, refresh } = useWallet();

  // ボタン要素へのref（チュートリアル用の矢印表示に利用）
  const flopRef = useRef(null);
  const foldRef = useRef(null);
  const checkBtnRef = useRef(null);
  const startBtnRef = useRef(null);
  const playAgainBtnRef = useRef(null);
  const welcomeBtnRef = useRef(null);

  // 手アイコン（矢印）表示用の座標計算
  const flopCenter = { x: POS.bet.flop.left + 35, y: POS.bet.flop.top + 35 };
  const turnCenter = { x: POS.bet.turn.left + 35, y: POS.bet.turn.top + 35 };
  const riverCenter = { x: POS.bet.river.left + 35, y: POS.bet.river.top + 35 };

  // 各チュートリアル段階の矢印表示フラグと点滅制御
  const showStage5Nudge =
    showTutorial &&
    tutorialStage === 5 &&
    gamePhase === 'preflop' &&
    !tutorialHidden;
  const [nudgeIndex5, setNudgeIndex5] = useState(0);
  useEffect(() => {
    if (!showStage5Nudge) return;
    const id = setInterval(() => setNudgeIndex5((i) => (i ? 0 : 1)), 1000);
    return () => clearInterval(id);
  }, [showStage5Nudge]);

  const [nudgeIndex6, setNudgeIndex6] = useState(0);
  useEffect(() => {
    const showStage6Nudge =
      showTutorial && tutorialStage === 6 && gamePhase === 'flop';
    if (!showStage6Nudge) return;
    const id = setInterval(() => setNudgeIndex6((i) => (i ? 0 : 1)), 1000);
    return () => clearInterval(id);
  }, [showTutorial, tutorialStage, gamePhase]);

  const [nudgeIndex7, setNudgeIndex7] = useState(0);
  useEffect(() => {
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

  const showWelcomePointer =
    gamePhase === 'initial' &&
    wallet.chips === 0 &&
    wallet.welcomeClaimed === false &&
    !showTutorial;
  const showStartPointer =
    showTutorial && gamePhase === 'initial' && tutorialStage >= 4;

  // カード表示ロード完了時のコールバック（カードがめくられたら次の処理へ進むためのもの）
  const [playerCardLoadCallback, setPlayerCardLoadCallback] = useState(
    () => () => {}
  );
  const [dealerCardLoadCallback, setDealerCardLoadCallback] = useState(
    () => () => {}
  );
  const [boardCardLoadCallback, setBoardCardLoadCallback] = useState(
    () => () => {}
  );

  // ウォレット操作（チップ補充ボタン）
  const handleTopUp = async () => {
    if (!wallet.welcomeClaimed && wallet.chips === 0) {
      // 初回のみ Welcome ボーナス
      const newChips = wallet.chips + 1000;
      await setWallet({ id: 1, chips: newChips, welcomeClaimed: true });
      refresh();
      // チュートリアル未完了ならチュートリアル開始
      if (!wallet.tutorialCompleted) {
        setShowTutorial(true);
        console.log('✅ showTutorial ON');
      }
    } else {
      // 2回目以降（将来的には広告視聴等）
      credit(1000);
    }
  };

  // チュートリアルの自動進行（ベット額に応じてステージを進める）
  useEffect(() => {
    if (!showTutorial || gamePhase !== 'initial') return;
    const anteDone = getTotalBet(placedChips, 'ante') >= 25;
    const bonusDone = getTotalBet(placedChips, 'bonus') >= 25;
    const jackpotDone = getTotalBet(placedChips, 'jackpot') >= 5;
    if (tutorialStage === 1 && anteDone) {
      setTutorialStage(2);
      setSelectedArea(null);
    } else if (tutorialStage === 2 && bonusDone) {
      setTutorialStage(3);
      setSelectedArea(null);
    } else if (tutorialStage === 3 && jackpotDone) {
      setTutorialStage(4);
      setSelectedArea(null);
    }
  }, [showTutorial, tutorialStage, placedChips, gamePhase]);

  // 勝敗判定ロジックの呼び出し（ゲーム終了時に自動でハンド履歴追加や支払い計算を実行）
  useShowdownLogic({
    showdown,
    folded,
    cards,
    credit,
    bets,
    dispatch,
    setResultText,
    onHandComplete: addHand,
  });

  // 「Play Again」ボタン押下時の処理（次のゲームの準備）
  const handlePlayAgain = async () => {
    setTutorialHidden(false); // 一時非表示中のチュートリアル矢印を再表示可能に
    setShowTutorial(false); // チュートリアル矢印をリセット
    setTutorialStage(0);
    restartRound({ dispatch, setResultText, placedChips: state.placedChips });
    await sleep(600);
    playPlaceYourBetsSound();
    setShowPlaceYourBets(true);
    setTimeout(() => setShowPlaceYourBets(false), 1500);
    // 次ハンド開始前に選択状態をクリア（チュートリアルガイドを正常に表示させるため）
    setSelectedArea(null);
    if (showTutorial) {
      // チュートリアル継続の場合、ステージ1から再開
      setTutorialStage(1);
      setSelectedArea(null);
    }
  };

  // 「Start」ボタン押下時の処理（ゲーム開始）
  const handleGameStart = async () => {
    // ① 最低額のANTEチェック
    const anteBet = state.placedChips.ante.reduce((sum, c) => sum + c.value, 0);
    if (anteBet < 25) {
      alert('ANTE は最低 $25 必要です');
      return;
    }
    // ② スタートボタンUIを無効化
    dispatch({ type: 'SET_PHASE', phase: 'starting' });
    // ③ ゲームの初期処理実行（カード配布など）
    await handleStartGameWithChecks({
      placedChips: state.placedChips,
      dispatch,
      setResultText,
      setPlayerCardLoadCallback,
      setDealerCardLoadCallback,
    });
    // ④ チュートリアル中なら次のステージ（FLOP/FOLD）へ
    if (showTutorial) {
      setTutorialStage(5);
    }
  };

  // 円形ベットエリアのクリック（FLOPベット: ANTE×2 自動ベット）
  const handleFlopCircleClick = async () => {
    const betAmount = bets.ante * 2;
    setTutorialHidden(true);
    if (
      gamePhase === 'preflop' &&
      bets.flop === 0 &&
      wallet.chips >= betAmount
    ) {
      const chipsToPlace = convertToChips(betAmount);
      chipsToPlace.sort((a, b) => a.value - b.value);
      debit(betAmount);
      dispatch({ type: 'SET_PLACED_CHIPS', area: 'flop', chips: chipsToPlace });
      playBetSound();
      dispatch({ type: 'PLACE_BET', area: 'flop', amount: betAmount });
      await sleep(220);
      await handleFlopBet({
        betAmount,
        deck,
        dispatch,
        setBoardCardLoadCallback,
        cards,
      });
      // FLOPベット完了後、チュートリアルステージ6（TURN/CHECK案内）へ
      if (showTutorial) {
        setTutorialStage(6);
        setTutorialHidden(false);
      }
    }
  };

  // チェックボタンのクリック（flop/turnフェーズで使用）
  const handleCheck = async () => {
    setTutorialHidden(true);
    if (gamePhase === 'flop') {
      // FLOPフェーズでCHECK: ターンカードを公開してフェーズ進行
      await handleCheckTurn({
        deck,
        dispatch,
        setBoardCardLoadCallback,
        cards,
      });
      if (showTutorial) {
        // ターンへ進行したらチュートリアルステージ7（RIVER/CHECK案内）を解放
        setTutorialStage(7);
        setTutorialHidden(false);
      }
    } else if (gamePhase === 'turn') {
      // TURNフェーズでCHECK: リバーカードを公開（＝ショウダウンへ進行）
      await handleCheckRiver({
        deck,
        dispatch,
        setBoardCardLoadCallback,
        cards,
      });
      // （RIVERへ進行。チュートリアル終了判定は次ステップで処理）
    }
  };

  // 円形ベットエリアのクリック（TURNベット: ANTE×1 自動ベット）
  const handleTurnCircleClick = async () => {
    const betAmount = bets.ante;
    if (gamePhase === 'flop' && bets.turn === 0 && wallet.chips >= betAmount) {
      setTutorialHidden(true);
      debit(betAmount);
      const chipsToPlace = convertToChips(betAmount);
      chipsToPlace.sort((a, b) => a.value - b.value);
      dispatch({ type: 'SET_PLACED_CHIPS', area: 'turn', chips: chipsToPlace });
      playBetSound();
      dispatch({ type: 'PLACE_BET', area: 'turn', amount: betAmount });
      await sleep(220);
      await handleTurnBet({
        betAmount,
        deck,
        dispatch,
        setBoardCardLoadCallback,
        cards,
      });
      // ターンベット完了後、チュートリアルステージ7（RIVER/CHECK案内）へ
      if (showTutorial) {
        setTutorialStage(7);
        setTutorialHidden(false);
      }
    }
  };

  // 円形ベットエリアのクリック（RIVERベット: ANTE×1 自動ベット）
  const handleRiverCircleClick = async () => {
    setTutorialHidden(true);
    const betAmount = bets.ante;
    if (gamePhase === 'turn' && bets.river === 0 && wallet.chips >= betAmount) {
      debit(betAmount);
      const chipsToPlace = convertToChips(betAmount);
      chipsToPlace.sort((a, b) => a.value - b.value);
      dispatch({
        type: 'SET_PLACED_CHIPS',
        area: 'river',
        chips: chipsToPlace,
      });
      playBetSound();
      dispatch({ type: 'PLACE_BET', area: 'river', amount: betAmount });
      await sleep(220);
      await handleRiverBet({
        betAmount,
        deck,
        dispatch,
        setBoardCardLoadCallback,
        cards,
      });
      // （リバーベット完了後はショウダウンへ進行）
    }
  };

  // FOLDボタンのクリック
  const handleFoldClick = () => {
    handleFold({
      dispatch,
      deck: state.deck,
      playerCards: cards.player,
      dealerCards: cards.dealer,
      bets: state.bets,
      onHandComplete: addHand,
      onResult: setResultText,
      debit,
    });
  };

  // BETボタンのクリック（TURNまたはRIVERのベット）
  const handleBet = async () => {
    setTutorialHidden(true);
    if (gamePhase === 'flop') {
      // 現在 flop フェーズでBET ⇒ ターンベット処理を実行
      await handleTurnCircleClick();
    } else if (gamePhase === 'turn') {
      // 現在 turn フェーズでBET ⇒ リバーベット処理を実行
      await handleRiverCircleClick();
    }
  };

  // 「PLACE YOUR BETS」メッセージ表示フラグ（次ゲーム開始時の案内用）
  const [showPlaceYourBets, setShowPlaceYourBets] = useState(false);

  return (
    <div className="game-board">
      <h1 className="title-in-board">
        🃏 Ultimate Texas Hold'em Poker Simulator
      </h1>
      {/* メインのゲームボードUIコンポーネント */}
      <GameBoard
        gamePhase={gamePhase}
        folded={folded}
        showdown={showdown}
        wallet={wallet}
        bets={bets}
        cards={cards}
        placedChips={placedChips}
        resultText={resultText}
        history={history}
        showTutorial={showTutorial}
        tutorialStage={tutorialStage}
        tutorialHidden={tutorialHidden}
        selectedArea={selectedArea}
        setSelectedArea={setSelectedArea}
        credit={credit}
        debit={debit}
        // カード画像ロード完了時のコールバック
        playerCardLoadCallback={playerCardLoadCallback}
        dealerCardLoadCallback={dealerCardLoadCallback}
        boardCardLoadCallback={boardCardLoadCallback}
        // BetCircleエリアのクリックハンドラ
        onFlopBet={handleFlopCircleClick}
        onTurnBet={handleTurnCircleClick}
        onRiverBet={handleRiverCircleClick}
        // チュートリアル矢印表示に使用する ref
        flopRef={flopRef}
        foldRef={foldRef}
        checkRef={checkBtnRef}
        playAgainRef={playAgainBtnRef}
        // （startボタンとwelcomeボタンのrefはGameControls側で使用）
      />
      {/* ゲーム操作ボタン類のコンポーネント */}
      <GameControls
        gamePhase={gamePhase}
        folded={folded}
        showTutorial={showTutorial}
        tutorialStage={tutorialStage}
        onFold={handleFoldClick}
        onCheck={handleCheck}
        onBet={handleBet}
        onStart={handleGameStart}
        onTopUp={handleTopUp}
        onPlayAgain={handlePlayAgain}
        // ボタン要素に ref を付与してチュートリアル矢印に使う
        foldRef={foldRef}
        checkRef={checkBtnRef}
        startRef={startBtnRef}
        playAgainRef={playAgainBtnRef}
        welcomeRef={welcomeBtnRef}
      />
      {/* 次ゲーム開始案内のオーバーレイ */}
      {showPlaceYourBets && (
        <div className="place-bets-overlay">PLACE YOUR BETS Please!</div>
      )}
      {/* 初回のみ「Welcome Bonus」ボタンを示す矢印 */}
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
          <RefPointer targetRef={welcomeBtnRef} corner="NE" durationMs={1600} />
        </div>
      )}
      {/* チュートリアル：開始ボタンを示す矢印（Stage4） */}
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
          <RefPointer targetRef={startBtnRef} corner="NE" durationMs={1600} />
        </div>
      )}
      {/* チュートリアル：Stage5（FLOP/FOLD）の矢印案内 */}
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
      {/* チュートリアル：Stage6（TURN/CHECK）の矢印案内 */}
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
      {/* チュートリアル：Stage7（RIVER/CHECK）の矢印案内 */}
      {showTutorial &&
        tutorialStage === 7 &&
        (gamePhase === 'turn' || gamePhase === 'showdown') &&
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
      {/* 現在の成績・履歴パネル */}
      <StatsPanel
        history={history}
        style={{ position: 'absolute', ...POS.ui.statsPanel }}
      />
      {/* （以下はデバッグ用UI、必要に応じて削除可能） */}
      <div style={{ marginTop: '1rem', borderTop: '1px dashed #ccc' }}>
        <button
          onClick={() =>
            addHand({
              playerCards: ['Ah', 'Kd'],
              dealerCards: ['7c', '7d'],
              community: ['2h', '5s', '9d', 'Qs', 'Jc'],
              resultText: 'Demo Save',
              payout: 0,
            })
          }
        >
          + Dummy Hand
        </button>
        <button onClick={wipe} style={{ marginLeft: '0.5rem' }}>
          Clear History
        </button>
        <span style={{ marginLeft: '1rem' }}>現在 {history.length} 件</span>
      </div>
      <button
        onClick={() =>
          setWallet({
            id: 1,
            chips: 0,
            welcomeClaimed: false,
            tutorialCompleted: false,
          })
        }
        style={{ position: 'fixed', bottom: 8, right: 8 }}
      >
        RESET&nbsp;WALLET
      </button>
    </div>
  );
}

export default App;
