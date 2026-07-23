# TypeType 1.2.0

TypeType 1.2.0 adds the server-side playback contract required by TypeType
Android, faster SABR seeking, progressive subscription loading, and several
playback improvements across mobile, VOD, and livestreams.

## What changed

- Add a dedicated Android-only YouTube VOD API with complete standard DASH
  manifests, stable playback generations, and same-origin media resources.
- Expose manual and auto-generated subtitles before Android prepares playback,
  with stable track identities and server-delivered UTF-8 WebVTT.
- Reuse existing SABR sessions for same-format seeks, reducing extraction work
  and making normal seeks and SponsorBlock skips faster.
- Improve YouTube livestream playback around the live edge, missing segment
  durations, quality changes, codec changes, and replacement sessions.
- Load subscription feeds progressively so the first videos can appear without
  waiting for the complete feed.
- Improve mobile MSE playback, ManagedMediaSource support, Picture-in-Picture,
  and buffered seek handling.
- Preserve saved playback progress and prevent temporary media transitions from
  overwriting the user's volume state.
- Add playback speeds up to 4x.
- Improve recovery when YouTube rejects or expires an extraction session.

Android playback currently supports completed YouTube VODs. Active livestream
playback is not yet advertised through the Android contract.

No database migration or environment change is required.

## Thanks

Thanks to @hugoghx for the detailed livestream reports, @BuggyPasta for the
Safari and iOS report, and @Toastienergy for reporting the playback speed and
volume persistence issue.

Thanks also to @InfinityLoop1308 and the PipePipe contributors for the extractor
work and protocol research that TypeType continues to build on.

## Updating

Follow the [update guide](https://typetype-video.github.io/Docs-TypeType/self-hosting/maintenance).

If necessary, follow the [rollback guide](https://typetype-video.github.io/Docs-TypeType/self-hosting/rollback).
