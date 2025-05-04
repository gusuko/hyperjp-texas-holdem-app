// useShowdownLogic.js
// 👉 ゲーム終了時に勝敗を判定し、結果や払い戻し額を計算するカスタムHook

import { useEffect } from 'react';
import { evaluateBestHand } from '../utils/evaluateHand';
import {
  getBonusMultiplierForPlayer,
  checkDoubleAceBonus,
} from '../utils/bonusUtils';
import { formatCard, formatHandByCompareRanks } from '../utils/formatUtils';
import { handRanks } from '../constants/rankorder';
import { getJackpotPayout } from '../utils/jackpotUtils';

const useShowdownLogic = ({
  showdown,
  folded,
  playerCards,
  dealerCards,
  communityCards,
  anteBet,
  bonusBet,
  jackpotBet,
  flopBet,
  turnBet,
  riverBet,
  dispatch,
  setResultText,
}) => {
  useEffect(() => {
    if (!showdown) return;
    // --- 初期化 ---
    let payout = 0;
    let anteWin = 0;
    let betWin = 0;
    let bonusWin = 0;

    // --- JACKPOT 判定（2枚 + FLOP3枚）
    const jackpotHand = [...playerCards, ...communityCards.slice(0, 3)];
    const { rank: jackpotRank, payout: jackpotWin } = getJackpotPayout(
      jackpotHand,
      jackpotBet
    );

    if (jackpotWin > 0) {
      payout += jackpotBet + jackpotWin; // ✅ 元金 + 配当
    }

    // --- プレイヤー・ディーラーの役を評価 ---
    const playerResult = evaluateBestHand([...playerCards, ...communityCards]);
    const dealerResult = evaluateBestHand([...dealerCards, ...communityCards]);

    const playerRank = playerResult.rank;
    const dealerRank = dealerResult.rank;

    // --- ボーナス倍率を取得（通常とAA vs AA） ---
    const normalBonusRate = getBonusMultiplierForPlayer(playerCards);
    const aaBonusRate = checkDoubleAceBonus(playerCards, dealerCards);
    const bonusRate = Math.max(normalBonusRate, aaBonusRate);

    // --- ボーナス払い戻し ---
    if (bonusRate > 0 && bonusBet > 0) {
      bonusWin = bonusBet * bonusRate;
      payout += bonusBet + bonusWin; // ✅ 元金 + 配当
    }
    // ✅ プレイヤーが実際に賭けた全ての合計（ANTE + BONUS + JACKPOT + FLOP〜RIVER）
    const totalBetAmount =
      anteBet + bonusBet + jackpotBet + flopBet + turnBet + riverBet;

    // --- 表示用カード整形 ---
    const playerSortedHand = formatHandByCompareRanks(
      playerResult.hand,
      playerResult.compareRanks
    );
    const dealerSortedHand = formatHandByCompareRanks(
      dealerResult.hand,
      dealerResult.compareRanks
    );

    const playerUsedCards = playerSortedHand.map(formatCard).join(' ');
    const dealerUsedCards = dealerSortedHand.map(formatCard).join(' ');

    const playerHandText = `あなたの手：${playerRank}（${playerUsedCards}）`;
    const dealerHandText = `ディーラーの手：${dealerRank}（${dealerUsedCards}）`;

    // --- 勝敗とキッカー勝負の判定 ---
    const pRanks = playerResult.compareRanks;
    const dRanks = dealerResult.compareRanks;

    let winnerText = '';
    let playerWins = false;
    let tie = false;
    let kickerUsed = false;

    // 🎯 まずは役の強さ（score）で比較！
    if (playerResult.score > dealerResult.score) {
      playerWins = true;
      winnerText = '→ あなたの勝ち！';
    } else if (playerResult.score < dealerResult.score) {
      playerWins = false;
      winnerText = '→ ディーラーの勝ち！';
    } else {
      // スコアが同じ → compareRanks を順に比較
      let winnerDecided = false;

      for (let i = 0; i < pRanks.length; i++) {
        if (pRanks[i] > dRanks[i]) {
          playerWins = true;
          kickerUsed = i >= 1; // 0番目なら役の中身で勝敗、キッカーではない
          winnerDecided = true;
          break;
        } else if (pRanks[i] < dRanks[i]) {
          playerWins = false;
          kickerUsed = i >= 1;
          winnerDecided = true;
          break;
        }
      }

      if (!winnerDecided) {
        tie = true;
        winnerText = '→ 完全に引き分け！';
      } else {
        winnerText = kickerUsed
          ? playerWins
            ? '→ キッカー勝負！あなたの勝ち！'
            : '→ キッカー勝負！ディーラーの勝ち！'
          : playerWins
          ? '→ あなたの勝ち！'
          : '→ ディーラーの勝ち！';
      }
    }

    // --- 払い戻し計算 ---
    const handStrengthIndex = handRanks.indexOf(playerRank);
    let anteText = '';

    if (folded) {
      payout = 0;
      anteText = `$0（降りたため没収）`;
    } else if (playerWins) {
      anteWin = anteBet;
      betWin = flopBet + turnBet + riverBet;

      if (handStrengthIndex >= 4) {
        payout += anteWin * 2;
        anteText = `$${anteBet * 2}（勝利＋ストレート以上の役）`;
      } else {
        payout += anteWin;
        anteText = `$${anteBet}（勝利だがストレート未満 → ANTE同額返却）`;
      }

      payout += betWin * 2;
    } else if (tie) {
      anteWin = anteBet;
      betWin = flopBet + turnBet + riverBet;
      payout += anteWin + betWin;
      anteText = `$${anteBet}（引き分け → ANTE同額返却）`;
    } else {
      anteText = `$0（敗北 → ANTE没収）`;
    }

    // --- チップと結果表示を反映 ---
    dispatch({ type: 'ADD_CHIPS', amount: payout });

    setResultText(
      `${playerHandText}
${dealerHandText}

${winnerText}

💰 払い戻し詳細:
ANTE: ${anteText}
BET: $${totalBetAmount}
BONUS: $${bonusWin > 0 ? bonusBet + bonusWin : 0}（${
        bonusWin > 0
          ? `倍率：x${bonusRate}${bonusRate === 1000 ? '（AA vs AA!）' : ''}`
          : '対象外'
      }）
JACKPOT: $${jackpotWin > 0 ? jackpotBet + jackpotWin : 0}（${
        jackpotWin > 0 ? `役：${jackpotRank}` : '対象外'
      }）



💰 合計：$${payout}`
    );
  }, [showdown]);
};

export default useShowdownLogic;
