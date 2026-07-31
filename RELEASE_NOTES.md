# TypeType 1.3.1

## Summary

- fix videos and Shorts stopping after about one minute when YouTube rejects the active SABR context [#184](https://github.com/TypeType-Video/TypeType/issues/184)
- refresh rejected YouTube token material before creating a replacement playback session
- release replaced SABR sessions and prevent stale background work from accumulating
- bound SABR metadata and media caches during long playback sessions

Playback now recovers in place with fresh authorization instead of repeatedly creating sessions that cannot produce media.

No configuration or database migration is required.

Thx to @LuckeeSoft for the precise report, and to everyone who tested playback on beta.

If u want to support TypeType, please share it with others. If u want to support it financially, u can do so through [GitHub Sponsors](https://github.com/sponsors/Priveetee).
