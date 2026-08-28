# TypeType 1.7.0

TypeType 1.7.0 adds account portability, community localization, subscription-group groundwork and a more resilient SABR playback path.

## Playback

- Restore saved playback positions before SABR startup instead of beginning at `00:00`.
- Update TypeType-Player to MSE `0.1.56` with more stable buffered seeks and source transitions.
- Stream VOD SABR media progressively and reuse bootstrap preparation to reduce startup and seek work.
- Align VOD audio windows to the current playhead and keep playback generations isolated during seeks.
- Prefer the original audio language when the source exposes it. [#249](https://github.com/TypeType-Video/TypeType/issues/249)
- Reduce redundant progress requests and avoid blocking playback on cached progress updates.
- Improve loading/session transitions and startup buffering while the remaining runtime reports continue to be monitored. [#238](https://github.com/TypeType-Video/TypeType/issues/238) [#248](https://github.com/TypeType-Video/TypeType/issues/248)

## Account Portability

- Add asynchronous account import and export with owned jobs, progress and diagnostics.
- Support TypeType, PipePipe, NewPipe, Invidious, Piped, LibreTube, ViewTube, Materialious, Flow, SkyTube, Grayjay, YouTube Takeout and OPML data.
- Add the import workspace and preview flow in the web application.
- Keep portability format detection and category writes bounded and deterministic.

## Localization

- Add the frontend translation catalog and English/French runtime messages. [#246](https://github.com/TypeType-Video/TypeType/issues/246)
- Add a Weblate workflow so contributors can translate without changing application code.
- Cover navigation, settings, player, watch, administration, authentication and portability surfaces.
- Unify and slightly speed up the language transition animation across the application.
- Use the Lucide `Pin` icon for pinned comments.
- Add checks that prevent new untranslated frontend literals from being introduced.

## Subscription Groups

- Add named subscription-group membership endpoints, including bounded atomic batch updates. [#172](https://github.com/TypeType-Video/TypeType/issues/172) [PR #80](https://github.com/TypeType-Video/TypeType-Server/pull/80)
- Preserve idempotent single-item compatibility while supporting multi-group channel membership.
- Add a TypeType management preview for filters, ungrouped channels, search, multi-select and inline group creation.
- Keep channels optional: nobody is required to assign every subscription to a group.

## Downloads And Reliability

- Preserve downloader artifact response metadata, including `Content-Length`. [#240](https://github.com/TypeType-Video/TypeType/issues/240)
- Keep the authenticated Server gateway in front of downloader artifacts.
- Serialize remote YouTube login input events so pointer press/release order is preserved. [#250](https://github.com/TypeType-Video/TypeType/issues/250)

No configuration change or manual database migration is required for this release.

## Thx

A huge thx to @kapdon for implementing the subscription-group Server contract and for the careful work on batching, locking and tests. [PR #80](https://github.com/TypeType-Video/TypeType-Server/pull/80)

Thx to [@typetype-translations](https://github.com/typetype-translations) and everyone contributing translations through Weblate. [#246](https://github.com/TypeType-Video/TypeType/issues/246)

A special thx to sponsors [@Toastienergy](https://github.com/Toastienergy) and [@filippobaroni](https://github.com/filippobaroni) for supporting TypeType.

Thx as well to everyone testing the beta, reporting playback and buffering problems, sharing logs, improving the documentation and helping other self-hosters.

## Updating

Follow the [update guide](https://typetype-video.github.io/Docs-TypeType/self-hosting/maintenance).

If necessary, follow the [rollback guide](https://typetype-video.github.io/Docs-TypeType/self-hosting/rollback).

If u want to support TypeType, please share it with others. If u want to support it financially, u can do so through [GitHub Sponsors](https://github.com/sponsors/Priveetee).
