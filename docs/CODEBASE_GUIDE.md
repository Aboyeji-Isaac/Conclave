# Conclave — The Codebase, Explained

This document walks through the entire project from the ground up: what it is, why every tool was chosen, how a request actually travels through the system, what every folder and file does, and — importantly — **what's actually built right now versus what's still a stub**, verified directly against the repo rather than assumed. If you're new to the project, read top to bottom. If you already know the shape of it, jump to whatever section you need.

---

## 1. What Conclave Actually Is

Strip away the tech and this is the problem: group chats are great at *communicating* and terrible at *remembering*. WhatsApp, Slack, Facebook Messenger — in every one of them, the decision your team made three weeks ago is buried under nine hundred messages about lunch. Nobody can find it. Nobody's sure who was supposed to follow up. And catching up after a few busy days means either reading everything or reading nothing.

Conclave is a private, invite-only messaging platform built to fix exactly that. Underneath, it's messaging + rooms + file sharing like any chat app. On top of that baseline sits a memory layer nothing else has:

- **Decisions Layer** — turn any message into a tagged, searchable Decision that lives outside the scrolling chat.
- **Action Items** — turn any message into a tracked task with an owner and a status.
- **Catch-up Digest** — see what actually changed since you were last in a room, not just an unread count.
- **Ask This Room** (planned, later) — ask the room a plain question, get an answer sourced from its own decisions and history.

Everything in this document explains how the software is built to support that.

---

## 2. The Big Picture — How the Pieces Talk to Each Other

