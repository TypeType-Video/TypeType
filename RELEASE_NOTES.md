# TypeType 1.7.1

TypeType 1.7.1 is a focused Server hotfix for SABR playback stalls after resuming or seeking in VOD videos.

## Playback

- Continue filling progressive VOD playback windows across every readable segment instead of stopping after the first one.
- Prevent resumed and distant seeks from remaining stuck in repeated SABR preparation cycles while media is already available.
- Preserve bounded preparation, playback generation isolation and the existing retry behavior.
- Update TypeType-Server to `1.7.1`. [PR #82](https://github.com/TypeType-Video/TypeType-Server/pull/82)

No frontend change, configuration change or manual database migration is required.

## Thx

Thx to everyone who reported buffering and seek regressions and shared detailed playback logs.

A special thx to sponsors [@Toastienergy](https://github.com/Toastienergy) and [@filippobaroni](https://github.com/filippobaroni) for supporting TypeType.

## Updating

Follow the [update guide](https://typetype-video.github.io/Docs-TypeType/self-hosting/maintenance).

If necessary, follow the [rollback guide](https://typetype-video.github.io/Docs-TypeType/self-hosting/rollback).

If u want to support TypeType, please share it with others. If u want to support it financially, u can do so through [GitHub Sponsors](https://github.com/sponsors/Priveetee).
