# TypeType 1.2.2

TypeType 1.2.2 is a hotpatch for YouTube livestreams that could start correctly but then buffer again every few seconds.

## Livestreams

- keep the server-side SABR pump active while a livestream is playing
- maintain a bounded media buffer instead of waiting for a missing segment before requesting more data
- wake the SABR pump immediately when the player needs another segment
- keep audio and video windows aligned when their timestamps differ slightly
- resolve missing live segment durations from the next available segment
- prevent playback from incorrectly jumping over cached live media
- preserve bounded cache eviction during long playback sessions

## Updating

Follow the [update guide](https://typetype-video.github.io/Docs-TypeType/self-hosting/maintenance).

If necessary, follow the [rollback guide](https://typetype-video.github.io/Docs-TypeType/self-hosting/rollback).
