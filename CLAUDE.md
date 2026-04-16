# CLAUDE.md — Global Instructions for Claude Code

## Architecture Standards

All Flutter/Dart code must follow the dev-flutter skill standards:
- **MVVM + DDD** with strict layer separation: data, domain, providers, presentation
- **Riverpod 3.x** for state management (codegen only, no legacy patterns)
- **Freezed 3.0** for immutable models and union types (abstract/sealed class)
- **Drift** with modular codegen for databases
- **Dart 3** pattern matching (`switch` expressions, never `when()`/`map()`)

## Before Writing Code

1. Read the universal skill:
   `D:\Github\dev_guides\skills\dev-flutter\SKILL.md`

2. If working in the scotch_software monorepo, also read:
   `D:\Github\dev_guides\skills\scotch-flutter\SKILL.md`

3. Consult the appropriate reference file in `references/` for deep-dive
   guidance on the specific topic (Riverpod, Drift, Freezed, etc.)

## Key Rules

1. Dependencies point INWARD toward the Domain layer
2. Domain layer is PURE DART — no Flutter imports
3. Use `@riverpod` codegen — never legacy StateNotifier/StateProvider
4. Use `@freezed` — `abstract class` for single, `sealed class` for unions
5. Use Dart 3 `switch` expressions — never Freezed `when()`/`map()`
6. Use Drift modular codegen (`.drift.dart`) — never `.g.dart`
7. Check `state.isLoading` before `when()` for retry scenarios
8. Disable auto-retry (`retry: (_, __) => null`) for manual retry UIs
9. All files use snake_case, all classes use UpperCamelCase
10. Constants use lowerCamelCase — never SCREAMING_CAPS
11. For HTTP/API contracts, do not build inline `Map<String, dynamic>` payloads in ViewModels or services when the shape is known. Define strongly typed request/response DTOs or payload models with `toJson`/`fromJson`, and keep them in the infrastructure/data layer. Use the dart Freezed package.
