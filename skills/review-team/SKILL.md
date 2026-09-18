---
name: review-team
description: Spawns a three-teammate agent team to review a diff, branch or module in parallel - one on correctness, one on security, one on tests - then synthesises their findings into a single report.
disable-model-invocation: true
---

# Review Team

Spawn three teammates to review the same target through three different lenses,
then merge what they find. Read-only: nobody on this team edits code.

Use this when a change is large enough that one reviewer would gravitate to one
kind of issue and miss the others. For a small diff, `/pre-pr` alone is cheaper
and enough.

## Before spawning

Establish the target and say it back before spawning anything. "The uncommitted
changes in scotch_launcher" and "the last three commits on this branch" are
different reviews. If the target is unclear, ask.

Each teammate is a full Claude instance, so confirm the target is worth three of
them before starting.

## Spawn

Spawn exactly three teammates, using these subagent definitions and these names:

| Name | Agent type | Lens |
|---|---|---|
| `correctness` | `reviewer` | Logic, layering, error handling |
| `secrets` | `security` | Leaked credentials, logging, unsafe input |
| `coverage` | `tester` | Whether tests actually cover what changed |

Teammates do not inherit this conversation, and a subagent definition's
preloaded skills are not applied to a teammate. Each spawn prompt must
therefore carry its own context. Give every teammate:

- The exact target: branch, base, paths, or "uncommitted changes in <path>".
- An instruction to read `D:/Github/dev_guides/skills/dev-flutter/SKILL.md`
  first, and, when the target is inside `scotch_software`, to read
  `D:/Github/dev_guides/skills/scotch-flutter/SKILL.md` as well, because its
  package conventions and layer rules take precedence there.
- The reminder that they report findings and change nothing.

Tell `coverage` to run the suite and report real numbers rather than inferring
coverage from the diff alone.

## While they work

Wait for all three to finish before writing anything up. Do not review the code
yourself in parallel; that duplicates their work and makes the synthesis harder
to trust.

If two teammates report the same issue from different angles, that is signal,
not noise. Say so.

## Synthesise

Merge the three reports into one. Do not concatenate them.

```text
## Blocking
- <file:line> - <issue> - (<which lens found it>)

## Advisory
- <file:line> - <suggestion> - (<lens>)

## Agreed across lenses
- <anything two or more teammates raised independently>

## Checked and sound
- <what the team verified and found no fault with>

## Not covered
- <what none of the three looked at>
```

The last section matters. Three lenses is not full coverage, and a reader who
assumes it is will trust this more than it deserves.

## Calibration

Each teammate was told to find problems, so between them they will produce a
list. Promote something to Blocking only when it affects correctness, security,
or a stated standard. An empty Blocking list is a valid result for a good
change; report it plainly rather than padding it to justify the team.

## Shutting down

When the synthesis is delivered, ask each teammate to shut down by name. They
are separate Claude instances and do not stop on their own.
