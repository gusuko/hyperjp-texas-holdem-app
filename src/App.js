// App.js
import React, { useState, useReducer } from 'react';
import HandPointer from './components/HandPointer';
import { initialState, reducer } from './state';
import useHandHistory from './hooks/useHandHistory';
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
import RefPointer from './components/RefPointer';
import useAutoScale from './hooks/useAutoScale';
import GameControls from './components/GameControls';
import GameBoard from './components/GameBoard';

function App() {
  useAutoScale();

  // Ensure wallet entry exists on first launch
  React.useEffect(() => {
    initWallet();
  }, []);

  // State management
  const [state, dispatch] = useReducer(reducer, initialState);
  const [tutorialStage, setTutorialStage] = useState(1);
  const { history, addHand, wipe } = useHandHistory();
  const { wallet, credit, debit, refresh } = useWallet();
  const { deck, cards, bets, phase: gamePhase, folded, showdown } = state;
  const [resultText, setResultText] = useState('');
  const [selectedArea, setSelectedArea] = useState(null);
  const { placedChips } = state;
  const [showTutorial, setShowTutorial] = useState(false);
  const [tutorialHidden, setTutorialHidden] = useState(false);
  const [showPlaceYourBets, setShowPlaceYourBets] = useState(false);

  // Refs for tutorial pointers and buttons
  const flopRef = React.useRef(null);
  const foldRef = React.useRef(null);
  const playAgainBtnRef = React.useRef(null);
  const checkBtnRef = React.useRef(null);
  const welcomeBtnRef = React.useRef(null);
  const startBtnRef = React.useRef(null);
  const boardRef = React.useRef(null); // **Added boardRef**

  // Disable bet circles based on stage (tutorial locks others)
  const isCircleDisabled = (area) => {
    if (wallet.chips === 0) return true;
    if (!showTutorial) return false;
    if (area === 'ante') return tutorialStage !== 1;
    if (area === 'bonus') return tutorialStage !== 2;
    if (area === 'jackpot') return tutorialStage !== 3;
    return false;
  };

  // Tutorial auto-progress: advance stage when bets are placed
  React.useEffect(() => {
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
      setTutorialStage(4); // enable Start button stage
      setSelectedArea(null);
    }
  }, [showTutorial, tutorialStage, placedChips, gamePhase]);

  // Showdown logic hook
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

  // Event handlers (bets and actions)
  const handleTopUp = async () => {
    if (!wallet.welcomeClaimed && wallet.chips === 0) {
      // First-time welcome bonus
      const newChips = wallet.chips + 1000;
      await setWallet({ id: 1, chips: newChips, welcomeClaimed: true });
      refresh();
      if (!wallet.tutorialCompleted) setShowTutorial(true);
      console.log('✅ showTutorial ON');
    } else {
      // Subsequent top-ups (e.g., via ad reward)
      credit(1000);
    }
  };

  const handlePlayAgain = async () => {
    setTutorialHidden(false);
    setShowTutorial(false);
    setTutorialStage(0);
    restartRound({ dispatch, setResultText, placedChips: state.placedChips });
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
    const anteTotal = state.placedChips.ante.reduce((s, c) => s + c.value, 0);
    if (anteTotal < 25) {
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
    if (showTutorial) {
      setTutorialStage(5);
    }
  };

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

  const handleCheckClick = async () => {
    setTutorialHidden(true);
    if (gamePhase === 'flop') {
      // FLOP phase: checking reveals turn card without additional bet
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
      // TURN phase: checking reveals river card
      await handleCheckRiver({
        deck,
        dispatch,
        setBoardCardLoadCallback,
        cards,
      });
      // (GamePhase will become 'river' after this)
    }
  };

  // Card load callbacks for animations
  const [playerCardLoadCallback, setPlayerCardLoadCallback] = useState(
    () => () => {}
  );
  const [dealerCardLoadCallback, setDealerCardLoadCallback] = useState(
    () => () => {}
  );
  const [boardCardLoadCallback, setBoardCardLoadCallback] = useState(
    () => () => {}
  );

  return (
    <>
      {' '}
      {/* Use fragment as wrapper */}
      <GameBoard
        boardRef={boardRef}
        walletChips={wallet.chips}
        welcomeClaimed={wallet.welcomeClaimed}
        dealerCards={cards.dealer}
        boardCards={cards.board}
        playerCards={cards.player}
        showdown={showdown}
        placedChips={placedChips}
        gamePhase={gamePhase}
        selectedArea={selectedArea}
        setSelectedArea={setSelectedArea}
        credit={credit}
        debit={debit}
        dispatch={dispatch}
        onFlopClick={handleFlopCircleClick}
        onTurnClick={handleTurnCircleClick}
        onRiverClick={handleRiverCircleClick}
        onTopUp={handleTopUp}
        onGameStart={handleGameStart}
        onFold={() => {
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
        onPlayAgain={handlePlayAgain}
        onCheck={handleCheckClick}
        showPlaceYourBets={showPlaceYourBets}
        history={history}
        resultText={resultText}
        folded={folded}
        // Pass refs for internal components (tutorial pointers)
        flopRef={flopRef}
        foldRef={foldRef}
        checkBtnRef={checkBtnRef}
        playAgainBtnRef={playAgainBtnRef}
        welcomeBtnRef={welcomeBtnRef}
        // Tutorial state
        showTutorial={showTutorial}
        tutorialStage={tutorialStage}
        tutorialHidden={tutorialHidden}
        // Card load callbacks
        dealerCardLoadCallback={dealerCardLoadCallback}
        boardCardLoadCallback={boardCardLoadCallback}
        playerCardLoadCallback={playerCardLoadCallback}
      />
      <GameControls
        gamePhase={gamePhase}
        wallet={wallet}
        handleGameStart={handleGameStart}
        deck={state.deck}
        handleFold={() => {
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
        handleCheckTurn={handleCheckTurn}
        handleCheckRiver={handleCheckRiver}
        handlePlayAgain={handlePlayAgain}
        handleTopUp={handleTopUp}
      />
      {/* Start Game button (shown in initial phase) */}
      {gamePhase === 'initial' && (
        <>
          <button
            ref={startBtnRef}
            className={`btn-start ${showTutorial ? 'disabled-btn' : ''}`}
            onClick={handleGameStart}
            disabled={showTutorial ? tutorialStage < 4 : false}
            style={{ position: 'absolute', ...POS.ui.start }}
          >
            🎮 <br />S T A R T
          </button>
          {/* Tutorial pointer to START button */}
          {showTutorial && tutorialStage >= 4 && (
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
                targetRef={startBtnRef}
                corner="NE"
                durationMs={1600}
              />
            </div>
          )}
        </>
      )}
    </>
  );
}

export default App;
