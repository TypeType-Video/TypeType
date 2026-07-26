# TypeType 1.2.1

TypeType 1.2.1 improves SABR playback stability, especially after seeks and browser lifecycle transitions. This release also includes additional recovery logic for livestreams and several mobile interface improvements.

## Playback

- fix Safari and iOS playback failures after SponsorBlock skips
- prevent delayed lifecycle events from restarting an obsolete MSE playback loop after a seek
- improve repeated, buffered and SponsorBlock seeks without unnecessarily replacing the active playback session
- recover expired SABR sessions automatically
- preserve media and playback state across fullscreen, Picture-in-Picture, orientation and background transitions
- keep the same player instance while complete video metadata finishes loading
- preserve the selected playback speed during temporary player transitions
- update the MSE runtime to [`@typetype/mse@0.1.42`](https://www.npmjs.com/package/@typetype/mse/v/0.1.42)

## Livestreams

- recover bounded gaps between live SABR sequences
- prevent repeated protected responses without media from buffering indefinitely
- reset the recovery budget when media, playback position or generation progresses
- improve recovery when the live playback window advances
- preserve the active playback session during recoverable live interruptions

## Mobile And PWA

- stabilize the watch layout in mobile landscape mode
- improve recovery after backgrounding, screen-off and orientation changes
- preserve playback through fullscreen and Picture-in-Picture transitions
- make history removal easier to use on touch devices

## Validation

Playback was validated on beta with:

- Safari and an installed WebKit PWA
- a Chromium-based mobile PWA
- automatic SponsorBlock skips
- repeated forward and backward seeks
- fullscreen and orientation changes
- background, screen-off and foreground recovery
- Picture-in-Picture transitions
- VOD and livestream SABR playback
- multiple fresh videos and playback sessions

## Thanks

Thx to @Toastienergy, @BuggyPasta, @jerkiz and @coral-hungus for the Safari, iOS and SponsorBlock reports and testing, and to @hugoghx for the detailed livestream traces.
