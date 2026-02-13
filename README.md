# Zip Unlimited 🎯

A modern web-based puzzle game inspired by LinkedIn’s Zip.

Create a single continuous path that:

- Visits **every cell exactly once**
- Connects all numbered circles **in order**
- Ends on the final circle

🌐 **Play it here:**  
👉 https://jasonzzeng.github.io/zip-unlimited

---

## 🎮 How to Play

The goal is simple — but not easy.

1. Start at circle **1**
2. Connect the circles in numerical order
3. Fill every single grid cell
4. End on the final circle

You may move:

- ⬆️ Up  
- ⬇️ Down  
- ⬅️ Left  
- ➡️ Right  

(No diagonals)

---

## 🧠 Game Rules

A solution is valid only if:

- ✅ Every grid cell is filled  
- ✅ Circles are connected strictly in order  
- ✅ The final circle is the last square in the path  

If:

- All circles are filled but empty cells remain →  
  **"All spots must be filled."**

- The board is full but you didn’t end on the last number →  
  **"You must end on the final number."**

---

## 🕹 Input Modes

Choose your preferred input style:

- **Drag Only** – Draw paths manually
- **Click Only** – Click to auto-extend
- **Both** – Use either method

Keyboard controls are always available:

- Arrow Keys
- WASD

---

## 🧩 Difficulty Levels

- **Easy**
- **Medium**
- **Hard**

Each difficulty increases:

- Grid size
- Number of circles
- Path complexity

Every puzzle is:

- 🎲 Randomized
- ✅ Guaranteed solvable
- 🧠 Structurally unique

---

## 🚀 Run Locally

```bash
npm install
npm run dev
