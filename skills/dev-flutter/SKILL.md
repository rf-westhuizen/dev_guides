---
name: dev-flutter
description: >
  Universal Flutter/Dart development skill enforcing MVVM + DDD architecture,
  Riverpod 3.x state management, Freezed 3.0 immutable models, Drift ORM,
  and modern Dart 3 patterns. TRIGGER when: writing any Flutter/Dart code,
  creating features or screens, explaining architecture patterns, writing
  ViewModels or Notifiers, creating database tables or DAOs, defining models,
  setting up providers, debugging async state issues, or when user mentions
  Flutter, Dart, widgets, repositories, services, view models, state management,
  database, or architecture. This skill applies to ALL Flutter/Dart projects
  and prefers a feature-first structure with `core/` plus
  `features/<feature>/{domain,data,providers,presentation}`.
---

# Flutter/Dart Development Skill

Universal architecture standards and patterns for Flutter/Dart development.
**Read this file first**, then consult reference documents in `references/`
for deep-dive guidance.

## Reference Documents (read as needed)

| File | When to read |
|------|-------------|
| `references/architecture.md` | Creating features, packages, or explaining layer rules |
| `references/riverpod_patterns.md` | Writing providers, ViewModels, state management |
| `references/drift_patterns.md` | Database tables, DAOs, migrations |
| `references/freezed_patterns.md` | Models, DTOs, union types, Dart 3 switch |
| `references/naming_conventions.md` | File, class, variable naming rules |
| `references/testing_standards.md` | Unit tests, widget tests, Mocktail |
| `references/riverpod_gotchas.md` | Debugging provider issues, retry, refresh |
| `references/external_sources.md` | Links to official Flutter/Dart/Riverpod docs |
| `references/analysis_options.md` | Lint rules and static analysis |

## Core Architecture: MVVM + DDD + Riverpod

### Layer Dependency Rule (CRITICAL)

```
Presentation -> Domain <- Data
     ^                      ^
     |                      |
  Providers ---------------+

[Screens/Widgets/ViewModels]  [Repo Impls/DAOs/Services/DTOs]
          [Entities/VOs/Contracts/Failures]
```

**Dependencies point inward toward Domain.** Domain has ZERO Flutter imports
and should stay focused on business rules, contracts, and immutable models.

### Preferred Project Structure

```text
lib/
  main.dart
  core/
    database/
    network/
    theme/
  features/
    my_feature/
      domain/
      data/
        dtos/
        repositories/
        services/
        daos/
      providers/
      presentation/
        my_view_model.dart
        my_screen.dart
        widgets/
```

### Layer Responsibilities

**Presentation** - UI only. Widgets render state and dispatch user actions.
ViewModels/notifiers that directly drive screen state may live in this layer.
Use `ref.watch()` for reactive reads, `ref.read()` inside callbacks, and
`ref.listen()` for side effects.

**Domain** - Pure Dart. Entities, value objects, repository/service contracts,
domain failures, and business logic. No Flutter imports. No persistence or API
details. State Management and Interface Classes used by the services in the Data layer.

**Data** - Concrete implementations that talk to databases, HTTP clients,
device APIs, or local storage. Typed DTOs with `fromJson`/`toJson`, DAOs,
services, mappers, and repository implementations live here.

**Providers** - Riverpod dependency wiring and feature-scoped dependency
selection. Providers connect `data/` implementations to presentation-facing
view models without turning `core/` into a global dumping ground.

### Decision Tree: What Goes Where?

```text
Is it a widget or screen?                 -> Presentation
Is it a ViewModel/Notifier for a screen?  -> Presentation
Is it feature DI or provider wiring?      -> Providers
Is it pure business logic or a contract?  -> Domain
Does it talk to DB/API/device/storage?    -> Data

Is it a typed model with fromJson?        -> Data (DTO)
Is it a pure immutable business model?    -> Domain
Is it an abstract repository/service?     -> Domain
Is it a concrete repository/service impl? -> Data
```

## Code Generation Rules

### ALWAYS use these patterns:

**Riverpod providers** - Use `@riverpod` annotation with codegen:
```dart
@riverpod
class BasketViewModel extends _$BasketViewModel {
  @override
  FutureOr<BasketState> build() => const BasketState();
}
```

**Freezed models** - `abstract class` for single-constructor, `sealed class`
for unions:
```dart
@freezed
abstract class User with _$User {
  const factory User({required String id, required String name}) = _User;
}

@freezed
sealed class AuthState with _$AuthState {
  const factory AuthState.unauthenticated() = AuthUnauthenticated;
  const factory AuthState.authenticated({required User user}) = AuthAuthenticated;
}
```

**Dart 3 pattern matching** - ALWAYS use `switch` over removed `when()`/`map()`:
```dart
return switch (state) {
  AuthUnauthenticated() => const LoginScreen(),
  AuthAuthenticated(:final user) => HomeScreen(user: user),
};
```

**Drift tables** - Use modular codegen (`.drift.dart` not `.g.dart`):
```dart
class Users extends Table {
  IntColumn get id => integer().autoIncrement()();
  TextColumn get name => text()();
}
```

### NEVER do these:

- NEVER use `StateNotifier`, `StateProvider`, or `ChangeNotifierProvider`
- NEVER put business logic in widgets
- NEVER import Flutter in the domain layer
- NEVER access services directly from ViewModels; go through domain contracts
- NEVER build known contracts as inline `Map<String, dynamic>` payloads when a
  typed DTO/request/response model can represent the shape
- NEVER use `.g.dart` for Drift; use modular `.drift.dart`
- NEVER use `SCREAMING_CAPS` for constants; use `lowerCamelCase`
- NEVER use bare `class` with `@freezed`; use `abstract class` or `sealed class`
- NEVER use `when()`/`map()` on Freezed unions; use Dart 3 `switch`
- NEVER use `ref.watch()` inside callbacks; use `ref.read()`
- NEVER turn `core/` into feature-specific storage for repositories, screens, or DI

## Error Handling Pattern

Prefer `AsyncValue.guard()` for async refresh/load flows in notifiers:
```dart
Future<void> refresh() async {
  state = const AsyncValue.loading();
  state = await AsyncValue.guard(() async {
    return await repo.getItems();
  });
}
```

When a screen action should preserve current UI state, return a typed failure to
presentation and let the UI decide how to display it instead of encoding user
messages in the domain layer.

## Riverpod 3.x Critical Gotchas

1. **Auto-retry is ON by default** - Disable it with `retry: (_, __) => null`
   when a provider has explicit manual retry.
2. **`when()` keeps previous error during refresh** - Check `isLoading` first
   during retry/refresh flows.
3. **Use `ref.read()` for stable dependencies** - Especially for singleton-like
   services, repositories, and DAOs that should not trigger rebuild churn.

## Dependency Injection with Riverpod

Wire dependencies inside each feature's `providers/` folder:

```dart
@Riverpod(keepAlive: true)
ItemsDao itemsDao(Ref ref) {
  return ItemsDao(ref.watch(localDbProvider));
}

@Riverpod(keepAlive: true)
BasketRepository basketRepository(Ref ref) {
  return BasketRepositoryImpl(
    itemsDao: ref.watch(itemsDaoProvider),
  );
}
```

## New Feature Checklist

1. **Domain first** - Define entities, value objects, contracts, failures
2. **Data** - Implement DTOs, DAOs, services, repository implementations
3. **Providers** - Wire feature-scoped Riverpod dependencies
4. **Presentation** - Build ViewModel, screens, and widgets
5. **Tests** - Mirror the feature structure in `test/features/...`
6. **Run codegen** - `dart run build_runner build -d`
