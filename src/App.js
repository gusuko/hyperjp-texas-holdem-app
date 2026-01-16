// App.js
// 👉 アプリ全体の中枢コンポーネント。表示の切り替えやロジックの接着を担う

import React, { useState, useReducer } from 'react';
import { initialState, reducer } from './state';
import useHandHistory from './hooks/useHandHistory';
import ResultPanel from './components/ResultPanel';
import StatsPanel from './components/StatsPanel';
import { setWallet } from './data/handHistoryRepo';
import { handleStartGameWithChecks } from './utils/gameStart';
import {
  handleFlopBet,
  handleTurnBet,
  handleRiverBet,
  handleCheckTurn,
  handleCheckRiver,
  handleFold,
} from './utils/betActions';
import useShowdownLogic from './hooks/useShowdownLogic'; // ← 勝敗判定ロジックのHook

import ChipSelector from './components/ChipSelector';
import './styles/App.css';
import BetCircle from './components/BetCircle';
import { POS } from './constants/layoutConfig';
import CardSlot from './components/CardSlot';
import { convertToChips, getTotalBet } from './utils/chipHelpers';
import CardGroup from './components/CardGroup';
import { restartRound } from './utils/gameReset';
import PayoutTable from './components/PayoutTable';
import { bonusPayouts, jackpotPayouts } from './constants/payouts';
import CurrentChips from './components/CurrentChips';
import useWallet from './hooks/useWallet';
import { playBetSound, playPlaceYourBetsSound } from './utils/sound';
import sleep from './utils/sleep';
import { initWallet } from './data/handHistoryRepo';
import TutorialPointers from './components/TutorialPointers';
import useAutoScale from './hooks/useAutoScale';

