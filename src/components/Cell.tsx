import React from 'react';
import { Point } from '../types';
import { pointToString } from '../utils/logic';

interface CellProps {
  point: Point;
  checkpoint?: number;
  isFilled: boolean;
  isHead: boolean;
  isValidTarget: boolean; // For visual feedback on hover/drag
  onMouseDown: (p: Point) => void;
  onMouseEnter: (p: Point) => void;
  onMouseUp: () => void;
}

export const Cell: React.FC<CellProps> = ({
  point,
  checkpoint,
  isFilled,
  isHead,
  onMouseDown,
  onMouseEnter,
  onMouseUp,
}) => {
  let className = 'cell';
  if (isFilled) className += ' filled';
  if (isHead) className += ' head';
  if (checkpoint) className += ' checkpoint-cell';

  return (
    <div
      className={className}
      onMouseDown={(e) => {
        e.preventDefault(); // Prevent text selection
        onMouseDown(point);
      }}
      onMouseEnter={() => onMouseEnter(point)}
      onMouseUp={onMouseUp}
      onTouchStart={(e) => {
         onMouseDown(point);
      }}
      data-testid={`cell-${point.x}-${point.y}`}
    >
      {checkpoint && (
        <div className={`checkpoint ${isFilled ? 'visited' : ''}`}>
          {checkpoint}
        </div>
      )}
    </div>
  );
};