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

# TypeType 1.6.0

TypeType 1.6.0 improves web playback, connected YouTube accounts, subscription feeds, downloads, authentication and notifications.

## Playback

- Resume playback after returning to a suspended browser tab instead of stopping or restarting from the beginning. [#219](https://github.com/TypeType-Video/TypeType/issues/219)
- Stop replaying the current video when autoplay is disabled. [#224](https://github.com/TypeType-Video/TypeType/issues/224)
- Show the correct resolution and codec labels in the quality selector. [#227](https://github.com/TypeType-Video/TypeType/issues/227)
- Preserve the exact playback position when changing video quality instead of jumping backward. [#229](https://github.com/TypeType-Video/TypeType/issues/229)
- Preserve saved progress through MSE source transitions and expire stale cached positions before resume.
- Keep Safari playback transitions bounded when autoplay permission or user activation has expired.

## YouTube Accounts

- Preserve the selected connected YouTube account through SABR preparation, token refresh and playback recovery.
- Bind the YouTube player and media tokens to the same selected account.
- Guide content requiring authentication to the YouTube account connection flow.
- Add an option to hide members-only videos. [#225](https://github.com/TypeType-Video/TypeType/issues/225)

## Subscription Feeds

- Correctly classify scheduled, active and finished live streams when applying the live visibility setting. [#213](https://github.com/TypeType-Video/TypeType/issues/213)
- Preserve the original ordering of scheduled live streams instead of continually promoting them.
- Remove finished or stale live entries from subscription feeds.

## Subscription Groups API

- Add the complete Server contract for named subscription groups. [#172](https://github.com/TypeType-Video/TypeType/issues/172)
- Create, rename and delete groups.
- Assign a subscribed channel to multiple groups.
- Filter subscriptions and feeds by group or show ungrouped channels.
- Preserve stable pagination while group membership changes.
- Include groups and memberships in TypeType backups.

**Subscription groups are API-only in this release. There is no web interface for creating or managing groups yet.** The frontend integration remains tracked in [#172](https://github.com/TypeType-Video/TypeType/issues/172).

## Accounts And Notifications

- Fix initial OIDC installations requiring users to sign in twice. [#221](https://github.com/TypeType-Video/TypeType/issues/221)
- Add a setting to mute notification popups while keeping notifications available in the notification center. [#231](https://github.com/TypeType-Video/TypeType/issues/231)

## Downloads

- Allow downloads to work when Garage is only available through the internal TypeType network. A separate public Garage endpoint is no longer required. [#222](https://github.com/TypeType-Video/TypeType/issues/222)
- Keep artifact delivery behind the authenticated Server gateway.

No configuration change or manual database migration is required. Server creates the subscription-group tables through its normal schema initialization.

## Thx

A huge thx to @kapdon for implementing the complete subscription-groups Server contract and for the careful work on pagination, backups and tests.

Thx to @CCGcastiel for proposing the live-stream visibility controls and helping improve subscription feeds.

Thx to @arcoast for reporting the OIDC first-login problem and the Garage download configuration issue.

Thx to @mfuchsberger for reporting the autoplay loop and proposing the option to hide members-only content.

Thx to @therealresonix for the detailed quality selector and playback-position reports.

Thx to @Toni-Vide for proposing the notification mute setting.

A special thx to my sponsors @Toastienergy and @filippobaroni for supporting TypeType.

Thx as well to everyone testing the beta, reporting playback problems, sharing logs, improving the documentation and helping other self-hosters.

## Updating

Follow the [update guide](https://typetype-video.github.io/Docs-TypeType/self-hosting/maintenance).

If necessary, follow the [rollback guide](https://typetype-video.github.io/Docs-TypeType/self-hosting/rollback).

If u want to support TypeType, please share it with others. If u want to support it financially, u can do so through [GitHub Sponsors](https://github.com/sponsors/Priveetee).
