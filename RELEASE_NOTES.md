# TypeType 1.1.0

TypeType 1.1.0 adds native YouTube livestream playback over SABR, an
embeddable player, and several library and availability improvements.

## What changed

- Play YouTube livestreams through stateful SABR with live-edge following,
  DVR seeking, and playback recovery.
- Add an embed route with start-time parameters, guest access control, and a
  manual retry action.
- Add Watch Later directly to video menus.
- Improve imported playlist loading, ordering, duplicate handling, and deleted
  video filtering.
- Show scheduled, members-only, and unavailable states on video cards, and
  keep active livestreams visible in the subscription feed.
- Recover automatically when YouTube expires the player context used for SABR
  admission.
- Allow the Server and Token services to share the optional
  `YOUTUBE_OUTBOUND_PROXY_URL` setting.

No database migration is required. The new proxy setting is optional and
existing configurations remain valid.

## Thanks

Thanks to @tam1m for contributing the embed player, and to everyone who
reported and tested the changes in this release.

## Updating

Follow the [update guide](https://typetype-video.github.io/Docs-TypeType/self-hosting/maintenance).

If necessary, follow the [rollback guide](https://typetype-video.github.io/Docs-TypeType/self-hosting/rollback).
