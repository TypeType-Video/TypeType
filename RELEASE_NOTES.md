# TypeType 1.4.0

TypeType 1.4.0 adds richer search filters, consistent content blocking,
server-delivered YouTube subtitles, configurable account sessions, and several
playback, import and self-hosting fixes.

## Search And Content Controls

- Add grouped YouTube search filters for upload date, content type, duration
  and sorting. [#187](https://github.com/TypeType-Video/TypeType/issues/187)
- Hide blocked channels and videos consistently across search, autoplay, watch
  pages, embeds, playlists, history, subscriptions and recommendations.
  [#193](https://github.com/TypeType-Video/TypeType/issues/193)
- Normalize channel and video identities so alternate YouTube URL formats
  cannot bypass blocked-content rules.

## Subtitles And Playback

- Load YouTube subtitles through TypeType-Server instead of requiring the web
  client to contact YouTube directly.
- Cache subtitle content and preserve manual, automatic and translated subtitle
  tracks.
- Return typed rate-limit errors when YouTube rejects subtitle retrieval.
- Preload adaptive SABR initialization ranges to prevent startup failures when
  an initialization segment is not returned immediately.
  [#204](https://github.com/TypeType-Video/TypeType/issues/204)
- Restore saved playback positions only after the SABR session has completed
  its initial bootstrap.
- Route chapter selection through SABR so selecting a chapter seeks correctly
  again. [#202](https://github.com/TypeType-Video/TypeType/issues/202)
- Center captions correctly in the web player.
  [#201](https://github.com/TypeType-Video/TypeType/issues/201)
- Update PipePipeExtractor and align TypeType with the current YouTube client
  profiles.

## Accounts And Administration

- Add `AUTH_SESSION_TTL_DAYS` to configure account session lifetime from 1 to
  365 days, with a default of 30 days.
  [#203](https://github.com/TypeType-Video/TypeType/issues/203)
- Preserve active browser sessions during temporary refresh failures instead
  of immediately redirecting to login.
- Keep generated password reset tokens visible and copyable when browser
  clipboard access is unavailable.
  [#198](https://github.com/TypeType-Video/TypeType/issues/198)
- Keep admin user avatars stable when an account identity is edited.
  [#199](https://github.com/TypeType-Video/TypeType/issues/199)

## Imports And Performance

- Skip deleted and unavailable videos when importing YouTube Takeout playlists.
  [#135](https://github.com/TypeType-Video/TypeType/issues/135)
- Bound concurrent SABR download parts to reduce memory and connection pressure
  during large downloads.
- Keep Server and Token YouTube traffic on the configured proxy instead of
  silently switching to a different egress.

## Self-Hosting

- Fix the installation script attempting to download the removed
  `youtube-egress-relay.mjs` file.
  [#197](https://github.com/TypeType-Video/TypeType/issues/197)
- Add account session lifetime configuration to the Compose stack and
  environment template.
- Validate the new session configuration during stack checks.

No database migration is required. `AUTH_SESSION_TTL_DAYS` is optional and
defaults to `30`.

When a YouTube proxy is configured, it must remain reachable because Server and
Token will no longer silently bypass it.

## Thx

- A big thx to @LuckeeSoft for proposing the new search filters.
- Thx to @Toni-Vide for the detailed reports about blocked content, password
  reset tokens and admin avatars.
- Thx to @Slashic for reporting the session, chapter selection and caption
  alignment problems.
- Thx to @Role92 for the precise SABR initialization logs.
- Thx to @Willie169 for catching the broken self-hosted installation path.
- Thx to @lelam183 for repeatedly testing YouTube Takeout imports and helping
  identify the remaining unavailable-video case.
- Thx as well to everyone testing subtitles and playback on beta, sharing logs,
  and helping improve the self-hosting setup.

## Updating

Follow the [update guide](https://typetype-video.github.io/Docs-TypeType/self-hosting/maintenance).

If necessary, follow the [rollback guide](https://typetype-video.github.io/Docs-TypeType/self-hosting/rollback).

If u want to support TypeType, please share it with others. If u want to support it financially, u can do so through [GitHub Sponsors](https://github.com/sponsors/Priveetee).
