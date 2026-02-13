import React, { useState, useEffect, useCallback, useRef } from 'react';
import './App.css';
import { generatePuzzle } from './utils/generator';
import { isValidMove, checkWin, checkInvalidFullBoard, checkInvalidNotFull, stringToPoint, formatTime } from './utils/logic';
import { Difficulty, GameState, Point, PuzzleConfig, InputMode } from './types';
import { Board } from './components/Board';
import { Controls } from './components/Controls';
import { Modal } from './components/Modal';
import { HelpPanel } from './components/HelpPanel';

function App() {
  const [difficulty, setDifficulty] = useState<Difficulty>('Easy');
  const [inputMode, setInputMode] = useState<InputMode>(() => {
    const saved = localStorage.getItem('zipUnlimited.inputMode');
    return (saved === 'both' || saved === 'drag' || saved === 'click') ? saved : 'both';
  });
  
  const [config, setConfig] = useState<PuzzleConfig | null>(null);
  const [gameState, setGameState] = useState<GameState>({
    path: [],
    history: [],
    isComplete: false,
  });
  
  const [showClearModal, setShowClearModal] = useState(false);
  const [showWinModal, setShowWinModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Timer State
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const timerIntervalRef = useRef<number | null>(null);

  // Timer Logic
  useEffect(() => {
    if (isTimerRunning) {
      timerIntervalRef.current = window.setInterval(() => {
        setElapsedTime(prev => prev + 1);
      }, 1000);
    } else {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
    }
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [isTimerRunning]);

  // Initialize Game
  const startNewGame = useCallback(() => {
    const newConfig = generatePuzzle(difficulty);
    
    // Find starting point (checkpoint 1)
    const startEntry = Object.entries(newConfig.checkpoints).find(([_, val]) => val === 1);
    const startPoint = startEntry ? stringToPoint(startEntry[0]) : { x: 0, y: 0 };

    setConfig(newConfig);
    setGameState({
      path: [startPoint],
      history: [],
      isComplete: false
    });
    setShowWinModal(false);
    setErrorMessage(null);
    
    // Reset and Start Timer
    setElapsedTime(0);
    setIsTimerRunning(true);
  }, [difficulty]);

  useEffect(() => {
    startNewGame();
  }, [startNewGame]);

  // Persist Input Mode
  useEffect(() => {
    localStorage.setItem('zipUnlimited.inputMode', inputMode);
  }, [inputMode]);

  // Handle Updates
  const updatePath = (newPath: Point[], commitToHistory = true) => {
    if (!config) return;

    setGameState(prev => {
      // Check win condition
      const isWin = checkWin(newPath, config);
      
      let error = null;
      if (!isWin) {
        if (checkInvalidFullBoard(newPath, config)) {
          error = "You must end on the final number.";
        } else if (checkInvalidNotFull(newPath, config)) {
          error = "All spots must be filled.";
        }
      }
      
      if (isWin) {
        setIsTimerRunning(false); // Stop timer on win
        setTimeout(() => setShowWinModal(true), 500);
      }
      setErrorMessage(error);

      const newHistory = commitToHistory 
        ? [...prev.history, prev.path] 
        : prev.history;

      return {
        ...prev,
        path: newPath,
        history: newHistory,
        isComplete: isWin
      };
    });
  };

  // Keyboard Controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!config || gameState.isComplete || showClearModal) return;

      const head = gameState.path[gameState.path.length - 1];
      let next: Point | null = null;

      switch(e.key) {
        case 'ArrowUp': case 'w': next = { x: head.x, y: head.y - 1 }; break;
        case 'ArrowDown': case 's': next = { x: head.x, y: head.y + 1 }; break;
        case 'ArrowLeft': case 'a': next = { x: head.x - 1, y: head.y }; break;
        case 'ArrowRight': case 'd': next = { x: head.x + 1, y: head.y }; break;
        case 'z': 
          if (e.ctrlKey || e.metaKey) handleUndo(); 
          return;
      }

      if (next && isValidMove(gameState.path, next, config)) {
        updatePath([...gameState.path, next], true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [config, gameState, showClearModal]);

  const handleUndo = () => {
    if (gameState.history.length === 0) return;
    setGameState(prev => {
      const previousPath = prev.history[prev.history.length - 1];
      const newHistory = prev.history.slice(0, -1);
      
      // Re-evaluate state for undo
      if (config) {
        const isWin = checkWin(previousPath, config);
        let error = null;
        if (!isWin) {
          if (checkInvalidFullBoard(previousPath, config)) {
            error = "You must end on the final number.";
          } else if (checkInvalidNotFull(previousPath, config)) {
            error = "All spots must be filled.";
          }
        }
        setErrorMessage(error);
      }

      return {
        ...prev,
        path: previousPath,
        history: newHistory,
        isComplete: false
      };
    });
  };

  const handleClear = () => {
    if (!config) return;
    // Find start again
    const startEntry = Object.entries(config.checkpoints).find(([_, val]) => val === 1);
    const startPoint = startEntry ? stringToPoint(startEntry[0]) : { x: 0, y: 0 };
    
    setGameState({
      path: [startPoint],
      history: [],
      isComplete: false
    });
    setErrorMessage(null);
    setShowClearModal(false);
  };

  // Snapshot functionality used by Drag Start
  const handleDragStartSnapshot = () => {
    setGameState(prev => ({
      ...prev,
      history: [...prev.history, prev.path]
    }));
  };

  if (!config) return <div>Loading...</div>;

  return (
    <div className="app">
      <header>
        <h1>Zip Unlimited</h1>
      </header>
      
      <main>
        <Controls 
          difficulty={difficulty}
          setDifficulty={setDifficulty}
          inputMode={inputMode}
          setInputMode={setInputMode}
          onNewGame={startNewGame}
          onUndo={handleUndo}
          onClear={() => setShowClearModal(true)}
          canUndo={gameState.history.length > 0}
          elapsedTime={elapsedTime}
        />
        
        <HelpPanel />

        <div className="board-wrapper">
          {errorMessage && (
            <div className="error-banner">
              {errorMessage}
            </div>
          )}
          
          <Board 
            config={config} 
            path={gameState.path} 
            onPathUpdate={(p, commit) => updatePath(p, commit)}
            onDragStart={handleDragStartSnapshot}
            isComplete={gameState.isComplete}
            inputMode={inputMode}
          />
        </div>
      </main>

      <Modal 
        isOpen={showClearModal}
        title="Clear Board?"
        message="Are you sure you want to restart this puzzle?"
        onConfirm={handleClear}
        onCancel={() => setShowClearModal(false)}
        confirmText="Clear"
      />

      <Modal 
        isOpen={showWinModal}
        title="Puzzle Solved!"
        message={`Solved in ${formatTime(elapsedTime)}! Ready for the next one?`}
        onConfirm={() => {
          startNewGame();
        }}
        confirmText="Play Again"
      />
    </div>
  );
}

export default App;