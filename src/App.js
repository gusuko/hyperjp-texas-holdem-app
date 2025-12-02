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
import useTutorial from './hooks/useTutorial';
import TutorialOverlay from './components/TutorialOverlay';

/* 画面に合わせて “タイトル帯を除いた残りエリア” だけで拡縮 */
/* 画面サイズ変化に合わせて --game-scale と --title-gap を更新 */
/* 画面サイズに応じて
 *   ① --game-scale を更新
 *   ② 最小倍率を下回ったら <html> に too-small クラスを付ける
 */
function useAutoScale() {
  const BOARD_W = 1800,
    BOARD_H = 1100;
  const MIN_SCALE = 0.4; // ボードがこれ以下には縮まない
  const MIN_PLAYABLE = 0.55; // 警告を出す閾値

  React.useLayoutEffect(() => {
    const upd = () => {
      let s = Math.min(
        window.innerWidth / BOARD_W,
        window.innerHeight / BOARD_H
      );
      s = Math.max(s, MIN_SCALE);

      //   document.documentElement.style.setProperty('--game-scale', s);
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

  const [state, dispatch] = useReducer(reducer, initialState);
  const { deck, cards, bets, phase: gamePhase, folded, showdown } = state;

  const {
    showTutorial,
    setShowTutorial,
    tutorialStage,
    setTutorialStage,
    tutorialHidden,
    setTutorialHidden,
    onFoldInTutorial,
    tutorialCompleted,
    setTutorialCompleted,
    nudgeIndex2,
    nudgeIndex3,
    nudgeIndex5,
    nudgeIndex6,
    nudgeIndex7,
  } = useTutorial(gamePhase, { show: false, stage: 0 });

  const { history, addHand, wipe } = useHandHistory();
  const { wallet, credit, debit, refresh } = useWallet();
  const [resultText, setResultText] = useState('');
  const [selectedArea, setSelectedArea] = useState(null);
  const { placedChips } = state;
  const anteBetTotal = getTotalBet(placedChips, 'ante');
  const jackpotBetTotal = getTotalBet(placedChips, 'jackpot');
  // Stage5: FLOP/FOLD ピンポン用
  const flopRef = React.useRef(null);
  const foldRef = React.useRef(null);
  const playAgainBtnRef = React.useRef(null);
  // Stage6: TURN/CHECK ピンポン用
  const checkBtnRef = React.useRef(null);

  const welcomeBtnRef = React.useRef(null);

  // 初回だけ WELCOME ボタンに矢印（initial、残高0、welcome未受領、かつオーバーレイ非表示）
  const showWelcomePointer =
    gamePhase === 'initial' &&
    wallet?.chips === 0 &&
    wallet?.welcomeClaimed === false &&
    !showTutorial;

  const startBtnRef = React.useRef(null);

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
      console.log(
        'DEBUG: tutorial開始 showTutorial=',
        true,
        'stage=',
        tutorialStage
      );
      console.log('✅ showTutorial ON');
    } else {
      /* --- 2 回目以降（広告予定） --- */
      // await showRewardedAd();
      credit(1000);
    }
  };

  /* -------------------  チュートリアル自動進行  ------------------- */

  React.useEffect(() => {
    if (!showTutorial) return;
    if (tutorialCompleted) return;
    if (gamePhase !== 'initial') return;
    if (!folded) return;
    if (tutorialStage === 1) return;

    setTutorialHidden(false);
    setTutorialStage(1);
  }, [
    gamePhase,
    folded,
    showTutorial,
    tutorialCompleted,
    tutorialStage,
    setTutorialHidden,
    setTutorialStage,
  ]);

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showTutorial, tutorialStage, placedChips, gamePhase]);

  /**** Showdown に入ったら（チュートリアル継続中は）矢印を必ず再表示する ****/
  React.useEffect(() => {
    if (!showTutorial) return; // チュートリアル外は何もしない
    if (tutorialCompleted) return; // 完走後は出さない
    if (gamePhase !== 'showdown') return;

    // FOLDでショーダウンに来た直後でも、必ず Overlay を表示状態に戻す
    setTutorialHidden(false);
  }, [showTutorial, tutorialCompleted, gamePhase, setTutorialHidden]);

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
    // --- Tutorial 再開ロジック（最小） ---
    // 条件: 「チュートリアル未完了」かつ「前ハンドが fold で終了」
    if (!tutorialCompleted && folded) {
      setShowTutorial(true); // ← OFFにしない
      setTutorialHidden(false);
      setTutorialStage(1);
    } else {
      // それ以外は通常プレイ（チュートリアルOFF）
      setShowTutorial(false);
      setTutorialHidden(false);
      setTutorialStage(0);
    }

    setSelectedArea(null);

    // 以降は既存どおり
    restartRound({
      dispatch,
      setResultText,
      placedChips: state.placedChips,
    });
    await sleep(600);
    playPlaceYourBetsSound();
    setShowPlaceYourBets(true);
    setTimeout(() => setShowPlaceYourBets(false), 1500);

    setSelectedArea(null);
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

      // Tutorial: RIVER を抜けたので完走扱い
      if (showTutorial && tutorialStage >= 7 && !tutorialCompleted) {
        setTutorialCompleted(true);
      }
    }
  }; // ← ここで関数を閉じる

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
      if (showTutorial && tutorialStage >= 7 && !tutorialCompleted) {
        setTutorialCompleted(true);
        setTutorialHidden(true);
      }
    }
  };

  return (
    <div className="game-board">
      <h1 className="title-in-board">
        🃏 Ultimate Texas Hold'em Poker Simulator
      </h1>
      <CurrentChips
        chips={wallet.chips} // stateから渡す
        style={{ position: 'absolute', ...POS.ui.chips }}
      />
      {/* ① 枠（CardSlot） */}
      {POS.cardSlot.dealer.map((pos, i) => (
        <CardSlot key={`slot-d${i}`} style={pos} />
      ))}
      {POS.cardSlot.player.map((pos, i) => (
        <CardSlot key={`slot-p${i}`} style={pos} />
      ))}
      {POS.cardSlot.community.map((pos, i) => (
        <CardSlot key={`slot-c${i}`} style={pos} />
      ))}
      {/* ② カード */}
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
      {/* ---------- ベット円（6個） ---------- */}
      <BetCircle
        area="ante"
        total={getTotalBet(placedChips, 'ante')}
        chips={placedChips.ante}
        isActive={gamePhase === 'initial'}
        isSelected={selectedArea === 'ante'}
        onClick={() => setSelectedArea('ante')}
        style={POS.bet.ante}
        /* ステージ1だけ点滅させる */
        tutorialActive={showTutorial && tutorialStage === 1}
        /* ANTE は常にクリック可なので無効化しない */
        isDisabled={isCircleDisabled('ante')}
      />
      <BetCircle
        area="bonus"
        total={getTotalBet(placedChips, 'bonus')}
        chips={placedChips.bonus}
        isActive={gamePhase === 'initial'}
        isSelected={selectedArea === 'bonus'}
        onClick={() => setSelectedArea('bonus')}
        style={POS.bet.bonus}
        /* ステージ1の間はクリック無効化（半透明） */
        isDisabled={isCircleDisabled('bonus')}
        /* ステージ2だけ点滅させる */
        tutorialActive={showTutorial && tutorialStage === 2}
      />
      <BetCircle
        area="jackpot"
        total={getTotalBet(placedChips, 'jackpot')}
        chips={placedChips.jackpot}
        isActive={gamePhase === 'initial'}
        isSelected={selectedArea === 'jackpot'}
        onClick={() => setSelectedArea('jackpot')}
        style={POS.bet.jackpot}
        /* ステージ1・2 ではクリック無効。
     ステージ3（JACKPOTの番）だけクリック可にする */
        isDisabled={isCircleDisabled('jackpot')}
        /* ステージ3 だけ点滅させる */
        tutorialActive={showTutorial && tutorialStage === 3}
      />
      {/* FLOP */}
      <div ref={flopRef}>
        <BetCircle
          area="flop"
          total={getTotalBet(placedChips, 'flop')}
          chips={placedChips.flop}
          isActive={gamePhase === 'preflop'}
          isSelected={false}
          onClick={handleFlopCircleClick}
          style={POS.bet.flop}
          isDisabled={
            wallet.chips === 0 || (showTutorial && tutorialStage !== 5)
          }
        />
      </div>
      {/* TURN */}
      <BetCircle
        area="turn"
        total={getTotalBet(placedChips, 'turn')}
        chips={placedChips.turn}
        isActive={gamePhase === 'flop'}
        isSelected={false}
        onClick={handleTurnCircleClick}
        style={POS.bet.turn}
        // Tutorial中は Stage6 のときだけ TURN を有効化
        isDisabled={wallet.chips === 0 || (showTutorial && tutorialStage !== 6)}
      />

      {/* RIVER */}
      <BetCircle
        area="river"
        total={getTotalBet(placedChips, 'river')}
        chips={placedChips.river}
        isActive={gamePhase === 'turn'}
        isSelected={false}
        onClick={handleRiverCircleClick}
        style={POS.bet.river}
        isDisabled={wallet.chips === 0 || (showTutorial && tutorialStage !== 7)}
      />

      {/* チップ選択パネル */}
      <div className="chip-selector-panel" style={POS.ui.selector}>
        <ChipSelector
          chips={wallet.chips}
          dispatch={dispatch}
          placedChips={placedChips}
          gamePhase={gamePhase}
          onFlopClick={handleFlopCircleClick}
          onTurnClick={handleTurnCircleClick}
          onRiverClick={handleRiverCircleClick}
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
      {/* === 下段：補充ボタン === */}
      <button
        ref={welcomeBtnRef}
        className="recharge-btn"
        onClick={handleTopUp}
        style={{ position: 'absolute', ...POS.ui.recharge }}
        disabled={showTutorial}
      >
        {!wallet.welcomeClaimed && wallet.chips === 0
          ? 'WELCOME\n＋$1,000'
          : '＋$1,000'}
      </button>

      {/* BONUS 払い戻し表 */}
      <PayoutTable uiKey="bonusTable" title="B O N U S" data={bonusPayouts} />
      {/* JACKPOT 払い戻し表 */}
      <PayoutTable
        uiKey="jackpotTable"
        title="J A C K P O T"
        data={jackpotPayouts}
      />
      {/* ========= ここで table-wrapper を閉じる ========= */}
      {/* 勝敗テキスト */}
      <ResultPanel
        showdown={showdown}
        folded={folded}
        resultText={resultText}
        history={history}
        onPlayAgain={handlePlayAgain}
      />
      {/* ① フォールド（preflop でのみ表示） */}
      {!folded && gamePhase === 'preflop' && (
        <button
          ref={foldRef}
          className="fold-btn"
          onClick={() => {
            handleFold({
              dispatch,
              deck: state.deck,
              playerCards: state.playerCards,
              dealerCards: state.dealerCards,
              bets: state.bets,
              onHandComplete: addHand,
              onResult: setResultText,
              debit,
            });
            onFoldInTutorial();
          }}
          style={POS.ui.fold}
        >
          FOLD
        </button>
      )}

      {/* ゲーム開始ボタンは初期フェーズだけ表示 */}
      {gamePhase === 'initial' && (
        <>
          <button
            ref={startBtnRef}
            className={`btn-start ${showTutorial ? 'disabled-btn' : ''}`}
            onClick={handleGameStart}
            // tutorial 中は stage 3 未満なら押せない。3 以上になれば押せる。
            disabled={showTutorial ? tutorialStage < 4 : false}
            style={{ position: 'absolute', ...POS.ui.start }}
          >
            🎮 <br />S T A R T
          </button>
        </>
      )}
      {gamePhase === 'showdown' && (
        <>
          <button
            ref={playAgainBtnRef}
            className="playagain-btn"
            onClick={handlePlayAgain}
            style={POS.ui.fold}
          >
            PLAY&nbsp;AGAIN
          </button>
        </>
      )}

      {/* 再プレイボタン押した後の文字 */}
      {showPlaceYourBets && (
        <div className="place-bets-overlay">PLACE YOUR BETS Please!</div>
      )}
      {/* 円形チェックボタン：flop または turn フェーズのみ */}
      {!folded && (gamePhase === 'flop' || gamePhase === 'turn') && (
        <button
          ref={checkBtnRef}
          className="check-btn"
          onClick={handleCheckClick}
          style={POS.ui.check}
        >
          チェック
        </button>
      )}

      {/* ===== Stage7: RIVER / CHECK のピンポン矢印 ===== */}
      <TutorialOverlay
        show={showTutorial}
        stage={tutorialStage}
        gamePhase={gamePhase}
        hidden={tutorialHidden}
        selectedArea={selectedArea}
        anteBetTotal={anteBetTotal}
        jackpotBetTotal={jackpotBetTotal}
        nudgeIndex2={nudgeIndex2}
        nudgeIndex3={nudgeIndex3}
        nudgeIndex5={nudgeIndex5}
        nudgeIndex6={nudgeIndex6}
        nudgeIndex7={nudgeIndex7}
        checkBtnRef={checkBtnRef}
        foldRef={foldRef}
        startBtnRef={startBtnRef}
        showPlaceYourBets={showPlaceYourBets}
        welcomeBtnRef={welcomeBtnRef}
        showWelcomePointer={showWelcomePointer}
        playAgainBtnRef={playAgainBtnRef}
      />

      {/* ==== デバッグ: ハンド履歴テスト ==== */}
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
      {/* Debug only */}
      <button
        onClick={() =>
          setWallet({
            id: 1,
            chips: 0,
            welcomeClaimed: false,
            tutorialCompleted: false, // ←★ この行を追加
          })
        }
        style={{ position: 'fixed', bottom: 8, right: 8 }}
      >
        RESET&nbsp;WALLET
      </button>
      <StatsPanel
        history={history}
        style={{ position: 'absolute', ...POS.ui.statsPanel }}
      />
    </div>
  );
}

export default App;
