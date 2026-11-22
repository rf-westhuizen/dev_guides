---
name: pre-pr
description: >
  Reviews a branch or working tree before commit or pull request and reports
  blocking problems separately from advisory ones. Checks diff hygiene,
  conflict markers, whitespace errors, accidental artifacts, PR scope, test
  coverage of the actual behaviour changed, behaviour against the base branch
  for payment and listener code, and whether the PR summary explains the risky
  parts.
when_to_use: >
  Use when the user is preparing a commit or pull request, asks for a PR
  review, asks whether a change is ready for review, asks to check or clean up
  a diff before pushing, or asks for help writing a PR summary. Also use when
  the user says they are done with a change and about to push.
allowed-tools: Bash(git status *) Bash(git diff *) Bash(git log *) Bash(git ls-files *) Bash(git branch *) Bash(git show *)
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
- [ ] 6. Behaviour vs base
- [ ] 7. Summary check
- [ ] 8. Report
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
out and why, not just that it is large. Payment-flow changes (sale, refund,
void, settlement, receipt, listener locking) belong in their own PR when the
diff also carries UI, settings or startup work, so they get a focused review.

**5. Tests.** Check that tests cover the behaviour that changed, not just a
corrected fixture or fake state. Flag behaviour changes with no test. Database
tests must use in-memory or temp databases and clean up after themselves. When
the diff adds a listener on a shared stream, event bus or static, require a
negative test: an event from an unrelated operation must not change this one.
A test that only asserts the intended path can encode the bug it should catch.

**6. Behaviour vs base.** Only when the diff touches payment, receipt,
listener, launcher, Pigeon or native driver code. For each changed operation,
write one line per failure mode: timeout, native refusal, lost or late reply,
and a second request arriving while the first is still running. Say what the
base branch did and what this branch does now. Read the unchanged code the
change depends on, not only the diff: a changed line is often wrong only
together with an unchanged one, such as a listener on a shared stream or a
lock released in middleware. `git show <base>:<path>` gives the old version.
Flag as Blocking:
- a failure mode the base branch handled correctly and this branch gets wrong
- state now shared between operations with no way to tell whose event or
  result it is
- a lock or busy flag that ends before, or long after, the work it protects

**7. Summary check.** If a PR summary exists, check that it explains the parts
a reviewer cannot infer from the diff: cross-package changes, listener or
launcher wiring, payment-flow behaviour changes, config or recovery changes,
and the risk of the change. If no summary exists, offer to draft one. A risk
that the summary or a commit message says is still open ("known risk", "not
handled yet") is Blocking unless the diff tests it or the summary links a
follow-up ticket. Explaining a risk is not the same as resolving it.

**8. Report.** Use the format below.

## Related standards

- If the diff touches Dart or Flutter code, read the matching architecture
  skill before judging layering: `dev-flutter` outside the monorepo,
  `scotch-flutter` inside `scotch_software`.
- If the diff touches payment, receipt, listener, launcher, Pigeon, or local
  API code in `scotch_software`, apply the payment and listener gates in
  `D:/Github/dev_guides/CLAUDE.md` ("Scotch Payment And Listener Gates"). In
  particular, never log PAN data or full unfiltered payment responses, and
  redact device or register identifiers from anything shown in chat.
- Judge readability against "Code Level" in `D:/Github/dev_guides/CLAUDE.md`.
  Clever code where plain code would do the same job, or an abstraction with
  no second use today, is Advisory. Give the plainer version.

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
Reading code shows how a failure can happen, not how often it happens or what
a device does; say which one a finding rests on.

An empty Blocking list is a valid and common result. Report it plainly.
