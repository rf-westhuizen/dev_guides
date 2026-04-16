# Drift Patterns — Flutter Development Standards

## Modular Code Generation (REQUIRED)

Use **Drift modular codegen** exclusively. Produces `.drift.dart` files
instead of monolithic `.g.dart` files.

### build.yaml Configuration

```yaml
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
class TransactionLogs extends Table {
  IntColumn get id => integer().autoIncrement()();
  TextColumn get transactionId => text().unique()();
  TextColumn get status => text()();
  IntColumn get amountInCents => integer()();
  TextColumn get currency => text().withDefault(const Constant('ZAR'))();
  TextColumn get responseCode => text().nullable()();
  DateTimeColumn get createdAt => dateTime()
      .clientDefault(() => DateTime.now())();
  DateTimeColumn get updatedAt => dateTime().nullable()();
}
```

### DAO Pattern

One DAO per table or logical group. Annotate with `@DriftAccessor`.

```dart
@DriftAccessor(tables: [TransactionLogs])
class TransactionLogsDao extends DatabaseAccessor<AppDatabase>
    with _$TransactionLogsDaoMixin {

  TransactionLogsDao(super.attachedDatabase);

  Stream<List<TransactionLog>> watchAll() {
    return (select(transactionLogs)
          ..orderBy([(t) => OrderingTerm.desc(t.createdAt)]))
        .watch();
  }

  Future<int> insertTransaction(TransactionLogsCompanion entry) {
    return into(transactionLogs).insert(entry);
  }

  Future<bool> updateStatus(String transactionId, String newStatus) {
    return (update(transactionLogs)
          ..where((t) => t.transactionId.equals(transactionId)))
        .write(TransactionLogsCompanion(
          status: Value(newStatus),
          updatedAt: Value(DateTime.now()),
        ))
        .then((rows) => rows > 0);
  }

  Future<void> upsertTransaction(TransactionLogsCompanion entry) {
    return into(transactionLogs).insertOnConflictUpdate(entry);
  }
}
```

### Database Class

```dart
@DriftDatabase(tables: [TransactionLogs], daos: [TransactionLogsDao])
class AppDatabase extends _$AppDatabase {
  AppDatabase(super.e);

  @override
  int get schemaVersion => 3;

  @override
  MigrationStrategy get migration => MigrationStrategy(
    onUpgrade: stepByStep(
      from1To2: (m, schema) async {
        await m.addColumn(
          schema.transactionLogs,
          schema.transactionLogs.updatedAt,
        );
      },
    ),
  );
}
```

### Type Converters

For enums:
```dart
class Transactions extends Table {
  IntColumn get status => intEnum<TransactionStatus>()();
  TextColumn get type => textEnum<TransactionType>()();
}
```

For complex types:
```dart
class MetadataConverter extends TypeConverter<Map<String, dynamic>, String> {
  const MetadataConverter();

  @override
  Map<String, dynamic> fromSql(String fromDb) =>
      json.decode(fromDb) as Map<String, dynamic>;

  @override
  String toSql(Map<String, dynamic> value) => json.encode(value);
}

// Usage in table
TextColumn get metadata => text().map(const MetadataConverter())();
```

### Migration Testing

```bash
# Export schema for each version
dart run drift_dev schema dump lib/src/database/app_database.dart drift_schemas/

# Generate migration test helpers
dart run drift_dev schema generate drift_schemas/ test/generated_migrations/
```

```dart
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
      setup: (db) => db.execute('PRAGMA journal_mode=WAL'),
    ),
  );
}
```

### Conditional Backend: SQLite + PostgreSQL

Use conditional imports for dual backend support:

```dart
export 'connection_stub.dart'
    if (dart.library.io) 'connection_native.dart'
    if (dart.library.js_interop) 'connection_web.dart';
```
