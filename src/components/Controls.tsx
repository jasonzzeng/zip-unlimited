import React from 'react';
import { Difficulty, InputMode } from '../types';
import { formatTime } from '../utils/logic';

interface ControlsProps {
  difficulty: Difficulty;
  setDifficulty: (d: Difficulty) => void;
  inputMode: InputMode;
  setInputMode: (m: InputMode) => void;
  onNewGame: () => void;
  onUndo: () => void;
  onClear: () => void;
  canUndo: boolean;
  elapsedTime: number;
}

export const Controls: React.FC<ControlsProps> = ({
  difficulty,
  setDifficulty,
  inputMode,
  setInputMode,
  onNewGame,
  onUndo,
  onClear,
  canUndo,
  elapsedTime
}) => {
  return (
    <div className="controls">
      <div className="top-row">
        <select 
          value={difficulty} 
          onChange={(e) => setDifficulty(e.target.value as Difficulty)}
          aria-label="Select Difficulty"
        >
          <option value="Easy">Easy</option>
          <option value="Medium">Medium</option>
          <option value="Hard">Hard</option>
        </select>

        <select
          value={inputMode}
          onChange={(e) => setInputMode(e.target.value as InputMode)}
          aria-label="Select Input Mode"
        >
          <option value="both">Both (Drag & Click)</option>
          <option value="drag">Drag Only</option>
          <option value="click">Click Only</option>
        </select>

        <button onClick={onNewGame}>New Puzzle</button>
      </div>
      <div className="actions-row">
        <div className="timer-display" style={{ 
          fontSize: '0.9rem', 
          fontWeight: 'bold', 
          display: 'flex', 
          alignItems: 'center',
          fontVariantNumeric: 'tabular-nums'
        }}>
          Time: {formatTime(elapsedTime)}
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={onUndo} disabled={!canUndo} aria-label="Undo last move">
            Undo
          </button>
          <button onClick={onClear} aria-label="Clear board">
            Clear
          </button>
        </div>
      </div>
    </div>
  );
};