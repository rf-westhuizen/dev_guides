---
name: pre-pr
description: >
  Reviews a branch or working tree before commit or pull request and reports
  blocking problems separately from advisory ones. Checks diff hygiene,
  conflict markers, whitespace errors, accidental artifacts, PR scope, test
  coverage of the actual behaviour changed, and whether the PR summary explains
  the risky parts.
when_to_use: >
  Use when the user is preparing a commit or pull request, asks for a PR
  review, asks whether a change is ready for review, asks to check or clean up
  a diff before pushing, or asks for help writing a PR summary. Also use when
  the user says they are done with a change and about to push.
allowed-tools: Bash(git status *) Bash(git diff *) Bash(git log *) Bash(git ls-files *) Bash(git branch *)
effort: high
---

# Pre-PR Review

Gate a change before it goes up for review. Report findings; do not fix things
silently, and do not commit, push, or open a PR unless asked.

## Start

- Begin active skill conversations with: `Lets prep this...`

## Workflow

Copy this checklist into the reply and check items off as you go:

```text
Pre-PR Progress:
- [ ] 1. Scope the diff
- [ ] 2. Mechanical checks
- [ ] 3. Artifact and churn review
- [ ] 4. Scope discipline
- [ ] 5. Tests
- [ ] 6. Summary check
- [ ] 7. Report
```

**1. Scope the diff.** Establish what is actually under review before judging
it. Run `git status --short` and `git diff --stat`, and for a branch
`git log --oneline <base>..HEAD`. Ask which base branch to compare against if
it is not obvious. State the file count and the packages touched.

**2. Mechanical checks.** Both are pass/fail, not judgement:
- `git diff --check` for whitespace errors and trailing whitespace
- Search the diff for conflict markers: `<<<<<<<`, `=======`, `>>>>>>>`

**3. Artifact and churn review.** Flag anything in the diff that should not be
there: line-ending-only churn, rename noise mixed with logic changes, dev-note
or scratch files, committed databases, committed DLLs or binaries, generated
platform folders outside the task's scope, commented-out code, and leftover
debug or test logging.

**4. Scope discipline.** A PR should do one thing. Recommend splitting when the
diff mixes pure renames, package moves, cross-package wiring changes, or
application rewrites with the actual feature or fix. Say what should be split
out and why, not just that it is large.

**5. Tests.** Check that tests cover the behaviour that changed, not just a
corrected fixture or fake state. Flag behaviour changes with no test. Database
tests must use in-memory or temp databases and clean up after themselves.

**6. Summary check.** If a PR summary exists, check that it explains the parts
a reviewer cannot infer from the diff: cross-package changes, listener or
launcher wiring, payment-flow behaviour changes, config or recovery changes,
and the risk of the change. If no summary exists, offer to draft one.

**7. Report.** Use the format below.

## Related standards

- If the diff touches Dart or Flutter code, read the matching architecture
  skill before judging layering: `dev-flutter` outside the monorepo,
  `scotch-flutter` inside `scotch_software`.
- If the diff touches payment, receipt, listener, launcher, Pigeon, or local
  API code in `scotch_software`, apply the payment and listener gates in
  `D:/Github/dev_guides/CLAUDE.md`. In particular, never log PAN data or full
  unfiltered payment responses, and redact device or register identifiers from
  anything shown in chat.

## Report format

Separate what must be fixed from what is optional. Do not pad the blocking
list to look thorough.

```text
## Blocking
- <file:line> - <what is wrong and why it blocks>

## Advisory
- <file:line> - <suggestion, clearly optional>

## Verdict
Ready / Not ready - <one line>
```

State evidence rather than asserting: name the command run and what it
returned. If a check could not be run, say so instead of implying it passed.

An empty Blocking list is a valid and common result. Report it plainly.
