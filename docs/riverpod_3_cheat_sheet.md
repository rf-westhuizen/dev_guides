# Riverpod 3.x Cheat Sheet

Quick reference for using Riverpod 3.x with the `dev-flutter` standard:
codegen providers, MVVM + DDD boundaries, Freezed state, and Dart 3 switches.

## Core Rules

- Use `riverpod_annotation` and generated providers.
- Use class-based `@riverpod` notifiers for mutable screen state.
- Use functional `@riverpod` providers for computed values and dependency wiring.
- Use feature-level `providers/` folders for repositories, services, DAOs, and DI.
- Keep screen-facing ViewModels in `presentation/`.
- Use `ref.watch()` in build methods for reactive reads.
- Use `ref.read()` inside callbacks and for stable dependencies.
- Use `ref.listen()` for side effects such as snackbars, navigation, and dialogs.
- Do not use `StateNotifier`, `StateProvider`, or `ChangeNotifierProvider`.

## Required Packages

```yaml
dependencies:
  flutter_riverpod: ^3.0.0
  riverpod_annotation: ^3.0.0

dev_dependencies:
  build_runner: ^2.4.0
  riverpod_generator: ^3.0.0
  riverpod_lint: ^3.0.0
  custom_lint: ^0.7.0
```

Use the latest compatible versions for the app, but keep the major version on
Riverpod 3.x.

## Provider Generation

You do not manually create the provider variable. Riverpod generates it from the
annotated function or class name.

```dart
import 'package:riverpod_annotation/riverpod_annotation.dart';

part 'customer_view_model.g.dart';

@riverpod
class CustomerViewModel extends _$CustomerViewModel {
  @override
  FutureOr<CustomerState> build() async {
    return const CustomerState.loading();
  }
}
```

Generated provider:

```dart
customerViewModelProvider
```

Run codegen after creating or changing annotated providers:

```bash
dart run build_runner build --delete-conflicting-outputs
```

## Feature Layout

```text
features/
  customer/
    domain/
      customer.dart
      customer_repository.dart
      customer_state.dart
      failure.dart
    data/
      customer_repository_impl.dart
      customer_dto.dart
    providers/
      customer_providers.dart
    presentation/
      customer_view_model.dart
      customer_screen.dart
```

## Dependency Wiring Provider

Use feature `providers/` files to wire domain contracts to data
implementations.

```dart
import 'package:riverpod_annotation/riverpod_annotation.dart';

part 'customer_providers.g.dart';

@Riverpod(keepAlive: true)
CustomerRepository customerRepository(Ref ref) {
  return CustomerRepositoryImpl(
    // dao: ref.watch(customerDaoProvider),
    // apiClient: ref.watch(apiClientProvider),
  );
}
```

This generates:

```dart
customerRepositoryProvider
```

## Screen ViewModel Provider

The ViewModel reads dependencies and exposes state to the UI.

```dart
import 'dart:async';

import 'package:riverpod_annotation/riverpod_annotation.dart';

import '../domain/customer_state.dart';
import '../domain/error_or.dart';
import '../providers/customer_providers.dart';

part 'customer_view_model.g.dart';

@riverpod
class CustomerViewModel extends _$CustomerViewModel {
  @override
  FutureOr<CustomerState> build() async {
    return _loadCustomer();
  }

  Future<CustomerState> _loadCustomer() async {
    final repository = ref.read(customerRepositoryProvider);
    final result = await repository.getCustomer();

    return switch (result) {
      ErrorOrValue(:final data) => CustomerState.success(customer: data),
      ErrorOrError(:final failure) => CustomerState.failed(failure: failure),
    };
  }

  Future<void> retry() async {
    state = const AsyncValue.data(CustomerState.loading());

    state = await AsyncValue.guard(() async {
      return _loadCustomer();
    });
  }
}
```

## Freezed State

Use a Freezed `sealed class` for state variants.

```dart
import 'package:freezed_annotation/freezed_annotation.dart';

part 'customer_state.freezed.dart';

@freezed
sealed class CustomerState with _$CustomerState {
  const factory CustomerState.loading() = CustomerLoading;

  const factory CustomerState.success({
    required Customer customer,
  }) = CustomerSuccess;

  const factory CustomerState.failed({
    required Failure failure,
  }) = CustomerFailed;
}
```

## UI Consumption

Use `ref.watch()` in `build()`.

