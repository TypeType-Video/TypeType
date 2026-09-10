# TypeType 1.8.1

TypeType 1.8.1 focuses on making playback more dependable across YouTube, BiliBili and NicoNico, improving mobile controls, strengthening profiles and notifications, making recommendations service-aware, and simplifying self-hosting.

## Reddit and Lemmy

We are very sad to announce that Reddit has banned the TypeType community! We are still trying to understand why.

It is frustrating to lose a place where people shared feedback, ideas, translations, bug reports and support for one another. We are truly grateful to everyone who helped make that community useful and welcoming.

We are moving the TypeType community to Lemmy:

[Join the TypeType community on Lemmy](https://blorp.lemmy.zip/home/c/TypeType@lemmy.zip)

We hope Lemmy gives TypeType a much better welcome!

Lemmy matters because federation keeps a community connected across instances instead of tying it to a single platform. We want TypeType to have a more independent, open and durable community space.

Please join us, contribute and share. Every test, translation, report, conversation and contribution helps keep this project alive. We hope to see you there!

## Playback and Providers

- Recover stalled and evicted SABR segments instead of leaving playback stuck.
- Improve paused Firefox seeks and isolate WebKit media transitions.
- Preserve the exact playback position across provider changes and source reloads.
- Isolate HLS request generations so stale Chromium requests cannot overwrite current playback.
- Align HLS buffering with the MSE player and release provider resources between videos.
- Keep mobile and compact player controls stable, including horizontal volume sliders.
- Restore volume and cinema-mode state reliably after provider initialization.
- Support custom audio SponsorBlock sliders correctly.
- Fix BiliBili playback failures reported in [#262](https://github.com/TypeType-Video/TypeType/issues/262).
- Improve BiliBili audio selection, bullet comments, media handles, range caching and connection reuse.
- Improve NicoNico playback reloads, media-handle routing and segment caching.
- Keep provider media behind expiring opaque handles.
- Preserve request cancellation during provider playback.
- Update TypeType-Player to MSE `0.1.60`.
- Refresh the PipePipeExtractor integration.

## Profiles, Search and Notifications

- Add account profiles and profile switching, addressing the workflow tracked in [#234](https://github.com/TypeType-Video/TypeType/issues/234).
- Add avatar support and isolated profile data.
- Bind authentication and service notifications to the active profile.
- Add service-aware search and recommendations so each provider receives relevant content.
- Add a panoramic search experience on desktop and mobile.
- Improve playback-progress loading with batch lookups.
- Add RSS video thumbnails.
- Improve notification delivery and preserve notification state during feed refreshes.

## Watch Experience and Localization

- Improve the floating and compact players with fullscreen and return controls.
- Keep player state stable while profile data refreshes.
- Improve mobile layouts and translated-label handling.
- Continue improving the English, French and German interface.
- Add a multilingual Lemmy announcement with a permanent dismissal option.

## Performance and Self-Hosting

- Bound playback, retry and server cache memory.
- Reduce unnecessary BiliBili lookups and reuse range connections.
- Parallelize provider media mapping while preserving cancellation.
- Avoid redundant settings writes and defer player initialization until playback is needed.
- Improve Downloader shutdown, job snapshots and artifact persistence.
- Update Downloader to `1.8.1`.
- Consolidate stack initialization into one short-lived `typetype-init` service, advancing the work tracked in [#254](https://github.com/TypeType-Video/TypeType/issues/254).
- Automate secret generation, Garage configuration and Downloader database setup.
- Make service URLs configurable, continuing the work tracked in [#261](https://github.com/TypeType-Video/TypeType/issues/261).
- Fix hardcoded Nginx service routing from [#251](https://github.com/TypeType-Video/TypeType/issues/251).
- Update Garage to `2.4.1`.

## Issues Fixed in This Dev Line

- [#262](https://github.com/TypeType-Video/TypeType/issues/262): BiliBili videos could not be played.
- [#251](https://github.com/TypeType-Video/TypeType/issues/251): Nginx used hardcoded `dockerdns` routing.

## Thx

Thx to everyone who tested TypeType and shared feedback during this release.

Thx to @Toastienergy for translating the German interface and helping test the beta.

A special thx to @Toastienergy for supporting TypeType.

## Updating

Follow the [update guide](https://typetype-video.github.io/Docs-TypeType/self-hosting/maintenance).

If necessary, follow the [rollback guide](https://typetype-video.github.io/Docs-TypeType/self-hosting/rollback).

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
