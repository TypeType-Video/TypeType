# TypeType 1.0.4

TypeType 1.0.4 is a hotfix for YouTube SABR playback. It restores playback for
on-demand videos whose initialization segments were not returned during session
startup.

## What changed

- Restore the SABR cold-start request state used to fetch audio and video
  initialization segments.
- Prevent affected playback sessions from repeatedly restarting before the
  browser can initialize its MediaSource buffers.
- Preserve the existing playback API, stream selection and self-hosting
  configuration.

No database migration or environment change is required.

## Updating

Follow the [update guide](https://typetype-video.github.io/Docs-TypeType/self-hosting/maintenance).

If necessary, follow the [rollback guide](https://typetype-video.github.io/Docs-TypeType/self-hosting/rollback).
