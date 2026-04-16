# Freezed Patterns — Flutter Development Standards

> **Freezed 3.0+ required.** All examples use Freezed 3.x syntax.
> Key migration rules from 2.x:
> - Single-constructor classes: `class` → `abstract class`
> - Union types: `class` → `sealed class`
> - `when()`/`map()` methods are **removed** — use Dart 3 pattern matching
> - `_PrivateName` redirected constructors now require public names for
>   union variants (e.g., `= PaymentInitial` not `= _Initial`)

## When to Use Freezed

```
Domain entities with multiple fields   → @freezed abstract class
Value objects with validation           → @freezed abstract class + methods
UI state with multiple variants         → @freezed sealed class (union type)
DTOs with JSON serialization            → @freezed abstract class + fromJson
Simple config/settings objects          → @freezed abstract class
```

## Class Keyword Rule (CRITICAL — Freezed 3.0)

```
Single constructor (entity, VO, DTO)   → abstract class
Multiple constructors (union/state)    → sealed class
```

## Basic Immutable Model

```dart
@freezed
abstract class User with _$User {
  const factory User({
    required String id,
    required String name,
    required String email,
    @Default(UserRole.standard) UserRole role,
  }) = _User;

  // Add fromJson ONLY if this is a DTO (infrastructure layer)
  // Domain entities do NOT have fromJson
  factory User.fromJson(Map<String, dynamic> json) => _$UserFromJson(json);
}
```

## Union Types (Sealed Classes) for State

```dart
@freezed
sealed class PaymentState with _$PaymentState {
  const factory PaymentState.initial() = PaymentInitial;
  const factory PaymentState.processing({
    required String transactionId,
  }) = PaymentProcessing;
  const factory PaymentState.completed({
    required PaymentTransaction transaction,
  }) = PaymentCompleted;
  const factory PaymentState.failed({
    required Failure failure,
  }) = PaymentFailed;
}
```

### Consuming Unions — Dart 3 Pattern Matching (ONLY approach)

```dart
Widget buildStatus(PaymentState state) {
  return switch (state) {
    PaymentInitial() => const Text('Ready'),
    PaymentProcessing(:final transactionId) =>
      Text('Processing: $transactionId'),
    PaymentCompleted(:final transaction) =>
      Text('Paid: ${transaction.amount.display}'),
    PaymentFailed(:final failure) =>
      Text('Error: ${failure.message}'),
  };
}

// NEVER — when/map are REMOVED in Freezed 3.0
// state.when(initial: () => ..., processing: (id) => ...);
```

## Freezed 3.0 Mixed Mode (extends + non-constant defaults)

```dart
@freezed
sealed class Response<T> with _$Response<T> {
  Response._({DateTime? time}) : time = time ?? DateTime.now();

  factory Response.data(T value, {DateTime? time}) = ResponseData;
  factory Response.error(Object error) = ResponseError;

  @override
  final DateTime time;
}
```

## Value Objects with Validation

```dart
@freezed
abstract class EmailAddress with _$EmailAddress {
  const EmailAddress._();
  const factory EmailAddress({required String value}) = _EmailAddress;

  static EmailAddress? tryCreate(String input) {
    if (_emailRegex.hasMatch(input)) return EmailAddress(value: input);
    return null;
  }

  static final _emailRegex = RegExp(r'^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$');
}
```

## DTOs with JSON (Infrastructure Layer ONLY)

```dart
@freezed
abstract class PaymentTransactionDto with _$PaymentTransactionDto {
  const PaymentTransactionDto._();

  const factory PaymentTransactionDto({
    @JsonKey(name: 'transaction_id') required String transactionId,
    @JsonKey(name: 'amount_cents') required int amountCents,
    required String currency,
    required String status,
  }) = _PaymentTransactionDto;

  factory PaymentTransactionDto.fromJson(Map<String, dynamic> json) =>
      _$PaymentTransactionDtoFromJson(json);

  /// Map DTO → Domain Entity
  PaymentTransaction toEntity() {
    return PaymentTransaction(
      transactionId: transactionId,
      amount: Amount(valueInCents: amountCents, currency: currency),
      status: TransactionStatus.fromString(status),
      createdAt: DateTime.now(),
    );
  }
}
```

## ErrorOr Pattern

```dart
@freezed
sealed class ErrorOr<T> with _$ErrorOr<T> {
  const factory ErrorOr.value(T data) = ErrorOrValue<T>;
  const factory ErrorOr.error(Failure failure) = ErrorOrError<T>;
}

// Consumption with Dart 3
final result = await repo.processPayment();
return switch (result) {
  ErrorOrValue(:final data) => PaymentState.completed(transaction: data),
  ErrorOrError(:final failure) => throw failure,
};
```

## Common @JsonKey Annotations

```dart
@JsonKey(name: 'server_name')              // Different JSON field name
@JsonKey(defaultValue: 0)                  // Default if missing
@JsonKey(includeFromJson: false)           // Skip deserialization
@JsonKey(includeToJson: false)             // Skip serialization
@JsonKey(unknownEnumValue: Status.unknown) // Fallback for unknown enums
```

## Build Runner Command

```bash
dart run build_runner build --delete-conflicting-outputs
```
