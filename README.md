# Zip Unlimited

A minimalist clone of the popular "Zip" path puzzle game.

## Overview
**Zip Unlimited** is a logic puzzle where you must draw a single continuous path that visits every square on the grid exactly once. The path must connect the numbered checkpoints in ascending order (1 → 2 → 3...).

## How to Play
- **Goal:** Fill the grid completely.
- **Rules:**
  1. Start at circle **1**.
  2. Visit numbers in order.
  3. Don't cross your own path.
  4. Only move Up, Down, Left, or Right.
- **Controls:**
  - **Drag/Swipe:** Click and hold to draw your path.
  - **Click:** Click a target cell to auto-fill the path if a safe route exists.
  - **Keyboard:** Use Arrow keys or WASD to move.
  - **Undo:** `Ctrl+Z` or use the Undo button.

## Setup & Run
1. Install dependencies:
   ```bash
   npm install
   ```
2. Run local development server:
   ```bash
   npm run dev
   ```
3. Run tests:
   ```bash
   npm run test
   ```

## Deployment (GitHub Pages)

This project is configured to deploy to `https://jasonzzeng.github.io/zip-unlimited`.

**One-Step Deploy:**
```bash
npm run deploy
```
This command will:
1. Build the project (using `vite build`).
2. Push the `dist` folder to the `gh-pages` branch.

## Tech Stack
- React 18
- TypeScript
- Vite
- Pure CSS (No UI frameworks)
- Vitest (Unit Testing)

## License
MIT. Original concept by LinkedIn/Microsoft. This is an educational clone.