<p align="center">
  <img src="assets/banner.svg" alt="TypeType" width="100%">
</p>

# TypeType

TypeType is a self-hosted web client for YouTube, with support for NicoNico and BiliBili. This repository is the central project repository: it contains the Docker Compose stack, installer, update and rollback tooling, release notes, and issue tracker.

> [!IMPORTANT]
> The TypeType repositories moved from `Priveetee` to the [`TypeType-Video`](https://github.com/TypeType-Video) organization. GitHub redirects existing repository links. New installations use the organization container image paths; the previous image paths remain available during the transition.

## Install

Docker Engine and Docker Compose v2 are required.

```bash
curl -fsSL https://raw.githubusercontent.com/TypeType-Video/TypeType/main/scripts/install-stack.sh | bash
```

The installer creates `~/typetype-stack`, prompts before starting the stack, generates installation-specific secrets, and preserves the existing `.env` file during updates.

For manual installation and operating instructions, use the documentation:

- [Self-hosting guide](https://typetype-video.github.io/Docs-TypeType/self-hosting/introduction)
- [Manual Docker Compose setup](https://typetype-video.github.io/Docs-TypeType/self-hosting/docker-compose#manual-setup)
- [Update guide](https://typetype-video.github.io/Docs-TypeType/self-hosting/maintenance)
- [Rollback guide](https://typetype-video.github.io/Docs-TypeType/self-hosting/rollback)
- [User guide](https://typetype-video.github.io/Docs-TypeType/guide/)

## Repositories

| Repository | Responsibility | License |
| --- | --- | --- |
| [TypeType](https://github.com/TypeType-Video/TypeType) | Stack, releases, coordination, and issues | MIT |
| [TypeType-Frontend](https://github.com/TypeType-Video/TypeType-Frontend) | React web client | MIT |
| [TypeType-Server](https://github.com/TypeType-Video/TypeType-Server) | Kotlin API and extraction backend | GPL-3.0 |
| [TypeType-Player](https://github.com/TypeType-Video/TypeType-Player) | MSE and SABR playback package | MIT |
| [TypeType-Token](https://github.com/TypeType-Video/TypeType-Token) | YouTube token and decoder service | MIT |
| [TypeType-Downloader](https://github.com/TypeType-Video/TypeType-Downloader) | Download jobs and artifacts | GPL-3.0-or-later |
| [Docs-TypeType](https://github.com/TypeType-Video/Docs-TypeType) | User and self-hosting documentation | MIT |

Development changes land on each component's `dev` branch. Component images published from `dev` notify this repository, which coordinates the beta update. Stable images are recorded without starting a production update.

## Privacy And Disclaimer

TypeType is designed to provide a private, self-hosted way to use supported media services. The project does not add telemetry or collect usage data. Instance operators control their own deployment, accounts, logs, storage, and network configuration.

TypeType and its contents are not affiliated with, funded, authorized, endorsed by, or associated with YouTube, Google LLC, NicoNico, BiliBili, or their affiliates. Trademarks, service marks, trade names, and other intellectual property belong to their respective owners.

TypeType is open source software built for learning and research purposes.

## Contributing

Use the [central issue tracker](https://github.com/TypeType-Video/TypeType/issues) for bug reports and feature requests. Pull requests belong in the repository that owns the affected component.

## License

The files in this repository are licensed under the [MIT License](LICENSE). Components keep their own licenses; in particular, TypeType-Server and other GPL components remain under GPL-3.0.
