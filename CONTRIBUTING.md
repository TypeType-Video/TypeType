# Contributing to TypeType

Thank you for taking the time to improve TypeType. Bug reports, documentation fixes, design work, tests, and code contributions are all useful.

## Before you start

Search the [central issue tracker](https://github.com/TypeType-Video/TypeType/issues) before opening a new issue. For a large change or anything that crosses several components, open an issue first so the API and release impact can be agreed on before implementation.

Use the central tracker for:

- Bug reports
- Feature requests
- Self-hosting and update problems
- Changes that affect more than one repository

Include the TypeType version, browser or operating system, reproduction steps, expected behavior, and relevant logs when reporting a bug. Remove passwords, cookies, private keys, access tokens, and `.env` secrets before posting.

## Choose the right repository

| Change | Repository |
| --- | --- |
| Web pages, player controls, settings, or frontend API integration | [TypeType-Frontend](https://github.com/TypeType-Video/TypeType-Frontend) |
| HTTP API, extraction, accounts, libraries, imports, or persistence | [TypeType-Server](https://github.com/TypeType-Video/TypeType-Server) |
| MSE buffering, SABR playback, seeking, or playback recovery | [TypeType-Player](https://github.com/TypeType-Video/TypeType-Player) |
| YouTube PO tokens, player decoding, or remote login sessions | [TypeType-Token](https://github.com/TypeType-Video/TypeType-Token) |
| Download jobs, stream selection, muxing, or artifact storage | [TypeType-Downloader](https://github.com/TypeType-Video/TypeType-Downloader) |
| User guides, self-hosting guides, screenshots, or troubleshooting | [Docs-TypeType](https://github.com/TypeType-Video/Docs-TypeType) |
| Compose files, installer, update tools, rollback tools, or component pins | [TypeType](https://github.com/TypeType-Video/TypeType) |

Each component repository has its own `CONTRIBUTING.md` with the required setup and checks.

## Development flow

1. Fork the repository that owns the change.
2. Create your branch from the current `dev` branch.
3. Keep the change focused on one problem.
4. Add or update tests when behavior changes.
5. Run the checks listed in that repository's `CONTRIBUTING.md`.
6. Open the pull request against `dev`.

Use a clear branch name such as `fix/resume-position` or `feat/embed-player`.

Commit messages use this format:

```text
type: short description
```

Common types are `feat`, `fix`, `refactor`, `docs`, `test`, `chore`, `perf`, and `style`. Use the imperative mood and keep the first line under 72 characters.

## Central stack changes

The central repository owns orchestration rather than component source code. Validate Compose files and shell scripts with:

```sh
./scripts/validate-stack.sh
```

Do not copy frontend, server, player, token, downloader, or documentation source into this repository. Update the owning component first, then update its pinned revision in the central stack when the compatible component revision is ready.

## Pull requests

A useful pull request explains:

- What changed
- Why the change is needed
- Which issue it addresses
- How it was tested
- Whether another TypeType component must change with it

Include screenshots or a short recording for visible interface changes. Do not include generated files, local configuration, credentials, or unrelated cleanup.

By contributing, you agree that your changes are distributed under the license of the repository receiving them.
