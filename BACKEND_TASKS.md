# Backend tasks — from frontend implementation

Found while building the frontend against the Penpot design. Ordered by what blocks the most.

---

## 1. Cross-room endpoints for Decisions and Digest

**The biggest gap, and it's the same gap twice.**

`/decisions` and `/digest` are both top-level, cross-room pages in the design. Each decision card shows its own `#room` in the metadata, so the page is explicitly showing decisions from across a user's rooms.

But the only endpoints that exist are room-scoped:

- `GET /decisions/room/:roomId`
- `GET /digest/room/:roomId`

Neither can answer "everything across every room I'm in", which is what both pages need.

Both controllers are TODO stubs (`decisions.controller.js`, `digest.controller.js`), so this is finishing them rather than starting from scratch.

The frontend fixtures in `client/src/config/devPreview.js` show the shape needed — `previewDecisions`, `previewDigestSummary`, `previewDigestItems`. Comments in that file describe the gap inline.

Note on the digest: the controller's own comments describe v1 as rule-based (query everything created after `room_members.last_seen_at`). The `digests` table is a cache, not a source of truth.

---

## 2. `listRooms` doesn't select `r.type`

`rooms.controller.js` — `listRooms` omits `r.type`, though `getRoom` includes it.

The sidebar now shows a Hash icon for public rooms and a Lock icon for private ones, per the design. Because `type` comes back undefined from `listRooms`, every room silently falls back to a generic icon.

One column in a SELECT. Smallest item on this list.

---

## 3. `attachments` has no filename column

`messages.controller.js` currently aliases `a.file_url` as `filename`, so the file card in a message renders a full URL where a filename should be.

Needs a migration adding a filename column, then the alias corrected.

---

## 4. `createMessage` doesn't include attachments

`listMessages` returns attachments after the recent fix, but `createMessage` (used for socket `receive-message`) doesn't.

So attachments appear on history load and vanish on live messages.

---

## 5. Message sender shape is inconsistent

- REST `listMessages` returns flat `sender_name`
- Socket `createMessage` returns nested `sender.display_name`

Both end up in the same `messages` array in `useMessages`, so the client carries a defensive helper checking each in turn.

Not urgent — it works. But two endpoints returning different shapes for the same entity means every consumer needs that helper, and it'll bite again when a field is added.

---

## 6. No delete-account endpoint

`/profile` has a Delete account button in a danger zone. There's no endpoint, so it shows an alert saying the feature isn't available.

Lower priority than the rest — flagging so it isn't forgotten before launch.

---

## Working agreement

- Branch and open a PR rather than pushing to `main`.
- **Don't change `useMessages` or `useRoom` signatures without telling everyone** — the frontend is built against them. If a signature needs to change, that's a conversation first.
- Formatting: an editor reformatted two whole files on a recent commit (single to double quotes, object expansion), turning a 4-line fix into a 172-line diff. Worth checking Prettier config against the repo's.
