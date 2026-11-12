---
name: agent-improve
description: Reviews past Claude Code transcripts that used dev_guides-owned skills or agents, scores them against a 5-dimension rubric, and drafts a targeted instruction edit only when the same failure recurs across multiple sessions - never applies it without explicit approval. Start it with /agent-improve.
disable-model-invocation: true
argument-hint: "optional: a skill or agent name to focus on, or a time window like 7d/30d (default: 30d)"
effort: high
---

# Agent Review

Review past work by dev_guides-owned skills and agents, score it, and surface
only failures that actually recur — with transcript citations. Never apply an
edit without the user approving that specific change in this turn.

Start with: `Lets audit this...`

## Before starting

State the scope back before running anything: the time window (default last
30 days) and, if the argument named one, the specific skill or agent being
focused on. If the argument is empty, confirm the default window rather than
silently picking one.

## Workflow

Copy this checklist into the reply and check items off as you go:

```text
Agent Review Progress:
- [ ] 1. Scope the review
- [ ] 2. Mine transcripts
- [ ] 3. Score with the transcript-reviewer
- [ ] 4. Separate recurring from single-observation
- [ ] 5. Draft edits for recurring issues only
- [ ] 6. Get approval, per edit
- [ ] 7. Report
```

**1. Scope the review.** Say back the time window and any skill/agent filter
before running anything (see "Before starting").

**2. Mine transcripts.** Run the bundled script from its own directory:
```sh
node D:/Github/dev_guides/skills/agent-improve/scripts/mine-transcripts.mjs --since 30d --out <scratchpad>/agent-improve-mined.json
```
Pass `--scope <name>` when the user named a specific skill or agent. The
script scans every project folder on this machine (dev_guides skills/agents
are machine-global, so a PARW or `fit_sync_ecosystem` session that ran
`/agent-flow` is in scope too) but only keeps turns that actually invoked a
dev_guides-owned skill or subagent — see its own header comment for exactly
which. Do not narrow scope by skipping project folders yourself; if the
script's scope looks wrong, fix the script, don't route around it.

**3. Score with the transcript-reviewer.** Read only `work_units_count` and
`sessions_scanned` from the mined JSON yourself, to sanity-check the run —
do not read its individual records in the main thread. `work_units_count`
counts human turns. Subagent runs are nested inside their parent turn's
`subagent_units` (`subagent_units_nested` counts them), so splitting the
batch by top-level unit keeps a parent and its subagents together. Spawn one or more
`transcript-reviewer` subagents (split a large batch across several the way
`agent-code-review-team` splits by lens, rather than reviewing everything in
one pass),
each given: the absolute path to the mined JSON, the absolute path to
`D:/Github/dev_guides/skills/agent-improve/rubrics/`, and nothing else —
it does not need this conversation's context. Wait for all of them before
continuing.

**4. Separate recurring from single-observation.** Merge the subagents'
reports. A problem is Recurring only when the same concrete issue appears in
2 or more distinct `session_id`s across the merged results. Everything else
is a Single Observation. Do not promote a Single Observation because it
feels important — that is exactly the padding this skill exists to avoid.

**5. Draft edits for recurring issues only.** For each Recurring Issue, Read
the current text of the target file (`D:/Github/dev_guides/skills/*/SKILL.md`,
`D:/Github/dev_guides/agents/*.md`, or `D:/Github/dev_guides/CLAUDE.md`) and
draft a minimal `old_string`/`new_string` pair that would have prevented the
cited failures. **Never draft an edit to
`D:/Github/dev_guides/skills/agent-improve/**` or
`D:/Github/dev_guides/agents/transcript-reviewer.md`** — list anything found
there under "Out of Scope" instead, with a note that this skill cannot modify
itself. This is a hard restriction, not a judgment call.

**6. Get approval, per edit.** Present each Recurring Issue's proposed edit
on its own, with its evidence, and ask "Apply this edit?" before touching
anything. Apply only the issues explicitly approved in this turn, one `Edit`
call per approved issue — never a blanket "yes to all". Never commit; an
applied edit is left as an uncommitted working-tree change for the user to
diff, commit, or discard with git normally.

**7. Report.** Use the format below.

## Related standards

- Score Comment Verbosity against the exact wording of "Code Level (Always)"
  in `D:/Github/dev_guides/CLAUDE.md` — the rubric file quotes it; don't
  invent a different verbosity standard.
- Score Code Quality against the same section's "Add nothing beyond that
  without a real use today" / "Plain beats clever" rules — these apply across
  every dev_guides skill, not only Flutter ones, since this review spans all
  of them.

## Report format

```text
## Scope
<time window, skill/agent filter, # sessions scanned, # work units, which
project folders were included/excluded>

## Dimension scores (across <n> work units)
- Task Success/Correctness: <label> x<n>, <label> x<n>, ... - flagged: <session:uuid citations, or "none">
- Efficiency: <label> x<n>, ...
- Code Quality: <label> x<n>, ...
- Test Coverage: <label> x<n>, ... - flagged: <citations, or "none">
- Comment Verbosity: <label> x<n>, ...

## Recurring Issues (>=2 corroborating transcripts - has a proposed edit)
### <short issue name>
- Dimension(s): <...>
- Seen in: <session:uuid>, <session:uuid>[, ...]
- Evidence:
  - "<quoted excerpt>" - <session:uuid>
  - "<quoted excerpt>" - <session:uuid>
- Proposed edit: <target file path>
  old_string: <exact text>
  new_string: <exact text>
- Rationale: <one or two sentences tying the edit to the cited evidence>

> Apply this edit? (yes / no / edit it first) - nothing is written until you answer.

## Single Observations (not yet actionable)
- <short name> - <dimension> - <session:uuid> - <one-line description> - "<excerpt>"

## Out of Scope / Not Covered
- <sessions/projects excluded by the scope filter>
- <anything found in agent-improve's own files or rubric - never self-proposed>

## Verdict
<n> recurring issue(s) with proposed edits, <n> observation(s), <n> flagged
hard-dimension score(s). <one line>
```

## Calibration

Every `transcript-reviewer` subagent was told to find problems, so between
them they will produce a list. A finding only earns Recurring Issue status
when it has real citations and 2+ session corroboration; everything else is a
Single Observation or dropped. **An empty Recurring Issues list is a valid
and good result — report it plainly rather than inflating a Single
Observation to look actionable.** Do not let a clean run feel like a wasted
one.

## Out of scope for v1

- **No scheduled/cron runs.** `disable-model-invocation: true`, manual-only;
  nothing wires this to run automatically. A later scheduled variant is the
  `schedule`/`loop` skills' job, not this one's.
- **No project-folder scoping.** Every project folder is scanned (dev_guides
  skills/agents are machine-global), but only turns that actually invoked a
  dev_guides-owned skill or agent are kept — a Postman, PARW, or
  `fit_sync_ecosystem` session surfaces only if it genuinely used one.
- **No self-modification.** This skill and `transcript-reviewer` never
  propose edits to their own files.
- **No new versioning mechanism.** An applied edit is an ordinary uncommitted
  working-tree change; git handles review/diff/commit/discard as normal.
  This skill never commits on its own.
- **No blended score.** The 5 rubric dimensions are reported independently;
  nothing here produces or stores one combined "grade".
