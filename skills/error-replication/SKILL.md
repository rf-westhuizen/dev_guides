---
name: error-replication
description: >
  Reproduce-first debugging and self-correction workflow. TRIGGER when the
  user reports an error, exception, crash, stack trace, logcat, or unexpected
  runtime behavior that needs a fix. Do NOT trigger on casual mentions of the
  word "error" with no concrete failure to diagnose. Workflow: replicate the
  failure first, explain root cause, implement the fix, then re-run the same
  replication against the fixed code to prove the error is actually handled.
---

# Error Replication

Use this skill to turn a bug report into a verified fix instead of a guess.
The reproduction is the proof — write it before explaining causes, and run it
again after the fix before calling anything solved.

## Start

- Begin active skill conversations with: `Lets replicate this...`
- Read `D:/Github/dev_guides/skills/dev-flutter/SKILL.md` (and
  `D:/Github/dev_guides/skills/scotch-flutter/SKILL.md` if inside
  `scotch_software`) before touching Flutter/Dart code — architecture and
  layering rules still apply to the fix.
- Read `references/testing_standards.md` guidance from `dev-flutter` for how
  a reproduction should be shaped as a real test when one is being added.

## Workflow

1. **Gather.** Read the full error, stack trace, or logcat before reacting.
   Identify the failing file, layer, and the narrowest input/state that
   triggers it. Ask only if the report is genuinely ambiguous.
2. **Replicate.** Before explaining or fixing anything, produce the smallest
   reproduction that fails the same way:
   - Prefer a real unit/widget/integration test in the existing suite when the
     failure is expressible there — it becomes a permanent regression guard.
   - Otherwise, a minimal script or harness in the scratchpad directory is
     acceptable — say explicitly that it's a scratch repro, not a checked-in
     test.
   - If it genuinely can't be replicated locally (hardware timing, prod-only
     conditions, flaky external device), say so plainly and switch to the
     **Fallback** path below instead of forcing a fake repro.
3. **Explain.** Once the failure reproduces, explain the root cause in plain
   terms: what triggered it, why the code allowed it, and any contributing
   conditions. Separate the symptom (what the log shows) from the cause (why
   it happened).
4. **Fix.** Implement the smallest correct fix. Keep it inside the
   architecture/layering and type-safety rules from `dev-flutter` /
   `scotch-flutter`. Do not fold in unrelated cleanup.
5. **Verify.** Re-run the exact reproduction from step 2 against the fixed
   code. It must now pass. This step is not optional — a fix without the
   reproduction re-run is not considered done.
6. **Report.** State cause, fix, and what the reproduction now proves, in a
   few sentences. If the repro was a scratch script rather than a checked-in
   test, note that and suggest promoting it if it's worth keeping.

## Fallback (non-replicable errors)

When a failure can't be reproduced locally:

- Say so explicitly — don't pretend a partial repro is the real thing.
- Reason from the log/stack trace directly to a root-cause hypothesis.
- Propose the fix against that hypothesis, and name the uncertainty.
- Recommend the logging/telemetry addition that would let a future occurrence
  be replicated or confirmed, instead of shipping a silent guess.

## Payment / Listener Sensitive Debugging

When the error touches payment, receipt, listener, or launcher code in
`scotch_software`, the gates in `D:/Github/dev_guides/CLAUDE.md` still apply
during debugging, not just the final fix:

- Never log or print PAN data or full unfiltered payment responses, even in
  a scratch reproduction.
- Redact device/register identifiers and secrets from any repro output shown
  in chat.
