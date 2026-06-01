# Architecture Reference — Scotch Software Monorepo

## Overview

This document defines the complete architecture for all packages in the
`scotch_software` monorepo. It follows a hybrid **MVVM + DDD** approach
using **Riverpod** for state management and dependency injection.

The architecture aligns with:
- Flutter's official architecture guide (MVVM with layered separation)
- DDD bounded contexts mapped to monorepo packages
- VGV engineering principles (strict layering, testability, consistency)

## The Layers in Detail (Presentation · Domain · Data, plus Provider wiring)

This is the same model as the universal `dev-flutter` standard and the official Flutter
architecture guide: ViewModels are part of the **Presentation** layer (they live in
`presentation/providers/`), and the outer implementation layer is **Data**. Use-cases are
an optional addition to the Domain layer for complex orchestration — not a separate layer.

### 1. Presentation Layer — Views

**Purpose:** Render UI and capture user interactions. Zero business logic.

**Contains:**
- Pages (full-screen widgets with Scaffold)
- Widgets (reusable UI components)
- No logic beyond conditional rendering based on state

**Rules:**
- Use `ref.watch()` in `build()` methods for reactive updates
- Use `ref.read()` ONLY inside callbacks (`onPressed`, `onTap`)
- Use `ref.listen()` for side effects (navigation, snackbars)
- Use `ref.select()` to reduce unnecessary rebuilds
- NEVER call repository or service methods directly
- NEVER hold local state that should be in a ViewModel

**Example — Payment Page:**

```dart
class PaymentPage extends ConsumerWidget {
  const PaymentPage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final state = ref.watch(paymentControllerProvider);

    // Listen for side effects (navigation on success)
    ref.listen(paymentControllerProvider, (previous, next) {
      next.whenOrNull(
        data: (data) {
          if (data.isCompleted) {
            Navigator.of(context).pushReplacementNamed('/receipt');
          }
        },
        error: (error, _) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text('Payment failed: $error')),
          );
        },
      );
    });

    return Scaffold(
      appBar: AppBar(title: const Text('Payment')),
      body: state.when(
        data: (payment) => PaymentFormWidget(
          payment: payment,
          onSubmit: () => ref.read(paymentControllerProvider.notifier).submit(),
        ),
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (error, _) => ErrorDisplayWidget(error: error),
      ),
    );
  }
}
```

### 2. Presentation Layer — ViewModels / Notifiers

**Purpose:** Orchestrate data flow between UI and domain/data layers.
Transform repository data into UI-ready state. Handle user actions. ViewModels are part
of the Presentation layer and live alongside their providers in `presentation/providers/`.

**Contains:**
- Riverpod `Notifier` / `AsyncNotifier` classes (the ViewModels)
- UseCases *(optional)* — only for complex multi-repository or server-side orchestration;
  place them in the Domain layer (see Domain, below)
- Providers file that wires everything together

**Rules:**
- One `AsyncNotifier` per screen or major feature
- Access data ONLY through repository interfaces (not implementations)
- Transform domain entities to UI state within the Notifier
- Use `AsyncValue.guard()` for async error handling
- NEVER import Flutter widgets or BuildContext
- NEVER call services directly — always go through repositories

**Example — Payment Controller (ViewModel):**

```dart
// file: lib/src/features/payment/presentation/providers/payment_controller.dart

@riverpod
class PaymentController extends _$PaymentController {
  @override
  FutureOr<PaymentState> build() async {
    // Initialize with current transaction state
    final repo = ref.watch(paymentRepositoryProvider);
    final currentTransaction = await repo.getCurrentTransaction();
    return currentTransaction != null
        ? PaymentState.ready(transaction: currentTransaction)
        : const PaymentState.initial();
  }

  Future<void> submit() async {
    state = const AsyncValue.loading();
    state = await AsyncValue.guard(() async {
      final repo = ref.read(paymentRepositoryProvider);
      final result = await repo.processPayment();
      return result.fold(
        (failure) => throw failure,
        (transaction) => PaymentState.completed(transaction: transaction),
      );
    });
  }

  Future<void> reverse() async {
    state = const AsyncValue.loading();
    state = await AsyncValue.guard(() async {
      final repo = ref.read(paymentRepositoryProvider);
      final result = await repo.reversePayment();
      return result.fold(
        (failure) => throw failure,
        (transaction) => PaymentState.reversed(transaction: transaction),
      );
    });
  }
}
```

### 3. Domain Layer

**Purpose:** Define business rules, entities, and contracts. This is the
stable core that rarely changes.

**Contains:**
- Entities (classes with identity — `id` field)
- Value Objects (immutable, defined by attributes, self-validating)
- Repository interfaces (abstract classes defining contracts)
- Failure types (typed error hierarchy)
- Use-cases / interactors *(optional)* — pure-Dart orchestration that spans multiple
  repositories or is reused across ViewModels (e.g. UART / card-activation server flows)

**Rules:**
- PURE DART ONLY — no Flutter imports, no package imports beyond `freezed`
- Entities use Freezed for immutability and equality
- Value Objects validate at construction time
- Repository interfaces define WHAT, not HOW
- Failures are Freezed union types, never raw exceptions

**Example — Domain Entity:**

