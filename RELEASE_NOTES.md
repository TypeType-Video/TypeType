# TypeType 1.5.0

TypeType 1.5.0 adds private RSS feeds, new-upload notifications and better
control over live content. It also closes a security issue in the public media
proxy and improves SABR playback during resumes and long-distance seeks.

## RSS And Notifications

- Add private RSS feeds for all subscriptions or a selected set of channels.
- Filter feeds by service and content type, with direct shortcuts from channel
  pages.
- Regenerate, disable or delete feed links without affecting subscriptions.
- Show compact in-app notifications when subscribed channels publish new
  videos. [#211](https://github.com/TypeType-Video/TypeType/issues/211)
- Give instance administrators control over RSS availability, public base URL,
  account limits, polling intervals and request rate limits.

RSS access is private to each account. Feed tokens can be revoked at any time
and do not expose the account session itself.

## Subscriptions

- Add account settings to hide live streams, upcoming streams or both from the
  subscription feed. [#213](https://github.com/TypeType-Video/TypeType/issues/213)
- Remove stale live entries after they stop being available from the provider.
- Normalize channel tab URLs before fetching and caching subscription pages.

## Playback

- Restore saved playback positions reliably in Safari after SABR preparation.
- Preserve the requested position while a SABR session is being prepared or
  recovered.
- Seek directly to distant positions before decoder preroll instead of replaying
  unnecessary media.
- Preserve play and pause intent through seeks and quality changes.
- Update the web player to `@typetype/mse` 0.1.44.

## Security

- Restrict the public media proxy to supported provider hosts and approved
  media paths.
- Block private, loopback and local-network destinations, including redirect
  and DNS resolution checks.
- Keep cross-provider redirects outside the proxy allowlist.
- Report YouTube remote-login readiness accurately instead of exposing an
  unusable login flow.
- Update application and build dependencies across the released services.

## Self-Hosting

No manual database migration is required.

RSS is disabled by default. Instance administrators can enable it and configure
the public feed base URL from the documented environment settings.

The account session lifetime and insecure-cookie development settings are now
documented in English, French and Spanish.

## Known Limitations

- YouTube may still throttle subtitle retrieval with HTTP 429 on some egress
  addresses. [#210](https://github.com/TypeType-Video/TypeType/issues/210)
- Native SABR playback on ARM64 remains under investigation.
  [#204](https://github.com/TypeType-Video/TypeType/issues/204)

## Thx

- A big thx to @LuckeeSoft for the RSS and notification ideas and for the
  detailed feedback while the feature was taking shape.
- Thx to @CCGcastiel for proposing granular live-content controls for the
  subscription feed.
- Thx to @Buage for privately and responsibly reporting the public proxy issue
  before disclosure. [#212](https://github.com/TypeType-Video/TypeType/issues/212)
- Thx to @VitoItalianGamer for the detailed browser playback reports and the
  time spent reproducing intermittent buffering behavior.
- A big thx to [@Toastienergy](https://github.com/Toastienergy) and
  [@filippobaroni](https://github.com/filippobaroni) for supporting TypeType
  through GitHub Sponsors. Their support helps me cover the infrastructure and
  spend more time improving the project.
- Thx as well to everyone testing beta, sharing logs and helping other
  self-hosters.

## Updating

Follow the [update guide](https://typetype-video.github.io/Docs-TypeType/self-hosting/maintenance).

If necessary, follow the [rollback guide](https://typetype-video.github.io/Docs-TypeType/self-hosting/rollback).

If u want to support TypeType, please share it with others. If u want to support it financially, u can do so through [GitHub Sponsors](https://github.com/sponsors/Priveetee).
