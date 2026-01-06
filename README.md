# Roblox Wrapped (Final)

A story-style "Wrapped" for Roblox badges (2025) with swipe navigation, animations, streaks, player type, and a share card.

## Requirements
- Node.js (recommended: current LTS)
- npm (comes with Node)

## Install & Run
1) Unzip this project
2) Open a terminal in the project folder
3) Install dependencies:
   ```bash
   npm install
   ```
4) Start dev server:
   ```bash
   npm run dev
   ```
5) Open:
   - http://localhost:3000

## Notes
- Swipe LEFT to go to the next slide, swipe RIGHT to go back.
- Roblox has rate limits; this project includes retry + backoff + short caching to reduce 429 errors.