```dart
// file: lib/src/features/payment/domain/entities/payment_transaction.dart

@freezed
abstract class PaymentTransaction with _$PaymentTransaction {
  const factory PaymentTransaction({
    required String transactionId,
    required Amount amount,
    required TransactionStatus status,
    required DateTime createdAt,
    String? receiptNumber,
    String? responseCode,
    String? responseDescription,
  }) = _PaymentTransaction;
}
```

**Example — Value Object:**

```dart
// file: lib/src/features/payment/domain/value_objects/amount.dart

@freezed
abstract class Amount with _$Amount {
  const Amount._();

  const factory Amount({
    required int valueInCents,
    @Default('ZAR') String currency,
  }) = _Amount;

  /// Display-ready formatted string: "R 12.50"
  String get display => 'R ${(valueInCents / 100).toStringAsFixed(2)}';

  /// Raw integer for POS device communication (no decimals)
  String get rawForDevice => valueInCents.toString();
}
```

**Example — Repository Interface:**

```dart
// file: lib/src/features/payment/domain/repositories/payment_repository.dart

abstract class PaymentRepository {
  Future<ErrorOr<PaymentTransaction>> processPayment();
  Future<ErrorOr<PaymentTransaction>> reversePayment();
  Future<ErrorOr<PaymentTransaction>> voidTransaction(String transactionId);
  Future<PaymentTransaction?> getCurrentTransaction();
  Stream<List<PaymentTransaction>> watchTransactions();
}
```

**Example — Failure Types:**

```dart
// file: lib/src/core/errors/failures.dart

@freezed
sealed class Failure with _$Failure {
  const factory Failure.server({required String message}) = ServerFailure;
  const factory Failure.connection({required String message}) = ConnectionFailure;
  const factory Failure.timeout({required String message}) = TimeoutFailure;
  const factory Failure.device({required String message}) = DeviceFailure;
  const factory Failure.unknown({required String message}) = UnknownFailure;
}
```

### 4. Data Layer

**Purpose:** Concrete implementations that talk to the outside world.
Databases, HTTP APIs, platform channels, file systems. (Some older payment/server
packages name this folder `infrastructure/`; new code uses `data/`.)

**Contains:**
- Repository implementations (concrete classes)
- DTOs (Data Transfer Objects with serialization)
- Services (API clients, Shelf servers, Pigeon bridges)
- Drift DAOs and table definitions
- Mappers (DTO ↔ Entity conversion)

**Rules:**
- Implement domain repository interfaces
- DTOs handle all serialization (fromJson/toJson) — entities do NOT
- Services are thin wrappers around external APIs
- One DAO per database table or logical group
- Use type converters for complex Drift column types

**Example — Repository Implementation:**

```dart
// file: lib/src/features/payment/data/repositories/payment_repository_impl.dart

class PaymentRepositoryImpl implements PaymentRepository {
  PaymentRepositoryImpl({
    required PaymentApiService apiService,
    required TransactionLogsDao logsDao,
  })  : _apiService = apiService,
        _logsDao = logsDao;

  final PaymentApiService _apiService;
  final TransactionLogsDao _logsDao;

  @override
  Future<ErrorOr<PaymentTransaction>> processPayment() async {
    try {
      final dto = await _apiService.sendSaleRequest();
      final entity = dto.toEntity();
      await _logsDao.insertTransaction(entity);
      return ErrorOr.value(entity);
    } on TimeoutException {
      return ErrorOr.error(
        const Failure.timeout(message: 'Payment device did not respond'),
      );
    } catch (e) {
      return ErrorOr.error(
        Failure.unknown(message: e.toString()),
      );
    }
  }
}
```

## Dependency Injection with Riverpod

All dependencies are wired through Riverpod providers. The provider hierarchy
mirrors the architecture layers:

```dart
// file: lib/src/features/payment/presentation/providers/payment_providers.dart

// Data — Services
@riverpod
PaymentApiService paymentApiService(Ref ref) {
  return PaymentApiService(baseUrl: 'http://localhost:6565');
}

// Data — DAOs (from database provider)
@riverpod
TransactionLogsDao transactionLogsDao(Ref ref) {
  final db = ref.watch(appDatabaseProvider);
  return TransactionLogsDao(db);
}

// Data — Repository Implementation
@riverpod
PaymentRepository paymentRepository(Ref ref) {
  return PaymentRepositoryImpl(
    apiService: ref.watch(paymentApiServiceProvider),
    logsDao: ref.watch(transactionLogsDaoProvider),
  );
}

// Presentation — ViewModel is already defined as @riverpod class above
```

## Creating a New Feature Checklist

When adding a new feature to any package:

1. **Domain first** — Define entities, value objects, repository interface (and a
   use-case only if the logic spans multiple repositories)
2. **Data** — Implement repository, create DTOs, write service/DAO, add mappers
3. **Presentation (ViewModel)** — Create AsyncNotifier (ViewModel), wire providers
4. **Presentation (UI)** — Build page and widgets consuming ViewModel state
5. **Tests** — Mirror the feature structure in `test/`
6. **Barrel file** — Export public API from package barrel file

This order ensures you design contracts before implementations, keeping
the architecture clean from the start.
