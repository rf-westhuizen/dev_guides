# Naming Conventions - Flutter Development Standards

## File & Directory Names - snake_case

```text
basket_repository.dart
basket_view_model.dart
login_screen.dart
```

Wrong:

```text
basketRepository.dart
BasketRepository.dart
basket-repository.dart
```

## Class Names - UpperCamelCase

```dart
class BasketRepository {}
class BasketRepositoryImpl {}
class ItemsDao {}
class WindowsAuthService {}
```

## Constants & Variables - lowerCamelCase

```dart
const maxRetryCount = 3;
const defaultTimeout = Duration(seconds: 120);
```

## Riverpod Provider Names

```dart
@riverpod
BasketRepository basketRepository(Ref ref) => ...;
// Generates: basketRepositoryProvider

@riverpod
class BasketViewModel extends _$BasketViewModel { ... }
// Generates: basketViewModelProvider
```

## Feature Directory Names - domain concept, snake_case

```text
features/
  auth/
  basket/
  device_info/
```

Avoid:

```text
features/
  AuthFeature/
  handle-basket/
```

## Preferred Source Layout

```text
lib/
  core/
  features/
    basket/
      domain/
      data/
      providers/
      presentation/
```

## Test File Names - mirror source with `_test` suffix

```text
lib/features/basket/data/repositories/basket_repository_impl.dart
test/features/basket/data/repositories/basket_repository_impl_test.dart
```

## Enum Values - lowerCamelCase

```dart
enum BasketStatus {
  empty,
  readyForCheckout,
  checkedOut,
}
```

## Documentation Comments - `///` for public APIs

```dart
/// A repository that loads basket items from local storage.
class BasketRepositoryImpl implements BasketRepository {
  /// Creates a [BasketRepositoryImpl] with the required dependencies.
  BasketRepositoryImpl({
    required ItemsDao itemsDao,
  });
}
```
