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
  const [state, dispatch] = useReducer(reducer, initialState);
  const { history, addHand, wipe } = useHandHistory();
  const { wallet, credit, debit, refresh } = useWallet();
  const { deck, cards, bets, phase: gamePhase, folded, showdown } = state;
  const [resultText, setResultText] = useState('');
  const [selectedArea, setSelectedArea] = useState('ante');
  const { placedChips } = state;
  const anteDone = getTotalBet(placedChips, 'ante') >= 25; // ANTE が $25 以上
  const bonusDone = getTotalBet(placedChips, 'bonus') >= 25; // BONUS が $25 以上
  const jackpotDone = getTotalBet(placedChips, 'jackpot') >= 25;
  const [showTutorial, setShowTutorial] = useState(false);
  const [tutorialStage, setTutorialStage] = useState(1);
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
    restartRound({
      dispatch,
      setResultText,
      placedChips: state.placedChips,
    });
    await sleep(600); // 0.6秒ディレイ
    playPlaceYourBetsSound(); // SE再生
    setShowPlaceYourBets(true);
    // 1.5秒後ぐらいに消す
    setTimeout(() => setShowPlaceYourBets(false), 1500);
  };

  const handleGameStart = async () => {
    /* ① 先に同期バリデーションだけする */
    const ante = state.placedChips.ante.reduce((s, c) => s + c.value, 0);
    if (ante < 25) {
      // ❌ NG → 何も変えない
      alert('ANTE は最低 $25 必要です');
      return;
    }

    /* ② 合格したら即フェーズを 'starting' にして
            Reset / Start を画面から消す */
    dispatch({ type: 'SET_PHASE', phase: 'starting' });

    /* ③ 重い処理を走らせる（元の関数をそのまま呼ぶ）*/
    await handleStartGameWithChecks({
      placedChips: state.placedChips,
      dispatch,
      setResultText,
      setPlayerCardLoadCallback,
      setDealerCardLoadCallback,
    });
  };
  // ✅ FLOP 円クリックで ANTE × 2 の自動ベット
  const handleFlopCircleClick = async () => {
    const betAmount = bets.ante * 2;

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
    }
  };

  // ✅ TURN 円クリックで ANTE × 1 の自動ベット
  const handleTurnCircleClick = async () => {
    const betAmount = bets.ante;

    if (gamePhase === 'flop' && bets.turn === 0 && wallet.chips >= betAmount) {
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
    }
  };

  // ✅ RIVER 円クリックで ANTE × 1 の自動ベット
  const handleRiverCircleClick = async () => {
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
    <div className="game-board">
      <h1 className="title-in-board">🃏 Ultimate Texas Hold'em Simulator</h1>
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
        isDisabled={false}
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
        isDisabled={showTutorial && tutorialStage === 1}
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
        isDisabled={showTutorial && tutorialStage !== 3}
        /* ステージ3 だけ点滅させる */
        tutorialActive={showTutorial && tutorialStage === 3}
      />
      {/* FLOP */}
      <BetCircle
        area="flop"
        total={getTotalBet(placedChips, 'flop')}
        chips={placedChips.flop}
        isActive={gamePhase === 'preflop'}
        isSelected={false}
        onClick={handleFlopCircleClick}
        style={POS.bet.flop}
      />
      {/* TURN */}
      <BetCircle
        area="turn"
        total={getTotalBet(placedChips, 'turn')}
        chips={placedChips.turn}
        isActive={gamePhase === 'flop'}
        isSelected={false}
        onClick={handleTurnCircleClick}
        style={POS.bet.turn}
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
        className="recharge-btn"
        onClick={handleTopUp}
        style={{ position: 'absolute', ...POS.ui.recharge }}
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
          className="fold-btn"
          onClick={() =>
            handleFold({
              dispatch,
              deck: state.deck,
              playerCards: state.playerCards,
              dealerCards: state.dealerCards,
              bets: state.bets, // 全ベット額が入っている state
              onHandComplete: addHand,
              onResult: setResultText,
              debit,
            })
          }
          style={POS.ui.fold}
        >
          FOLD
        </button>
      )}
      {/* ゲーム開始ボタンは初期フェーズだけ表示 */}
      {gamePhase === 'initial' && (
        <button
          className={`btn-start ${showTutorial ? 'disabled-btn' : ''}`}
          onClick={handleGameStart}
          disabled={showTutorial} /* ← ボタン無効化 */
          style={{
            position: 'absolute',
            ...POS.ui.start,
          }}
        >
          🎮 <br />S T A R T
        </button>
      )}
      {gamePhase !== 'initial' && (
        <>
          {/* 再プレイボタン */}
          {gamePhase === 'showdown' && (
            <button
              className="playagain-btn"
              onClick={handlePlayAgain}
              style={POS.ui.playAgain}
            >
              PLAY&nbsp;AGAIN
            </button>
          )}
        </>
      )}
      {/* 再プレイボタン押した後の文字 */}
      {showPlaceYourBets && (
        <div className="place-bets-overlay">PLACE YOUR BETS Please!</div>
      )}
      {/* 円形チェックボタン：flop または turn フェーズのみ */}
      {!folded && (gamePhase === 'flop' || gamePhase === 'turn') && (
        <button
          className="check-btn"
          onClick={() =>
            gamePhase === 'flop'
              ? handleCheckTurn({
                  deck,
                  dispatch,
                  setBoardCardLoadCallback, // ←追加！
                  cards,
                })
              : handleCheckRiver({
                  deck,
                  dispatch,
                  setBoardCardLoadCallback, // ←追加！
                  cards,
                })
          }
          style={POS.ui.check}
        >
          チェック
        </button>
      )}
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
      {/* ===== Tutorial Overlay ===== */}
      {showTutorial && (
        <TutorialOverlay
          /* ステージごとにメッセージを切り替える */
          stage={tutorialStage}
          /* OK ボタンが押せる条件をステージ別に渡す */
          canClose={
            tutorialStage === 1
              ? anteDone
              : tutorialStage === 2
              ? bonusDone
              : jackpotDone
          }
          /* OK を押したときの挙動をステージ別に分岐 */
          onClose={async () => {
            if (tutorialStage === 1) {
              setTutorialStage(2); // ANTE → BONUS
            } else if (tutorialStage === 2) {
              setTutorialStage(3); // BONUS → JACKPOT
            } else {
              setShowTutorial(false); // 全部終わり
              await setWallet({ tutorialCompleted: true });
              refresh();
            }
          }}
        />
      )}{' '}
    </div>
  );
}

export default App;
