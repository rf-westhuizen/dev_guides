# Drift Patterns — Scotch Software Standards

## Modular Code Generation (REQUIRED)

The Scotch Software monorepo uses **Drift modular codegen** exclusively.
This produces `.drift.dart` files instead of monolithic `.g.dart` files.

### build.yaml Configuration

```yaml
# build.yaml (in each package with Drift)
targets:
  $default:
    builders:
      drift_dev:
        enabled: false
      drift_dev:modular:
        enabled: true
        options:
          generate_manager: false
```

### Table Definition Pattern

```dart
// file: lib/src/database/tables/transaction_logs.dart

import 'package:drift/drift.dart';

class TransactionLogs extends Table {
  IntColumn get id => integer().autoIncrement()();
  TextColumn get transactionId => text().unique()();
  TextColumn get status => text()();
  IntColumn get amountInCents => integer()();
  TextColumn get currency => text().withDefault(const Constant('ZAR'))();
  TextColumn get responseCode => text().nullable()();
  TextColumn get responseDescription => text().nullable()();
  TextColumn get receiptNumber => text().nullable()();
  DateTimeColumn get createdAt => dateTime()
      .clientDefault(() => DateTime.now())();
  DateTimeColumn get updatedAt => dateTime().nullable()();
}
```

### The clientDefault Hooks Problem (CRITICAL)

When using modular codegen, `clientDefault` closures that reference
conditional exports (like `device_info_fetcher`) resolve to `_none.dart`
fallback files during `build_runner` analysis. This causes
`UnimplementedError` at runtime.

**Solution: Use the hooks pattern with uniquely named top-level functions.**

```dart
// file: lib/src/database/tables/scotch_errors.dart

/// Unique top-level function — avoids ambiguous export conflicts
String scotchErrorSoftwareDefault() =>
    SqlitePostgresqlConnectorHooks.softwareFunction();

class ScotchErrors extends Table {
  IntColumn get id => integer().autoIncrement()();
  TextColumn get software => text()
      .clientDefault(scotchErrorSoftwareDefault)();  // Function reference
  TextColumn get version => text()
      .clientDefault(scotchErrorVersionDefault)();
  TextColumn get errorMessage => text()();
  DateTimeColumn get createdAt => dateTime()
      .clientDefault(() => DateTime.now())();
}
```

### DAO Pattern

One DAO per table or logical group. Annotate with `@DriftAccessor`.

```dart
// file: lib/src/database/daos/transaction_logs_dao.dart

@DriftAccessor(tables: [TransactionLogs])
class TransactionLogsDao extends DatabaseAccessor<AppDatabase>
    with _$TransactionLogsDaoMixin {

  TransactionLogsDao(super.attachedDatabase);

  /// Watch all transactions, newest first
  Stream<List<TransactionLog>> watchAll() {
    return (select(transactionLogs)
          ..orderBy([(t) => OrderingTerm.desc(t.createdAt)]))
        .watch();
  }

  /// Get all transactions without duplicate void/reversal attempts
  Future<List<TransactionLog>> getAllTransactionsLean() {
    return (select(transactionLogs)
          ..orderBy([(t) => OrderingTerm.desc(t.createdAt)]))
        .get();
  }

  /// Insert a new transaction log
  Future<int> insertTransaction(TransactionLogsCompanion entry) {
    return into(transactionLogs).insert(entry);
  }

  /// Update transaction status
  Future<bool> updateStatus(String transactionId, String newStatus) {
    return (update(transactionLogs)
          ..where((t) => t.transactionId.equals(transactionId)))
        .write(TransactionLogsCompanion(
          status: Value(newStatus),
          updatedAt: Value(DateTime.now()),
        ))
        .then((rows) => rows > 0);
  }

  /// Upsert — insert or update on conflict
  Future<void> upsertTransaction(TransactionLogsCompanion entry) {
    return into(transactionLogs).insertOnConflictUpdate(entry);
  }
}
```

### Database Class

```dart
// file: lib/src/database/app_database.dart

@DriftDatabase(tables: [TransactionLogs, ScotchErrors], daos: [TransactionLogsDao])
class AppDatabase extends _$AppDatabase {
  AppDatabase(super.e);

  @override
  int get schemaVersion => 3;

  @override
  MigrationStrategy get migration => MigrationStrategy(
    onUpgrade: stepByStep(
      from1To2: (m, schema) async {
        await m.addColumn(schema.transactionLogs, schema.transactionLogs.updatedAt);
      },
      from2To3: (m, schema) async {
        await m.createTable(schema.scotchErrors);
      },
    ),
  );
}
```

### Type Converters

For enums, use built-in shortcuts:

```dart
class Transactions extends Table {
  // Stores enum index as integer
  IntColumn get status => intEnum<TransactionStatus>()();

  // Stores enum name as text (preferred for readability)
  TextColumn get type => textEnum<TransactionType>()();
}
```

For complex types, use `TypeConverter`:

```dart
class MetadataConverter extends TypeConverter<Map<String, dynamic>, String> {
  const MetadataConverter();

  @override
  Map<String, dynamic> fromSql(String fromDb) {
    return json.decode(fromDb) as Map<String, dynamic>;
  }

  @override
  String toSql(Map<String, dynamic> value) {
    return json.encode(value);
  }
}

// Usage in table
TextColumn get metadata => text().map(const MetadataConverter())();
```

### Migration Testing

Always export schemas and test migrations:

```bash
# Export schema for each version
dart run drift_dev schema dump lib/src/database/app_database.dart drift_schemas/

# Generate migration test helpers
dart run drift_dev schema generate drift_schemas/ test/generated_migrations/
```

```dart
// test/database/migration_test.dart
void main() {
  late SchemaVerifier verifier;

  setUpAll(() {
    verifier = SchemaVerifier(GeneratedHelper());
  });

  test('upgrade from v1 to v3', () async {
    final connection = await verifier.startAt(1);
    await verifier.migrateAndValidate(connection, 3);
  });
}
```

### Testing with In-Memory Database

```dart
AppDatabase createTestDatabase() {
  return AppDatabase(
    NativeDatabase.memory(
      // CRITICAL: prevents timer leak errors in Flutter widget tests
      setup: (db) => db.execute('PRAGMA journal_mode=WAL'),
    ),
  );
}
```

### Dual Backend: SQLite + PostgreSQL

The monorepo supports both backends. Use conditional imports:

```dart
// file: lib/src/database/connection/connection.dart
export 'connection_stub.dart'
    if (dart.library.io) 'connection_native.dart'
    if (dart.library.js_interop) 'connection_web.dart';
```
