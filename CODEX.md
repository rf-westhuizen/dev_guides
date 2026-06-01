# CODEX.md - Global Instructions for Codex

## Purpose

Use this repository as the source of truth for Flutter/Dart coding standards,
architecture patterns, scaffolding, and AI-assisted development workflows.

The universal Flutter standards live in:

- `D:\Github\dev_guides\skills\dev-flutter\SKILL.md`

Shared collaboration and learning behavior lives in:

- `D:\Github\dev_guides\skills\shared-understanding\SKILL.md`

Shared documentation-backed grilling and planning behavior lives in:

- `D:\Github\dev_guides\skills\grill-with-docs\SKILL.md`

Shared domain terminology lives in:

- `D:\Github\dev_guides\skills\ubiquitous-language\SKILL.md`
- `D:\Github\dev_guides\UBIQUITOUS_LANGUAGE.md`

If working inside the `scotch_software` monorepo, also use:

- `D:\Github\dev_guides\skills\scotch-flutter\SKILL.md`

Scotch-Docs may be used only as comparison or background context. The
operational instructions for Codex come from this `dev_guides` repository.

## Before Writing Code

1. Read the universal Flutter skill:
   `D:\Github\dev_guides\skills\dev-flutter\SKILL.md`
2. For shared planning, explanation, learning, or terminology work, read:
   `D:\Github\dev_guides\skills\shared-understanding\SKILL.md`
3. For grilling, stress-testing plans, or documentation-backed clarification, read:
   `D:\Github\dev_guides\skills\grill-with-docs\SKILL.md`
4. For domain terminology alignment or glossary updates, read:
   `D:\Github\dev_guides\skills\ubiquitous-language\SKILL.md`
5. If the project is in the Scotch monorepo named `scotch_software`, also read:
   `D:\Github\dev_guides\skills\scotch-flutter\SKILL.md`
6. Search existing code before creating any new class, widget, value object,
   service, route, constant, helper, DTO, provider, or test utility. Reuse or
   extend existing patterns unless a new component is clearly needed.
7. Open only the relevant reference document for the task at hand
   (`architecture.md`, `riverpod_patterns.md`, `drift_patterns.md`,
   `freezed_patterns.md`, `testing_standards.md`, and so on).
8. Use templates from `templates/` when scaffolding new packages or features.

## Flutter/Dart Standards

All Flutter/Dart code must follow the `dev-flutter` standards:

- MVVM + DDD with strict layer separation: data, domain, providers,
  presentation
- Riverpod codegen patterns only
- Freezed for immutable models and unions
- Drift modular code generation
- Dart 3 pattern matching with `switch` expressions
- Strongly typed DTOs using Freezed/json serialization
- Scan-before-create discipline for reusable objects, widgets, constants, and
  helpers

## Key Architecture Rules

1. Dependencies point inward toward the Domain layer.
2. Domain is pure Dart with no Flutter imports and no data, provider, or
   presentation imports.
3. Domain holds business entities, value objects, failures, state classes, and
   interface contracts.
4. Repositories return domain types, not DTOs.
5. ViewModels orchestrate UI state and call domain contracts, not
   raw services or HTTP clients.
6. Use `@riverpod` codegen instead of legacy Riverpod patterns.
7. Use `@freezed` with `abstract class` for single-constructor models and
   `sealed class` for unions.
8. Use Dart 3 `switch` expressions instead of Freezed `when()` or `map()`.
9. Use Drift modular codegen with `.drift.dart`.
10. Check `state.isLoading` before `when()` in retry-sensitive UIs.
11. Disable Riverpod auto-retry when the UI provides manual retry.
12. Use snake_case for files and lowerCamelCase for constants.
13. Keep business logic out of widgets and external access out of ViewModels.

## Type Safety Rules

- Do not use `dynamic` for known shapes.
- Do not pass known API contracts around as inline `Map<String, dynamic>` from
  ViewModels or services. Define strongly typed request/response DTOs or payload
  models with `toJson`/`fromJson`, and keep them in the data
  layer.
- `Map<String, dynamic>` is acceptable only at serialization boundaries, such as
  generated `fromJson`/`toJson`, JSON converters, or tightly scoped decoding
  adapters.
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

## How To Use This Repo With Codex

- When starting a new Flutter project, tell Codex to use the `dev-flutter`
  skill and this repository as the project guide.
- For planning, teaching, or shared understanding, tell Codex to use the
  `shared-understanding` skill.
- For grilling, stress-testing a plan, or documenting terms and decisions as
  they crystallize, read `D:\Github\dev_guides\skills\grill-with-docs\SKILL.md`
  directly. (grill-with-docs is not installed as a live skill — read the file.)
- For domain terminology, tell Codex to use the `ubiquitous-language` skill and
  update `D:\Github\dev_guides\UBIQUITOUS_LANGUAGE.md`.
- For architecture or implementation work, have Codex read `SKILL.md` first,
  then the relevant reference file.
- For monorepo-specific work, add `scotch-flutter` on top of `dev-flutter`.
- For scaffolding, copy from `templates/new_package/` or other templates as a
  starting point.

## Suggested Prompt Pattern

Use prompts like:

`Use D:\Github\dev_guides\CODEX.md and the dev-flutter skill as the guide for this Flutter project.`

Or:

`Follow D:\Github\dev_guides\skills\dev-flutter\SKILL.md for architecture and coding standards while making this change.`
