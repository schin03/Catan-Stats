# Catan Stat Tracker

A full-stack real-time web application for tracking dice rolls, scores, and statistics across Catan board game sessions. Built as a solo project to explore production-minded Next.js development with a focus on database security, real-time updates, and mobile-first design.

![Stack](https://img.shields.io/badge/Next.js-16-black) ![Stack](https://img.shields.io/badge/TypeScript-5-blue) ![Stack](https://img.shields.io/badge/Supabase-PostgreSQL-green) ![Stack](https://img.shields.io/badge/Deployed-Vercel-black)

---

## What it does

Friends playing Catan join a private lobby and track their games together in real time. The lobby host records each dice roll during a game; every other player watching the page sees new rolls appear live without refreshing. When the game ends, the host enters final scores and selects a winner. The lobby leaderboard updates immediately to reflect the result.

### Core features

- **Username and password accounts** — no email required; accounts are identified by an immutable UUID so usernames can be changed without breaking history
- **Private lobbies** — created by a host, joined via time-limited invite codes (10-minute expiry, rate-limited redemption)
- **Member labels** — hosts assign custom labels (e.g. "Regulars", "Family") to members; labels filter the leaderboard
- **Live dice tracking** — red die, yellow die, and an optional Cities & Knights event die (black, yellow, green, grey); rolls are recorded per round with automatic sequential numbering
- **Real-time updates** — Supabase Realtime pushes changes to all lobby members; a debounced re-fetch strategy means the event payload is never trusted directly
- **Dice distribution chart** — bar chart of roll totals 2–12 including zero-count values, updated live during a game
- **Game close-out** — host enters final scores (0–99) and selects a winner; the database validates that the winner is a participant and every participant has a score
- **Leaderboard** — sortable by games played, wins, win rate, and average points; label filters narrow the view; correct calculations update when completed games are edited or deleted

---

## Technical highlights

### Security model
Every table has Row Level Security enabled. Unauthenticated users receive no data. Game writes (rolls, scores, finish) go through Postgres RPC functions that re-verify the caller's identity and validate input server-side — there are no insert/update/delete grants on game tables for browser-facing roles. The Supabase service-role key is imported with `server-only` to cause a build-time error if it ever reaches browser code.

### Authentication approach
Supabase Auth is email/password only, but this app is entirely username-based. Each account gets a randomly generated synthetic email at signup that is never displayed or sent anywhere. Login works by looking up the username server-side (via a service-role-only RPC), retrieving the hidden email, and signing in with it. The browser never sees the email. Login errors are always generic so usernames cannot be probed.

### Database design
A normalized PostgreSQL schema with UUID primary keys, check constraints on dice values (1–6) and scores (0–99), a partial unique index enforcing one active game per lobby at the database layer, deferred unique constraints enabling round renumbering in a single transaction after a roll deletion, and a generated column keeping the dice total always consistent with the red and yellow values.

### Real-time strategy
Supabase Realtime events are used only as a "something changed" signal. The app never renders data from the event payload directly — every event triggers a debounced `router.refresh()` that re-fetches through the normal RLS-protected server queries. This means a non-member who somehow received a broadcast event would still get nothing from the re-fetch.

---

## Schema overview

```
profiles          — one row per account (id = auth UUID, unique username)
lobbies           — name, host_id (immutable)
lobby_members     — current members only; leaving removes the row
lobby_invite_codes— one active code per lobby, expires_at = created + 10 min
labels            — lobby-scoped text labels
member_labels     — many-to-many label assignments
games             — status (active/completed), winner_id, completed_at
game_participants  — references profiles (not lobby_members) so history survives departures
dice_rolls        — round, red, yellow, total (generated), event_die, game_id
```

---

## Stack

| | |
|---|---|
| **Framework** | Next.js 16, App Router, React Server Components, Server Actions |
| **Language** | TypeScript (strict) |
| **Styling** | Tailwind CSS v4 |
| **Database** | PostgreSQL via Supabase (RLS, RPC functions, Realtime, triggers) |
| **Auth** | Supabase Auth (email/password, server-side session management) |
| **Charts** | Recharts |
| **Testing** | Vitest (39 tests across validation, statistics, and error mapping) |
| **Deployment** | Vercel (CI/CD via GitHub) |

---

## Project structure

```
src/
  app/
    (auth)/              # login, signup — no app header
    (app)/               # all authenticated routes
      lobbies/[lobbyId]/
        games/[gameId]/  # live + completed game view
        leaderboard/
        members/
  features/
    auth/                # signup, login, logout
    games/               # game lifecycle, dice tracking, close-out
    lobbies/             # lobby management, invite codes, labels
    profile/             # username and password settings
  lib/
    stats/               # pure roll distribution and leaderboard logic
    validation/          # input validation shared by UI and server actions
    supabase/            # browser, server, and admin clients
supabase/
  migrations/            # 5 SQL migration files
```

---

## Running locally

```bash
# 1. Install dependencies
npm install

# 2. Copy the environment template and fill in your Supabase keys
cp .env.local.example .env.local

# 3. Run the 5 migration files in Supabase SQL Editor (in order)
# supabase/migrations/0001_schema.sql through 0005_event_die.sql

# 4. Start the dev server
npm run dev

# 5. Run tests
npm run test
```

See the [setup README](./README.md) for the full Supabase dashboard configuration steps.

---

## What I would add next

- Password reset via email
- Host transfer between members
- Cross-lobby player statistics on a profile page
- CSV export of game history
- Per-player dice roll statistics (who rolled the most 7s?)
- Public lobby discovery with join requests
