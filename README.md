<div align="center">
  <img src="assets/banner.svg" alt="TypeType" width="100%">
</div>

<div align="center">

[<img src="assets/widgets/license.svg" alt="MIT license">](LICENSE)

[<img src="assets/widgets/typetype.svg" alt="TypeType">](https://github.com/Priveetee/TypeType)
[<img src="assets/widgets/pipepipe.svg" alt="PipePipe">](https://github.com/InfinityLoop1308/PipePipeExtractor)
[<img src="assets/widgets/react.svg" alt="React">](https://react.dev)

</div>

TypeType is a self-hosted, privacy-respecting video platform with a modern web client, private user features, and a server-side extraction boundary. It is built for people who want a clean video experience without handing watch history, subscriptions, playlists, and preferences to a public platform.

This project is still young. Expect active changes while watch, recommendations, imports, and mobile layouts continue to mature.

## What this is

A TypeScript web application and self-hosting stack for TypeType. The frontend runs in the browser, talks to TypeType-Server over HTTP, and keeps extraction out of the web codebase.

The app focuses on a calm interface for watching videos, managing subscriptions, importing existing data, and keeping user state on your own instance.

## What this is not

- Not a YouTube frontend clone.
- Not a fork of Piped, FreeTube, LibreTube, Invidious, or NewPipe.
- Not a standalone extractor. TypeType needs a reachable TypeType-Server instance.
- Not affiliated with YouTube or any upstream video platform.

## Highlights

- Watch pages with subtitles, audio language selection, progress tracking, playlists, favorites, and watch later.
- Home recommendations with local privacy controls and feedback actions.
- Shorts-style vertical browsing for short-form videos.
- YouTube Takeout and PipePipe backup import flows.
- Download jobs through a separate downloader service.
- A Docker Compose stack for self-hosting the frontend, backend, cache, database, token service, and artifact storage.

## Source repositories

If you only want the source code, clone the repositories directly:

```sh
git clone https://github.com/Priveetee/TypeType.git
git clone https://github.com/Priveetee/TypeType-Server.git
git clone https://github.com/Priveetee/TypeType-Downloader.git
git clone https://github.com/Priveetee/TypeType-Token.git
```

## Stack

| Role | Tool |
|---|---|
| Language | TypeScript |
| Runtime | Bun |
| Build | Vite |
| UI | React |
| Routing | TanStack Router |
| Server state | TanStack Query |
| Client state | Zustand |
| Player | Vidstack |
| Styling | Tailwind CSS |
| Components | shadcn/ui + Radix UI |
| Quality | Biome, Sherif, Knip |
| Deployment | Docker Compose |
| License | MIT |

## Self-hosting

The installer is for running the stack, not just cloning the source repositories:

```sh
curl -fsSL https://raw.githubusercontent.com/Priveetee/TypeType/main/scripts/install-stack.sh | bash
```

It installs to `~/typetype-stack`, generates local downloader credentials, chooses free ports when needed, starts the services, and bootstraps Garage.

To download stack files without starting Docker:

```sh
curl -fsSL https://raw.githubusercontent.com/Priveetee/TypeType/main/scripts/install-stack.sh | bash -s -- --download-only
```

For an interactive setup from a cloned repository:

```sh
./scripts/setup-stack.sh
```

Manual setup is also supported:

```sh
cp .env.example .env
docker compose pull
docker compose up -d
./scripts/bootstrap-garage.sh
docker compose ps
```

Default local endpoints are `http://localhost:8082` for the frontend, `http://localhost:8080` for the API, and `http://localhost:8081` for the token service. Host ports can be changed through `.env`.

## Local development

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

Open `http://localhost:5173`.

## Checks

```sh
bun run check
bun run build
bun run knip
bun run sherif
```

## Updating

Update the whole stack:

```sh
docker compose pull
docker compose up -d --force-recreate
docker compose ps
```

Update only the frontend:

```sh
docker compose pull typetype
docker compose up -d --force-recreate --no-deps typetype
```

## Acknowledgments

TypeType is a clean rewrite, but the product direction was shaped by existing open-source video clients and extractor projects.

- [Piped](https://github.com/TeamPiped/Piped-Frontend) for UX and API pattern references.
- [FreeTube](https://github.com/FreeTubeApp/FreeTube) for video player behavior references.
- [PipePipe](https://github.com/InfinityLoop1308/PipePipe) and [PipePipeExtractor](https://github.com/InfinityLoop1308/PipePipeExtractor) for multi-service extraction behavior.

## License

MIT. See [LICENSE](LICENSE).
