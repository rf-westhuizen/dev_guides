# Naming Conventions — Scotch Software Standards

## File & Directory Names

ALL files and directories use `snake_case`:

```
payment_repository.dart       ✅
paymentRepository.dart        ❌
PaymentRepository.dart        ❌
payment-repository.dart       ❌
```

## Class Names — UpperCamelCase

```dart
class PaymentRepository {}          ✅
class PaymentRepositoryImpl {}      ✅
class TransactionLogsDao {}         ✅

// Acronyms: capitalize like words (except 2-letter: IO, ID)
class HttpService {}                ✅ (not HTTPService)
class JsonParser {}                 ✅ (not JSONParser)
class IoHelper {}                   ✅ (2-letter exception)
```

## Constants & Variables — lowerCamelCase

```dart
const maxRetryCount = 3;            ✅
const defaultTimeout = Duration(seconds: 120);  ✅

const MAX_RETRY_COUNT = 3;          ❌ SCREAMING_CAPS is wrong
const DEFAULT_TIMEOUT = 120;        ❌
```

## Private Members — Prefix with underscore

```dart
class PaymentService {
  final PaymentApiService _apiService;     ✅
  final TransactionLogsDao _logsDao;       ✅

  int _retryCount = 0;                     ✅
  bool _isInitialized = false;             ✅
}
```

## Riverpod Provider Names

Codegen auto-generates provider names from the annotated function/class.
Follow these patterns:

```dart
@riverpod
PaymentRepository paymentRepository(Ref ref) => ...;
// Generates: paymentRepositoryProvider

@riverpod
class PaymentController extends _$PaymentController { ... }
// Generates: paymentControllerProvider
```

## Package Names

Monorepo package naming follows these conventions:

```
{feature}_api          → Flutter plugin with native code (Pigeon)
{feature}_service      → Background Dart service (Shelf HTTP)
{feature}_db_package   → Drift database package
{feature}_plugin       → Integration plugin (no native code needed)
{name}_fetcher         → Utility package for data fetching
pilot_light            → Core orchestration package
scotch_launcher        → Main launcher application
```

## Feature Directory Names

Inside `lib/src/features/`, use the domain concept name:

```
features/
├── payment/           ✅ (domain concept)
├── settlement/        ✅
├── receipt/           ✅
├── device_info/       ✅
├── uart_bridge/       ✅

├── PaymentFeature/    ❌ (not UpperCamelCase)
├── handle-payments/   ❌ (not kebab-case)
```

## Test File Names

Mirror source file names exactly with `_test` suffix:

```
lib/src/features/payment/data/repositories/payment_repository_impl.dart
test/src/features/payment/data/repositories/payment_repository_impl_test.dart
```

## Barrel File Names

Match the directory name or the package name:

```
lib/src/features/payment/payment.dart           # Feature barrel
lib/src/features/payment/domain/domain.dart     # Layer barrel
lib/my_package.dart                             # Package barrel
```

## Enum Values — lowerCamelCase

```dart
enum TransactionStatus {
  pending,
  approved,
  declined,
  reversed,
  voided,
  settlementFailed,     ✅
  settlement_failed,    ❌
  SETTLEMENT_FAILED,    ❌
}
```

## Android/Java Naming (in _api packages)

```java
// Package: com.scotch.{feature}
package com.scotch.standardbank;

// Class names: UpperCamelCase
public class StandardBankActivity extends Activity { ... }
public class TrampolineActivity extends Activity { ... }

// Intent extras: SCREAMING_SNAKE (Android convention, NOT Dart)
public static final String EXTRA_AMOUNT = "AMOUNT";
public static final String EXTRA_TRANSACTION_TYPE = "TRANSACTION_TYPE";
```

## Documentation Comments

Use `///` triple-slash for all public APIs:

```dart
/// A repository that manages payment transactions.
///
/// Communicates with the POS device via [PaymentApiService]
/// and persists results to the local database via [TransactionLogsDao].
class PaymentRepositoryImpl implements PaymentRepository {
  /// Creates a [PaymentRepositoryImpl] with the required dependencies.
  PaymentRepositoryImpl({
    required PaymentApiService apiService,
    required TransactionLogsDao logsDao,
  });
}
```