Think of it like a restaurant. The **client** (what you see in your browser) is the dining room — it's where people sit and interact. The **backend** is the kitchen — it does the actual work, and customers never deal with it directly. The **database** is the pantry — the permanent record of everything, checked and updated constantly. **Redis** is the waiter's notepad — fast, temporary, thrown away and rewritten constantly, used for things that change by the second (who's online right now) rather than things that need to last forever. **Cloudinary** is off-site storage for anything bulky (photos, videos, PDFs) — the kitchen doesn't want to store those itself. And **Socket.IO** is the intercom system — the fast, always-open line for things that need to happen the instant they happen (a new message appearing on everyone's screen at once), as opposed to the normal REST API, which is more like placing an order and waiting for a single response.

```
[React Client]  <-- REST (Express) -->   [Express Backend]
       |         <-- WebSocket (Socket.IO) -->      |
       |                                             |--> PostgreSQL  (permanent data)
       |                                             |--> Redis        (presence, pub/sub)
       |                                             |--> Cloudinary   (files/media)
       |                                             |--> Claude API   (AI features, later)
```

Two backend concerns split cleanly: **REST handles anything CRUD** — create a room, fetch message history, update your profile. **Socket.IO handles anything real-time** — a message arriving live, someone typing, presence changing. Both ultimately go through the same database and, where it matters (sending a message), the exact same code path — more on that in §5.

---

## 3. The Languages & Tools — What Each One Is, and Why It's Here

| Tool | What it actually is | Why this one |
|---|---|---|
| **Node.js** | A way to run JavaScript outside a browser, on a server | The team already knew JS; using it on both frontend and backend means one language, not two |
| **Express** | A minimal framework for handling HTTP requests in Node | The default, boring, extremely well-documented choice for a REST API — no reason to reach for anything fancier at this stage |
| **Socket.IO** | A library for real-time, two-way communication between browser and server | Plain WebSockets are low-level; Socket.IO adds automatic reconnection, room support (`io.to(roomId)`), and fallbacks — exactly what a chat app needs |
| **PostgreSQL** | A relational (table-based) database | Chat data is inherently relational — users belong to rooms, messages belong to rooms, tasks reference messages. Postgres also has real full-text search built in (used for message and decision search), so no separate search engine is needed yet |
| **Redis** | An in-memory key-value store | Presence ("who's online"), typing indicators, and pub/sub between server instances all need to be *fast* and *don't need to survive a restart* — a perfect fit, and the wrong job for Postgres |
| **Cloudinary** | A hosted media storage/CDN service | Storing large files (images, video) directly in Postgres or on the server's disk doesn't scale and isn't its job. The database only ever stores a URL and some metadata, never the file itself |
| **JWT (JSON Web Tokens)** | A signed, self-contained token proving who a user is | Lets the server verify a user's identity on every request *without* looking anything up in a database first — the token itself carries the proof. See §8 for the full explanation |
| **React** | A library for building interactive UIs out of components | Standard for this kind of app; large ecosystem, and the team already knows it |
| **Tailwind CSS** | A utility-first CSS framework | Lets styling happen directly in the markup (`className="p-4 rounded-lg"`) without writing and naming separate CSS files for every component — faster for a small team to move fast in |
| **Vite** | A build tool/dev server for frontend projects | Near-instant reload during development, much faster than older tools like Create React App |

---

## 4. Repo Tour — Every Folder, What It's For

```
backend/
  src/
    config/        Environment variables, and the three external connections
                    (Postgres, Redis, Cloudinary) — one file each
    controllers/    The actual logic behind every API endpoint
    middlewares/    Code that runs *before* a controller (auth check, error handling)
    routes/         Maps a URL + HTTP method to a controller function — no logic here
    services/       Shared business logic used by more than one entry point
                    (e.g. message.service.js is used by both the REST route
                    and the Socket.IO event for sending a message)
    sockets/        All Socket.IO event handlers, in one file
    utils/          Small shared helpers (error class, response formatter, async wrapper)
  database/
    migrations/     Plain SQL files, run in order, that build the database schema
    migrate.js      The script that runs them
client/
  src/
    pages/          One file per screen (Login, Room, Profile, etc.)
    components/     Reusable UI pieces used across pages (currently just Navbar)
    hooks/           Reusable pieces of React logic (currently useHeartbeat)
    lib/            Talking to the backend: api.js (REST) and socket.js (real-time)
docs/
    This file, the PKB (product/architecture brief), API_CONTRACTS.md, DECISIONS_LOG.md
docker-compose.yml    Spins up local Postgres + Redis for development
```

The pattern in `backend/src` — **route → controller → (service if shared) → database** — is consistent across the whole backend. Once you understand it for one endpoint, you understand it for all of them.

---

## 5. Following a Request End to End

Reading the folder list only gets you so far — here's what actually happens, step by step, for two real examples.

### Example A: registering a new account (`POST /api/auth/register`)

1. The request hits `app.js` first, and passes through three middlewares in order: **helmet** (sets security-related HTTP headers), **cors** (allows the frontend's origin to call this API), **morgan** (logs the request to the console — this is what you see as `GET /health 200 5ms` lines in your terminal).
2. `express.json()` parses the request body from raw text into a JavaScript object.
3. `app.use('/api', routes)` hands it to `routes/index.js`, which forwards anything under `/auth` to `routes/auth.routes.js`.
4. That file maps `POST /register` to `controllers/auth.controller.js`'s `register` function.
5. Inside `register`: check that `email`, `password`, and `displayName` were provided (else throw a 400 error). Check the email isn't already taken. Hash the password with **bcrypt** (never store a plain password — bcrypt turns it into a one-way scrambled string that can be checked but not reversed). Insert the new row into the `users` table. Sign an **access token** and a **refresh token** (see §8). Store a hash of the refresh token in the `refresh_tokens` table. Return the user, plus both tokens, with a 201 status.
6. If anything throws an error anywhere in that chain, it's caught by `asyncHandler` (a small wrapper every controller function is wrapped in, so a thrown error doesn't crash the whole server) and handed to `errorMiddleware`, which logs the real error to the server console and sends back a generic `{"success":false,"message":"..."}` — deliberately vague to the client, so internal details never leak over the wire.

### Example B: sending a message live (Socket.IO `send-message` event)

1. The client already has an open Socket.IO connection, authenticated at connect-time by verifying the JWT access token passed in `socket.handshake.auth.token` (see `sockets/index.js`'s `io.use(...)` middleware — this is the socket equivalent of the `requireAuth` middleware used on REST routes).
2. Client emits `send-message` with `{ roomId, content, replyToId? }`.
3. The handler in `sockets/index.js` calls `message.service.createMessage(...)` — **the exact same function** the REST fallback endpoint (`POST /api/messages`) calls. This matters: it means a message is validated and saved through one single code path no matter which route it came in through, so the two can never drift out of sync or produce inconsistent data.
4. `createMessage` checks the sender is actually a member of the room, checks the reply target exists if one was given, inserts the message, and fetches the sender's display name/avatar to attach to the response.
5. Back in the socket handler: clear any typing indicator for that user, then `io.to(roomId).emit('receive-message', { message })` — broadcasting the saved message to everyone currently in that room, instantly.

---

## 6. The Database — Every Table, and Why It's Shaped This Way

Migrations run in order from `backend/database/migrations/`. There's no ORM yet (Prisma/Drizzle is still an open decision — see the PKB) — for now, schema changes are plain, numbered `.sql` files, applied by `migrate.js`. Nobody is blocked waiting on that decision.

**001_init.sql — the foundation:**

| Table | What it stores | Notable design choice |
|---|---|---|
| `users` | Account info, hashed password, role | `role_id` links to `roles` for admin/moderator/user access levels |
| `roles` | The three access levels | Seeded with `admin`, `moderator`, `user` on creation |
| `refresh_tokens` | Hashed refresh tokens, one row per issued token | Stored **hashed**, never in plain text — same reasoning as passwords. Can be individually revoked (logout) |
| `rooms` | A chat room — 1:1 or group | `type` distinguishes `dm` from `group` |
| `room_members` | Who belongs to which room, and their role in it | `last_seen_at` here is the single field the Catch-up Digest will depend on — everything "new since you were last here" is calculated from this timestamp |
| `messages` | The actual chat messages | `reply_to_id` supports threaded replies; `edited_at`/`deleted_at` support edit and soft-delete without losing history |
| `message_reactions` | Emoji reactions on messages | Unique constraint on (message, user, emoji) prevents duplicate reactions |
| `attachments` | Metadata for uploaded files | Stores only the Cloudinary URL + type/size — never the file itself |
| `notifications` | New message, mention, invite, etc. | Generic `reference_id` points at whatever triggered it, depending on `type` |

**002_decisions_tasks_digest.sql — the differentiator layer:**

| Table | What it stores | Notable design choice |
|---|---|---|
| `decisions` | Promoted messages, tagged and searchable | `source_message_id` links back to the original message; a GIN index enables full-text search independent of scrolling chat history |
| `tasks` | Action items with status | `status` is `open`/`in_progress`/`done`; also links back to its `source_message_id` |
| `digests` | Cached, generated summaries | Explicitly a **cache**, not a source of truth — safe to delete and regenerate at any time |

**003_messages_search_index.sql** (added on the `conclave_v1` branch, not yet on `main`): adds a GIN full-text index on `messages.content` (used by the message search endpoint) and a composite index for faster paginated message history queries.

---

## 7. The Real-Time Layer — Socket.IO + Redis

Everything time-sensitive goes through Socket.IO rather than REST, because polling the server every few seconds to ask "anything new?" doesn't scale and feels laggy. Socket.IO keeps one open connection per client instead.

**The event catalog** (see `backend/src/sockets/index.js` for the authoritative, always-current list):

| Direction | Event | What it's for |
|---|---|---|
| Client → Server | `join-room` / `leave-room` | Enter/exit a room's live updates |
| Client → Server | `send-message` | Send a message (goes through `message.service.createMessage`) |
| Client → Server | `typing` / `stop-typing` | Typing indicator |
| Client → Server | `message-read` | Read receipt |
| Client → Server | `heartbeat` | Keep-alive signal, every 30s (see below) |
| Server → Client | `receive-message` | A new message arrived |
| Server → Client | `user-online` / `user-offline` | Global presence change |
| Server → Client | `room-presence` | Who's online *in this specific room* |
| Server → Client | `room-typing` | Full typing state, sent when you join a room |

**Presence, explained:** a client can disconnect ungracefully — a dropped WiFi connection doesn't send a polite "goodbye" packet. To handle that, the client sends a `heartbeat` event every 30 seconds (`client/src/hooks/useHeartbeat.js`), and the server stores a Redis key with a 45-second expiry (`presence.service.js`). A background sweep, running every 30 seconds, checks for users whose heartbeat key has silently expired and marks them offline. This is why the heartbeat interval (30s) is deliberately shorter than the TTL (45s) — it needs enough margin that one missed beat doesn't falsely mark someone offline.

**Why Redis specifically:** presence data changes constantly and doesn't need to survive a server restart — exactly what Redis is for, and exactly the kind of write load that would be wasteful to put on Postgres. The Redis adapter (`@socket.io/redis-adapter`, wired up in `server.js`) also means that if the backend is ever scaled to multiple server instances, a message sent to a user connected to *server B* still reaches them even if it originated on *server A* — Redis pub/sub bridges the two.

---

## 8. Auth — JWT Access + Refresh Tokens, Explained Simply

Two tokens, two different jobs:

- **Access token** — short-lived (15 minutes), sent with every request in the `Authorization: Bearer <token>` header. The server verifies it by checking its cryptographic signature — no database lookup needed, which is what "stateless" means and why it's fast. Because it's short-lived, if one ever leaks, the damage window is small.
- **Refresh token** — long-lived (7 days), used *only* to get a new access token when the old one expires. Unlike the access token, refresh tokens are tracked in the `refresh_tokens` table (hashed, not plaintext) so they can be individually revoked — logging out invalidates that specific token without affecting any other device the user's logged into.

The password itself is never stored — only a **bcrypt hash** of it. Bcrypt is intentionally slow (by design, to resist brute-force guessing) and one-way: logging in re-hashes the entered password and compares hashes, never decrypts anything, because there's nothing to decrypt.

---

## 9. Frontend — How the Client Is Put Together

- **`main.jsx`** — the entry point; wraps the app in `BrowserRouter` for routing.
- **`App.jsx`** — defines every route (`/login`, `/`, `/rooms/:roomId`, etc.), renders the shared `Navbar`, and (on `conclave_v1`) opens the Socket.IO connection on mount if a token is already stored, and keeps it alive via `useHeartbeat`.
- **`lib/api.js`** — a shared `axios` instance. Every REST call should go through this, not a fresh `axios` call, because it has an interceptor that automatically attaches the stored access token to every outgoing request.
- **`lib/socket.js`** — manages a single Socket.IO connection: `connectSocket()`, `disconnectSocket()`, `getSocket()`. Deliberately a singleton — only one connection should ever be open per browser tab.
- **`hooks/useHeartbeat.js`** — the 30-second keep-alive described in §7.
- **`pages/`** — one file per screen. As of this writing, **every page is still a placeholder** (`Login`, `Register`, `Home`, `Profile`, `Settings`, `Notifications`, `Room` all just render a heading and "TODO: build this page"). No actual UI has been built yet — see §11 for the honest current status.

---

## 10. The Differentiator Features, for Anyone New to the Project

These are what separate Conclave from a generic chat clone — worth understanding even before they're built, since they shape decisions being made in the foundation layer right now (e.g. why `last_seen_at` exists on `room_members`, why `decisions`/`tasks` link back to `source_message_id`).

- **Decisions Layer:** any message can be promoted into a tagged Decision, stored outside the normal chat timeline and independently searchable. Solves "what did we actually agree on?" without scrolling back through weeks of chat.
- **Action Items:** any message can be flagged as a task, assigned to someone, and tracked through open → in progress → done in a dedicated per-room tab. Solves "who owns this?"
- **Catch-up Digest:** opening a room after time away shows what's actually changed — new decisions, new/updated tasks, mentions, files — rather than a bare unread count.
- **Ask This Room** (later phase): once the above three exist as real structured data, a member will be able to ask a plain question and get an answer sourced from that room's own decisions/tasks/messages, answered via the Claude API with citations back to the source message. This is why it's sequenced *after* the other three — it has nothing to retrieve against until they exist.

---

## 11. Current State of the Repo — Verified, Not Assumed

Everything below was checked directly against the actual repository (both branches cloned, `npm install` run, every file syntax-checked) rather than inferred from the plan.

**On `main`:**
- ✅ Auth (register/login/refresh/logout) — fully implemented
- ✅ Rooms (create/list/get/add member) — fully implemented, including a transaction-safe room creation flow
- 🚧 Everything else (`messages`, `decisions`, `tasks`, `digest`, `notifications`, `upload`) — scaffolded with clear TODOs, not yet implemented
- Frontend — routing and page shells exist; no page has real UI yet

**On `conclave_v1` (not yet merged into `main`):**
- ✅ Everything from `main`, plus:
- ✅ Messages — send (REST + Socket.IO, sharing one code path), paginated history, full-text search
- ✅ Presence — online/offline, per-room presence, typing indicators, heartbeat + stale-user sweep, all Redis-backed
- ✅ Multi-instance Socket.IO scaling via the Redis adapter
- Frontend — socket connection lifecycle and heartbeat wired into `App.jsx`; pages themselves still unbuilt

**Not started anywhere yet:** Decisions, Action Items, Catch-up Digest, notifications, file upload, and essentially all of the actual frontend UI.

**The one open item that matters most right now:** `conclave_v1` needs to be merged into `main`. Until that happens, anyone who clones the repo the normal way only gets the older, less-complete version — and the longer the two branches diverge, the harder that merge gets.

---

## 12. Glossary

- **REST API** — the standard "send a request, get a response" pattern (`GET`, `POST`, etc.) used for anything that isn't real-time.
- **WebSocket** — a connection that stays open, letting server and client send messages to each other at any time, in either direction, without a new request each time.
- **Endpoint** — one specific URL + HTTP method combination that does one thing, e.g. `POST /api/auth/login`.
- **Middleware** — code that runs *between* the incoming request and the final handler — used for cross-cutting things like auth checks or logging that apply to many routes at once.
- **ORM** — a library that lets you write database queries as code instead of raw SQL. Not in use here yet (deliberately — see §6); an open decision for later.
- **Migration** — a file describing one incremental change to the database schema, run in order so every environment (your laptop, a teammate's laptop, production) ends up with an identical database structure.
- **Hashing** — a one-way scrambling of data (like a password) so it can be checked but never reversed back to the original.
- **JWT** — a signed token that proves identity without needing a database lookup to check it. See §8.
- **Pub/Sub** — "publish/subscribe": one part of the system announces something happened, and any other part that's listening reacts. Used here so multiple backend servers can stay in sync via Redis.

---

## 13. Where to Go Next

- **Product vision, full feature list, team roles, sprint plan:** `docs/PKB_Project_Architecture_Brief.docx`
- **Endpoint-by-endpoint API reference (living document):** `docs/API_CONTRACTS.md`
- **Project decisions log:** `docs/DECISIONS_LOG.md`
- **The authoritative, always-current Socket.IO event list:** the comment block at the top of `backend/src/sockets/index.js`
