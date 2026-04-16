# Riverpod Patterns - Flutter Development Standards

## Provider Decision Guide

```text
Need a read-only computed value?        -> Functional @riverpod
Need mutable screen state + methods?    -> Class-based @riverpod
Need async loading?                     -> AsyncNotifier
Need reactive database updates?         -> Stream or StreamNotifier
Need state to survive navigation?       -> @Riverpod(keepAlive: true)
Need implementation wiring?             -> Feature providers file
```

## Modern Riverpod (codegen only)

### Functional Provider

```dart
@riverpod
String greeting(Ref ref) {
  final name = ref.watch(userNameProvider);
  return 'Hello, $name!';
}
```

### AsyncNotifier for a screen ViewModel

```dart
@riverpod
class BasketViewModel extends _$BasketViewModel {
  @override
  FutureOr<BasketState> build() async {
    final repository = ref.read(basketRepositoryProvider);
    return repository.load();
  }

  Future<void> refresh() async {
    state = const AsyncValue.loading();
    state = await AsyncValue.guard(() async {
      return ref.read(basketRepositoryProvider).load();
    });
  }
}
```

### Stream-backed ViewModel

```dart
@riverpod
class TodoListViewModel extends _$TodoListViewModel {
  @override
  Future<List<Todo>> build() async {
    final repository = ref.read(todoRepositoryProvider);
    ref.listenManual(repository.watchAll(), (todos) {
      state = AsyncValue.data(todos);
    });
    return repository.getAll();
  }
}
```

### KeepAlive Provider for feature DI

```dart
@Riverpod(keepAlive: true)
BasketRepository basketRepository(Ref ref) {
  return BasketRepositoryImpl(
    itemsDao: ref.watch(itemsDaoProvider),
  );
}
```

## Consumption Rules

### In build() - `ref.watch()`

```dart
final state = ref.watch(basketViewModelProvider);
```

### In callbacks - `ref.read()`

```dart
IconButton(
  onPressed: () {
    ref.read(basketViewModelProvider.notifier).checkout();
  },
  icon: const Icon(Icons.shopping_bag),
)
```

### For side effects - `ref.listen()`

```dart
ref.listen(authViewModelProvider, (previous, next) {
  next.whenOrNull(
    error: (error, _) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(error.toString())),
      );
    },
  );
});
```

## Legacy Patterns - NEVER USE

```dart
class MyNotifier extends StateNotifier<MyState> { ... }
final myProvider = StateProvider<int>((ref) => 0);
final myProvider = ChangeNotifierProvider((ref) => MyChangeNotifier());
final myProvider = Provider<MyService>((ref) => MyService());
```

## Provider File Organization

Use a feature-level `providers/` folder as a sibling of `presentation/`:

```text
features/
  basket/
    data/
    domain/
    providers/
      basket_providers.dart
    presentation/
      basket_view_model.dart
      basket_screen.dart
```

Rules:
- DI wiring belongs in `providers/`
- screen-facing notifiers may live in `presentation/`
- avoid a global `core/di` folder for feature-specific providers

## Error Handling Pattern

Use `AsyncValue.guard()` for load/refresh flows when replacing screen state.
For action methods that should preserve the current UI, prefer returning a typed
failure and letting presentation decide how to render or announce it.

## Testing Riverpod Providers

```dart
void main() {
  late MockBasketRepository mockRepository;
  late ProviderContainer container;

  setUp(() {
    mockRepository = MockBasketRepository();
    container = ProviderContainer(
      overrides: [
        basketRepositoryProvider.overrideWithValue(mockRepository),
      ],
    );
    addTearDown(container.dispose);
  });

  test('build returns initial basket state', () async {
    when(() => mockRepository.load())
        .thenAnswer((_) async => const BasketState());

    final state = await container.read(basketViewModelProvider.future);
    expect(state, const BasketState());
  });
}
```
