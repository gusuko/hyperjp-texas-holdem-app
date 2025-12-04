import React, { useState, useRef } from 'react';
import GameBoard from './components/GameBoard';
import GameControls from './components/GameControls';
// Import CurrentChips in GameBoard.jsx to fix the undefined component issue

function App() {
  // Initialize state with safe default values to avoid undefined errors
  const [deck, setDeck] = useState([]); // e.g. remaining cards in the deck
  const [cards, setCards] = useState({
    // player, dealer, and board cards
    player: [],
    dealer: [],
    board: [],
  });
  const [chips, setChips] = useState(1000); // Example starting chips for player
  const [tutorialStage, setTutorialStage] = useState(1); // Start at stage 1 of tutorial
  const [showTutorial, setShowTutorial] = useState(true); // Show tutorial overlay by default for development

  // Refs to link GameControls buttons (for tutorial pointers/highlights)
  const foldRef = useRef(null);
  const checkBtnRef = useRef(null);
  const playAgainBtnRef = useRef(null);

  // Handler for Fold button – advances tutorial or handles fold action
  const handleFold = () => {
    if (showTutorial) {
      // In tutorial mode, moving from stage 5 (after flop) to stage 6
      if (tutorialStage === 5) {
        setTutorialStage(6);
      }
    } else {
      // Normal game fold logic (if any) can be handled here
      console.log('Player folds.');
    }
  };

  // Handler for Check button – advances tutorial or handles check action
  const handleCheck = () => {
    if (showTutorial) {
      // In tutorial mode, stage 6 (after flop) -> stage 7 (after turn), or finish tutorial at stage 7
      if (tutorialStage === 6) {
        setTutorialStage(7);
      } else if (tutorialStage === 7) {
        // Tutorial complete
        setShowTutorial(false);
        console.log('Tutorial completed.');
      }
    } else {
      // Normal game check logic (if any) can be handled here
      console.log('Player checks.');
    }
  };

  // Handler for Play Again button – resets the game state for a new round
  const handlePlayAgain = () => {
    // Reset deck and cards for a fresh game (could regenerate a new deck as needed)
    setDeck([]);
    setCards({ player: [], dealer: [], board: [] });
    // Optionally reset tutorial or other states
    setTutorialStage(1);
    setShowTutorial(false);
    console.log('Game reset for a new round.');
  };

  return (
    <div className="App">
      {/* GameBoard displays the game state (cards, chips, etc.) */}
      <GameBoard
        cards={cards}
        deck={deck}
        chips={chips}
        tutorialStage={tutorialStage}
        showTutorial={showTutorial}
      />

      {/* GameControls contains action buttons and uses refs for tutorial highlighting */}
      <GameControls
        onFold={handleFold}
        onCheck={handleCheck}
        onPlayAgain={handlePlayAgain}
        foldRef={foldRef}
        checkBtnRef={checkBtnRef}
        playAgainBtnRef={playAgainBtnRef}
        tutorialStage={tutorialStage}
        showTutorial={showTutorial}
      />
    </div>
  );
}

export default App;
