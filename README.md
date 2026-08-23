# 🔦 SQL Detective: The Ultimate Database Mystery Adventure

A fully client-side SQL learning game. The Crown Diamond has been stolen from
the Grand Museum — you play a detective who writes **real SQL** against a
live, in-browser SQLite database (via [sql.js](https://github.com/sql-js/sql.js))
to interrogate suspects, evidence, transactions and camera logs across 8
progressively harder case files, from `SELECT`/`WHERE` up to CTEs and window
functions.

No backend, no build step, no server-side database — everything runs
locally in the browser tab.

## Running it locally

You can't just double-click `index.html` in some browsers, because the
`fetch` used to load the WASM SQL engine needs to run over `http://`, not
`file://`. Serve the folder instead:

```bash
cd sql-detective
python3 -m http.server 8080
# then open http://localhost:8080 in your browser
```

or with Node:

```bash
npx serve .
```

## Deploying it

It's static, so any static host works — no configuration needed:

- **GitHub Pages**: push this repo, then enable Pages on the `main` branch
  (root folder). Your game will be live at
  `https://<username>.github.io/<repo>/`.
- **Netlify / Vercel**: drag-and-drop the folder, or connect the repo —
  no build command needed, publish directory is `.` / `/`.

## Project structure

```
sql-detective/
├── index.html          # entry point, loads css + js in order
├── css/
│   └── style.css        # all styling: glassmorphism, neon, CRT scanline theme
├── js/
│   ├── data.js           # DB schema/seed SQL, case/challenge definitions,
│   │                      # achievements, SQL Academy lessons, mock leaderboard
│   ├── state.js           # game state object, sound synth (Web Audio), toasts
│   ├── engine.js           # sql.js bootstrap + query execution/comparison
│   ├── ui.js               # all screen rendering + game logic
│   └── main.js              # boot sequence
└── ANSWERS.md            # reference solution query for every case/challenge
```

Scripts are loaded as plain `<script src>` tags (no bundler), so the load
order in `index.html` matters: `data.js` → `state.js` → `engine.js` →
`ui.js` → `main.js`.

## How grading works

Each challenge has a canonical "solution" query. When you run your own
query, the game runs both, normalizes both result sets (sorts values within
each row, then sorts the rows), and compares them — so any query that
produces the same data is accepted, not just one exact string.

## Notes / known limitations

- **No backend or persistence.** Progress (XP, solved challenges,
  achievements) lives only in memory for the current page load and resets
  on refresh. To persist progress you'd want to add `localStorage` (works
  fine in a real deployed site — it's only disallowed inside Claude's
  in-chat artifact sandbox) or a small backend + database.
- **Sandboxed by design.** The game database is a private in-memory SQLite
  instance created fresh per session — there's nothing for a destructive
  query to damage. `DROP`, `ALTER`, `ATTACH`, `PRAGMA`, and `VACUUM` are
  additionally blocked in the query runner as a defense-in-depth measure;
  `INSERT`/`UPDATE`/`DELETE` are allowed so players can safely see how they
  work.
- **Leaderboard is mock data** (`js/data.js` → `MOCK_LB`) since there's no
  backend to source real player scores from.

## License

Use it, fork it, extend it — no restrictions.
