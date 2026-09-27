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

# TypeType 1.8.0

TypeType 1.8.0 improves playback reliability, the watch experience,
account portability, sharing and localization.

## Playback

- Recover stalled SABR segment requests instead of leaving playback stuck.
- Preserve the exact playback position across WebKit provider changes.
- Isolate WebKit seeks to prevent stale media state.
- Improve paused Firefox seeks by filling the playback buffer first.
- Synchronize compact player controls after seeking.
- Reduce playback regressions when switching or recovering media sources.
- Update TypeType-Player to MSE `0.1.59`.
- Keep BiliBili stream extraction compatible with the fixes introduced in 1.7.3.

## Floating Watch Player

- Keep the current video visible while scrolling through the page.
- Add a draggable floating player.
- Persist the floating player position and state across navigation.
- Keep the compact player usable on mobile.
- Disable the floating player in landscape layouts where it would obstruct content.
- Keep the player stable when related videos are displayed.

## Sharing

- Add a compact share menu anchored to the share button.
- Show the destination name next to each share icon.
- Add direct links to the original provider.
- Normalize YouTube Shorts share links.
- Improve the share menu layout on desktop and mobile.

## Playback Progress

- Show playback progress directly on video cards.
- Add batch progress lookup for faster history and recommendation loading.
- Keep progress updates non-blocking during playback.

## Volume Controls

- Support mouse-wheel volume changes on every player layout.
- Prevent the page from scrolling when the wheel is used over the volume slider.
- Keep volume controls usable in the compact and floating players.

## Localization

- Add the German interface locale.
- Add the German translation catalog.
- Improve layout behavior for longer translated labels.
- Make video settings responsive to the active locale.
- Continue rejecting untranslated frontend messages during validation.

## Account Portability

- Support large YouTube Takeout archives.
- Add ZIP64 archive reading for large imports.
- Return a typed error when an upload is too large.
- Preserve bounded import processing and progress reporting.

## YouTube Login

- Fix remote YouTube login completion after passkey or 2FA.
- Stabilize remote YouTube input handling.
- Improve diagnostics for failed remote-login sessions.

## Server Reliability

- Isolate the Server SABR contract behind explicit adapter boundaries.
- Expand SABR contract and playback recovery tests.
- Preserve bounded retries, playback generations and session isolation.

No configuration change or manual database migration is required for this release.

## Thx

Thx to @whiskeredtux and @tigershark482 for the detailed buffering,
seek and playback reports that helped improve SABR recovery. [#248](https://github.com/TypeType-Video/TypeType/issues/248)

Thx to @kinouzero for reporting remote YouTube login failures around
passkey and 2FA, and for testing the login fixes. [#250](https://github.com/TypeType-Video/TypeType/issues/250)

Thx to @Toastienergy for contributing the German translation and helping
test the localized interface, compact player and playback experience.

Thx to @surasuku235 for reporting the BiliBili extraction regression
addressed in the previous release. [#262](https://github.com/TypeType-Video/TypeType/issues/262)

A special thx to sponsors [@Toastienergy](https://github.com/Toastienergy)
and [@filippobaroni](https://github.com/filippobaroni) for supporting
TypeType.

Thx as well to everyone testing the beta, sharing playback logs, testing
mobile layouts, reviewing translations and helping other self-hosters.

## Updating

Follow the [update guide](https://typetype-video.github.io/Docs-TypeType/self-hosting/maintenance).

If necessary, follow the [rollback guide](https://typetype-video.github.io/Docs-TypeType/self-hosting/rollback).
