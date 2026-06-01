# OOP And SOLID In Dart

Practical reference for using object-oriented programming and SOLID principles
in Dart and Flutter codebases that follow MVVM + DDD.

## Object-Oriented Programming

Object-oriented programming organizes behavior around objects. In Dart, that
usually means classes, interfaces, inheritance, composition, and polymorphism.

The goal is not to create a class for everything. The goal is to place behavior
where it naturally belongs and keep dependencies easy to change.

## Core OOP Concepts

### Class

A class defines the shape and behavior of an object.

```dart
class Customer {
  const Customer({
    required this.id,
    required this.name,
  });

  final String id;
  final String name;

  bool get hasDisplayName => name.trim().isNotEmpty;
}
```

### Object

An object is an instance of a class.

```dart
final customer = Customer(id: '1', name: 'Ada');
```

### Encapsulation

Encapsulation means protecting internal details and exposing a small, clear API.

```dart
class Cart {
  final List<CartItem> _items = [];

  List<CartItem> get items => List.unmodifiable(_items);

  void add(CartItem item) {
    if (item.quantity <= 0) {
      throw ArgumentError.value(item.quantity, 'quantity');
    }

    _items.add(item);
  }
}
```

External code can read `items`, but it cannot mutate `_items` directly.

### Abstraction

Abstraction means depending on what something does, not how it does it.

```dart
abstract interface class CustomerRepository {
  Future<Customer?> findById(String id);
}
```

The UI and ViewModel depend on `CustomerRepository`, not on HTTP, Drift,
SQLite, shared preferences, or any concrete storage detail.

### Inheritance

Inheritance lets one class reuse or specialize another class.

Use inheritance carefully. In Dart app code, composition is usually easier to
change than deep inheritance trees.

```dart
abstract class PaymentFailure {
  const PaymentFailure(this.message);

  final String message;
}

class NetworkPaymentFailure extends PaymentFailure {
  const NetworkPaymentFailure() : super('Network unavailable');
}
```

For domain states and failures, prefer Freezed sealed classes when you need a
closed set of variants.

### Polymorphism

Polymorphism means different implementations can be used through the same
interface.

```dart
class ApiCustomerRepository implements CustomerRepository {
  @override
  Future<Customer?> findById(String id) async {
    // Load from API.
    return null;
  }
}

class FakeCustomerRepository implements CustomerRepository {
  @override
  Future<Customer?> findById(String id) async {
    return Customer(id: id, name: 'Test Customer');
  }
}
```

Both classes can be used wherever `CustomerRepository` is required.

## Composition Over Inheritance

Prefer building classes from smaller collaborators instead of extending large
base classes.

```dart
class CheckoutService {
  const CheckoutService({
    required PaymentGateway paymentGateway,
    required ReceiptPrinter receiptPrinter,
  })  : _paymentGateway = paymentGateway,
        _receiptPrinter = receiptPrinter;

  final PaymentGateway _paymentGateway;
  final ReceiptPrinter _receiptPrinter;

  Future<void> checkout(Cart cart) async {
    final receipt = await _paymentGateway.charge(cart.total);
    await _receiptPrinter.print(receipt);
  }
}
```

This keeps payment and printing replaceable without forcing them into a shared
base class.

## SOLID Principles

SOLID is a set of design principles for keeping code easier to change.

```text
S - Single Responsibility Principle
O - Open/Closed Principle
L - Liskov Substitution Principle
I - Interface Segregation Principle
D - Dependency Inversion Principle
```

## S: Single Responsibility Principle

A class should have one reason to change.

Bad: one class handles validation, persistence, networking, and UI state.

```dart
class CustomerViewModel {
  Future<void> saveCustomer(String name) async {
    if (name.isEmpty) {
      // validation
    }

    // HTTP request
    // database write
    // snackbar message
  }
}
```

Better: split responsibilities.

```dart
class CustomerName {
  const CustomerName._(this.value);

  final String value;

  static CustomerName? tryCreate(String input) {
    final trimmed = input.trim();
    if (trimmed.isEmpty) return null;
    return CustomerName._(trimmed);
  }
}

abstract interface class CustomerRepository {
  Future<void> save(Customer customer);
}

@riverpod
class CustomerViewModel extends _$CustomerViewModel {
  @override
  CustomerState build() => const CustomerState.editing();

  Future<Failure?> save(String input) async {
    final name = CustomerName.tryCreate(input);
    if (name == null) {
      return const Failure.validation('Name is required');
    }

    final repository = ref.read(customerRepositoryProvider);
    await repository.save(Customer(name: name));
    return null;
  }
}
```

The value object validates, the repository persists, and the ViewModel
orchestrates the screen action.

## O: Open/Closed Principle

Code should be open for extension but closed for modification.

Bad: adding a payment type requires editing this method every time.

```dart
Future<void> pay(PaymentType type, Money amount) async {
  if (type == PaymentType.cash) {
    // cash logic
  } else if (type == PaymentType.card) {
    // card logic
  }
}
```

Better: add a new implementation without rewriting the caller.

```dart
abstract interface class PaymentMethod {
  Future<PaymentResult> pay(Money amount);
}

class CashPaymentMethod implements PaymentMethod {
  @override
  Future<PaymentResult> pay(Money amount) async {
    return PaymentResult.success();
  }
}

class CardPaymentMethod implements PaymentMethod {
  @override
  Future<PaymentResult> pay(Money amount) async {
    return PaymentResult.success();
  }
}

class PaymentService {
  const PaymentService(this._paymentMethod);

  final PaymentMethod _paymentMethod;

  Future<PaymentResult> pay(Money amount) {
    return _paymentMethod.pay(amount);
  }
}
```

