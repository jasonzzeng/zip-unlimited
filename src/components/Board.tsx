import React, { useEffect, useRef, useState } from 'react';
import { PuzzleConfig, Point, InputMode } from '../types';
import { Cell } from './Cell';
import { pointToString, isValidMove, shouldAllowDrag, shouldAllowClick } from '../utils/logic';
import { findShortestPath, findStraightLinePath } from '../utils/pathfinding';

interface BoardProps {
  config: PuzzleConfig;
  path: Point[];
  onPathUpdate: (newPath: Point[], commitToHistory?: boolean) => void;
  onDragStart: () => void;
  isComplete: boolean;
  inputMode: InputMode;
}

const DEBUG_CLICK = false; // Toggle this to debug click issues

export const Board: React.FC<BoardProps> = ({ config, path, onPathUpdate, onDragStart, isComplete, inputMode }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [cellSize, setCellSize] = useState(50);
  const boardRef = useRef<HTMLDivElement>(null);

  // Responsive Cell Sizing Logic
  useEffect(() => {
    const calculateSize = () => {
      // Base target size varies by difficulty to make Hard boards physically larger
      let targetSize = 50;
      if (config.width <= 6) targetSize = 60;
      else if (config.width <= 8) targetSize = 55;
      else targetSize = 50;

      // Available space (viewport minus padding)
      const maxWidth = window.innerWidth - 32;
      const maxHeight = window.innerHeight - 240;

      // Calculate max possible cell size to fit in viewport
      const maxCellW = Math.floor(maxWidth / config.width);
      const maxCellH = Math.floor(maxHeight / config.height);

      // Final size is the target, constrained by viewport
      const finalSize = Math.max(20, Math.min(targetSize, maxCellW, maxCellH));
      setCellSize(finalSize);
    };

    calculateSize();
    window.addEventListener('resize', calculateSize);
    return () => window.removeEventListener('resize', calculateSize);
  }, [config]);

  // Dynamic grid styles
  const gridStyle = {
    display: 'grid',
    gridTemplateColumns: `repeat(${config.width}, ${cellSize}px)`,
    gridTemplateRows: `repeat(${config.height}, ${cellSize}px)`,
    gap: '0px', // Gap 0 ensures easy center-to-center math for SVG
    margin: '0 auto',
    width: 'fit-content',
    position: 'relative' as const, // Anchor for absolute SVG
  };

  // Calculate SVG Polyline Points
  const getPolylinePoints = () => {
    if (path.length === 0) return '';
    return path.map(p => {
      const cx = p.x * cellSize + cellSize / 2;
      const cy = p.y * cellSize + cellSize / 2;
      return `${cx},${cy}`;
    }).join(' ');
  };

  const handleInteractStart = (p: Point) => {
    if (isComplete) return;
    
    const head = path[path.length - 1];
    const pointStr = pointToString(p);
    const isHead = pointStr === pointToString(head);

    if (DEBUG_CLICK) {
      console.log('--- Interact Start ---');
      console.log('Mode:', inputMode);
      console.log('Head:', head);
      console.log('Clicked:', p);
    }

    // 1. Drag Start (Clicking Head)
    if (isHead) {
      if (shouldAllowDrag(inputMode)) {
        onDragStart(); // Snapshot history before dragging starts
        setIsDragging(true);
      } else if (DEBUG_CLICK) {
        console.log('Drag disallowed by mode');
      }
      return;
    }

    // Interaction Check for Click actions
    if (!shouldAllowClick(inputMode)) {
      if (DEBUG_CLICK) console.log('Click disallowed by mode');
      return; 
    }

    // 2. Click-Backtracking (Clicking existing path)
    const existingIndex = path.findIndex(pt => pointToString(pt) === pointStr);
    if (existingIndex !== -1) {
      // User clicked a previous part of the path -> Truncate
      onDragStart(); // Snapshot current state
      const newPath = path.slice(0, existingIndex + 1);
      onPathUpdate(newPath, false); 
      if (DEBUG_CLICK) console.log('Backtracking to index', existingIndex);
      return;
    }

    // 3. Extension (Clicking empty cell)
    // Try Straight-Line First
    let extension = findStraightLinePath(head, p, path, config);
    if (DEBUG_CLICK) console.log('Straight line found?', !!extension);
    
    // If no straight line, Try BFS
    if (!extension) {
      extension = findShortestPath(head, p, path, config);
      if (DEBUG_CLICK) console.log('BFS found?', !!extension);
    }

    if (extension) {
      onPathUpdate([...path, ...extension], true); // Commit to history
    } else {
      // Visual feedback for error
      if (DEBUG_CLICK) console.log('No valid path found');
      const el = boardRef.current;
      if (el) {
        el.classList.add('shake');
        setTimeout(() => el.classList.remove('shake'), 300);
      }
    }
  };

  const handleMouseEnter = (p: Point) => {
    if (!isDragging || isComplete) return;

    // Redundant check just in case, but isDragging should only be true if allowed
    if (!shouldAllowDrag(inputMode)) return;

    const pointStr = pointToString(p);
    
    // Check if we entered a cell that is ALREADY in the path (Backtracking)
    const existingIndex = path.findIndex(pt => pointToString(pt) === pointStr);

    if (existingIndex !== -1) {
      // STRICT RETRACT RULE:
      // Only allow retract if we are moving to the immediate predecessor of head.
      const headIndex = path.length - 1;
      
      // If we are touching the cell right before the head, we step back.
      if (existingIndex === headIndex - 1) {
        const newPath = path.slice(0, existingIndex + 1);
        onPathUpdate(newPath, false); 
      }
      // If we touch any other visited cell (including head itself or older cells), ignore.
      return;
    }

    // Otherwise try to extend path by one step
    if (isValidMove(path, p, config)) {
      onPathUpdate([...path, p], false);
    }
  };

  const handleInteractEnd = () => {
    if (isDragging) {
      setIsDragging(false);
    }
  };

  // Global mouse up to catch dragging outside cells
  useEffect(() => {
    window.addEventListener('mouseup', handleInteractEnd);
    return () => window.removeEventListener('mouseup', handleInteractEnd);
  }, [isDragging]);

  const cells = [];
  for (let y = 0; y < config.height; y++) {
    for (let x = 0; x < config.width; x++) {
      const p = { x, y };
      const key = pointToString(p);
      const isFilled = path.some(pt => pointToString(pt) === key);
      const isHead = pointToString(path[path.length - 1]) === key;
      const checkpoint = config.checkpoints[key];

      cells.push(
        <Cell
          key={key}
          point={p}
          checkpoint={checkpoint}
          isFilled={isFilled}
          isHead={isHead}
          isValidTarget={true}
          onMouseDown={handleInteractStart}
          onMouseEnter={handleMouseEnter}
          onMouseUp={handleInteractEnd}
        />
      );
    }
  }

  // Determine cursor class based on mode
  const modeClass = `mode-${inputMode}`;

  return (
    <div ref={boardRef} style={gridStyle} className={`board-container ${modeClass}`}>
      {/* SVG Path Overlay */}
      <svg
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          zIndex: 10,
          overflow: 'visible'
        }}
        width={config.width * cellSize}
        height={config.height * cellSize}
      >
        <polyline
          points={getPolylinePoints()}
          fill="none"
          stroke="var(--path-stroke-color)" 
          strokeWidth={cellSize * 0.45}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>

      {cells}
    </div>
  );
};