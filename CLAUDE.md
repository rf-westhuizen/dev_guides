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

**Note:** unlike the other rows above, `scotch-flutter` has no junction —
global or project-local. It never appears in the `Skill` tool's discovery
list, so it cannot be auto-engaged. Load it with `Read` on
`D:/Github/dev_guides/skills/scotch-flutter/SKILL.md` directly whenever the
table above says to use it. This is intentional (see `ENVIRONMENT.md`): a
global junction would make it auto-trigger on Flutter projects outside
`scotch_software` too.
| Domain terms / glossary / `UBIQUITOUS_LANGUAGE.md` | `ubiquitous-language` | `Lets name this...` |
| Planning, explaining, learning, shared understanding | `shared-understanding` | `Lets understand this...` |
| Stress-testing or grilling a plan against docs/ADRs | `grill-with-docs` | `Lets grill this...` |
| Error, exception, crash, stack trace, or logcat to debug | `error-replication` | `Lets replicate this...` |

In the `scotch_software` monorepo, prefer `scotch-flutter` over `dev-flutter`
for code work. This file is imported automatically into context via an
`@D:/Github/dev_guides/CLAUDE.md` line in the root `D:/Github/CLAUDE.md`
(Claude Code only) — no hook is needed to re-surface it. Codex has no
equivalent import mechanism and relies on this section directly.

`grill-with-docs` and `manage-azure-devops-stories` (Azure DevOps work-item
management, from the separate `C:/ClaudePlugins/azure-devops-work-items`
plugin) are also installed as live global skills. See `ENVIRONMENT.md` in this
repo for how skill auto-discovery is wired up on this machine (`CLAUDE_CONFIG_DIR`
override + junction registry) before adding or debugging any skill.

## Purpose

Use this repository as the source of truth for Flutter/Dart coding standards,
architecture patterns, scaffolding, and AI-assisted development workflows. See
"Before Writing Code" below for which skill file to read for each kind of work.

Scotch-Docs may be used only as comparison or background context. The
operational instructions for Claude Code come from this `dev_guides` repository.

## Before Writing Code

1. Read the universal Flutter skill:
   `D:/Github/dev_guides/skills/dev-flutter/SKILL.md`
2. For shared planning, explanation, learning, or terminology work, read:
   `D:/Github/dev_guides/skills/shared-understanding/SKILL.md`
3. For grilling, stress-testing plans, or documentation-backed clarification, read:
   `D:/Github/dev_guides/skills/grill-with-docs/SKILL.md`
4. For domain terminology alignment or glossary updates, read:
   `D:/Github/dev_guides/skills/ubiquitous-language/SKILL.md`
5. If the project is in the Scotch monorepo named `scotch_software`, also read:
   `D:/Github/dev_guides/skills/scotch-flutter/SKILL.md`
6. When debugging an error, exception, crash, or logcat, read:
   `D:/Github/dev_guides/skills/error-replication/SKILL.md`
7. Search existing code before creating any new class, widget, value object,
   service, route, constant, helper, DTO, provider, or test utility. Reuse or
   extend existing patterns unless a new component is clearly needed.
8. Open only the relevant reference document for the task at hand
   (`architecture.md`, `riverpod_patterns.md`, `drift_patterns.md`,
   `freezed_patterns.md`, `testing_standards.md`, and so on).
9. Use templates from `templates/` when scaffolding new packages or features.

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

## Before Commit / Before PR

Treat these as hard gates before asking for review:

1. Run or check `git diff --check`.
2. Search the diff for conflict markers: `<<<<<<<`, `=======`, `>>>>>>>`.
3. Reject unrelated line-ending churn, rename noise, dev-note files, committed
   databases, committed DLLs, generated platform folders outside scope, and
   leftover debug/test code.
4. Keep PRs scoped. Split pure renames, package moves, cross-package listener
   work, and application rewrites into separate PRs when feasible.
5. PR summaries must explicitly explain cross-package changes, listener/launcher
   wiring, payment-flow behavior changes, config recovery changes, and risk.
6. Add or update tests for the actual behavior, not only fixed fake state.
7. Database tests must use memory/temp databases and clean up after themselves.

## Further Reading

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
