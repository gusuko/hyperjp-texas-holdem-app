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

const useShowdownLogic = ({
  showdown,
  folded,
  playerCards,
  dealerCards,
  communityCards,
  anteBet,
  bonusBet,
  flopBet,
  turnBet,
  riverBet,
  setChips,
  setResultText,
}) => {
  useEffect(() => {
    if (!showdown) return;

    // --- 初期化 ---
    let payout = 0;
    let anteWin = 0;
    let betWin = 0;
    let bonusWin = 0;

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
      payout += bonusWin;
    }

    // --- 役の構成と表示用カードを整形 ---
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

    // --- 勝敗判定 ---
    const pRanks = playerResult.compareRanks;
    const dRanks = dealerResult.compareRanks;
    let playerWins = false;
    let tie = false;

    // キッカー勝負の位置を役に応じて調整
    let kickerStartIndex = 0;
    if (['High Card'].includes(playerRank)) kickerStartIndex = 0;
    else if (['One Pair'].includes(playerRank)) kickerStartIndex = 1;
    else if (['Two Pair'].includes(playerRank)) kickerStartIndex = 2;
    else if (['Three of a Kind', 'Four of a Kind'].includes(playerRank))
      kickerStartIndex = 1;

    for (let i = 0; i < pRanks.length; i++) {
      if (pRanks[i] > dRanks[i]) {
        playerWins = true;
        break;
      }
      if (dRanks[i] > pRanks[i]) {
        break;
      }
    }

    if (pRanks.join(',') === dRanks.join(',')) tie = true;

    // --- 結果メッセージ ---
    let winnerText = '';
    if (folded) {
      winnerText = '→ 降りたため負け';
    } else if (playerWins) {
      winnerText = '→ あなたの勝ち！';
    } else if (tie) {
      winnerText = '→ 完全に引き分け！';
    } else {
      winnerText = '→ ディーラーの勝ち！';
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

    // --- 結果の反映 ---
    setChips((prev) => prev + payout);

    setResultText(
      `${playerHandText}
${dealerHandText}

${winnerText}

💰 払い戻し詳細:
ANTE: ${anteText}
BET: $${playerWins || tie ? betWin * 2 : 0}
BONUS: $${bonusWin > 0 ? bonusWin : 0}（${
        bonusWin > 0
          ? `倍率：x${bonusRate}${bonusRate === 1000 ? '（AA vs AA!）' : ''}`
          : '対象外'
      }）

💰 合計：$${payout}`
    );
  }, [
    showdown,
    folded,
    playerCards,
    dealerCards,
    communityCards,
    anteBet,
    bonusBet,
    flopBet,
    turnBet,
    riverBet,
    setChips,
    setResultText,
  ]);
};

export default useShowdownLogic;
