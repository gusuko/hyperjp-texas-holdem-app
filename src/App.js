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
import useShowdownLogic from './hooks/useShowdownLogic';

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

  const [state, dispatch] = useReducer(reducer, initialState);
  const [tutorialStage, setTutorialStage] = useState(1);
  const { history, addHand, wipe } = useHandHistory();
  const { wallet, credit, debit, refresh } = useWallet();
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
  const welcomeBtnRef = React.useRef(null);
  const startBtnRef = React.useRef(null);

  /* ------------------- 円がクリック不可かどうか ------------------- */
  const isCircleDisabled = (area) => {
    if (wallet.chips === 0) return true; // Welcome 前は全部ロック
    if (!showTutorial) return false; // チュートリアル後は解放

    // チュートリアル中はステージに合った円だけ解放
    if (area === 'ante') return tutorialStage !== 1;
    if (area === 'bonus') return tutorialStage !== 2;
    if (area === 'jackpot') return tutorialStage !== 3;
    return false;
  };

  /* -------------------  HandPointer 用座標  ------------------- */
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

  // 初回だけ WELCOME ボタンに矢印
  const showWelcomePointer =
    gamePhase === 'initial' &&
    wallet?.chips === 0 &&
    wallet?.welcomeClaimed === false &&
    !showTutorial;

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
      const newChips = wallet.chips + 1000;
      await setWallet({ id: 1, chips: newChips, welcomeClaimed: true });
      refresh();
      if (!wallet.tutorialCompleted) setShowTutorial(true);
    } else {
      credit(1000);
    }
  };

  /* -------------------  チュートリアル自動進行  ------------------- */
  React.useEffect(() => {
    if (!showTutorial) return;
    if (gamePhase !== 'initial') return;

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

  // 勝敗ロジック
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
    setTutorialHidden(false);
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

    setSelectedArea(null);

    if (showTutorial) {
      setTutorialStage(1);
      setSelectedArea(null);
    }
  };

  const handleGameStart = async () => {
    const ante = state.placedChips.ante.reduce((s, c) => s + c.value, 0);
    if (ante < 25) {
      alert('ANTE は最低 $25 必要です');
      return;
    }

    dispatch({ type: 'SET_PHASE', phase: 'starting' });

    await handleStartGameWithChecks({
      placedChips: state.placedChips,
      dispatch,
      setResultText,
      setPlayerCardLoadCallback,
      setDealerCardLoadCallback,
    });

    if (showTutorial) setTutorialStage(5);
  };

  // FLOP: ANTE×2
  const handleFlopCircleClick = async () => {
    const betAmount = bets.ante * 2;
    setTutorialHidden(true);

    if (
      gamePhase === 'preflop' &&
      bets.flop === 0 &&
      wallet.chips >= betAmount
    ) {
      const chipsToPlace = convertToChips(betAmount).sort(
        (a, b) => a.value - b.value
      );
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

      if (showTutorial) {
        setTutorialStage(6);
        setTutorialHidden(false);
      }
    }
  };

  // CHECK
  const handleCheckClick = async () => {
    setTutorialHidden(true);

    if (gamePhase === 'flop') {
      await handleCheckTurn({
        deck,
        dispatch,
        setBoardCardLoadCallback,
        cards,
      });
      if (showTutorial) {
        setTutorialStage(7);
        setTutorialHidden(false);
      }
    } else if (gamePhase === 'turn') {
      await handleCheckRiver({
        deck,
        dispatch,
        setBoardCardLoadCallback,
        cards,
      });
    }
  };

  // TURN: ANTE×1
  const handleTurnCircleClick = async () => {
    const betAmount = bets.ante;

    if (gamePhase === 'flop' && bets.turn === 0 && wallet.chips >= betAmount) {
      setTutorialHidden(true);

      debit(betAmount);
      const chipsToPlace = convertToChips(betAmount).sort(
        (a, b) => a.value - b.value
      );
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

      if (showTutorial) {
        setTutorialStage(7);
        setTutorialHidden(false);
      }
    }
  };

  // RIVER: ANTE×1
  const handleRiverCircleClick = async () => {
    setTutorialHidden(true);
    const betAmount = bets.ante;

    if (gamePhase === 'turn' && bets.river === 0 && wallet.chips >= betAmount) {
      debit(betAmount);
      const chipsToPlace = convertToChips(betAmount).sort(
        (a, b) => a.value - b.value
      );

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
      {/* ===== 左：盤面外UI（BONUS / JACKPOT / STATS） ===== */}
      <aside className="side-ui left-ui">
        <PayoutTable uiKey="bonusTable" title="B O N U S" data={bonusPayouts} />
        <PayoutTable
          uiKey="jackpotTable"
          title="J A C K P O T"
          data={jackpotPayouts}
        />
        <StatsPanel history={history} />
      </aside>

      {/* ===== 中央：盤面（固定＋スケール） ===== */}
      <div className="board-wrap">
        <div className="game-board">
          <h1 className="title-in-board">
            🃏 Ultimate Texas Hold&apos;em Poker Simulator
          </h1>

          <CurrentChips
            chips={wallet.chips}
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
            tutorialActive={showTutorial && tutorialStage === 1}
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
            isDisabled={isCircleDisabled('bonus')}
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
            isDisabled={isCircleDisabled('jackpot')}
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
            isDisabled={
              wallet.chips === 0 || (showTutorial && tutorialStage !== 6)
            }
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
            isDisabled={
              wallet.chips === 0 || (showTutorial && tutorialStage !== 7)
            }
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

          {/* 補充ボタン */}
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

          {/* フォールド（preflop でのみ表示） */}
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
              }}
              style={POS.ui.fold}
            >
              FOLD
            </button>
          )}

          {/* ゲーム開始ボタン（初期フェーズのみ） */}
          {gamePhase === 'initial' && (
            <button
              ref={startBtnRef}
              className={`btn-start ${showTutorial ? 'disabled-btn' : ''}`}
              onClick={handleGameStart}
              disabled={showTutorial ? tutorialStage < 4 : false}
              style={{ position: 'absolute', ...POS.ui.start }}
            >
              🎮 <br />S T A R T
            </button>
          )}

          {/* ショーダウン後：PLAY AGAIN */}
          {gamePhase === 'showdown' && (
            <button
              ref={playAgainBtnRef}
              className="playagain-btn"
              onClick={handlePlayAgain}
              style={POS.ui.fold}
            >
              PLAY&nbsp;AGAIN
            </button>
          )}

          {showPlaceYourBets && (
            <div className="place-bets-overlay">PLACE YOUR BETS Please!</div>
          )}

          {/* チェック（flop/turn のみ） */}
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

          {/* チュートリアルポインタ */}
          <TutorialPointers
            showTutorial={showTutorial}
            tutorialStage={tutorialStage}
            gamePhase={gamePhase}
            tutorialHidden={tutorialHidden}
            selectedArea={selectedArea}
            placedChips={placedChips}
            centers={{
              ante: anteCenter,
              bonus: bonusCenter,
              jackpot: jackpotCenter,
              chip5: chip5Center,
              chip25: chip25Center,
              flop: flopCenter,
              turn: turnCenter,
              river: riverCenter,
            }}
            refs={{
              foldRef,
              checkBtnRef,
              startBtnRef,
              playAgainBtnRef,
              welcomeBtnRef,
            }}
            showWelcomePointer={showWelcomePointer}
            showStartPointer={showStartPointer}
          />
        </div>
      </div>

      {/* ===== 右：盤面外UI（RESULT / HISTORY） ===== */}
      <aside className="side-ui right-ui">
        <div className="right-top">
          <ResultPanel
            showdown={showdown}
            folded={folded}
            resultText={resultText}
            history={history}
            onPlayAgain={handlePlayAgain}
          />
        </div>

        <div className="right-bottom">
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
              RESET WALLET
            </button>
          )}

          <div className="debug-row">
            <button onClick={() => addHand(/*...*/)}>+ Dummy Hand</button>
            <button onClick={wipe}>Clear History</button>
            <span className="debug-count">現在 {history.length} 件</span>
          </div>
        </div>
      </aside>
    </div>
  );
}

export default App;
