<p align="center">
  <img src="assets/banner.svg" alt="TypeType" width="100%">
</p>

# TypeType

TypeType is a self-hosted video platform for YouTube, NicoNico, and BiliBili. It combines a web app, private accounts and libraries, playback, downloads, and instance administration in one stack that you control.

This is the central TypeType repository. It contains the Docker Compose stack, installer, update and rollback tools, release coordination, and the project issue tracker.

## Desktop

<p align="center">
  <img src="assets/screenshots/01-hero-watch-desktop.png" alt="TypeType playing a YouTube video" width="100%">
</p>

### Search across three services

<p align="center">
  <img src="assets/gifs/01-multi-service-search.gif" alt="Switching a TypeType search between YouTube, NicoNico, and BiliBili" width="960">
</p>

| YouTube | NicoNico | BiliBili |
| --- | --- | --- |
| ![YouTube search results](assets/screenshots/02-youtube-search-desktop.png) | ![NicoNico search results](assets/screenshots/03-niconico-search-desktop.png) | ![BiliBili search results](assets/screenshots/04-bilibili-search-desktop.png) |

### Keep your own library

| Save to a playlist | Resume from history |
| --- | --- |
| ![Saving a video to a playlist](assets/gifs/02-save-to-playlist.gif) | ![Resuming a video from history](assets/gifs/03-resume-from-history.gif) |

| Subscriptions | History |
| --- | --- |
| ![TypeType subscriptions](assets/screenshots/05-subscriptions-desktop.png) | ![TypeType watch history](assets/screenshots/06-history-desktop.png) |

## Mobile

| Home | Search | History |
| --- | --- | --- |
| ![TypeType mobile home](assets/screenshots/07-mobile-home.png) | ![TypeType mobile search](assets/screenshots/08-mobile-search.png) | ![TypeType mobile history](assets/screenshots/09-mobile-history.png) |

| Playlists | Playback | Audio only |
| --- | --- | --- |
| ![TypeType mobile playlists](assets/screenshots/10-mobile-playlists.png) | ![TypeType mobile playback](assets/screenshots/11-mobile-watch.png) | ![TypeType mobile audio-only mode](assets/screenshots/12-mobile-audio-only.png) |

## Start here

### Install TypeType

Docker Engine and Docker Compose v2 are required.

```sh
curl -fsSL https://raw.githubusercontent.com/TypeType-Video/TypeType/main/scripts/install-stack.sh | bash
```

The installer creates `~/typetype-stack`, generates installation-specific secrets, and asks before starting the stack.

- [Quick start](https://typetype-video.github.io/Docs-TypeType/self-hosting/quick-start)
- [Manual Docker Compose setup](https://typetype-video.github.io/Docs-TypeType/self-hosting/docker-compose#manual-setup)
- [Configuration](https://typetype-video.github.io/Docs-TypeType/self-hosting/configuration)

### Use and maintain your instance

- [User guide](https://typetype-video.github.io/Docs-TypeType/guide/)
- [Update guide](https://typetype-video.github.io/Docs-TypeType/self-hosting/maintenance)
- [Rollback guide](https://typetype-video.github.io/Docs-TypeType/self-hosting/rollback)
- [Release notes](https://typetype.video/releases)
- [Report a bug or request a feature](https://github.com/TypeType-Video/TypeType/issues)

## What TypeType includes

- A responsive web client for YouTube, NicoNico, and BiliBili
- Accounts, subscriptions, history, playlists, favorites, and watch progress
- MSE and SABR playback with quality, audio-track, subtitle, and recovery controls
- Video and audio downloads with local or S3-compatible storage
- SponsorBlock, DeArrow, content blocking, imports, OIDC, and instance administration
- No TypeType telemetry; the instance operator controls the deployment and its data

## For developers

Each component has its own repository, tests, release cycle, and license. Pull requests belong in the repository that owns the changed code. Bug reports and feature requests stay in the central issue tracker.

| Repository | Responsibility | License |
| --- | --- | --- |
| [TypeType](https://github.com/TypeType-Video/TypeType) | Stack, installer, releases, coordination, and issues | MIT |
| [TypeType-Frontend](https://github.com/TypeType-Video/TypeType-Frontend) | React web client | MIT |
| [TypeType-Server](https://github.com/TypeType-Video/TypeType-Server) | Kotlin API, extraction, and user data | GPL-3.0 |
| [TypeType-Player](https://github.com/TypeType-Video/TypeType-Player) | Browser MSE and SABR playback package | MIT |
| [TypeType-Token](https://github.com/TypeType-Video/TypeType-Token) | YouTube token, decoder, and session service | MIT |
| [TypeType-Downloader](https://github.com/TypeType-Video/TypeType-Downloader) | Download jobs, muxing, and artifacts | GPL-3.0-or-later |
| [Docs-TypeType](https://github.com/TypeType-Video/Docs-TypeType) | User and self-hosting documentation | MIT |

Development changes target each component's `dev` branch. `main` represents the stable release line.

Clone the central stack and all public components with:

```sh
git clone --recurse-submodules https://github.com/TypeType-Video/TypeType.git
```

Read [CONTRIBUTING.md](CONTRIBUTING.md) before opening a pull request.

## Privacy and disclaimer

TypeType is designed to provide a private, self-hosted way to use supported media services. The project does not add telemetry or collect usage data. Instance operators control their own accounts, logs, storage, and network configuration.

TypeType is not affiliated with, funded, authorized, endorsed by, or associated with YouTube, Google LLC, NicoNico, BiliBili, or their affiliates. Trademarks, service marks, trade names, and other intellectual property belong to their respective owners.

TypeType is open source software built for learning and research purposes.

## License

The orchestration files in this repository are licensed under the [MIT License](LICENSE). Each component keeps the license shown in the repository table.
