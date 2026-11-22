---
name: coding-refresh
description: Checks dev_guides against current official docs for Flutter, Dart, Riverpod, Drift/Freezed/build tooling, Android/Kotlin/Pigeon, Claude Code and SOLID/design patterns, and drafts an edit only for a fact a re-checked primary source proves out of date - never applies one without approval. Start it with /coding-refresh <domain>.
disable-model-invocation: true
argument-hint: "one or two domains: flutter-dart, riverpod, data-and-build, android-kotlin, claude-code, solid-patterns"
effort: high
---

# Coding Refresh

Check what dev_guides tells agents against what the official sources say today,
and surface only facts that are provably out of date, each with a quote from a
page opened in this run and a second, independent check. Never apply an edit
without the user approving that specific finding in this turn.

Start with: `Lets refresh this...`

`agent-improve` looks backwards at how agents followed the standards. This skill
looks outwards at whether the standards themselves are still current. This skill
never edits agent-improve; agent-improve may propose edits to this one, with
approval. Neither edits itself.

## Before starting

Each domain is a file in [domains/](./domains/): `flutter-dart`, `riverpod`,
`data-and-build`, `android-kotlin`, `claude-code`, `solid-patterns`.

- If the argument names no domain, list the six and recommend one or two.
  Running all six means up to 12 subagents and a report too long to review well.
