# TypeType 1.2.4

## Summary

- fix intermittent SABR startup failures when resuming videos from a saved position
- restore reliable audio and video initialization on cold playback sessions
- prevent stalled preparation from retrying indefinitely
- improve recovery when a SABR session cannot produce media

Normal seeks and quality changes continue to preserve the current playback position.

No configuration or database migration is required.

Thx to everyone who reported playback and buffering issues.

If u want to support TypeType, please share it with others. If u want to support it financially, u can do so through [GitHub Sponsors](https://github.com/sponsors/Priveetee).
