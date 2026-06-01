# Ubiquitous Language

Central glossary for shared domain terminology used across projects.

| Project | Term | Meaning | Code Expression | Layer | Notes |
|---|---|---|---|---|---|
| dev_guides | Ubiquitous Language | Shared vocabulary used by conversation, planning, and code so everyone speaks from the same domain model. | `UBIQUITOUS_LANGUAGE.md`, `ubiquitous-language` | Documentation | Seed term |
| dev_guides | Shared Understanding | Collaboration style for aligning goals, constraints, decisions, and learning before implementation. | `shared-understanding` | Skill | Seed term |
| dev_guides | Plan Mode | Planning-only workflow where the agent explores and asks questions before producing a decision-complete plan. | `<proposed_plan>` | Workflow | Seed term |
| dev_guides | Learning Tracker | Compact record of what was learned, what to review next, and what remains unclear. | `Learned`, `Review Next`, `Open Questions` | Skill | Seed term |
| dev_guides | DDD | Design approach that keeps business concepts central and separates domain rules from infrastructure details. | `domain/`, entities, value objects, contracts | Architecture | Core Flutter standard |
| dev_guides | MVVM | UI architecture where views render state and ViewModels coordinate user actions and state changes. | `presentation/*_view_model.dart` | Architecture | Core Flutter standard |
| dev_guides | Domain Layer | Pure Dart layer for business entities, value objects, failures, state, and contracts. | `features/*/domain/` | Domain | No Flutter imports |
| dev_guides | Data Layer | Infrastructure layer for APIs, databases, DTOs, DAOs, services, and repository implementations. | `features/*/data/` | Data | Maps external details to domain types |
| dev_guides | Presentation Layer | UI layer for widgets, screens, and screen-facing ViewModels. | `features/*/presentation/` | Presentation | Business logic stays out of widgets |
| dev_guides | Providers Layer | Riverpod dependency wiring between data implementations and presentation ViewModels. | `features/*/providers/` | Providers | Feature-scoped DI |
| dev_guides | ViewModel | Presentation coordinator that exposes UI state and calls domain/application contracts. | `BasketViewModel`, `*_view_model.dart` | Presentation | Should not call raw services directly |
| dev_guides | Entity | Domain object with business meaning and identity or lifecycle. | Domain model classes | Domain | Needs project-specific examples |
| dev_guides | Value Object | Typed domain wrapper for meaningful primitives such as money, SKU, transaction ID, or receipt ID. | `Money`, `Sku` | Domain | Prevents primitive obsession |
| dev_guides | DTO | Data transfer shape for API, listener, or persistence boundaries. | `fromJson`, `toJson`, `dtos/` | Data | Must not leak into domain contracts |
| dev_guides | Repository Contract | Domain interface describing data access in business terms. | `abstract class *Repository` | Domain | Implementation lives in data |
| dev_guides | Repository Implementation | Data-layer class that fulfills a domain repository contract using APIs, databases, or services. | `*RepositoryImpl` | Data | Returns domain types |
| dev_guides | Riverpod Codegen | Riverpod provider pattern using annotations and generated provider code. | `@riverpod`, `@Riverpod` | Providers | Preferred over legacy providers |
| dev_guides | Freezed Union | Immutable sealed state or result model represented with Freezed variants. | `@freezed sealed class` | Domain/Presentation | Use Dart 3 `switch` |
| dev_guides | Drift DAO | Database access object used with Drift modular code generation. | `daos/`, `.drift.dart` | Data | Avoid `.g.dart` for Drift |
| dev_guides | Scan Before Create | Rule to search for existing widgets, classes, providers, constants, and helpers before adding new ones. | `rg`, existing feature folders | Workflow | Reduces duplication |