- Say back the domains, their target files (from each domain file's Targets),
  how many subagents will run, and that they will read web pages. Wait for the
  user to confirm.
- Run `git -C D:/Github/dev_guides status --short`. Name every file with
  uncommitted changes. Those files get no drafted edit, as a target or as a
  copy, unless the user says so now, because discarding a refresh edit with git
  would also discard their work.
- Researchers read `D:/Github/scotch_software` for version pins. If this session
  did not start under `D:/Github`, warn that those reads may ask for permission.
- If the session is in plan mode, say that steps 1-6 work in plan mode but
  step 7 (applying edits) needs the user to switch mode first.

## Workflow

Copy this checklist into the reply and check items off as you go:

```text
Coding Refresh Progress:
- [ ] 1. Scope the refresh
- [ ] 2. Research each domain
- [ ] 3. Verify each "Wrong now" finding
- [ ] 4. Merge and sort
- [ ] 5. Draft edits (max 8)
- [ ] 6. Report
- [ ] 7. Get approval, per finding
```

**1. Scope the refresh.** See "Before starting".

**2. Research each domain.** In one message, spawn one `practice-researcher`
subagent per domain. Each prompt contains only: `Follow ## Research`, the
absolute path to that domain's file, and today's date. It does not need this
conversation. Wait for every researcher to report before step 3.

**3. Verify each "Wrong now" finding.** For each domain whose report has at least
one "Wrong now" finding, spawn a fresh `practice-researcher` with
`Follow ## Verify`. Give it the absolute path to the domain file and, per
finding, only: the id, the kind, the source URL, the anchor, and the dev_guides
file:line. Never pass the researcher's quote or reasoning, so the verifier reads
the page for itself instead of agreeing with it. Wait for every verifier.

**4. Merge and sort.** Merge findings that cite the same file:line, keeping every
source. A finding is **Verified** only when all of these hold:

- the verifier's verdict is `confirmed`;
- the researcher's quote appears in the verifier's extraction - compare the text
  yourself, ignoring whitespace, quotation marks and Markdown markup (backticks,
  asterisks, square brackets, `#`); do not take either agent's word;
- the final URL is on a host listed in that domain's Sources, or, for a
  `contradiction`, is the baseline file the verifier re-read;
- the verifier marked the page as current (a baseline file counts as current);
- nothing in "Calibration" or "Edit rules" below sends it to the Watch list.

A `refuted` finding is dropped; list it under "Checked and current" as
"researcher claim refuted". Everything else goes to the **Watch list** with its
reason: unverifiable, upgrade available (team decision), differs by choice,
upcoming deadline, policy may not apply, or protected section.

**5. Draft edits (max 8).** Draft edits for Verified findings only, at most 8 per
run, in this order of priority:

1. code that does not compile, or a command that fails as written;
2. dead links (MUST-FOLLOW lists first);
3. two dev_guides files contradicting each other;
4. API or setup facts.

Put mechanical items of one kind into one finding (for example, every dead
Riverpod link in both `external_sources.md` files). Anything over the limit, or
that cannot be drafted (see below), goes under "Verified, not drafted this run"
with its reason. For each finding:

- Grep all of `D:/Github/dev_guides` for every copy of the claim. A copy states
  the same fact.
- A nearby rule that differs between the dev-flutter and scotch-flutter twins is
  not a copy. List it under "Twins differ (not changed)" and never edit one twin
  to match the other.
- Read each target, then draft one `old_string`/`new_string` pair per copy, all
  under one approval. Confirm each `old_string` occurs exactly once in its file.
  If any copy cannot be drafted, or sits in a file with uncommitted changes the
  user did not opt in for, draft nothing for that finding: all copies or none.
- Follow the edit rules below.

**6. Report.** Use the format below.

**7. Get approval, per finding.** If the session is in plan mode, stop here and
ask the user to switch mode. Then walk the Verified findings one at a time and
ask "Apply this edit? (yes / no / edit it first)", waiting for each answer. On
"edit it first", take the user's change, redraft, and ask again. Apply only
findings the user approves in this turn, never a blanket "yes to all". Before
each `Edit`, Read the file again and confirm each `old_string` still occurs
exactly once; if not, redraft. Never commit: an applied edit stays an
uncommitted change for the user to diff, commit or discard.

## Edit rules

- **Never edit**: `skills/agent-improve/**`, `agents/transcript-reviewer.md`,
  `skills/coding-refresh/**`, `agents/practice-researcher.md`, `scripts/**`
  (code with its own tests), `UBIQUITOUS_LANGUAGE.md` (owned by
  `ubiquitous-language`), or anything outside `D:/Github/dev_guides`. Stale text
  there goes under "Out of scope / Not covered" as "stale copy left at
  <file:line>".
- **Protected sections, Watch list only**: in `CLAUDE.md` and `CODEX.md` (where
  present), the sections "Reply Marker", "Skill Routing", "Code Level (Always)",
  "Running Checks", "Live Data", "Type Safety Rules" and "Scotch Payment And
  Listener Gates"; in `CODEX.md`, also "Key Architecture Rules".
- **Payment-adjacent text**: `skills/scotch-flutter/references/pigeon_platform.md`,
  the "Device SDKs" section of `agents/platform.md`, and the payment lines of
  `agents/security.md`. Only code that does not compile, a command that fails, or
  a dead link may be drafted there, labelled "touches payment/platform guidance,
  not device-tested". A change of pattern (base class, launch API, manifest
  attribute, theme) goes to the Watch list.
