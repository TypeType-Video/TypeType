# AI Transparency

TypeType is built by humans. AI is a development tool, not an author, maintainer or decision-maker.

I use AI regularly. Depending on the task, I may use open-weight models in zero-data-retention setups, such as GLM, Qwen or DeepSeek, or hosted models such as GPT-5.6 Luna.

AI can help with debugging, refactoring, tests, docs, translations, infrastructure and even complete implementations. That is fine. But AI does not own the result.

## Human responsibility

For every merged change, a human must be able to answer:

- what does it do?
- why is it correct?
- how was it tested?
- what could break?
- can it be maintained?

AI can write 10%, 50% or 100% of the code. That is not the issue. The issue is whether a human reviewed it, validated it and takes responsibility for it.

## Testing still matters

AI can produce bugs. Humans can too.

Every meaningful change needs review, tests and real validation. The amount of AI used does not lower the quality bar.

Security changes, breaking changes, migration work and user-facing behavior require extra care.

## Contributor rules

You may use AI freely, including for complete implementations.

Your pull request should still explain:

- what the change does;
- why it is needed;
- how it was tested;
- known risks or limitations.

Low-effort AI spam is rejected. Mass-generated PRs, untested fixes, fake reports and unreviewed translations are not welcome.

## Commits and attribution

I do not want AI systems in commit history.

Do not add AI tools as author, committer or co-author. Do not add trailers like `Co-authored-by: SomeAI` or `Generated-with: SomeAI`.

The human who validates the change signs the work.

If you think an exception makes sense, explain it in the PR or contact me. I am open to discussion, but hidden AI attribution in commit history is not accepted by default.

## Private data

Do not send credentials, cookies, tokens, API keys, private keys, account data, third-party personal data or private logs to AI tools.

If real data is needed to reproduce an issue, reduce it, anonymize it and never publish it.

## Criticism is welcome

This document is my current position, not dogma.

If you think something here is wrong, open an issue, start a discussion or contact me. Explain your case. I prefer honest criticism over silent compliance.
