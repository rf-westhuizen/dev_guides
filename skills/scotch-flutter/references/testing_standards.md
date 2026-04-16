# Testing Standards — Scotch Software Standards

## Testing Philosophy

Following VGV engineering principles adapted for Riverpod:
- Target **100% line coverage** as a real goal, not aspirational
- Test files **mirror source structure** exactly
- Use **Mocktail** (zero codegen) over Mockito
- **Mock repositories, not notifiers** — test real business logic
- Arrange-Act-Assert pattern in every test

## Directory Structure

```
test/
└── src/
    └── features/
        └── payment/
            ├── data/
            │   ├── repositories/
            │   │   └── payment_repository_impl_test.dart
            │   └── services/
            │       └── payment_api_service_test.dart
            ├── domain/
            │   └── value_objects/
            │       └── amount_test.dart
            └── presentation/
                └── providers/
                    └── payment_controller_test.dart
```

## Mocktail Setup

```dart
import 'package:mocktail/mocktail.dart';

// Create mocks — no codegen needed
class MockPaymentRepository extends Mock implements PaymentRepository {}
class MockTransactionLogsDao extends Mock implements TransactionLogsDao {}
class MockPaymentApiService extends Mock implements PaymentApiService {}
```

## Unit Test — Repository Implementation

```dart
void main() {
  late PaymentRepositoryImpl repository;
  late MockPaymentApiService mockApiService;
  late MockTransactionLogsDao mockLogsDao;

  setUp(() {
    mockApiService = MockPaymentApiService();
    mockLogsDao = MockTransactionLogsDao();
    repository = PaymentRepositoryImpl(
      apiService: mockApiService,
      logsDao: mockLogsDao,
    );
  });

  group('processPayment', () {
    test('returns transaction on success', () async {
      // Arrange
      final expectedDto = PaymentTransactionDto(
        transactionId: 'txn_001',
        amountCents: 1250,
        currency: 'ZAR',
        status: 'approved',
      );
      when(() => mockApiService.sendSaleRequest())
          .thenAnswer((_) async => expectedDto);
      when(() => mockLogsDao.insertTransaction(any()))
          .thenAnswer((_) async => 1);

      // Act
      final result = await repository.processPayment();

      // Assert
      expect(result, isA<ErrorOrValue<PaymentTransaction>>());
      final transaction = (result as ErrorOrValue).data;
      expect(transaction.transactionId, 'txn_001');
      expect(transaction.amount.valueInCents, 1250);
      verify(() => mockLogsDao.insertTransaction(any())).called(1);
    });

    test('returns timeout failure when device does not respond', () async {
      // Arrange
      when(() => mockApiService.sendSaleRequest())
          .thenThrow(TimeoutException('No response'));

      // Act
      final result = await repository.processPayment();

      // Assert
      expect(result, isA<ErrorOrError<PaymentTransaction>>());
      final failure = (result as ErrorOrError).failure;
      expect(failure, isA<TimeoutFailure>());
    });
  });
}
```

## Unit Test — Riverpod AsyncNotifier (ViewModel)

```dart
void main() {
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

  group('PaymentController', () {
    test('build returns initial state when no current transaction', () async {
      // Arrange
      when(() => mockRepo.getCurrentTransaction())
          .thenAnswer((_) async => null);

      // Act
      final state = await container.read(
        paymentControllerProvider.future,
      );

      // Assert
      expect(state, const PaymentState.initial());
    });

    test('submit transitions to completed on success', () async {
      // Arrange
      when(() => mockRepo.getCurrentTransaction())
          .thenAnswer((_) async => null);
      final transaction = PaymentTransaction(
        transactionId: 'txn_001',
        amount: const Amount(valueInCents: 1250),
        status: TransactionStatus.approved,
        createdAt: DateTime.now(),
      );
      when(() => mockRepo.processPayment())
          .thenAnswer((_) async => ErrorOr.value(transaction));

      // Wait for initialization
      await container.read(paymentControllerProvider.future);

      // Act
      await container.read(paymentControllerProvider.notifier).submit();

      // Assert
      final state = await container.read(paymentControllerProvider.future);
      expect(state, isA<PaymentCompleted>());
    });
  });
}
```

## Widget Test — ConsumerWidget

```dart
void main() {
  late MockPaymentRepository mockRepo;

  setUp(() {
    mockRepo = MockPaymentRepository();
  });

  testWidgets('PaymentPage shows loading then data', (tester) async {
    // Arrange
    when(() => mockRepo.getCurrentTransaction())
        .thenAnswer((_) async => null);

    // Act
    await tester.pumpWidget(
      ProviderScope(
        overrides: [
          paymentRepositoryProvider.overrideWithValue(mockRepo),
        ],
        child: const MaterialApp(home: PaymentPage()),
      ),
    );

    // Initially shows loading
    expect(find.byType(CircularProgressIndicator), findsOneWidget);

    // Pump until async settles
    await tester.pumpAndSettle();

    // Now shows the form
    expect(find.byType(PaymentFormWidget), findsOneWidget);
  });
}
```

## Drift Database Tests

```dart
void main() {
  late AppDatabase db;

  setUp(() {
    db = AppDatabase(NativeDatabase.memory());
  });

  tearDown(() async {
    await db.close();
  });

  group('TransactionLogsDao', () {
    test('insertTransaction creates a record', () async {
      final dao = TransactionLogsDao(db);

      await dao.insertTransaction(TransactionLogsCompanion.insert(
        transactionId: 'txn_001',
        status: 'approved',
        amountInCents: 1250,
      ));

      final all = await dao.getAllTransactionsLean();
      expect(all, hasLength(1));
      expect(all.first.transactionId, 'txn_001');
    });
  });
}
```

## Test Grouping Convention

```dart
void main() {
  // Group by method name for repositories/services
  group('PaymentRepositoryImpl', () {
    group('processPayment', () { ... });
    group('reversePayment', () { ... });
    group('voidTransaction', () { ... });
  });

  // Group by behavior for widgets
  group('PaymentPage', () {
    group('renders', () { ... });
    group('navigates', () { ... });
    group('calls', () { ... });
  });

  // Group by state for ViewModels
  group('PaymentController', () {
    group('build', () { ... });
    group('submit', () { ... });
    group('reverse', () { ... });
  });
}
```

## RegisterFallbackValue for Mocktail

When using `any()` with custom types, register fallback values:

```dart
setUpAll(() {
  registerFallbackValue(TransactionLogsCompanion.insert(
    transactionId: '',
    status: '',
    amountInCents: 0,
  ));
  registerFallbackValue(const PaymentRequest(type: '', amount: ''));
});
```
