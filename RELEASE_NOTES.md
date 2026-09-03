# TypeType 1.7.2

TypeType 1.7.2 is a focused Token hotfix for YouTube videos that stopped starting after an anonymous playback identity was rejected.

## Playback

- Detect anonymous YouTube `LOGIN_REQUIRED` responses during MWEB and WEB SABR session creation.
- Discard the rejected Innertube and BotGuard identity before obtaining fresh visitor-bound and video-bound PO-token material.
- Retry session creation once with the new identity while preserving bounded recovery behavior.
- Update TypeType-Token to `1.7.2`. [PR #16](https://github.com/TypeType-Video/TypeType-Token/pull/16)

No frontend change, configuration change or manual database migration is required.

## Thx

Thx to everyone who reported videos failing to start and shared detailed playback diagnostics.

A special thx to sponsors [@Toastienergy](https://github.com/Toastienergy) and [@filippobaroni](https://github.com/filippobaroni) for supporting TypeType.

## Updating

Follow the [update guide](https://typetype-video.github.io/Docs-TypeType/self-hosting/maintenance).

If necessary, follow the [rollback guide](https://typetype-video.github.io/Docs-TypeType/self-hosting/rollback).

If u want to support TypeType, please share it with others. If u want to support it financially, u can do so through [GitHub Sponsors](https://github.com/sponsors/Priveetee).
