# TypeType 1.2.3

TypeType 1.2.3 is a hotpatch for accelerated YouTube playback that could exhaust SABR media windows and repeatedly restart playback.

## Playback

- propagate playback speed continuously through the web SABR contract
- size media and server read-ahead buffers for playback speeds up to 4x
- keep rate-aware SABR preparation bounded during long sessions
- preserve the selected video format during recovery instead of switching codec families
- prevent repeated recovery sessions after seeks when playback is faster than the prepared window
- update the MSE runtime to [`@typetype/mse@0.1.43`](https://www.npmjs.com/package/@typetype/mse/v/0.1.43)

## Updating

Follow the [update guide](https://typetype-video.github.io/Docs-TypeType/self-hosting/maintenance).

If necessary, follow the [rollback guide](https://typetype-video.github.io/Docs-TypeType/self-hosting/rollback).
