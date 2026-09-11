---
name: scotch-flutter
description: >
  Enforces Scotch Software monorepo Flutter/Dart architecture standards using MVVM,
  DDD layers, Riverpod state management, Drift ORM, Freezed models, and Melos tooling.
  TRIGGER when: writing or generating any Dart/Flutter code, creating new packages or
  features, explaining architecture patterns, writing ViewModels or Notifiers, creating
  Drift tables or DAOs, defining Freezed models, setting up Riverpod providers, working
  with Pigeon platform channels, creating Shelf HTTP servers, or when user mentions
  Flutter, Dart, widgets, repositories, services, view models, state management,
  database, payment integration, or monorepo. Also trigger when user asks about file
  structure, naming conventions, barrel files, or coding standards. This skill applies
  to ALL code generation and explanation tasks involving the scotch_software monorepo.
---

# Scotch Software Flutter Architecture Skill

This skill enforces the Scotch Software monorepo coding standards, architecture patterns,
and tooling conventions. **Read this file first**, then consult reference documents in
`references/` for deep-dive guidance on specific topics.

## Start

- Begin active skill conversations with: `Lets scotch build this...`

## Reference Documents (read as needed)

| File | When to read |
|------|-------------|
| `references/architecture.md` | Creating new features, packages, or explaining layer rules |
| `references/riverpod_patterns.md` | Writing providers, ViewModels, or state management code |
| `references/drift_patterns.md` | Creating tables, DAOs, migrations, or database code |
| `references/freezed_patterns.md` | Defining models, DTOs, union types, or value objects |
| `references/naming_conventions.md` | Naming files, classes, packages, or any identifier |
| `references/melos_tooling.md` | Running codegen, CI scripts, managing packages, or resetting the environment/clean builds |
| `references/pigeon_platform.md` | Creating Flutter plugins with native Android/iOS code |
| `references/testing_standards.md` | Writing unit, widget, or integration tests |
| `references/external_sources.md` | Links to official docs for Flutter, Dart, Riverpod, Drift |
| `references/analysis_options.md` | Lint rules and static analysis configuration |

## Core Architecture: MVVM + DDD + Riverpod

The Scotch Software monorepo follows the **same MVVM + DDD layering as the universal
`dev-flutter` standard**, with Riverpod for dependency injection and state management.
There are **three layers plus provider wiring**, with strict dependency rules. (This
matches both the official Flutter architecture guide and how the bulk of the monorepo is
actually structured — ViewModels live in `presentation/`, and the outer layer is `data/`.)

### Layer Dependency Rule (CRITICAL)

```
Presentation ──▶ Domain ◀── Data
     │             ▲          ▲
     │             │          │
  Providers ───────┴──────────┘

[Widgets/Pages/ViewModels]   [Repo Impls/DAOs/Services/DTOs]
        [Entities/Value Objects/Contracts/Failures]
```

**Dependencies point INWARD toward Domain.** The Domain layer has ZERO external
dependencies — no Flutter imports, no package imports beyond Dart core and Freezed.

### Layer Responsibilities

**Presentation Layer** — UI **and** its ViewModels. Widgets/pages render state and
dispatch events; ViewModels (Riverpod `Notifier`/`AsyncNotifier`) orchestrate data from
repositories, transform it for the UI, and expose state. One ViewModel per screen or
complex widget. Widgets hold no business logic and never touch repositories/services
directly — they go through their ViewModel. Use `ref.watch()` for reactive state and
`ref.read()` only inside callbacks.

**Domain Layer** — Pure Dart. Entities (identity-based), Value Objects (attribute-based),
repository/service interfaces (abstract classes only), and failure types. This layer
defines the contracts; the data layer implements them. *Optional:* use-cases /
interactors for complex cross-repository or server-side orchestration (e.g. the UART /
card-activation server packages) — add them only when logic spans multiple repositories
or is reused, per the official Flutter guidance.

**Data Layer** — Concrete implementations that talk to the outside world: repository
implementations, Drift DAOs, HTTP services (Shelf servers), platform services (Pigeon
APIs), and DTOs with `fromJson`/`toJson`. Mappers convert DTOs to domain models. This is
the only layer that reaches a database, API, or device.

**Providers** — Riverpod dependency wiring. Connect `data/` implementations to
presentation-facing ViewModels via feature-scoped providers (kept in
`presentation/providers/`). Do not turn `core/` into a global DI dumping ground.

### Decision Tree: What Goes Where?

```
Is it a widget or page?                    → Presentation
Is it a ViewModel/Notifier for a screen?   → Presentation
Is it Riverpod provider / DI wiring?       → Providers
Is it pure business logic (no imports)?    → Domain
Does it talk to a database/API/device?     → Data

Is it a data class with fromJson?          → Data (DTO)
Is it a data class without fromJson?       → Domain (Entity/VO)
Is it an abstract repository/service?      → Domain (interface)
Is it a concrete repository/service impl?  → Data
Is it complex cross-repo orchestration?    → Domain use-case (optional)
```

## Scotch Software Monorepo Package Conventions

### Package Naming Pattern

The monorepo uses a consistent split between API packages (platform plugins) and
service packages (background HTTP servers):

```
packages/
├── standard_bank_api/      # Flutter plugin — Pigeon-generated, Java/Android
├── standard_bank_service/  # Dart Shelf HTTP server on port 6565
├── newlands_api/           # Flutter plugin — Nedbank/African Resonance
├── newlands_service/       # Dart Shelf HTTP server
├── hiopos_plugin/          # HioPOS integration plugin
├── log_db_package/         # Drift database — logging
├── audit_db_package/       # Drift database — audit trail
├── device_info_fetcher/    # Platform info via conditional exports
├── yaml_parser_fetcher/    # YAML config parsing
├── pilot_light/            # Core payment flow orchestration
└── scotch_launcher/        # Main launcher app
```

