# Freezed Patterns — Scotch Software Standards

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

  // Add fromJson ONLY if this is a DTO (data layer)
  // Domain entities do NOT have fromJson
  factory User.fromJson(Map<String, dynamic> json) => _$UserFromJson(json);
}
```

## Union Types (Sealed Classes) for State

Use Freezed unions for state that has distinct variants. Use Dart 3
pattern matching (`switch`) — `when`/`map` are removed in Freezed 3.0.

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
  const factory PaymentState.reversed({
    required PaymentTransaction transaction,
  }) = PaymentReversed;
}
```

### Consuming Union Types — Dart 3 Pattern Matching (ONLY approach)

```dart
// Dart 3 switch expression — the ONLY way in Freezed 3.0+
Widget buildPaymentStatus(PaymentState state) {
  return switch (state) {
    PaymentInitial() => const Text('Ready to pay'),
    PaymentProcessing(:final transactionId) =>
      Text('Processing: $transactionId'),
    PaymentCompleted(:final transaction) =>
      Text('Paid: ${transaction.amount.display}'),
    PaymentFailed(:final failure) =>
      Text('Error: ${failure.message}'),
    PaymentReversed(:final transaction) =>
      Text('Reversed: ${transaction.transactionId}'),
  };
}
```

```dart
// NEVER — when/map are REMOVED in Freezed 3.0. Do NOT use.
// state.when(initial: () => ..., processing: (id) => ...);
```

## Freezed 3.0 Mixed Mode (extends + non-constant defaults)

Freezed 3.0 supports a "mixed mode" where you define real constructors
and fields alongside the `@freezed` annotation. This enables `extends`
and non-constant default values:

```dart
@freezed
sealed class Response<T> with _$Response<T> {
  // Private constructor with non-constant default
  Response._({DateTime? time}) : time = time ?? DateTime.now();

  factory Response.data(T value, {DateTime? time}) = ResponseData;
  factory Response.error(Object error) = ResponseError;

  @override
  final DateTime time;
}
```

## Value Objects with Validation

Value objects validate at construction. Use `const` constructor with
an assertion or a factory that throws:

```dart
@freezed
abstract class EmailAddress with _$EmailAddress {
  const EmailAddress._();

  const factory EmailAddress({
    required String value,
  }) = _EmailAddress;

  /// Validates and creates. Returns null if invalid.
  static EmailAddress? tryCreate(String input) {
    if (_emailRegex.hasMatch(input)) {
      return EmailAddress(value: input);
    }
    return null;
  }

  static final _emailRegex = RegExp(r'^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$');
}
```

## DTOs with JSON Serialization (Data Layer ONLY)

DTOs live in the data layer and handle serialization.
They map to/from domain entities via extension methods or mapper classes.

```dart
// file: lib/src/features/payment/data/dtos/payment_transaction_dto.dart

@freezed
abstract class PaymentTransactionDto with _$PaymentTransactionDto {
  const PaymentTransactionDto._();

  const factory PaymentTransactionDto({
    @JsonKey(name: 'transaction_id') required String transactionId,
    @JsonKey(name: 'amount_cents') required int amountCents,
    required String currency,
    required String status,
    @JsonKey(name: 'response_code') String? responseCode,
    @JsonKey(name: 'response_desc') String? responseDescription,
    @JsonKey(name: 'receipt_no') String? receiptNumber,
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
      responseCode: responseCode,
      responseDescription: responseDescription,
      receiptNumber: receiptNumber,
    );
  }

  /// Map Domain Entity → DTO
  factory PaymentTransactionDto.fromEntity(PaymentTransaction entity) {
    return PaymentTransactionDto(
      transactionId: entity.transactionId,
      amountCents: entity.amount.valueInCents,
      currency: entity.amount.currency,
      status: entity.status.name,
      responseCode: entity.responseCode,
      responseDescription: entity.responseDescription,
      receiptNumber: entity.receiptNumber,
    );
  }
}
```

## ErrorOr Pattern with Freezed

```dart
@freezed
sealed class ErrorOr<T> with _$ErrorOr<T> {
  const factory ErrorOr.value(T data) = ErrorOrValue<T>;
  const factory ErrorOr.error(Failure failure) = ErrorOrError<T>;
}

// Usage with Dart 3 pattern matching
final result = await repo.processPayment();
return switch (result) {
  ErrorOrValue(:final data) => PaymentState.completed(transaction: data),
  ErrorOrError(:final failure) => throw failure,
};
```

## Common @JsonKey Annotations

```dart
@JsonKey(name: 'server_name')           // Different JSON field name
@JsonKey(defaultValue: 0)               // Default if missing in JSON
@JsonKey(includeFromJson: false)        // Skip during deserialization
@JsonKey(includeToJson: false)          // Skip during serialization
@JsonKey(fromJson: _dateFromString)     // Custom deserializer
@JsonKey(toJson: _dateToString)         // Custom serializer
@JsonKey(unknownEnumValue: Status.unknown) // Fallback for unknown enums
```

## File Naming Convention

```
payment_transaction.dart          → Entity (domain layer)
payment_transaction.freezed.dart  → Generated Freezed code
payment_transaction.g.dart        → Generated JSON serialization
payment_transaction_dto.dart      → DTO (data layer)
payment_state.dart                → Union type state
```

## Build Runner Command

```bash
# Single package
dart run build_runner build --delete-conflicting-outputs

# Via Melos (all packages)
melos run codegen
```

## Minimum Versions (as of 2025)

```yaml
# pubspec.yaml
dependencies:
  freezed_annotation: ^3.0.0
dev_dependencies:
  freezed: ^3.0.0
  build_runner: ^2.4.14
```
