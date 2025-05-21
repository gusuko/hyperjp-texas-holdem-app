// src/utils/playCardSound.js
export default function playCardSound() {
  const audio = new Audio(process.env.PUBLIC_URL + '/se/card-deal.mp3');
  audio.currentTime = 0;
  audio.play();
}
// ベット時SE
export function playBetSound() {
  const audio = new Audio(process.env.PUBLIC_URL + '/se/bet-coin.mp3');
  audio.currentTime = 0;
  audio.play();
}

// Place your bets SE
export function playPlaceYourBetsSound() {
  const audio = new Audio(process.env.PUBLIC_URL + '/se/place-your-bets.mp3');
  audio.currentTime = 0;
  audio.play();
}
