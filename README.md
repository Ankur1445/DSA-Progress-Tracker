# DSA Practice Tracker

A simple web app to track my progress while practicing DSA problems, from Arrays all the way to BST (156 problems in total).

I built this because I kept solving problems on LeetCode but had no clean way to track which topics I had actually covered and which ones I still needed to revise. So I made my own tracker.

## Features

- Dashboard showing total, solved, remaining, and completion %
- Overall progress bar
- Search problems by name
- Filter by difficulty (Easy / Medium / Hard)
- Topics are collapsible, so you can focus on one at a time
- Shows a message when no problems match your search/filter
- Your progress is saved automatically in the browser (localStorage), so it's still there when you come back
- Fully responsive, works fine on mobile too

## Tech Used

- HTML
- CSS
- Vanilla JavaScript

No frameworks, no libraries. Just wanted to get the fundamentals right first.

## How it works

- `data.js` holds all the problems, organized topic-wise
- `script.js` reads that data and builds the whole UI using JavaScript (no problems are hardcoded in the HTML)
- Whenever you search, filter, or check off a problem, the visible list is simply rebuilt — with ~150 problems this is fast and keeps the code easy to follow
- Checked problems are saved to localStorage so progress isn't lost on refresh

## Running it locally

Just clone the repo and open `index.html` in your browser. That's it, no build step, no installs.

```bash
git clone https://github.com/Ankur_1445/DSA-Progress-Tracker.git
cd dsa-practice-tracker
```

Then open `index.html` (or use the Live Server extension in VS Code).

## What I'd like to add later

- Notes section for each problem
- Dark mode
- Option to export/import progress as a file

## Why I built this

I'm a 3rd-year B.Tech CSE student practicing DSA, and I wanted a lightweight tool that's actually mine instead of using someone else's tracker. It also gave me a chance to practice DOM manipulation and localStorage properly instead of just reading about them.