- **What a `new_string` may contain**: a version read from a JSON or metadata
  endpoint or copied from the baseline (a dev_guides file, a `scotch_software`
  pubspec or Gradle file, or Flutter's Android template at the stable tag), a
  final URL that was checked and sits on a Sources host, an identifier from the
  official API reference, and your own wording. Never copy page prose into it.
  Never add a new dependency or a new host.
- Only `practice-researcher` opens web pages. This conversation never calls
  WebFetch or WebSearch, because it is the one that holds `Edit`.

## Related standards

- `D:/Github/dev_guides/CLAUDE.md` "Code Level (Always)" is a set of team
  choices. Research never "fixes" it; a source that disagrees goes to the Watch
  list as "differs by choice".
- Payment and Pigeon text follows "Scotch Payment And Listener Gates" in the same
  file.
- Every edit follows "Refactor small": the smallest change that makes the fact
  true again.

## Report format

```text
## Scope
<domains, target files, subagents run, files skipped for uncommitted changes, date>

## Versions (checked <date>)
| Item | Guides say | Baseline | Latest stable (ISO date) | Verdict: current / upgrade available / Verified / Watch |
|---|---|---|---|---|

## Verified (has a proposed edit)
### <short name>
- Domain: <...> - Kind: <broken code | failing command | dead link | contradiction | API/setup fact>
- Claim: "<exact text>" - <file:line>; copies: <file:line, ...>
- Source: "<quote, at most 2 sentences>" - <final URL> (opened <date>)
- Verifier: confirmed - <one line>
- Label: <"touches payment/platform guidance, not device-tested", or none>
- Proposed edit (all copies apply together):
  <file>
  old_string: <exact text>
  new_string: <exact text>
- Twins differ (not changed): <file:line, or none>
- Rationale: <one or two sentences>
- (Asked one at a time after this report. Nothing is written until you answer.)

## Verified, not drafted this run
- <short name> - <file:line> - <source URL> - <over the limit | uncommitted file | copy not draftable>

## Watch list (not yet actionable)
- <short name> - <reason> - <source URL>

## Checked and current
- <links and APIs checked and found current; versions live only in the table above>

## Suspicious pages
- <URL> - <what looked aimed at an AI agent>, or "none"

## Out of scope / Not covered
- <stale copies in never-edit files, project code such as scotch_software Gradle files, the researchers' "Not checked" items>

## Verdict
<n> verified finding(s) with proposed edits, <n> verified but not drafted, <n> on the Watch list. <one line>
```

## Calibration

- Every researcher was told to find what is out of date, so between them they
  will produce a list. An empty Verified list is a valid and good result; report
  it plainly rather than promoting a Watch-list item to look useful.
- **Fact or choice.** A fact is a version number, a URL, an API name or
  signature, a command's syntax, or a dated policy. Anything the guide states as
  MUST, NEVER, "Use X" or "Prefer Y" is a team choice. A finding that would change
  a choice goes to the Watch list as "differs by choice", even when the source is
  official.
- **Versions.** Compare a pin with its baseline ("Version baseline" in
  `agents/practice-researcher.md`), not with the newest release. A pin a major
  version behind another dev_guides file or a `scotch_software` pin is a
  contradiction and can be Verified. An older pin in the same major is current.
  A newer major than the baseline, or a pin behind only the newest release,
  goes to the Watch list as "upgrade available, team decision", never to
  Verified.
- **Policy.** A requirement such as a Google Play deadline is Verified only if it
  binds every app the target file covers.
- **No quote, no finding.** A finding without a word-for-word quote from a page
  opened in this run (or, for a contradiction, from the baseline file) is
  dropped.

## Adding a domain or a source

- Copy an existing file in `domains/` and fill in Targets (dev_guides paths, and
  which part of a shared file this domain owns) and Sources.
- A source is the vendor's own docs or site, the package's own pub.dev page,
  changelog or API, the official repository, or an author's own site for their
  own definitions (Fowler, Martin, Evans). Never a third-party blog, Medium or
  Stack Overflow. A well-known third-party reference stays only if its "Use
  for" note says why.
- Give every source line a "Use for: ..." note.
- Add the domain name to `argument-hint` above, add any new host as a
  `WebFetch(domain:<host>)` rule in `D:/Github/.claude/settings.json`, then run
  `/coding-refresh <name>` once to check it.
- Remove a source that turns out dead, wrong or second-hand rather than keeping it.

## Out of scope for v1

- **No scheduled runs.** `disable-model-invocation: true`, manual-only.
- **No state between runs.** The guides' own version pins are the baseline.
- **No self-modification.** This skill never edits its own folder or
  `practice-researcher`; `agent-improve` can propose changes to both, with
  approval.
- **No commits.** Applied edits stay uncommitted for the user.
- **No project code.** `scotch_software` is read only as a version baseline;
  stale project files are reported under "Out of scope / Not covered".
- **No new dependencies or hosts** in drafted edits.

A bigger version would use the Workflow tool to pipeline each domain's research
straight into its verify step; it's worth it only if full runs get slow.
