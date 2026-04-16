# CODEX.md - Global Instructions for Codex

## Purpose

Use this repository as a shared standards and scaffolding guide when starting
or working on Flutter/Dart projects.

The source of truth for Flutter conventions lives in:

- `D:\Github\dev_guides\skills\dev-flutter\SKILL.md`

If working inside the `scotch_software` monorepo, also use:

- `D:\Github\dev_guides\skills\scotch-flutter\SKILL.md`

## Before Writing Code

1. Read the universal Flutter skill:
   `D:\Github\dev_guides\skills\dev-flutter\SKILL.md`
2. If the project is in the Scotch monorepo named scotch_software, also read:
   `D:\Github\dev_guides\skills\scotch-flutter\SKILL.md`
3. Open only the relevant reference document for the task at hand
   (`architecture.md`, `riverpod_patterns.md`, `drift_patterns.md`,
   `freezed_patterns.md`, `testing_standards.md`, and so on).
4. Use templates from `templates/` when scaffolding new packages or features.

## Flutter/Dart Standards

All Flutter/Dart code should follow the `dev-flutter` standards:

- MVVM + DDD with strict layer separation: data, domain, providers, presentation
- Riverpod codegen patterns only
- Freezed for immutable models and unions
- Drift modular code generation
- Dart 3 pattern matching with `switch` expressions
- Strongly typed DTOs using the Freezed package 

## Key Rules

1. Dependencies point inward toward the Domain layer.
2. Domain is pure Dart with no Flutter imports, holding the Iterface classes and Freezed state classes.
3. Use `@riverpod` codegen instead of legacy Riverpod patterns.
4. Use `@freezed` with `abstract class` for single models and `sealed class`
   for unions.
5. Use Dart 3 `switch` expressions instead of Freezed `when()` or `map()`.
6. Use Drift modular codegen with `.drift.dart`.
7. Check `state.isLoading` before `when()` in retry-sensitive UIs.
8. Disable Riverpod auto-retry when the UI provides manual retry.
9. Use snake_case for files and lowerCamelCase for constants.
10. Keep business logic out of widgets and external access out of ViewModels.
11. For HTTP/API contracts, do not build inline `Map<String, dynamic>` payloads in ViewModels or services when the shape is known. Define strongly typed request/response DTOs or payload models with `toJson`/`fromJson`, and keep them in the infrastructure/data layer. Use the dart Freezed package.

## How To Use This Repo With Codex

- When starting a new Flutter project, tell Codex to use the `dev-flutter`
  skill and this repository as the project guide.
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


