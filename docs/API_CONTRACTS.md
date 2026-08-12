# API Contracts (working draft)

Base URL: `http://localhost:5000/api`
Auth: `Authorization: Bearer <accessToken>` on every route except `/auth/*`.

Fill this in as each route is actually implemented — treat it as the
source of truth the frontend codes against, not documentation written
after the fact.

## Auth
| Method | Path | Body | Notes |
|---|---|---|---|
| POST | /auth/register | `{ email, password, displayName }` | ✅ implemented |
| POST | /auth/login | `{ email, password }` | ✅ implemented |
| POST | /auth/refresh | `{ refreshToken }` | ✅ implemented |
| POST | /auth/logout | `{ refreshToken }` | ✅ implemented |

## Users
| Method | Path | Notes |
|---|---|---|
| GET | /users/me | ✅ implemented |
| PATCH | /users/me | TODO |
| GET | /users | TODO |

## Rooms / Messages / Decisions / Tasks / Digest / Notifications / Upload

TODO — one row per endpoint, same format as above, filled in as each
person builds their assigned area. See the PKB §8 for ownership.