function App() {
  useAutoScale();
  // --- 初回起動で wallet 行を確実に作成 ---
  React.useEffect(() => {
    initWallet();
  }, []);

  // 🎯 状態（ステート）管理
  /* 円がクリック不可かどうかを判定 */
  const isCircleDisabled = (area) => {
    if (wallet.chips === 0) return true; // Welcome 前は全部ロック
    if (!showTutorial) return false; // チュートリアル後は解放

    // チュートリアル中はステージに合った円だけ解放
    if (area === 'ante') return tutorialStage !== 1;
    if (area === 'bonus') return tutorialStage !== 2;
    if (area === 'jackpot') return tutorialStage !== 3;
    return false; // それ以外
  };
  /* -------------------  手アイコン座標  ------------------- */
  const anteCenter = {
    x: POS.bet.ante.left + 35,
    y: POS.bet.ante.top + 35,
  };
  const bonusCenter = {
    x: POS.bet.bonus.left + 35,
    y: POS.bet.bonus.top + 35,
  };

  const jackpotCenter = {
    x: POS.bet.jackpot.left + 35,
    y: POS.bet.jackpot.top + 35,
  };

  /* 5ドルチップは chipOptions[0] (index 0) の中央 */
  const chip5Center = {
    x: POS.ui.selector.left + 35, // 左端 + 半径
    y: POS.ui.selector.top + 35,
  };

  /* ChipSelector パネル左上＋(1チップ分＋gap) ＝ 25$ チップ中央 */
  const chip25Center = {
    x: POS.ui.selector.left + 70 + 8 + 35, // 70=chip幅, 8=gap, 35=半径
    y: POS.ui.selector.top + 35,
  };

  const flopCenter = {
    x: POS.bet.flop.left + 35, // 直径70前提の半径
    y: POS.bet.flop.top + 35,
  };

  const [state, dispatch] = useReducer(reducer, initialState);
  const [tutorialStage, setTutorialStage] = useState(1);
  const { history, addHand, wipe } = useHandHistory();
  const { wallet, credit, debit, refresh } = useWallet();
  /* 残高 0（Welcome 前）またはチュートリアル中は円をロック */
  const { deck, cards, bets, phase: gamePhase, folded, showdown } = state;
  const [resultText, setResultText] = useState('');
  const [selectedArea, setSelectedArea] = useState(null);
  const { placedChips } = state;
  const [showTutorial, setShowTutorial] = useState(false);
  // Stage5: FLOP/FOLD ピンポン用
  const flopRef = React.useRef(null);
  const foldRef = React.useRef(null);
  const playAgainBtnRef = React.useRef(null);
  // Stage6: TURN/CHECK ピンポン用
  const checkBtnRef = React.useRef(null);
  const [tutorialHidden, setTutorialHidden] = React.useState(false);

  // TURN 円の中心（HandPointer 用）
  const turnCenter = {
    x: POS.bet.turn.left + 35,
    y: POS.bet.turn.top + 35,
  };

  // RIVER 円の中心（★これに差し替え）
  const riverCenter = {
    x: POS.bet.river.left + 35,
    y: POS.bet.river.top + 35,
  };
  const welcomeBtnRef = React.useRef(null);

  // 初回だけ WELCOME ボタンに矢印（initial、残高0、welcome未受領、かつオーバーレイ非表示）
  const showWelcomePointer =
    gamePhase === 'initial' &&
    wallet?.chips === 0 &&
    wallet?.welcomeClaimed === false &&
    !showTutorial;

  const startBtnRef = React.useRef(null);

  // Start の矢印は tutorial 中 かつ JACKPOT 後のみ（= stage 4 以上）
  const showStartPointer =
    showTutorial === true && gamePhase === 'initial' && tutorialStage >= 4;

  const [showPlaceYourBets, setShowPlaceYourBets] = useState(false);
  const [playerCardLoadCallback, setPlayerCardLoadCallback] = useState(
    () => () => {}
  );
  const [dealerCardLoadCallback, setDealerCardLoadCallback] = useState(
    () => () => {}
  );
  const [boardCardLoadCallback, setBoardCardLoadCallback] = useState(
    () => () => {}
  );
  const handleTopUp = async () => {
    if (!wallet.welcomeClaimed && wallet.chips === 0) {
      /* --- 初回 Welcome --- */
      const newChips = wallet.chips + 1000; // 今の残高 +1000
      await setWallet({ id: 1, chips: newChips, welcomeClaimed: true });
      refresh();
      // ★ まだチュートリアル未完了なら表示フラグを ON
      if (!wallet.tutorialCompleted) setShowTutorial(true);
      console.log('✅ showTutorial ON');
    } else {
      /* --- 2 回目以降（広告予定） --- */
      // await showRewardedAd();
      credit(1000);
    }
  };

  /* -------------------  チュートリアル自動進行  ------------------- */
  React.useEffect(() => {
    if (!showTutorial) return; // チュートリアル外は何もしない
    if (gamePhase !== 'initial') return; // ← これが肝：初期画面以外では進めない

    const anteDone = getTotalBet(placedChips, 'ante') >= 25;
    const bonusDone = getTotalBet(placedChips, 'bonus') >= 25;
    const jackpotDone = getTotalBet(placedChips, 'jackpot') >= 5;

    // ステージごとに条件を満たしたら次へ
    if (tutorialStage === 1 && anteDone) {
      setTutorialStage(2);
      setSelectedArea(null);
    } else if (tutorialStage === 2 && bonusDone) {
      setTutorialStage(3);
      setSelectedArea(null);
    } else if (tutorialStage === 3 && jackpotDone) {
      setTutorialStage(4); // Start 誘導へ
      setSelectedArea(null);
    }
  }, [showTutorial, tutorialStage, placedChips, gamePhase]);

  // 🧠 勝敗ロジックをカスタムHookで呼び出し
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

  const handlePlayAgain = async () => {
    setTutorialHidden(false); // 矢印の一時非表示フラグだけ解除
    // チュートリアル矢印をリセット
    setShowTutorial(false);
    setTutorialStage(0);

    restartRound({
      dispatch,
      setResultText,
      placedChips: state.placedChips,
    });
    await sleep(600);
    playPlaceYourBetsSound();
    setShowPlaceYourBets(true);
    setTimeout(() => setShowPlaceYourBets(false), 1500);

    // 追加：次ハンドに入る前に選択をクリア（ガイドを正常表示させる）
    setSelectedArea(null);

    if (showTutorial) {
      setTutorialStage(1);
      setSelectedArea(null);
    }
  };

  const handleGameStart = async () => {
    // ① 最低ANTEチェック
    const ante = state.placedChips.ante.reduce((s, c) => s + c.value, 0);
    if (ante < 25) {
      alert('ANTE は最低 $25 必要です');
      return;
    }

    // ② 画面からスタート系UIを隠す
    dispatch({ type: 'SET_PHASE', phase: 'starting' });

    // ③ 元の開始処理
    await handleStartGameWithChecks({
      placedChips: state.placedChips,
      dispatch,
      setResultText,
      setPlayerCardLoadCallback,
      setDealerCardLoadCallback,
    });

    // ④ チュートリアル継続 → Stage5へ（FLOP/FOLD）
    if (showTutorial) {
      setTutorialStage(5);
    }
  };

  // ✅ FLOP 円クリックで ANTE × 2 の自動ベット
  const handleFlopCircleClick = async () => {
    const betAmount = bets.ante * 2;
    setTutorialHidden(true);

    if (
      gamePhase === 'preflop' &&
      bets.flop === 0 &&
      wallet.chips >= betAmount
    ) {
      const chipsToPlace = convertToChips(betAmount);
      chipsToPlace.sort((a, b) => a.value - b.value); // 小さい順！
      debit(betAmount);
      dispatch({
        type: 'SET_PLACED_CHIPS',
        area: 'flop',
        chips: chipsToPlace,
      });
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
      // ④ FLOP ベット完了 → Tutorial を Stage6 へ（TURN/CHECK）
      if (showTutorial) {
        setTutorialStage(6);
        setTutorialHidden(false);
      }
    }
  };

  // ✅ チェック（flop/turn 両対応）
  const handleCheckClick = async () => {
    setTutorialHidden(true); // 押した瞬間に矢印オフ
    if (gamePhase === 'flop') {
      // FLOPでCHECK → ターンカード公開 & フェーズ進行
      await handleCheckTurn({
        deck,
        dispatch,
        setBoardCardLoadCallback,
        cards,
      });
      // Tutorial中は、TURN へ入ったら Stage7（RIVER/CHECK）を解放
      if (showTutorial) {
        setTutorialStage(7); // TURN へ進行
        setTutorialHidden(false); // Stage7 で再表示
      }
    } else if (gamePhase === 'turn') {
      // TURNでCHECK → リバーカード公開（＝RIVERへ）
      await handleCheckRiver({
        deck,
        dispatch,
        setBoardCardLoadCallback,
        cards,
      });
      // （この時点でRIVERへ進行。チュートリアルの終了判定は次のステップで調整予定）
    }
  };

  // ✅ TURN 円クリックで ANTE × 1 の自動ベット
  const handleTurnCircleClick = async () => {
    const betAmount = bets.ante;

    if (gamePhase === 'flop' && bets.turn === 0 && wallet.chips >= betAmount) {
      setTutorialHidden(true);

      debit(betAmount);
      const chipsToPlace = convertToChips(betAmount);
      chipsToPlace.sort((a, b) => a.value - b.value);

      dispatch({
        type: 'SET_PLACED_CHIPS',
        area: 'turn',
        chips: chipsToPlace,
      });
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
      // ★ TURN ベット直後に Stage7 へ
      if (showTutorial) {
        setTutorialStage(7);
        setTutorialHidden(false);
      }
    }
  };

  // ✅ RIVER 円クリックで ANTE × 1 の自動ベット
  const handleRiverCircleClick = async () => {
    setTutorialHidden(true);
    const betAmount = bets.ante;

    if (gamePhase === 'turn' && bets.river === 0 && wallet.chips >= betAmount) {
      debit(betAmount);
      const chipsToPlace = convertToChips(betAmount);
      chipsToPlace.sort((a, b) => a.value - b.value); // 小さい順！

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
    }
  };

  return (
    <div className="app-shell">
      {/* ===== 左：盤面（縮小・座標系の世界） ===== */}
      <div className="board-wrap">
        <div className="game-board">
          {/* === ここに「盤面に残したいもの」だけ入れる === */}
          {/* 例：タイトル、CurrentChips、CardSlot、CardGroup、BetCircle、ChipSelector、Welcome、FOLD/CHECK/START/PLAYAGAIN、TutorialPointers、overlay等 */}

          {/* --- ここから下、君の既存の <div className="game-board"> の中身をコピペ --- */}
          <h1 className="title-in-board">
            🃏 Ultimate Texas Hold'em Poker Simulator
          </h1>

          <CurrentChips
            chips={wallet.chips}
            style={{ position: 'absolute', ...POS.ui.chips }}
          />

          {POS.cardSlot.dealer.map((pos, i) => (
            <CardSlot key={`slot-d${i}`} style={pos} />
          ))}
          {POS.cardSlot.player.map((pos, i) => (
            <CardSlot key={`slot-p${i}`} style={pos} />
          ))}
          {POS.cardSlot.community.map((pos, i) => (
            <CardSlot key={`slot-c${i}`} style={pos} />
          ))}

          <CardGroup
            onCardLoad={dealerCardLoadCallback}
            cards={cards.dealer}
            positions={POS.cardSlot.dealer}
            facedown={!showdown}
          />
          <CardGroup
            onCardLoad={boardCardLoadCallback}
            cards={cards.board}
            positions={POS.cardSlot.community}
          />
          <CardGroup
            onCardLoad={playerCardLoadCallback}
            cards={cards.player}
            positions={POS.cardSlot.player}
          />

          {/* ベット円…（このまま全部ここに残してOK） */}
          {/* ChipSelector / Welcome / Fold / Check / Start / PlayAgain / TutorialPointers もここ */}
          {/* --- ここまで --- */}
        </div>
      </div>

      {/* ===== 右：Web UI（普通のHTMLの世界） ===== */}
      <aside className="side-ui">
        {/* ここに「盤面の外に出したいもの」だけ置く */}

        {/* BONUS / JACKPOT 払い戻し表 */}
        <PayoutTable uiKey="bonusTable" title="B O N U S" data={bonusPayouts} />
        <PayoutTable
          uiKey="jackpotTable"
          title="J A C K P O T"
          data={jackpotPayouts}
        />

        {/* 結果・履歴（ResultPanelがhistoryも持ってるならここに置くのが楽） */}
        <ResultPanel
          showdown={showdown}
          folded={folded}
          resultText={resultText}
          history={history}
          onPlayAgain={handlePlayAgain}
        />

        {/* Stats */}
        <StatsPanel history={history} />

        {/* Debug はここ（盤面外だから邪魔しない） */}
        {process.env.NODE_ENV === 'development' && (
          <button
            onClick={() =>
              setWallet({
                id: 1,
                chips: 0,
                welcomeClaimed: false,
                tutorialCompleted: false,
              })
            }
          >
            RESET&nbsp;WALLET
          </button>
        )}

        {/* Dummy/Clear もここに逃がすと盤面が汚れない */}
        <div style={{ borderTop: '1px dashed #ccc', paddingTop: 8 }}>
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
          <button onClick={wipe} style={{ marginLeft: 8 }}>
            Clear History
          </button>
          <span style={{ marginLeft: 12 }}>現在 {history.length} 件</span>
        </div>
      </aside>
    </div>
  );
}

export default App;
