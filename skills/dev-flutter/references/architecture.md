# Architecture Reference - MVVM + DDD + Riverpod

## Overview

This standard uses a feature-first Flutter structure:

- `lib/core/` for shared cross-feature infrastructure such as theme, network,
  and database bootstrapping
- `lib/features/<feature>/domain` for business rules and contracts
- `lib/features/<feature>/data` for concrete persistence and transport code
- `lib/features/<feature>/providers` for Riverpod wiring
- `lib/features/<feature>/presentation` for screen-facing UI and view models

The intent is still **MVVM + DDD**, but the preferred folder organization is
feature-first rather than top-level `application/`, `domain/`,
`infrastructure/`, and `presentation/`.

## Preferred Structure

```text
lib/
  main.dart
  core/
    database/
      local_db.dart
    network/
      api_client.dart
      api_exception.dart
    theme/
      app_theme.dart
  features/
    auth/
      domain/
        auth_service.dart
        auth_state.dart
      data/
        cashiers.dart
        daos/
        services/
      providers/
        auth_providers.dart
      presentation/
        auth_view_model.dart
        auth_gate.dart
        login_screen.dart
```

## Layer Roles

### Presentation

Purpose: render UI, capture user interaction, expose screen state.

Contains:
- screens/pages
- widgets
- feature-specific view models or notifiers that directly drive a screen

Rules:
- use `ref.watch()` in build methods
- use `ref.read()` inside callbacks
- use `ref.listen()` for side effects triggered by provider state changes, such as snackbars, dialogs, navigation, logging, analytics, or haptics
- do not place domain decisions or persistence code in widgets

### Domain

Purpose: pure business rules and contracts.

Contains:
- entities
- value objects
- repository or service interfaces
- domain failures

Rules:
- no Flutter imports
- no DTOs
- no database, HTTP, or device code

### Data

Purpose: concrete implementations and external I/O.

Contains:
- typed DTOs with `fromJson`/`toJson`
- repository implementations
- DAOs
- HTTP/device services
- mappers between DTOs and domain models

Rules:
- implementations depend on domain contracts, not the other way around
- keep API/storage details out of domain and presentation

### Providers

Purpose: Riverpod dependency wiring and feature-scoped composition.

Contains:
- repository providers
- DAO/service providers
- implementation selection flags or environment-specific swaps

Rules:
- colocate DI with the feature instead of using a global catch-all DI folder
- keep business logic out of provider factory functions

## Dependency Direction

```text
presentation -> domain <- data
      ^                  ^
      |                  |
      +---- providers ---+
```

Examples:
- `presentation/` may depend on `domain/` and `providers/`
- `providers/` may depend on `data/` and `domain/`
- `data/` may depend on `domain/`
- `domain/` depends on neither `presentation/` nor `data/`

## Placement Rules

- Widget or screen -> `presentation/`
- Screen-facing `Notifier` / `AsyncNotifier` / `StreamNotifier` -> `presentation/`
- Riverpod wiring or implementation swapping -> `providers/`
- Pure immutable business model -> `domain/`
- Abstract repository/service contract -> `domain/`
- Typed JSON/storage model -> `data/`
- DAO or service talking to the outside world -> `data/`
- Repository implementation -> `data/`

## Feature Checklist

1. Define the domain models and contracts.
2. Add DTOs, services, DAOs, mappers, and repository implementations in `data/`.
3. Wire dependencies in `providers/`.
4. Build the view model and UI in `presentation/`.
5. Mirror the feature layout in `test/features/<feature>/...`.
