<div align="center">
  <img src="assets/banner.svg" alt="TypeType" width="100%">
</div>

<div align="center">

[<img src="assets/widgets/license.svg" alt="MIT license">](LICENSE)
[<img src="assets/widgets/typetype.svg" alt="TypeType">](https://github.com/Priveetee/TypeType)
[<img src="assets/widgets/pipepipe.svg" alt="PipePipe">](https://github.com/InfinityLoop1308/PipePipeExtractor)
[<img src="assets/widgets/react.svg" alt="React">](https://react.dev)

</div>

TypeType is a self-hostable video app for YouTube, NicoNico and BiliBili.

It is not only a web UI. This repository contains the TypeType web client and the deployment files for running the full stack: frontend, Kotlin API backend, PostgreSQL, Dragonfly, media proxying, token service, downloader service and Garage-backed download storage.

## Documentation

Full documentation lives at **[priveetee.github.io/Docs-TypeType](https://priveetee.github.io/Docs-TypeType/)**:

- [Self-hosting guide](https://priveetee.github.io/Docs-TypeType/self-hosting/introduction), set up and operate the stack, including a fully script-free Docker Compose setup.
- [User guide](https://priveetee.github.io/Docs-TypeType/guide/), everything the app can do.

## Start Here

Install and start the stack with one command:

```sh
curl -fsSL https://raw.githubusercontent.com/Priveetee/TypeType/main/scripts/install-stack.sh | bash
```

The installer creates `~/typetype-stack`, generates local downloader and YouTube remote login secrets, selects available ports when defaults are busy, starts the services, and bootstraps Garage.

After install:

```sh
cd ~/typetype-stack
docker compose ps
curl -fsS http://localhost:8080/health
```

Open the web app:

```text
http://localhost:8082
```

Default local endpoints:

| Service | URL |
|---|---|
| Web app | `http://localhost:8082` |
| API backend | `http://localhost:8080` |
| Token service | `http://localhost:8081` |
| Garage S3 | `http://localhost:3900` |

Download the stack files without starting Docker:

```sh
curl -fsSL https://raw.githubusercontent.com/Priveetee/TypeType/main/scripts/install-stack.sh | bash -s -- --download-only
```

## Screenshots

![TypeType home](assets/screenshots/01-home-desktop.png)

### Multi-Service Search

![TypeType multi-service search](assets/gifs/multi-service-search.gif)

| YouTube | NicoNico | BiliBili |
|---|---|---|
| ![YouTube search](assets/screenshots/02-youtube-search-desktop.png) | ![NicoNico search](assets/screenshots/05-niconico-search-desktop.png) | ![BiliBili search](assets/screenshots/07-bilibili-search-desktop.png) |

### Playback

![TypeType watch flow](assets/gifs/watch-flow.gif)

| YouTube | NicoNico | BiliBili |
|---|---|---|
| ![YouTube watch page](assets/screenshots/04-youtube-watch-desktop.png) | ![NicoNico watch page](assets/screenshots/06-niconico-watch-desktop.png) | ![BiliBili watch page](assets/screenshots/08-bilibili-watch-desktop.png) |

| Save to playlist | Download formats | NicoNico danmaku |
|---|---|---|
| ![Save to playlist](assets/screenshots/15-youtube-save-dropdown-desktop.png) | ![Download format picker](assets/screenshots/16-youtube-download-sheet-desktop.png) | ![NicoNico danmaku](assets/screenshots/17-niconico-danmaku-desktop.png) |

### Library Flow

![TypeType library flow](assets/gifs/library-flow.gif)

| Playlists | History | Import |
|---|---|---|
| ![Playlists](assets/screenshots/09-library-playlists-desktop.png) | ![History](assets/screenshots/10-history-desktop.png) | ![Import](assets/screenshots/11-import-desktop.png) |

| Channel | Settings |
|---|---|
| ![Channel page](assets/screenshots/03-youtube-channel-desktop.png) | ![Settings](assets/screenshots/12-settings-desktop.png) |

Subscriptions:

![Subscriptions](assets/screenshots/14-subscriptions-desktop.png)

Import and settings flow:

![TypeType import and settings flow](assets/gifs/import-settings-flow.gif)

Mobile layout:

![TypeType mobile flow](assets/gifs/mobile-flow.gif)

| Home | Search | Watch |
|---|---|---|
| ![TypeType mobile home](assets/screenshots/13-home-mobile.png) | ![TypeType mobile search](assets/screenshots/18-mobile-search.png) | ![TypeType mobile watch](assets/screenshots/19-mobile-watch.png) |

## What It Does

- Plays YouTube, NicoNico and BiliBili videos from a self-hosted web app.
- Stores history, subscriptions, playlists, favorites, watch later, progress and settings on your own instance.
- Searches, loads trending feeds, shows comments and opens channel pages through the backend API.
- Proxies media when direct browser playback is unreliable or provider-specific headers are needed.
- Generates DASH manifests when separate audio/video streams are available.
- Imports YouTube Takeout data and PipePipe backup data.
- Runs download jobs through a separate downloader service.

## What This Is Not

- Not a hosted SaaS.
- Not a YouTube-only frontend clone.
- Not a fork of Piped, FreeTube, LibreTube, Invidious or NewPipe.
- Not a browser-side extractor. Extraction stays behind the HTTP API boundary.
- Not affiliated with YouTube, NicoNico, BiliBili or any upstream video platform.

## Stack

| Role | Project |
|---|---|
| Web client | React, TypeScript, Vite, TanStack Router, TanStack Query, Tailwind CSS |
| API backend | Kotlin, Ktor, PipePipeExtractor |
| User data | PostgreSQL |
| Extraction cache | Dragonfly |
| Media proxy | TypeType-Server |
| Token service | TypeType-Token |
| Downloader | TypeType-Downloader |
| Download storage | Garage S3 |
| Deployment | Docker Compose |

## API Smoke Tests

Run these after the stack is up.

Health:

```sh
curl -fsS http://localhost:8080/health
```

YouTube search:

```sh
curl -fsS "http://localhost:8080/search?q=lofi&service=0"
```

NicoNico suggestions:

```sh
curl -fsS "http://localhost:8080/suggestions?query=miku&service=6"
```

BiliBili trending:

```sh
curl -fsS "http://localhost:8080/trending?service=5"
```

YouTube stream extraction:

```sh
curl -fsS "http://localhost:8080/streams?url=https%3A%2F%2Fwww.youtube.com%2Fwatch%3Fv%3DdQw4w9WgXcQ"
```

NicoNico stream extraction:

```sh
curl -fsS "http://localhost:8080/streams?url=https%3A%2F%2Fwww.nicovideo.jp%2Fwatch%2Fsm9"
```

Create a guest session for protected user-data endpoints:

```sh
curl -fsS -X POST http://localhost:8080/auth/guest
```

Use the returned token as a bearer token, or let Python extract it:

```sh
TOKEN="$(curl -fsS -X POST http://localhost:8080/auth/guest | python3 -c 'import json,sys; print(json.load(sys.stdin)["token"])')"
curl -fsS http://localhost:8080/settings -H "Authorization: Bearer ${TOKEN}"
```

Service IDs:

| Service | ID |
|---|---:|
| YouTube | `0` |
| BiliBili | `5` |
| NicoNico | `6` |

## Manual Install

The installer is recommended. For a fully **script-free** Docker Compose setup (no bootstrap scripts), follow the [manual setup guide](https://priveetee.github.io/Docs-TypeType/self-hosting/docker-compose). If you want to run from a cloned repository with the helper scripts instead:

```sh
git clone https://github.com/Priveetee/TypeType.git
cd TypeType
cp .env.example .env
./scripts/bootstrap-env.sh
./scripts/setup-stack.sh
```

Manual Docker Compose flow:

```sh
cp .env.example .env
./scripts/bootstrap-env.sh
docker compose pull
./scripts/bootstrap-garage.sh
docker compose up -d
docker compose ps
```

If you do the manual flow, edit `.env` before exposing the stack outside localhost. In particular, keep the generated downloader S3 access key, downloader S3 secret key, YouTube remote login token, and YouTube session encryption key private.

## Updating

Update the whole stack:

```sh
cd ~/typetype-stack
./scripts/bootstrap-env.sh
docker compose pull
docker compose up -d --force-recreate
docker compose ps
```

Update only the web client:

```sh
cd ~/typetype-stack
docker compose pull typetype
docker compose up -d --force-recreate --no-deps typetype
```

## Local Development

Install dependencies:

```sh
bun install
```

Create the frontend environment file:

```sh
cp apps/web/.env.example apps/web/.env
```

Set the API URL:

```env
VITE_API_URL=http://localhost:8080
```

Run the dev server:

```sh
bun run dev
```

Open:

```text
http://localhost:5173
```

Checks:

```sh
bun run check
bun run build
bun run knip
bun run sherif
```

## Related Repositories

- [TypeType](https://github.com/Priveetee/TypeType) contains the web client and deployment stack.
- [TypeType-Server](https://github.com/Priveetee/TypeType-Server) is the Kotlin/Ktor API backend.
- [TypeType-Downloader](https://github.com/Priveetee/TypeType-Downloader) handles download jobs and artifacts.
- [TypeType-Token](https://github.com/Priveetee/TypeType-Token) provides YouTube PO tokens.

Clone the source repositories directly:

```sh
git clone https://github.com/Priveetee/TypeType.git
git clone https://github.com/Priveetee/TypeType-Server.git
git clone https://github.com/Priveetee/TypeType-Downloader.git
git clone https://github.com/Priveetee/TypeType-Token.git
```

## Notes

TypeType is usable, but it is still young. Video providers change frequently, and provider-specific extraction, signed URLs, manifests, headers, range requests and cache TTLs can break over time.

The clean boundary is HTTP. The web client talks to the API; extraction stays in TypeType-Server.

## Acknowledgments

TypeType is a clean rewrite, but its direction was shaped by existing open-source video clients and extractor projects.

- [PipePipe](https://github.com/InfinityLoop1308/PipePipe) and [PipePipeExtractor](https://github.com/InfinityLoop1308/PipePipeExtractor) for multi-service extraction behavior.
- [Piped](https://github.com/TeamPiped/Piped-Frontend) for UX and API pattern references.
- [FreeTube](https://github.com/FreeTubeApp/FreeTube) for video player behavior references.

## License

This repository is MIT licensed. See [LICENSE](LICENSE).

TypeType-Server is GPLv3 because it uses PipePipeExtractor.
