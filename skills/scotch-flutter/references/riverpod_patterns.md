# Riverpod Patterns — Scotch Software Standards

## Provider Decision Guide

```
Need a read-only computed value?        → Functional @riverpod
Need mutable state with methods?        → Class-based @riverpod (Notifier)
Need async data fetching?               → Class-based @riverpod (AsyncNotifier)
Need a stream of data?                  → Functional @riverpod returning Stream
Need state to survive navigation?       → @Riverpod(keepAlive: true)
Need to pass parameters?                → Family providers (auto with codegen)
```

## Modern Riverpod (v2+ with codegen) — The ONLY Patterns We Use

### Functional Provider (read-only)

```dart
@riverpod
String greeting(Ref ref) {
  final name = ref.watch(userNameProvider);
  return 'Hello, $name!';
}

// Auto-generates: greetingProvider
```

### AsyncNotifier (ViewModel pattern — most common)

```dart
@riverpod
class TransactionListController extends _$TransactionListController {
  @override
  FutureOr<List<PaymentTransaction>> build() async {
    final repo = ref.watch(paymentRepositoryProvider);
    return repo.getAllTransactions();
  }

  Future<void> refresh() async {
    state = const AsyncValue.loading();
    state = await AsyncValue.guard(() async {
      final repo = ref.read(paymentRepositoryProvider);
      return repo.getAllTransactions();
    });
  }

  Future<void> deleteTransaction(String id) async {
    state = await AsyncValue.guard(() async {
      final repo = ref.read(paymentRepositoryProvider);
      await repo.delete(id);
      return repo.getAllTransactions();
    });
  }
}
```

### Stream Provider (reactive database watching)

```dart
@riverpod
Stream<List<TransactionLog>> transactionLogs(Ref ref) {
  final dao = ref.watch(transactionLogsDaoProvider);
  return dao.watchAll();
}
```

### Family Provider (parameterized)

```dart
@riverpod
Future<PaymentTransaction?> transactionById(
  Ref ref,
  String transactionId,
) async {
  final repo = ref.watch(paymentRepositoryProvider);
  return repo.getById(transactionId);
}

// Usage: ref.watch(transactionByIdProvider('txn_123'))
```

### KeepAlive Provider (survives navigation)

```dart
@Riverpod(keepAlive: true)
class AppSettings extends _$AppSettings {
  @override
  AppSettingsState build() {
    return const AppSettingsState.defaults();
  }

  void updateTheme(ThemeMode mode) {
    state = state.copyWith(themeMode: mode);
  }
}
```

## Consumption Rules

### In build() methods — ALWAYS ref.watch()

```dart
@override
Widget build(BuildContext context, WidgetRef ref) {
  // CORRECT — reactive, rebuilds on change
  final state = ref.watch(paymentControllerProvider);

  // WRONG — reads once, no reactivity
  // final state = ref.read(paymentControllerProvider);
}
```

### In callbacks — ALWAYS ref.read()

```dart
ElevatedButton(
  onPressed: () {
    // CORRECT — fire-and-forget, no subscription
    ref.read(paymentControllerProvider.notifier).submit();
  },
  child: const Text('Pay'),
)
```

### For side effects — ref.listen()

```dart
ref.listen(paymentControllerProvider, (previous, next) {
  next.whenOrNull(
    error: (error, _) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(error.toString())),
      );
    },
  );
});
```

### To reduce rebuilds — ref.select()

```dart
// Only rebuilds when the status changes, not when other fields change
final status = ref.watch(
  paymentControllerProvider.select(
    (state) => state.valueOrNull?.status,
  ),
);
```

## Legacy Patterns — NEVER USE

These are all deprecated. If you see them in existing code, flag for migration:

```dart
// NEVER — StateNotifier is legacy
class MyNotifier extends StateNotifier<MyState> { ... }

// NEVER — StateProvider is legacy
final myProvider = StateProvider<int>((ref) => 0);

// NEVER — ChangeNotifierProvider is legacy
final myProvider = ChangeNotifierProvider((ref) => MyChangeNotifier());

// NEVER — raw Provider without codegen
final myProvider = Provider<MyService>((ref) => MyService());
```

## Provider File Organization

One providers file per feature, colocated with the presentation layer:

```
features/
└── payment/
    └── presentation/
        └── providers/
            ├── payment_providers.dart      # DI wiring (services, repos)
            └── payment_controller.dart     # ViewModel (AsyncNotifier)
```

The providers file handles dependency injection wiring. The controller file
contains the ViewModel logic. Keep them separate for clarity.

## Error Handling Pattern

ALWAYS use `AsyncValue.guard()` for async operations in Notifiers:

```dart
Future<void> performAction() async {
  state = const AsyncValue.loading();
  state = await AsyncValue.guard(() async {
    // Your async logic here
    return await repo.doSomething();
  });
}
```

For operations that return `ErrorOr<T>`:

```dart
Future<void> processPayment() async {
  state = const AsyncValue.loading();
  state = await AsyncValue.guard(() async {
    final result = await ref.read(paymentRepositoryProvider).process();
    return result.fold(
      (failure) => throw failure,  // AsyncValue catches and wraps as error
      (data) => PaymentState.completed(transaction: data),
    );
  });
}
```

## Testing Riverpod Providers

```dart
void main() {
  group('PaymentController', () {
    late MockPaymentRepository mockRepo;
    late ProviderContainer container;

    setUp(() {
      mockRepo = MockPaymentRepository();
      container = ProviderContainer(
        overrides: [
          paymentRepositoryProvider.overrideWithValue(mockRepo),
        ],
      );
      addTearDown(container.dispose);
    });

    test('build returns initial state', () async {
      when(() => mockRepo.getCurrentTransaction())
          .thenAnswer((_) async => null);

      final controller = container.read(paymentControllerProvider.notifier);
      final state = await container.read(paymentControllerProvider.future);

      expect(state, const PaymentState.initial());
    });
  });
}
```
