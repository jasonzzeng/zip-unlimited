import React, { useState } from 'react';

export const HelpPanel: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="help-panel">
      <button 
        className="help-toggle"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
      >
        {isOpen ? 'Hide Rules' : 'How to Play'}
      </button>
      {isOpen && (
        <div className="help-content">
          <ul>
            <li><strong>Goal:</strong> Fill every square on the grid.</li>
            <li><strong>Path:</strong> Make one continuous line. No crossing.</li>
            <li><strong>Numbers:</strong> Visit circles in order (1 → 2 → 3).</li>
            <li><strong>Controls:</strong> Drag, Click to auto-fill, or use Arrow keys.</li>
          </ul>
        </div>
      )}
    </div>
  );
};