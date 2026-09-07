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