**`_api` packages** are Flutter plugins with:
- `android/` folder with Java/Kotlin native code
- Pigeon-generated platform channel bindings
- Trampoline Activity pattern for intent-based communication
- Transparent activity themes (no black screen flashes)

**`_service` packages** are Dart background services with:
- Shelf HTTP server (typically port 6565)
- `flutter_background_service` for lifecycle management
- Own `DeviceInfoCache` or hooks for device-specific data
- JSON request/response handling

### Package Dependency Hierarchy

```
scotch_launcher (app)
  └── depends on feature packages
       └── depends on _service packages
            └── depends on _api packages
                 └── depends on db packages + core packages

NEVER: db_package depends on _api or _service
NEVER: _api depends on _service
NEVER: domain layer depends on data
```

## File Structure Within a Package

Every package follows this structure. Read `references/architecture.md` for the full
template with example files.

```
my_package/
├── lib/
│   ├── my_package.dart              # Barrel file — public API only
│   └── src/
│       ├── features/
│       │   └── payment/
│       │       ├── data/
│       │       │   ├── repositories/
│       │       │   │   └── payment_repository_impl.dart
│       │       │   └── services/
│       │       │       └── payment_api_service.dart
│       │       ├── domain/
│       │       │   ├── entities/
│       │       │   │   └── payment_transaction.dart
│       │       │   ├── value_objects/
│       │       │   │   └── amount.dart
│       │       │   └── repositories/
│       │       │       └── payment_repository.dart  # Abstract only
│       │       └── presentation/
│       │           ├── providers/
│       │           │   └── payment_providers.dart
│       │           ├── pages/
│       │           │   └── payment_page.dart
│       │           └── widgets/
│       │               └── payment_card_widget.dart
│       └── core/
│           ├── errors/
│           │   └── failures.dart
│           └── utils/
│               └── extensions.dart
├── test/
│   └── src/
│       └── features/
│           └── payment/
│               ├── data/
│               │   └── repositories/
│               │       └── payment_repository_impl_test.dart
│               └── presentation/
│                   └── providers/
│                       └── payment_providers_test.dart
├── pubspec.yaml
├── analysis_options.yaml
└── README.md
```

## Code Generation Rules

### ALWAYS use these patterns:

**Riverpod providers** — Use `@riverpod` annotation with `riverpod_generator`:
```dart
@riverpod
class PaymentController extends _$PaymentController {
  @override
  FutureOr<PaymentState> build() => const PaymentState.initial();
}
```

**Freezed models** — Use `@freezed` with `abstract` (single) or `sealed` (union):
```dart
// Single-constructor → abstract class (Freezed 3.0)
@freezed
abstract class PaymentTransaction with _$PaymentTransaction {
  const factory PaymentTransaction({
    required String id,
    required Amount amount,
    required TransactionStatus status,
  }) = _PaymentTransaction;
}
```

**Drift tables** — Use modular codegen (`.drift.dart` not `.g.dart`):
```dart
class TransactionLogs extends Table {
  IntColumn get id => integer().autoIncrement()();
  TextColumn get transactionId => text()();
  TextColumn get status => text()();
  DateTimeColumn get createdAt => dateTime()
      .clientDefault(() => DateTime.now())();
}
```

### NEVER do these:

- NEVER use `StateNotifier`, `StateProvider`, or `ChangeNotifierProvider` (legacy)
- NEVER put business logic in widgets
- NEVER import Flutter in the domain layer
- NEVER access services directly from ViewModels (go through repositories)
- NEVER use `.g.dart` for Drift (use modular `.drift.dart`)
- NEVER hardcode device-specific values (use hooks pattern)
- NEVER use `SCREAMING_CAPS` for constants (use `lowerCamelCase`)
- NEVER use bare `class` with `@freezed` (use `abstract class` or `sealed class`)
- NEVER use `when()`/`map()` on Freezed unions (removed in 3.0 — use Dart 3 switch)

## Hooks Pattern for Cross-Package Decoupling

When a database package needs values from a platform-specific package (like device info),
use the hooks pattern to avoid circular dependencies:

```dart
// In db_package — define the hooks interface
abstract class SqlitePostgresqlConnectorHooks {
  static String Function() softwareFunction = () => 'unknown';
  static String Function() versionFunction = () => 'unknown';
  static Map<String, dynamic> Function() metaFunction = () => {};
}

// In the app — register concrete implementations at startup
SqlitePostgresqlConnectorHooks.softwareFunction = () => DeviceInfo.software;
SqlitePostgresqlConnectorHooks.versionFunction = () => DeviceInfo.version;
```

## Quick Reference: Common Scotch Patterns

| Pattern | Implementation |
|---------|---------------|
| Background payment service | Shelf HTTP server + `flutter_background_service` |
| Native POS communication | Pigeon API + Trampoline Activity + Android Intents |
| Database with dual backend | Drift with SQLite (mobile) + PostgreSQL (server) |
| Config parsing | `yaml_parser_fetcher` with conditional exports |
| Error handling | `ErrorOr<T>` pattern or Freezed union types |
| Receipt printing | `ReceiptPrinter` class with TTF Script commands |
| UART communication | `UartHttpBridgeService` with delimiter mode |
| Settlement timeout | 120s Dart timeout with synthetic FAILED response |

## Melos Commands (Quick Reference)

```bash
melos bootstrap              # Install deps + link local packages
melos run analyze            # Run dart analyze across all packages
melos run test:all           # Run all tests
melos run codegen            # Run build_runner in all packages that need it
melos run codegen_raw        # Cross-platform codegen via Dart helper script
```

For full Melos configuration and custom scripts, read `references/melos_tooling.md`.
