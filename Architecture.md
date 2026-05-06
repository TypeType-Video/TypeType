# Architecture

## Overview

TypeType is a frontend SPA. It renders client-side and talks to backend services over HTTP.

Runtime responsibilities:

- TypeType frontend (this repo): UI, routing, state, playback UX
- TypeType-Server: extraction, auth, user data
- TypeType-Token: PO token and subtitle helper for YouTube flows

## System Boundary

```
PipePipeExtractor (Java, GPL v3)
        |
        v
TypeType-Server (Kotlin/Ktor, GPL v3)
        |
        v
TypeType frontend (TypeScript/React, MIT)
```

The frontend and backend are separate programs. The REST API is the boundary.

## Frontend Stack

| Role | Tool |
|---|---|
| Language | TypeScript (strict) |
| Runtime / Package manager | Bun |
| Build | Vite |
| Framework | React |
| Routing | TanStack Router |
| Server state | TanStack Query |
| Client state | Zustand |
| Video player | Vidstack |
| Styling | Tailwind CSS |
| Components | shadcn/ui + Radix UI |
| Lint / Format | Biome |

## Repository Structure

```
TypeType/
├── apps/
│   └── web/
│       ├── src/
│       │   ├── components/
│       │   ├── hooks/
│       │   ├── lib/
│       │   ├── routes/
│       │   └── types/
│       └── public/
├── Dockerfile
├── docker-compose.yml
└── nginx.conf
```

## Runtime Data Flow

```
User action
    |
    v
Route / Hook
    |
    v
TanStack Query / fetch
    |
    v
TypeType-Server HTTP API
    |
    v
JSON response
    |
    v
UI render update
```

## Authentication Model

TypeType uses JWT auth from TypeType-Server.

Auth routes:

- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/refresh`
- `GET /auth/me`
- `POST /auth/guest`
- `POST /auth/reset-password`

Protected routes use:

- `Authorization: Bearer <token>`

## API Surface (frontend usage)

Base URL is `VITE_API_URL` (defaults to `/api` in app runtime).

Public data routes:

- `/streams`, `/streams/manifest`, `/streams/native-manifest`
- `/search`, `/suggestions`, `/trending`
- `/comments`, `/comments/replies`, `/bullet-comments`, `/channel`
- `/proxy`, `/proxy/storyboard`, `/proxy/nicovideo`

Protected user routes:

- `/history`, `/subscriptions`, `/subscriptions/feed`, `/subscriptions/shorts`
- `/playlists`, `/watch-later`, `/progress`, `/favorites`, `/settings`
- `/search-history`, `/blocked/channels`, `/blocked/videos`
- `/recommendations/home`, `/recommendations/shorts`
- `/recommendations/home/metrics`, `/restore/pipepipe`, `/imports/youtube-takeout`, `/bug-reports`

Protected admin routes:

- `/admin/users`, `/admin/settings`, `/admin/bug-reports`

## Notable Behavior Contracts

- `GET /progress/{videoUrl}` can return `404` when no position exists; frontend treats this as position `0`
- YouTube uses `/streams/native-manifest` first, then fallback to `/streams/manifest` on `422`
- NicoNico can return `422` on `/streams/manifest`; expected for non-DASH cases
- `GET /search-history` supports backend pagination: `page` and `limit`, total from `X-Total-Count`
- Home and Shorts recommendations are fetched without client event reporting

## Recommendation and Privacy Flow

- Home feed requests call `/recommendations/home` with `intent` (currently default `auto`).
- Shorts feed requests call `/recommendations/shorts` with `intent` (currently default `auto`).
- Optional offline quality metrics are available via `/recommendations/home/metrics`.

## Import and Restore Flow

- YouTube import (`/imports/youtube-takeout`) is job-based:
  - create upload job,
  - poll status,
  - fetch preview,
  - commit import,
  - read final report.
- PipePipe restore uses `POST /restore/pipepipe?timeMode=raw|normalized` and returns restore counts plus watchedAt range details.

## License Boundary

TypeType-Server is GPL v3. This frontend is MIT.

No backend source code, classes, or shared modules are imported into the frontend. Integration is HTTP-only.