```dart
class CustomerScreen extends ConsumerWidget {
  const CustomerScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final asyncState = ref.watch(customerViewModelProvider);

    if (asyncState.isLoading) {
      return const LoadingView();
    }

    return switch (asyncState.value) {
      CustomerLoading() => const LoadingView(),
      CustomerSuccess(:final customer) => CustomerDetails(customer: customer),
      CustomerFailed(:final failure) => ErrorView(
          message: failure.message,
          onRetry: () {
            ref.read(customerViewModelProvider.notifier).retry();
          },
        ),
      null => const SizedBox.shrink(),
    };
  }
}
```

## Watch, Read, Listen

Use `watch` for reactive rendering:

```dart
final state = ref.watch(customerViewModelProvider);
```

Use `read` inside callbacks:

```dart
onPressed: () {
  ref.read(customerViewModelProvider.notifier).retry();
}
```

Use `read` for stable dependencies inside ViewModels:

```dart
final repository = ref.read(customerRepositoryProvider);
```

Use `listen` for side effects:

```dart
ref.listen(customerViewModelProvider, (previous, next) {
  if (next.hasError) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text(next.error.toString())),
    );
  }
});
```

## Functional Providers

Use functional providers for computed values and dependency wiring.

```dart
@riverpod
bool hasSelectedCustomer(Ref ref) {
  final state = ref.watch(customerViewModelProvider);

  return switch (state.value) {
    CustomerSuccess() => true,
    _ => false,
  };
}
```

## Async Loading Pattern

Use `AsyncValue.guard()` when replacing async screen state.

```dart
Future<void> refresh() async {
  state = const AsyncValue.loading();

  state = await AsyncValue.guard(() async {
    final repository = ref.read(customerRepositoryProvider);
    return repository.load();
  });
}
```

If the action should preserve the current UI, return a typed failure from the
action instead of replacing the whole screen state.

```dart
Future<Failure?> save() async {
  final repository = ref.read(customerRepositoryProvider);
  final result = await repository.save();

  return switch (result) {
    ErrorOrValue() => null,
    ErrorOrError(:final failure) => failure,
  };
}
```

## Manual Retry Gotcha

Riverpod 3.x has automatic retry. Disable it when the UI has its own retry
button.

```dart
@Riverpod(retry: noRetry)
Future<Customer> customer(Ref ref) async {
  return ref.read(customerRepositoryProvider).getCustomer();
}

Duration? noRetry(int retryCount, Object error) => null;
```

For generated class providers, prefer explicit ViewModel retry methods and avoid
throwing expected domain failures from `build()`.

## Loading During Refresh Gotcha

Check `isLoading` before rendering the `AsyncValue` body. During retry or
refresh, Riverpod may preserve previous data or errors while loading.

```dart
final state = ref.watch(customerViewModelProvider);

if (state.isLoading) {
  return const LoadingView();
}
```

## Provider Overrides In Tests

Override dependencies, then read the ViewModel provider.

```dart
void main() {
  late MockCustomerRepository repository;
  late ProviderContainer container;

  setUp(() {
    repository = MockCustomerRepository();

    container = ProviderContainer(
      overrides: [
        customerRepositoryProvider.overrideWithValue(repository),
      ],
    );

    addTearDown(container.dispose);
  });

  test('loads customer successfully', () async {
    when(() => repository.getCustomer()).thenAnswer(
      (_) async => ErrorOr.value(Customer(id: '1', name: 'Ada')),
    );

    final state = await container.read(customerViewModelProvider.future);

    expect(
      state,
      CustomerState.success(customer: Customer(id: '1', name: 'Ada')),
    );
  });
}
```

## Naming Rules

```text
CustomerViewModel      -> customerViewModelProvider
customerRepository()   -> customerRepositoryProvider
selectedCustomerId()   -> selectedCustomerIdProvider
```

Provider names are generated from the annotated function or class.

## Quick Decision Guide

```text
Screen state with methods?       -> @riverpod class ViewModel
Repository/service/DAO wiring?   -> functional @Riverpod in providers/
Derived read-only value?         -> functional @riverpod
Async one-shot load?             -> Future-returning @riverpod
Live DB/API stream?              -> Stream-returning @riverpod or StreamNotifier
Should survive navigation?       -> @Riverpod(keepAlive: true)
```

## Avoid

```dart
final countProvider = StateProvider<int>((ref) => 0);
final viewModelProvider = StateNotifierProvider<MyNotifier, MyState>((ref) {
  return MyNotifier();
});
final serviceProvider = Provider<MyService>((ref) => MyService());
```

Use generated Riverpod providers instead.

