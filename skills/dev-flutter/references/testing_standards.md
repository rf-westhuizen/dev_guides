# Testing Standards - Flutter Development Standards

## Testing Philosophy

- Target high line coverage for feature code
- Test files mirror the feature structure
- Use Mocktail over Mockito
- Mock repositories, DAOs, or services rather than mocking notifiers
- Prefer Arrange / Act / Assert in every test

## Directory Structure

```text
test/
  features/
    payment/
      domain/
        payment_state_test.dart
      data/
        repositories/
          payment_repository_impl_test.dart
        services/
          payment_api_service_test.dart
      presentation/
        payment_view_model_test.dart
        pages/
          payment_page_test.dart
        widgets/
          payment_form_test.dart
      providers/
        payment_providers_test.dart
```

Only add `providers/` tests when the provider wiring itself has meaningful
behavior beyond what repository/view model tests already cover.

## Repository Test Example

```dart
void main() {
  late BasketRepositoryImpl repository;
  late MockItemsDao itemsDao;

  setUp(() {
    itemsDao = MockItemsDao();
    repository = BasketRepositoryImpl(itemsDao: itemsDao);
  });

  test('returns basket lines on success', () async {
    when(() => itemsDao.getAll()).thenAnswer((_) async => [fakeItemDto]);

    final result = await repository.load();

    expect(result.lines, isNotEmpty);
  });
}
```

## ViewModel Test Example

```dart
void main() {
  late MockBasketRepository repository;
  late ProviderContainer container;

  setUp(() {
    repository = MockBasketRepository();
    container = ProviderContainer(
      overrides: [
        basketRepositoryProvider.overrideWithValue(repository),
      ],
    );
    addTearDown(container.dispose);
  });

  test('addItem keeps previous lines until stream update arrives', () async {
    when(() => repository.load())
        .thenAnswer((_) async => BasketState(lines: [existingLine]));

    await container.read(basketViewModelProvider.future);
    await container.read(basketViewModelProvider.notifier).addItem('sku-1');

    expect(
      container.read(basketViewModelProvider).valueOrNull?.lines,
      [existingLine],
    );
  });
}
```

## Widget Test Example

```dart
testWidgets('BasketScreen renders items from repository state', (tester) async {
  await tester.pumpWidget(
    ProviderScope(
      overrides: [
        basketRepositoryProvider.overrideWithValue(mockRepository),
      ],
      child: const MaterialApp(home: BasketScreen()),
    ),
  );

  expect(find.text('Checkout'), findsOneWidget);
});
```

## Mocktail Setup

```dart
import 'package:mocktail/mocktail.dart';

class MockBasketRepository extends Mock implements BasketRepository {}
class MockItemsDao extends Mock implements ItemsDao {}
class MockAuthService extends Mock implements AuthService {}
```
