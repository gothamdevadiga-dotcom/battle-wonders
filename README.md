# Pokemon Wonders

Browser-based creature battle game with a Node.js server. Each player runs their own local copy.

## Download and run on Windows

1. Install Node.js from https://nodejs.org/ (choose the LTS version).
2. Download this repository as a ZIP using GitHub's **Code > Download ZIP** button.
3. Extract the ZIP file.
4. Double-click `start-game.bat` in the extracted folder.
5. The game opens at http://localhost:3000. Keep the server window open while playing.

To stop the server, close its command window. Each friend needs to download and run their own copy; `localhost` always refers to the computer running the game.

## Run from a terminal

Install Node.js, open a terminal in this folder, then run `node backend/server.js` and visit http://localhost:3000.

## Project files

- `backend/` contains the server, battle engine, and game data.
- `frontend/` contains the game page, styles, and browser code.