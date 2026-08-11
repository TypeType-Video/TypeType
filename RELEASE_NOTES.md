# TypeType 1.5.1

TypeType 1.5.1 fixes YouTube captions and improves anonymous YouTube session
startup.

## Playback

- Load YouTube caption tracks directly from the viewer's browser instead of
  routing timed-text requests through the instance egress. This avoids
  subtitle-only HTTP 429 responses caused by shared server IP addresses.
- Preserve manual captions, automatically generated captions and translated
  tracks. [#210](https://github.com/TypeType-Video/TypeType/issues/210)
- Keep subtitle handling for NicoNico and BiliBili unchanged.

## YouTube Sessions

- Bind the BotGuard challenge and event identifier to the same page-native
  YouTube context and visitor session.
- Use the current page context when generating anonymous YouTube tokens.

## Self-Hosting

No configuration or database migration is required.

Frontend, Server, Token and Downloader are aligned on version `1.5.1`.

## Thx

- A big thx to @Slashic for the detailed subtitle report and for suggesting the
  client-side retrieval path.
- Thx as well to everyone testing beta and reporting playback issues.
- A big thx to [@Toastienergy](https://github.com/Toastienergy) and
  [@filippobaroni](https://github.com/filippobaroni) for supporting TypeType
  through GitHub Sponsors. Their support helps me cover the infrastructure and
  spend more time improving the project.

## Updating

Follow the [update guide](https://typetype-video.github.io/Docs-TypeType/self-hosting/maintenance).

If necessary, follow the [rollback guide](https://typetype-video.github.io/Docs-TypeType/self-hosting/rollback).

If u want to support TypeType, please share it with others. If u want to support it financially, u can do so through [GitHub Sponsors](https://github.com/sponsors/Priveetee).
