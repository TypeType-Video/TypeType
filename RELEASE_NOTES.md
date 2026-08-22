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
