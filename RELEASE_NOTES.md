# TypeType 1.13.0

TypeType 1.13.0 brings QR code sign-in for TypeType TV, a BiliBili buffer setting and NicoNico ID search, and fixes NicoNico playback, YouTube seeks, BiliBili stalls and videos failing to load after a night away.

## New

- Sign in to TypeType TV by scanning a QR code and confirming on a signed-in phone, with [TypeType TV 0.3.0](https://github.com/TypeType-Video/TypeType-TV/releases/tag/v0.3.0) or later. Admins can turn it off in the admin settings. [Server changes](https://github.com/TypeType-Video/TypeType-Server/compare/d265ca0aa5113ea722e48333d955ba7d2574964b...f3eaacb0566165b395256dbb4bed158a86aaab8f) [Frontend changes](https://github.com/TypeType-Video/TypeType-Frontend/compare/31440fde04fc81aeabe3249ec8e085bfb0df59a9...c516e1618671065790d5187451185a71d66302d9)
- Choose how far ahead BiliBili videos load in Settings > Playback: Saver (8 s), Normal (15 s, the default) or Large (30 s). The buffer grows with the playback speed, up to 120 s. This addresses [#347](https://github.com/TypeType-Video/TypeType/issues/347).
- Open a NicoNico video by typing its ID, like `sm22314266`, in search.

## Playback

- Play NicoNico videos again: whole HLS segments are loaded so the encrypted audio and video decrypt. This fixes [#360](https://github.com/TypeType-Video/TypeType/issues/360). [Player changes](https://github.com/TypeType-Video/TypeType-Player/compare/9888aad46e336b0130f7caf28ef588a44aeb3dab...eb12cdef121be85175a1e32c779dfa6df2391a05)
- Keep YouTube seeks hidden until playback resumes at the target, instead of playing the part before it and then jumping back. This fixes [#351](https://github.com/TypeType-Video/TypeType/issues/351).
- Move the progress bar and the time to a YouTube seek or replay target right away, while the video loads. This follows up on [#357](https://github.com/TypeType-Video/TypeType/issues/357).
- Keep BiliBili gap jumping on after a manual quality change, so a small hole in the buffer no longer freezes playback for good. This addresses [#361](https://github.com/TypeType-Video/TypeType/issues/361).
- Fit vertical videos inside the mini-player on iOS Safari. This addresses [#334](https://github.com/TypeType-Video/TypeType/issues/334).

## Sign-in

- Refresh an expired session before loading a video, comments, search, recommendations or playlists, instead of failing with 401 until the page is reloaded after a night or a sleeping device. This fixes [#362](https://github.com/TypeType-Video/TypeType/issues/362).

## Thx

- @Aquarius-Situla for the detailed NicoNico, BiliBili, YouTube and sign-in reports, and the mini-player fix idea. [#362](https://github.com/TypeType-Video/TypeType/issues/362), [#361](https://github.com/TypeType-Video/TypeType/issues/361), [#360](https://github.com/TypeType-Video/TypeType/issues/360), [#351](https://github.com/TypeType-Video/TypeType/issues/351), [#347](https://github.com/TypeType-Video/TypeType/issues/347), [#334](https://github.com/TypeType-Video/TypeType/issues/334)

Thx u guys, [@Toastienergy](https://github.com/Toastienergy) and [@crichemond](https://github.com/crichemond), for supporting TypeType!

If u want to support TypeType, please share it with others! If u want to support it financially, u can do so through [GitHub Sponsors](https://github.com/sponsors/Priveetee)!

## Updating

Follow the [update guide](https://typetype-video.github.io/Docs-TypeType/self-hosting/maintenance).

If necessary, follow the [rollback guide](https://typetype-video.github.io/Docs-TypeType/self-hosting/rollback).

# TypeType 1.12.0

TypeType 1.12.0 brings BiliBili verified badges, a player color setting and subtitles in audio-only mode, and fixes a batch of BiliBili and YouTube playback bugs.

## New

- Show BiliBili verified badges: a yellow lightning for verified people and a blue one for organizations, in search and on channel pages. Verified channels now come first in BiliBili channel search. This addresses [#354](https://github.com/TypeType-Video/TypeType/issues/354). [Extractor changes](https://github.com/TypeType-Video/PipePipeExtractor/compare/631988d64ba4ebddab8a182d2a58cbe1ace7efea...b49ced6760c37d6c68a85fed4173268212c599cf)
- Pick the player color in Settings > Interface: default, white, red, pink, purple, blue, green or orange. It colors the progress bar and the controls, for video and audio-only playback. [Frontend changes](https://github.com/TypeType-Video/TypeType-Frontend/compare/2d8f45e8b4c555c97e59196930db6631a67f156e...80a5e93a182f893bf7b34d505093a76351e48f2c)
- Show subtitles in audio-only mode. This addresses [#342](https://github.com/TypeType-Video/TypeType/issues/342).

## Playback

- Resume a BiliBili media segment from the missing bytes when the CDN cuts it mid-transfer, and switch to another official BiliBili mirror when a range fails or is too slow, instead of answering 500. This addresses [#347](https://github.com/TypeType-Video/TypeType/issues/347). [Server changes](https://github.com/TypeType-Video/TypeType-Server/compare/326e05f956d857839fc87a310ce3ba913d28a779...b75c7cc573f9e756a0a160404860be82818c6943)
- Reload an expired BiliBili stream instead of freezing when seeking or rewinding after a long watch, and use smaller seek buffers. This fixes [#358](https://github.com/TypeType-Video/TypeType/issues/358).
- Keep the BiliBili player when returning from the mini-player instead of reloading it. This fixes [#350](https://github.com/TypeType-Video/TypeType/issues/350).
- Replay a YouTube video from the start after it ends instead of getting stuck. This fixes [#357](https://github.com/TypeType-Video/TypeType/issues/357). [Player changes](https://github.com/TypeType-Video/TypeType-Player/compare/2381ffe51041ec8d4fc7d5ec0f00f6d95f3c874e...9888aad46e336b0130f7caf28ef588a44aeb3dab)
- Land YouTube seeks on the target instead of overshooting and jumping back. This addresses [#351](https://github.com/TypeType-Video/TypeType/issues/351).
- Fit vertical videos in the mini-player instead of showing a large black box. This fixes [#334](https://github.com/TypeType-Video/TypeType/issues/334).

## Server

- Fix a server freeze under load: waiting for an extraction slot no longer blocks the threads that serve requests.
- Load later pages of BiliBili collections instead of failing with 422, and name their uploader. This fixes [#356](https://github.com/TypeType-Video/TypeType/issues/356).

## Thx

- @Aquarius-Situla for the many detailed BiliBili and YouTube player reports. [#358](https://github.com/TypeType-Video/TypeType/issues/358), [#357](https://github.com/TypeType-Video/TypeType/issues/357), [#356](https://github.com/TypeType-Video/TypeType/issues/356), [#354](https://github.com/TypeType-Video/TypeType/issues/354), [#351](https://github.com/TypeType-Video/TypeType/issues/351), [#350](https://github.com/TypeType-Video/TypeType/issues/350), [#347](https://github.com/TypeType-Video/TypeType/issues/347), [#334](https://github.com/TypeType-Video/TypeType/issues/334)
- @AphoticUmbral for asking for subtitles in audio-only mode in [#342](https://github.com/TypeType-Video/TypeType/issues/342).

Thx u guys, [@Toastienergy](https://github.com/Toastienergy) and [@crichemond](https://github.com/crichemond), for supporting TypeType!

If u want to support TypeType, please share it with others! If u want to support it financially, u can do so through [GitHub Sponsors](https://github.com/sponsors/Priveetee)!

## Updating

Follow the [update guide](https://typetype-video.github.io/Docs-TypeType/self-hosting/maintenance).

If necessary, follow the [rollback guide](https://typetype-video.github.io/Docs-TypeType/self-hosting/rollback).

# TypeType 1.11.1

TypeType 1.11.1 is a reliability and performance release. NicoNico playback works again, videos start much faster, and the server now handles YouTube bot checks without breaking playback or getting the instance flagged in the first place.

## Playback

- Fix NicoNico playback after NicoNico changed its watch data format. [Extractor changes](https://github.com/TypeType-Video/PipePipeExtractor/compare/705e2649f96e69d7525dac4fa625c60498639f81...631988d64ba4ebddab8a182d2a58cbe1ace7efea)
- Start YouTube videos faster: a warm start now reaches the first frame in about 0.2 s instead of 0.9 s, and a cold start in about 2 s instead of 3.4 s. [Server changes](https://github.com/TypeType-Video/TypeType-Server/compare/e36c464255994c8adcf0ed9d950e533266923c4e...10d72e779ad7b276fc185bb17a1b9316557547ed)
- Prefer warm BiliBili mirror CDNs, which cuts the slowest cold starts from about 9 s to under 4 s.
- Retry a failed media request without clearing the buffer or restarting the video from the beginning. This addresses [#347](https://github.com/TypeType-Video/TypeType/issues/347). [Player changes](https://github.com/TypeType-Video/TypeType-Player/compare/f03a8bcc5fdb040a82e1b50e319d95e628b17f4c...2381ffe51041ec8d4fc7d5ec0f00f6d95f3c874e)
- Keep the requested position when seeking while a video is still loading. This addresses [#321](https://github.com/TypeType-Video/TypeType/issues/321).
- Keep SABR sessions alive when a single segment cannot be fetched, and recover segments that YouTube did not return. This covers [#339](https://github.com/TypeType-Video/TypeType/issues/339) and [#340](https://github.com/TypeType-Video/TypeType/issues/340).
- Cache finished live streams briefly, so replays of past streams no longer run a full extraction on every play.

## YouTube Bot Checks

- Refresh subscription feeds on a timer instead of on every read. TypeType now sends about 12 times fewer requests to YouTube, which was the main reason instances got bot-checked.
- Answer a bot check, a rate limit or an upstream timeout with a clear status (503, 429 or 504) and a `Retry-After` delay instead of a generic 502.
- Pause YouTube requests while the instance is blocked, renew the session once, and resume automatically when the block lifts.
- Rebuild playback sessions after a PO token refresh, so playback recovers instead of failing with 403. [Token changes](https://github.com/TypeType-Video/TypeType-Token/compare/bfcf9b0b909b2fdf72e54e7a4dcbb89e1ea2b2ac...705af3cff7930309cfd323ff78d63703fcbee7c8)
- Warm PO tokens at startup, bound every token request with a timeout, recover from a browser crash, and report token readiness on `/ready`.
- Respect `Retry-After` in the web player, so clients no longer flood a busy server, and tell viewers when a stream is being retried.

## Data and Caching

- Never cache empty or failed channel pages, searches, comments, related videos or Shorts feeds. Keep the last good result when a provider fails. This fixes [#346](https://github.com/TypeType-Video/TypeType/issues/346) for every service.
- Keep a channel's videos in the subscription feed when that channel fails to load.
- Return `200` with an explicit favorite status instead of a `404` for videos that are not favorited. This addresses [#333](https://github.com/TypeType-Video/TypeType/issues/333).
- Turn notifications on or off for every channel in one request, and include the video thumbnail in push notifications.

## Interface and Performance

- Load about 28% less JavaScript on the first page. [Frontend changes](https://github.com/TypeType-Video/TypeType-Frontend/compare/ec6a88af10402a558ddbd861133886696f4ca1af...c7aa23941a1db00800b90e703dfa8b297a4f2255)
- Remove the remote browser YouTube login, which no longer worked, and keep the TV device-code login. This addresses [#250](https://github.com/TypeType-Video/TypeType/issues/250).
- Match the startup loader and page spinner to the light theme. This addresses [#345](https://github.com/TypeType-Video/TypeType/issues/345).
- Stop answering 500 when a client closes a connection early, and stop saving unchanged caption styles.

## Thx

- @Aquarius-Situla for the detailed reports on the proxy, the BiliBili channel cache and the favorite status. [#347](https://github.com/TypeType-Video/TypeType/issues/347), [#346](https://github.com/TypeType-Video/TypeType/issues/346), [#345](https://github.com/TypeType-Video/TypeType/issues/345), [#333](https://github.com/TypeType-Video/TypeType/issues/333)
- @MatthiasGrandl for tracing the SABR recovery bugs. [#339](https://github.com/TypeType-Video/TypeType/issues/339), [#340](https://github.com/TypeType-Video/TypeType/issues/340)
- @AphoticUmbral for reporting the seek issue in [#321](https://github.com/TypeType-Video/TypeType/issues/321).
- @kinouzero for the YouTube login report in [#250](https://github.com/TypeType-Video/TypeType/issues/250).

Thx u guys, [@Toastienergy](https://github.com/Toastienergy) and [@crichemond](https://github.com/crichemond), for supporting TypeType!

If u want to support TypeType, please share it with others! If u want to support it financially, u can do so through [GitHub Sponsors](https://github.com/sponsors/Priveetee)!

## Updating

Follow the [update guide](https://typetype-video.github.io/Docs-TypeType/self-hosting/maintenance).

If necessary, follow the [rollback guide](https://typetype-video.github.io/Docs-TypeType/self-hosting/rollback).

# TypeType 1.11.0

TypeType 1.11.0 adds YouTube account linking for TV-backed playback, expands BiliBili channel and playlist tools, and improves recovery after seeks. Authenticated YouTube streams now keep their real video title and channel name in the watch page and history.

## YouTube Accounts and Playback

- Connect YouTube with a TV device-code flow or import an existing session cookie. Sessions are encrypted at rest and refreshed automatically. [Frontend device login](https://github.com/TypeType-Video/TypeType-Frontend/commit/adce8871), [Server changes](https://github.com/TypeType-Video/TypeType-Server/compare/36e1e7d174df9161900c56e118e3543375e60c45...65c25cda709206e6ad06c639484513781c768360), [Token changes](https://github.com/TypeType-Video/TypeType-Token/compare/a5024bb55831d459b644d2733bf8b4296af1ef98...ad3064246552d8c92a7fdd036dd516cdffe90627)
- Use the matching TV player identity and integrity token for authenticated SABR playback, including age-restricted videos.
- Keep the YouTube title and channel name on authenticated video pages and in watch history instead of the generic provider label.
- Recover protected SABR initialization requests and ignore stale playback-position updates after a seek.

## BiliBili

- Browse channel collections and series, search within a channel, and save public playlists. [Frontend #60](https://github.com/TypeType-Video/TypeType-Frontend/pull/60)
- Refresh linked BiliBili sessions automatically, including rotated refresh credentials.
- Preserve BiliBili API paths through the reverse proxy and keep those requests on the intended provider routes.

## Watch and Discovery

- Choose audio-only playback for a playlist and keep playlist controls in sync with the active mode.
- Exclude Shorts from normal video browsing and filter search results for livestreams.
- Render BiliBili danmaku emotes and richer comment text.
- Give video details, related videos, and comments more room on the watch page.
- Preserve playback progress through player reattachment and improve recovery from seek/decode failures. This addresses the black-screen pause reported in [#323](https://github.com/TypeType-Video/TypeType/issues/323).

## Interface and Reliability

- Respect iOS safe areas when TypeType is installed as a web app. [Frontend #64](https://github.com/TypeType-Video/TypeType-Frontend/pull/64)
- Keep the login redirect clear when guest mode is disabled, and hide registration when it is unavailable. [Frontend #61](https://github.com/TypeType-Video/TypeType-Frontend/pull/61)
- Refine Simplified Chinese wording. [Frontend #59](https://github.com/TypeType-Video/TypeType-Frontend/pull/59)
- Retry push deliveries until the client acknowledges them, and invalidate unread-count caches when notification preferences change.
- Parse Unicode whitespace in YouTube Takeout dates.

## Thx

- @Aquarius-Situla for the BiliBili channel tools, account flow, iOS safe-area work, and Simplified Chinese updates. [Frontend #59](https://github.com/TypeType-Video/TypeType-Frontend/pull/59), [#60](https://github.com/TypeType-Video/TypeType-Frontend/pull/60), [#61](https://github.com/TypeType-Video/TypeType-Frontend/pull/61), [#64](https://github.com/TypeType-Video/TypeType-Frontend/pull/64)
- @AphoticUmbral for reporting the seek recovery issue in [#323](https://github.com/TypeType-Video/TypeType/issues/323).

Thx u guys, [@Toastienergy](https://github.com/Toastienergy) and [@crichemond](https://github.com/crichemond), for supporting TypeType!

If u want to support TypeType, please share it with others! If u want to support it financially, u can do so through [GitHub Sponsors](https://github.com/sponsors/Priveetee)!

## Updating

Follow the [update guide](https://typetype-video.github.io/Docs-TypeType/self-hosting/maintenance).

If necessary, follow the [rollback guide](https://typetype-video.github.io/Docs-TypeType/self-hosting/rollback).

# TypeType 1.10.0

TypeType 1.10.0 brings an experimental recommender you run yourself, a first version of the YouTube livestream chat, and a player that recovers instead of resetting. It also lands a large batch of community pull requests, a seasonal theme, and the documentation in four languages.

Thx to everyone who reported, tested, translated or sent code. A big part of this release started with a report or a pull request from the community, and I really appreciate the time you put into it.

## Self-Hosted Recommender (experimental)

- Add an experimental, optional recommendation service to the stack. It is off by default, offered by the installer, and a stack without it behaves exactly as before. [#306](https://github.com/TypeType-Video/TypeType/pull/306)
- Build the home feed on the instance from its own data, with an Algorithm page to choose and tune how the feed is built. [Frontend #55](https://github.com/TypeType-Video/TypeType-Frontend/pull/55), [Server #95](https://github.com/TypeType-Video/TypeType-Server/pull/95)
- Keep it opt-in per profile, store its settings, opinions and choices per profile, and carry them in exports and backups. A refusal stays isolated to the profile that made it.
- Document the service, its install and the algorithm tuning. [Self-hosting guide](https://typetype-video.github.io/Docs-TypeType/self-hosting/recommender), [Algorithm guide](https://typetype-video.github.io/Docs-TypeType/guide/algorithm)
- Treat it as experimental: the algorithms, and the home feed they build, will keep changing. You turn it on per profile, and you can turn it off to go back to the standard home page at any time.

## Live Streams

- Show the YouTube livestream chat beside the player, with the author name, avatar and message. [#297](https://github.com/TypeType-Video/TypeType/issues/297)
- Reconnect on its own when the chat drops, show a skeleton while it connects, and batch incoming messages so the panel stays smooth.
- Release the extractor resources after the chat ends and report the failing stage when it cannot be initialized.

## Playback and Providers

- Keep the player mounted and the position intact when toggling cinema mode. [#295](https://github.com/TypeType-Video/TypeType/issues/295)
- Recover SABR playback instead of resetting it: keep the media mounted during a recovery, wait for the network to come back, and confirm autoplay once the stream resumes.
- Keep YouTube extraction answering under load, pace the videos opened at the provider, and renew the provider session after repeated refusals. [Server #92](https://github.com/TypeType-Video/TypeType-Server/pull/92)
- Support BiliBili multi-part videos and collections, with episode thumbnails and section tabs in the collection panel. [#294](https://github.com/TypeType-Video/TypeType/issues/294), [Frontend #39](https://github.com/TypeType-Video/TypeType-Frontend/pull/39)
- Support the BiliBili session cookie to unlock 1080p and 4K streams, and fix a channel page returning HTTP 422. [#287](https://github.com/TypeType-Video/TypeType/issues/287), [#286](https://github.com/TypeType-Video/TypeType/issues/286)
- Generate multi-quality DASH manifests so BiliBili plays at full resolution. [Frontend #36](https://github.com/TypeType-Video/TypeType-Frontend/pull/36)
- Normalize the BiliBili session timestamp and recommend the top matching creator in search. [Frontend #46](https://github.com/TypeType-Video/TypeType-Frontend/pull/46), [Frontend #37](https://github.com/TypeType-Video/TypeType-Frontend/pull/37), [Server #90](https://github.com/TypeType-Video/TypeType-Server/pull/90)
- Improve danmaku: synchronize playback, smooth the animation, support BiliBili bullet comments, move the overlay beneath the control bar, and add a desktop `D` key to toggle them. [Frontend #48](https://github.com/TypeType-Video/TypeType-Frontend/pull/48)

## Watch Page and Playlists

- Add persistent shuffle and a per-playlist choice to hide upcoming videos. [#303](https://github.com/TypeType-Video/TypeType/issues/303)
- Expand the watch metadata to the full width in cinema mode. [Frontend #47](https://github.com/TypeType-Video/TypeType-Frontend/pull/47)
- Stop requesting the recommendation videos nobody is watching yet, and read the notifications once a minute instead of repeatedly. [Frontend #54](https://github.com/TypeType-Video/TypeType-Frontend/pull/54)
- Show a subscription feed being prepared instead of a misleading empty feed, and prepare a card only when the pointer rests on it.
- Prevent the recommended-videos and guest-screen flashes on the watch page, and show a playlist skeleton while the page loads. [Frontend #42](https://github.com/TypeType-Video/TypeType-Frontend/pull/42), [Frontend #38](https://github.com/TypeType-Video/TypeType-Frontend/pull/38)

## Interface and Languages

- Add a system theme mode with a three-way toggle that follows the OS in real time. [Frontend #44](https://github.com/TypeType-Video/TypeType-Frontend/pull/44)
- Add Simplified Chinese to the web app, and the documentation in French, German, Spanish and Simplified Chinese. [Frontend #45](https://github.com/TypeType-Video/TypeType-Frontend/pull/45)
- Add web fullscreen mode with its control and hotkey, session-platform navigation with anti-flicker transitions, and an instant redirect on the landing page when the home is disabled. [Frontend #41](https://github.com/TypeType-Video/TypeType-Frontend/pull/41), [Frontend #43](https://github.com/TypeType-Video/TypeType-Frontend/pull/43), [Frontend #40](https://github.com/TypeType-Video/TypeType-Frontend/pull/40)
- Normalize the channel search result layout.
- Add a seasonal Halloween theme you can open from the navbar. It is a 3D scene, so it asks for graphics acceleration and stays off on its own. [Frontend #57](https://github.com/TypeType-Video/TypeType-Frontend/pull/57), [Frontend #56](https://github.com/TypeType-Video/TypeType-Frontend/pull/56)

## Accounts and Imports

- Allow TOTP and password 2FA fallback when the platform authenticator is not supported during remote login. [Token #21](https://github.com/TypeType-Video/TypeType-Token/pull/21)
- Import a YouTube Takeout faithfully in any language: keep the likes apart from the dislikes, keep the current subscriptions with their dates, accept a handle in the channel URL, and leave the ads out of the imported history. [Server #93](https://github.com/TypeType-Video/TypeType-Server/pull/93)

## Self-Hosting and Dependencies

- Offer the optional recommender in the installer, and give the cache a memory limit so it forgets its oldest entries instead of growing. [#305](https://github.com/TypeType-Video/TypeType/pull/305)
- Keep proxied thumbnails in the shared cache. [Server #94](https://github.com/TypeType-Video/TypeType-Server/pull/94)
- Refresh the container base images, the Go and Kotlin dependencies, and the Ktor and Jackson versions, and update the bundled extractor.
- Move the build and validation pipelines to Woodpecker across the repositories.

## Downloads

- Fix H.264 and AV1 downloads, which failed because the requested codec profile was matched case-sensitively. [#304](https://github.com/TypeType-Video/TypeType/issues/304)
- Delete expired artifacts from Garage after their URL grace, evict expired jobs from the cache, and move the downloader image to ffmpeg 9.

## Issues Fixed in This Dev Line

- [#254](https://github.com/TypeType-Video/TypeType/issues/254): Simplify the initial setup.
- [#276](https://github.com/TypeType-Video/TypeType/issues/276): Importing a YouTube Takeout could fail.
- [#283](https://github.com/TypeType-Video/TypeType/issues/283): Separate autoplay on open from autoplay next video.
- [#286](https://github.com/TypeType-Video/TypeType/issues/286): Visiting a BiliBili channel returned HTTP 422.
- [#287](https://github.com/TypeType-Video/TypeType/issues/287): Support the BiliBili session cookie for higher quality.
- [#288](https://github.com/TypeType-Video/TypeType/issues/288): Restore cursor visibility over a paused player.
- [#289](https://github.com/TypeType-Video/TypeType/issues/289): Add configurable content density for grids and related videos.
- [#294](https://github.com/TypeType-Video/TypeType/issues/294): Support BiliBili multi-part videos and collections.

## Thx

- @Aquarius-Situla for the long run of frontend work on this release: the playback fixes, the danmaku rework, the BiliBili collections, the system theme, the web fullscreen, Simplified Chinese, the cinema-mode report in [#295](https://github.com/TypeType-Video/TypeType/issues/295), and the BiliBili server and token fixes. [Frontend #36](https://github.com/TypeType-Video/TypeType-Frontend/pull/36) to [Frontend #48](https://github.com/TypeType-Video/TypeType-Frontend/pull/48), [Server #89](https://github.com/TypeType-Video/TypeType-Server/pull/89), [Server #90](https://github.com/TypeType-Video/TypeType-Server/pull/90), [Token #21](https://github.com/TypeType-Video/TypeType-Token/pull/21)
- @Toastienergy for reviewing this release, testing the beta, the recommender setup feedback, the random-recommendations request in [#270](https://github.com/TypeType-Video/TypeType/issues/270), and the German translation.
- @uniextra for the Takeout import report in [#276](https://github.com/TypeType-Video/TypeType/issues/276).
- @kinouzero for the YouTube remote-login report in [#250](https://github.com/TypeType-Video/TypeType/issues/250).
- @gohoski for the downloader report in [#304](https://github.com/TypeType-Video/TypeType/issues/304).
- @AphoticUmbral for the shuffle request and the loading report in [#303](https://github.com/TypeType-Video/TypeType/issues/303) and [#302](https://github.com/TypeType-Video/TypeType/issues/302).
- @ilar for the livestream chat request in [#297](https://github.com/TypeType-Video/TypeType/issues/297).
- @drJeckyll for the autoplay discussion in [#283](https://github.com/TypeType-Video/TypeType/issues/283).
- @arcoast for the setup feedback in [#254](https://github.com/TypeType-Video/TypeType/issues/254).

A special thx to sponsors [@Toastienergy](https://github.com/Toastienergy) and [@crichemond](https://github.com/crichemond) for supporting TypeType.

If u want to support TypeType, please share it with others! If u want to support it financially, u can do so through [GitHub Sponsors](https://github.com/sponsors/Priveetee)!

## Updating

Follow the [update guide](https://typetype-video.github.io/Docs-TypeType/self-hosting/maintenance).

If necessary, follow the [rollback guide](https://typetype-video.github.io/Docs-TypeType/self-hosting/rollback).

# TypeType 1.9.0

This is a big one. More than two weeks of work went into making playback more reliable, bringing subscription groups to desktop, improving Takeout and self-hosting, and making TypeType’s approach to AI easier to find. Many of these improvements started with community reports and PRs. We’re grateful to everyone who helped make this release happen.

## AI Transparency

We've added a public [AI Transparency document](https://github.com/TypeType-Video/TypeType/blob/main/AI_TRANSPARENCY.md) explaining our approach to AI in TypeType development.

## Playback and Providers

- Make YouTube web playback SABR-only, while keeping BiliBili and NicoNico playback unchanged. [#168](https://github.com/TypeType-Video/TypeType/issues/168)
- Requeue recoverable live requests in the active playback session instead of leaving playback stuck.
- Improve quality selection and stop showing the unavailable-audio warning on single-language streams. [Frontend #34](https://github.com/TypeType-Video/TypeType-Frontend/pull/34), [Frontend #33](https://github.com/TypeType-Video/TypeType-Frontend/pull/33)
- Decode extractor responses using their declared charset. [Server #87](https://github.com/TypeType-Video/TypeType-Server/pull/87)
- Fix YouTube comments displaying raw HTML. [#266](https://github.com/TypeType-Video/TypeType/issues/266)

Live playback passed three 30-minute beta runs with no session loss; 16 recoverable requests were requeued in place.

## Subscriptions and Watch Experience

- Add desktop management for subscription groups and paginate group members. [Frontend #32](https://github.com/TypeType-Video/TypeType-Frontend/pull/32), [Server #86](https://github.com/TypeType-Video/TypeType-Server/pull/86)
- Show a skeleton while channel avatars load and retry failed image requests without requiring a page refresh.
- Remove the duplicate NicoNico entry from the service picker.
- Fix Shorts not appearing on the initial home screen. [#275](https://github.com/TypeType-Video/TypeType/issues/275)

## Takeout and Self-Hosting

- Improve Takeout imports for localized fields, including Spanish, and larger archives.
- Add `BILIBILI_SESSION_ENCRYPTION_KEY` to the Compose and environment templates. [#291](https://github.com/TypeType-Video/TypeType/pull/291)
- Improve self-hosting documentation, including Dockge and Traefik guidance.
- Split the Server into focused Gradle modules and keep tests close to the code they cover.

## Issues Fixed in This Dev Line

- [#267](https://github.com/TypeType-Video/TypeType/issues/267): Account registration and login could fail.
- [#271](https://github.com/TypeType-Video/TypeType/issues/271), [#273](https://github.com/TypeType-Video/TypeType/issues/273), [#274](https://github.com/TypeType-Video/TypeType/issues/274): Fix YouTube Remote Login persistence and configuration issues, plus a readiness check.
- [#272](https://github.com/TypeType-Video/TypeType/issues/272): Document reverse-proxy WebSocket headers.
- [#275](https://github.com/TypeType-Video/TypeType/issues/275): Shorts could be missing from the initial home screen.
- [#266](https://github.com/TypeType-Video/TypeType/issues/266): YouTube comments could display raw HTML.

## Thx

More than two weeks of work went into this release, and many improvements began with someone taking the time to report a problem, send a PR, test a fix, or help with translations. We truly appreciate the time and care you put into TypeType.

- @Aquarius-Situla for the playback fixes in [Frontend #33](https://github.com/TypeType-Video/TypeType-Frontend/pull/33) and [#34](https://github.com/TypeType-Video/TypeType-Frontend/pull/34), and the BiliBili session configuration in [#291](https://github.com/TypeType-Video/TypeType/pull/291).
- @kapdon for desktop subscription-group management in [Frontend #32](https://github.com/TypeType-Video/TypeType-Frontend/pull/32) and pagination in [Server #86](https://github.com/TypeType-Video/TypeType-Server/pull/86).
- @tam1m for the charset fix in [Server #87](https://github.com/TypeType-Video/TypeType-Server/pull/87).
- @drJeckyll for reporting the YouTube comments issue in [#266](https://github.com/TypeType-Video/TypeType/issues/266).
- @hsjlyj for the detailed reports in [#271](https://github.com/TypeType-Video/TypeType/issues/271), [#272](https://github.com/TypeType-Video/TypeType/issues/272), [#273](https://github.com/TypeType-Video/TypeType/issues/273), and [#274](https://github.com/TypeType-Video/TypeType/issues/274).
- @therealresonix for reporting the login issue in [#267](https://github.com/TypeType-Video/TypeType/issues/267).
- @uniextra for the Shorts report and Takeout import feedback in [#275](https://github.com/TypeType-Video/TypeType/issues/275) and [#276](https://github.com/TypeType-Video/TypeType/issues/276).
- @Toastienergy for the German translation and beta testing.

## Updating

Follow the [update guide](https://typetype-video.github.io/Docs-TypeType/self-hosting/maintenance).

If necessary, follow the [rollback guide](https://typetype-video.github.io/Docs-TypeType/self-hosting/rollback).

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

# TypeType 1.8.0

TypeType 1.8.0 improves playback reliability, the watch experience,
account portability, sharing and localization.

## Playback

- Recover stalled SABR segment requests instead of leaving playback stuck.
- Preserve the exact playback position across WebKit provider changes.
- Isolate WebKit seeks to prevent stale media state.
- Improve paused Firefox seeks by filling the playback buffer first.
- Synchronize compact player controls after seeking.
- Reduce playback regressions when switching or recovering media sources.
- Update TypeType-Player to MSE `0.1.59`.
- Keep BiliBili stream extraction compatible with the fixes introduced in 1.7.3.

## Floating Watch Player

- Keep the current video visible while scrolling through the page.
- Add a draggable floating player.
- Persist the floating player position and state across navigation.
- Keep the compact player usable on mobile.
- Disable the floating player in landscape layouts where it would obstruct content.
- Keep the player stable when related videos are displayed.

## Sharing

- Add a compact share menu anchored to the share button.
- Show the destination name next to each share icon.
- Add direct links to the original provider.
- Normalize YouTube Shorts share links.
- Improve the share menu layout on desktop and mobile.

## Playback Progress

- Show playback progress directly on video cards.
- Add batch progress lookup for faster history and recommendation loading.
- Keep progress updates non-blocking during playback.

## Volume Controls

- Support mouse-wheel volume changes on every player layout.
- Prevent the page from scrolling when the wheel is used over the volume slider.
- Keep volume controls usable in the compact and floating players.

## Localization

- Add the German interface locale.
- Add the German translation catalog.
- Improve layout behavior for longer translated labels.
- Make video settings responsive to the active locale.
- Continue rejecting untranslated frontend messages during validation.

## Account Portability

- Support large YouTube Takeout archives.
- Add ZIP64 archive reading for large imports.
- Return a typed error when an upload is too large.
- Preserve bounded import processing and progress reporting.

## YouTube Login

- Fix remote YouTube login completion after passkey or 2FA.
- Stabilize remote YouTube input handling.
- Improve diagnostics for failed remote-login sessions.

## Server Reliability

- Isolate the Server SABR contract behind explicit adapter boundaries.
- Expand SABR contract and playback recovery tests.
- Preserve bounded retries, playback generations and session isolation.

No configuration change or manual database migration is required for this release.

## Thx

Thx to @whiskeredtux and @tigershark482 for the detailed buffering,
seek and playback reports that helped improve SABR recovery. [#248](https://github.com/TypeType-Video/TypeType/issues/248)

Thx to @kinouzero for reporting remote YouTube login failures around
passkey and 2FA, and for testing the login fixes. [#250](https://github.com/TypeType-Video/TypeType/issues/250)

Thx to @Toastienergy for contributing the German translation and helping
test the localized interface, compact player and playback experience.

Thx to @surasuku235 for reporting the BiliBili extraction regression
addressed in the previous release. [#262](https://github.com/TypeType-Video/TypeType/issues/262)

A special thx to sponsors [@Toastienergy](https://github.com/Toastienergy)
and [@filippobaroni](https://github.com/filippobaroni) for supporting
TypeType.

Thx as well to everyone testing the beta, sharing playback logs, testing
mobile layouts, reviewing translations and helping other self-hosters.

## Updating

Follow the [update guide](https://typetype-video.github.io/Docs-TypeType/self-hosting/maintenance).

If necessary, follow the [rollback guide](https://typetype-video.github.io/Docs-TypeType/self-hosting/rollback).
