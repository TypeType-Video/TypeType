# TypeType 1.7.3

TypeType 1.7.3 fixes BiliBili videos that failed during stream extraction after a metadata format change.

## Playback

- Update PipePipeExtractor to the BiliBili metadata fix used by TypeType-Server.
- Restore BiliBili stream extraction and preserve the available audio and video formats.
- Update TypeType-Server to `1.7.2`. [PR #83](https://github.com/TypeType-Video/TypeType-Server/pull/83)

No frontend change, configuration change or manual database migration is required.

## Thx

Thx to everyone who reported BiliBili playback failures and shared detailed diagnostics.

A special thx to sponsors [@Toastienergy](https://github.com/Toastienergy) and [@filippobaroni](https://github.com/filippobaroni) for supporting TypeType.

## Updating

Follow the [update guide](https://typetype-video.github.io/Docs-TypeType/self-hosting/maintenance).

If necessary, follow the [rollback guide](https://typetype-video.github.io/Docs-TypeType/self-hosting/rollback).

If u want to support TypeType, please share it with others. If u want to support it financially, u can do so through [GitHub Sponsors](https://github.com/sponsors/Priveetee).
