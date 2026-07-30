> TypeType 1.3.0 brings new backup and content controls, makes SABR the only YouTube playback path on the web, and improves downloads and self-hosted updates.

## Playback

- Use SABR/MSE for all YouTube web playback, including watch pages, embeds and autoplay. The old Classic toggle and transition prompt have been removed. NicoNico and BiliBili playback remain unchanged. [#168](https://github.com/TypeType-Video/TypeType/issues/168)
- Recover SABR sessions when YouTube authorization expires and stop stalled preparation attempts instead of retrying indefinitely.
- Apply automatic SponsorBlock skips in audio-only mode. [#178](https://github.com/TypeType-Video/TypeType/issues/178)
- Add a default playback speed from `0.25x` to `4x`, applied to regular videos and Shorts.

## Backups And Content Controls

- Export a complete TypeType backup or select individual categories, including subscriptions, history, playlists, watch later, favorites, playback progress, search history, saved playlists, settings and content filters.
- Restore versioned TypeType JSON backups with an immediate confirmation showing how many items were restored.
- Add blocked title keywords to filter unwanted videos from recommendations.
- Support very large history exports without exceeding PostgreSQL query limits.
- Preserve more original dates and metadata when importing YouTube Takeout favorites, history and playlists.

## Subscriptions

- Keep subscription feeds updating when one subscribed channel is deleted, private or temporarily unavailable. [#180](https://github.com/TypeType-Video/TypeType/issues/180)
- Keep live videos ordered by their actual promotion time instead of permanently placing every active live stream first.

## Downloads And Performance

- Rework SABR downloads around bounded multipart streams and concurrent range workers.
- Reserve the required disk space before starting large downloads to prevent active jobs from exhausting storage.
- Detect stalled streams while allowing long downloads to continue as long as data is still arriving.
- Reduce progress-update contention and reuse download buffers.
- Serve precompressed frontend assets through Nginx.

## Self-Hosting

- Bundle the default Nginx configuration directly in the Frontend image.
- Generate the default Garage configuration inside a managed Docker volume.
- Back up existing stack files and preserve custom Compose and Garage configuration during updates.
- Validate the resolved Compose configuration, wait for service health and provide a rollback directory when an update fails.
- Show the Frontend, Server, Token and Downloader versions, revisions and build times directly in Settings.
- Expand the self-hosting documentation with resource requirements and new French and Spanish prerequisites guides. [#176](https://github.com/TypeType-Video/TypeType/issues/176)

Self-hosters should follow the official update procedure for this release because the Compose stack and managed configuration have changed.

## Thx

- A big thx to @BuggyPasta for the detailed testing and for the ideas behind backups, blocked keywords and default playback speed.
- Thx to @Toastienergy for reporting the missing SponsorBlock behavior in audio-only mode, and to @tam1m for the precise subscription-feed report.
- Thx to @jerkiz and @coral-hungus for testing playback and SponsorBlock on real iPhones.
- Thx to @arcoast for the Nginx, Garage and update-flow suggestions, to @filippobaroni for helping expose problems caused by stale self-hosted stack files, and to @EdgarsJudovics for helping keep the script-free installation path documented.
- Thx as well to everyone testing the beta, reporting playback and buffering problems, or helping other self-hosters.

## Updating

Follow the [update guide](https://typetype-video.github.io/Docs-TypeType/self-hosting/maintenance).

If necessary, follow the [rollback guide](https://typetype-video.github.io/Docs-TypeType/self-hosting/rollback).

If u want to support TypeType, please share it with others. If u want to support it financially, u can do so through [GitHub Sponsors](https://github.com/sponsors/Priveetee).
