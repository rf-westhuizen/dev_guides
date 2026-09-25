# CLAUDE.md - Global Instructions for Claude Code

## Reply Marker (Always)

Start the first message of every conversation, and the start of every reply,
with the exact line:

`oKAy, Lets GO!`

This signals that these `dev_guides` instructions are loaded and being followed.
Applies to both Claude Code and Codex.

## Skill Routing (Auto-Engage)

Engage the matching skill automatically when a request fits its trigger. This is
trigger-based, not always-on: skip skill engagement for trivial chat or simple
questions. When a skill engages, lead with its start marker so the active skill
is visible.

| When the request is about... | Engage skill | Start marker |
|---|---|---|
| Dart/Flutter code outside the monorepo | `dev-flutter` | `Lets dev build this...` |
| Dart/Flutter code inside `scotch_software` | `scotch-flutter` | `Lets scotch build this...` |
| Domain terms / glossary / `UBIQUITOUS_LANGUAGE.md` / "UL" or "ul" | `ubiquitous-language` | `Lets name this...` |
| Planning, explaining this codebase, shared understanding | `shared-understanding` | `Lets understand this...` |
| Learning a concept or topic for its own sake (teach, ELI5, quiz me) | `learn` | `Lets learn this...` |
| Stress-testing or grilling a plan against docs/ADRs | `grill-with-docs` | `Lets grill this...` |
| Error, exception, crash, stack trace, or logcat to debug | `error-replication` | `Lets replicate this...` |
| Preparing a commit or PR | `pre-pr` | `Lets prep this...` |

In the `scotch_software` monorepo, prefer `scotch-flutter` over `dev-flutter`
for code work. This file is imported automatically into context via an
`@D:/Github/dev_guides/CLAUDE.md` line in the root `D:/Github/CLAUDE.md`
(Claude Code only) — no hook is needed to re-surface it. Codex has no
equivalent import mechanism and relies on this section directly.

See `ENVIRONMENT.md` in this repo for how skill auto-discovery is wired up on
this machine (`CLAUDE_CONFIG_DIR` override + junction registry) before adding
or debugging any skill.

## Purpose

Use this repository as the source of truth for Flutter/Dart coding standards,
architecture patterns, scaffolding, and AI-assisted development workflows. See
the Skill Routing table above for which skill engages for each kind of work.

Scotch-Docs may be used only as comparison or background context. The
operational instructions for Claude Code come from this `dev_guides` repository.

## Before Writing Code

1. Search existing code before creating any new class, widget, value object,
   service, route, constant, helper, DTO, provider, or test utility. Reuse or
   extend existing patterns unless a new component is clearly needed.
2. Open only the relevant reference document for the task at hand
   (`architecture.md`, `riverpod_patterns.md`, `drift_patterns.md`,
   `freezed_patterns.md`, `testing_standards.md`, and so on).
3. Use templates from `templates/` when scaffolding new packages or features.

## Code Level (Always)

The reader of every code example, refactor and fix is a mid-to-junior
engineer. They must be able to read, maintain and explain the code without
help. Senior quality means the simplest correct code, not the most
sophisticated.

- **Keep what the standards require.** Layers, domain contracts, repository
  interfaces, Freezed, Riverpod, value objects where logic depends on them, and
  the rules in `dev-flutter`/`scotch-flutter` are not optional.
- **Add nothing beyond that without a real use today.** No extra interface,
  generic, base class, wrapper, factory, config option or parameter for a
  hypothetical future case. Two concrete uses justify an abstraction; one
  expected use does not.
- **Plain beats clever.** Prefer explicit `if`/`switch`, named intermediate
  variables and short methods over chained one-liners, nested ternaries and
  dense collection pipelines. Do not introduce advanced language features
  (extension types, complex generics, mixins, custom operators) the codebase
  does not already use.
- **Refactor small.** Change only what was asked, keep existing names and
  structure where they work, and show before and after for any non-trivial
  change.
- **Explain in plain English.** After code, say briefly what it does and why it
  has this shape. Give a concept the reader may not know one or two sentences.
  Name a SOLID principle or pattern only when the code actually uses it; never
  add a pattern so there is one to name.
- **Offer the bigger design, do not ship it.** If a more advanced solution is
  genuinely better, deliver the simple version and add: "A bigger version would
  add X; it's worth it only if Y." The user decides.
- **"Too complex" means simplify.** When the user says code is too complex or
  hard to follow, rewrite it simpler instead of defending it.

## Type Safety Rules

Architecture, layering, Riverpod/Freezed/Drift codegen rules, and the
Map<String, dynamic> DTO-boundary rule are owned by `dev-flutter/SKILL.md`
(and `scotch-flutter/SKILL.md` in the monorepo) — read those, not a copy here.
The rules below are the parts not already stated there:

- Do not use `dynamic` for known shapes.
- Use value objects for meaningful primitives when logic depends on them, such
  as `Money`, `Sku`, transaction IDs, route/action names, receipt identifiers,
  and device/register identifiers.
- Do not let DTOs, listener response DTOs, database rows, or API-specific types
  leak into domain interfaces.

## Scotch Payment And Listener Gates

For `scotch_software`, payment, receipt, listener, launcher, Pigeon/platform,
or local API work:

- Never log PAN data or full unfiltered payment responses.
- Never hardcode secrets, subnets, local file paths, credentials, production
  seed users, or payment-device assumptions.
- Risky flags such as `isReprint` must be explicit and required when omitting
  them could change transaction, receipt, or audit semantics.
- Listener/admin endpoints must document authentication behavior, ownership
  boundaries, and why unauthenticated local access is acceptable if it exists.
- Prefer Pigeon or an established platform-channel pattern over growing one
  new bridge method per event.
- Keep payment flow, receipt printing, reprint, reversal, void, retry, sync, and
  reconciliation concerns split into focused services/use cases/notifiers.

These gates apply while writing and debugging, not only at PR time. The same
section exists in `CODEX.md`; change both together.

## Further Reading

- Manual-only skills (started by the user, never auto-engaged):
  `/agent-flow <what to build>` runs a feature through the subagents in order
  with two approval checkpoints; `/review-team <target>` runs a three-lens
  parallel review.

- Azure DevOps work-item creation, updates, or re-parenting: the
  `manage-azure-devops-stories` skill (requires the MCP server in
  `C:/ClaudePlugins/azure-devops-work-items` to be registered and its PAT env
  vars set — see `ENVIRONMENT.md`).
- Scaffolding new packages/features: `templates/new_package/` or other
  templates in `templates/`.
- Ready-made prompts (new feature, fix a bug, review code, review like
  Heinrich, prepare a PR, grill with docs, architecture question):
  `D:/Github/dev_guides/PROMPTS.md`.
- Supplementary background (not gates): `D:/Github/dev_guides/docs/oop_solid_dart.md`
  and `D:/Github/dev_guides/docs/riverpod_3_cheat_sheet.md`.
