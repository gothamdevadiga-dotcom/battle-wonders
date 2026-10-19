# battle Wonders

Browser-based creature battle game. Deploy it once, then share the public URL. Players can open it on desktop or mobile without installing Node.js.

## Deploy online

1. Create a Render account at https://render.com/ and connect your GitHub account.
2. In Render, create a new Blueprint and select this repository. Render will use `render.yaml` to build and start the app.
3. When deployment finishes, share the `onrender.com` URL Render gives you. Players open that link in their browser.

The free service may take a little while to wake up after being idle. Keep the service running in Render for the public link to work.

## Run locally for development

Install Node.js, open a terminal in this folder, and run `npm start`. Then visit http://localhost:3000.

## Project files

- `backend/` contains the server, battle engine, and game data.
- `frontend/` contains the game page, styles, and browser code.