To add mobile money, create `MobileMoneyPaymentMethod` and wire it in.

## L: Liskov Substitution Principle

Any implementation of an interface should be usable anywhere the interface is
expected without surprising behavior.

Bad: an implementation breaks the contract.

```dart
class ReadOnlyCustomerRepository implements CustomerRepository {
  @override
  Future<Customer?> findById(String id) async {
    return null;
  }

  @override
  Future<void> save(Customer customer) {
    throw UnsupportedError('Cannot save');
  }
}
```

If `CustomerRepository` promises saving, every implementation should save.

Better: split the contracts.

```dart
abstract interface class CustomerReader {
  Future<Customer?> findById(String id);
}

abstract interface class CustomerWriter {
  Future<void> save(Customer customer);
}

class ReadOnlyCustomerRepository implements CustomerReader {
  @override
  Future<Customer?> findById(String id) async {
    return null;
  }
}
```

Now read-only implementations do not pretend to support writes.

## I: Interface Segregation Principle

Prefer small, focused interfaces over large interfaces that force classes to
implement methods they do not need.

Bad:

```dart
abstract interface class CustomerDataSource {
  Future<Customer?> findById(String id);
  Future<void> save(Customer customer);
  Future<void> delete(String id);
  Stream<List<Customer>> watchAll();
  Future<void> syncRemote();
}
```

Better:

```dart
abstract interface class CustomerReader {
  Future<Customer?> findById(String id);
}

abstract interface class CustomerWriter {
  Future<void> save(Customer customer);
  Future<void> delete(String id);
}

abstract interface class CustomerWatcher {
  Stream<List<Customer>> watchAll();
}

abstract interface class CustomerSyncer {
  Future<void> syncRemote();
}
```

A ViewModel that only loads one customer depends only on `CustomerReader`.

## D: Dependency Inversion Principle

High-level policy should not depend on low-level details. Both should depend on
abstractions.

Bad: ViewModel creates the implementation directly.

```dart
class CustomerViewModel {
  final _repository = ApiCustomerRepository(HttpClient());
}
```

Better: ViewModel depends on a domain contract, and Riverpod wires the concrete
implementation.

```dart
abstract interface class CustomerRepository {
  Future<Customer?> findById(String id);
}

@Riverpod(keepAlive: true)
CustomerRepository customerRepository(Ref ref) {
  return ApiCustomerRepository(
    client: ref.watch(apiClientProvider),
  );
}

@riverpod
class CustomerViewModel extends _$CustomerViewModel {
  @override
  FutureOr<CustomerState> build() async {
    final repository = ref.read(customerRepositoryProvider);
    final customer = await repository.findById('1');

    if (customer == null) {
      return const CustomerState.failed(
        failure: Failure.notFound('Customer not found'),
      );
    }

    return CustomerState.success(customer: customer);
  }
}
```

This makes the ViewModel testable and keeps infrastructure details out of
presentation.

## SOLID In The Project Architecture

```text
Presentation
  Widgets render state.
  ViewModels orchestrate UI behavior.

Domain
  Entities, value objects, failures, state classes, and contracts.
  No Flutter imports.

Data
  DTOs, API clients, DAOs, repository implementations, and mappers.

Providers
  Riverpod dependency wiring for concrete implementations.
```

SOLID fits this architecture naturally:

```text
SRP -> each layer has one job
OCP -> add implementations without rewriting callers
LSP -> implementations honor their contracts
ISP -> small contracts for focused use cases
DIP -> ViewModels depend on domain contracts, not data classes
```

## Dart-Specific Tools

### `abstract interface class`

Use this for contracts.

```dart
abstract interface class InvoiceRepository {
  Future<Invoice?> findById(String id);
}
```

### `final class`

Use this when a class should not be extended outside its library.

```dart
final class InvoiceRepositoryImpl implements InvoiceRepository {
  const InvoiceRepositoryImpl(this._dao);

  final InvoiceDao _dao;
}
```

### Freezed `sealed class`

Use this for closed variant sets such as state, failures, and result types.

```dart
@freezed
sealed class SaveResult with _$SaveResult {
  const factory SaveResult.success() = SaveSuccess;
  const factory SaveResult.failed(Failure failure) = SaveFailed;
}
```

Consume with Dart 3 `switch`.

```dart
return switch (result) {
  SaveSuccess() => const CustomerState.saved(),
  SaveFailed(:final failure) => CustomerState.failed(failure: failure),
};
```

## Common Smells

- A ViewModel imports an API client, DAO, or DTO directly.
- A widget contains business rules.
- A repository returns DTOs instead of domain entities.
- A single service does validation, persistence, networking, and presentation.
- An interface has methods most implementations throw or ignore.
- A class creates its own dependencies instead of receiving them.
- Adding a new behavior requires editing many unrelated files.

## Quick Checklist

Before creating or changing a class, ask:

```text
Does this class have one clear reason to change?
Can I test it without real infrastructure?
Does it depend on an abstraction where the implementation may vary?
Is the interface smaller than the caller needs?
Would another implementation satisfy the same contract honestly?
Is this behavior in the right layer?
```

If the answer is unclear, start by simplifying the responsibility or splitting
the contract.

