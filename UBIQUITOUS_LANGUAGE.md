# Ubiquitous Language

Central glossary for shared domain terminology used across projects.

| Project | Term | Meaning | Code Expression | Layer | Notes |
|---|---|---|---|---|---|
| dev_guides | Ubiquitous Language | Shared vocabulary used by conversation, planning, and code so everyone speaks from the same domain model. | `UBIQUITOUS_LANGUAGE.md`, `ubiquitous-language` | Documentation | Seed term |
| dev_guides | Shared Understanding | Collaboration style for aligning goals, constraints, decisions, and learning before implementation. | `shared-understanding` | Skill | Seed term |
| dev_guides | Plan Mode | Planning-only workflow where the agent explores and asks questions before producing a decision-complete plan. | `<proposed_plan>` | Workflow | Seed term |
| dev_guides | Learning Tracker | Compact record of what was learned, what to review next, and what remains unclear. | `Learned`, `Review Next`, `Open Questions` | Skill | Seed term |
| dev_guides | DDD | Design approach that keeps business concepts central and separates domain rules from infrastructure details. | `domain/`, entities, value objects, contracts | Architecture | Core Flutter standard |
| dev_guides | MVVM | UI architecture where views render state and ViewModels coordinate user actions and state changes. | `presentation/*_view_model.dart` | Architecture | Core Flutter standard |
| dev_guides | Domain Layer | Pure Dart layer for business entities, value objects, failures, state, and contracts. | `features/*/domain/` | Domain | No Flutter imports |
| dev_guides | Data Layer | Infrastructure layer for APIs, databases, DTOs, DAOs, services, and repository implementations. | `features/*/data/` | Data | Maps external details to domain types |
| dev_guides | Presentation Layer | UI layer for widgets, screens, and screen-facing ViewModels. | `features/*/presentation/` | Presentation | Business logic stays out of widgets |
| dev_guides | Providers Layer | Riverpod dependency wiring between data implementations and presentation ViewModels. | `features/*/providers/` | Providers | Feature-scoped DI |
| dev_guides | ViewModel | Presentation coordinator that exposes UI state and calls domain/application contracts. | `BasketViewModel`, `*_view_model.dart` | Presentation | Should not call raw services directly |
| dev_guides | Entity | Domain object with business meaning and identity or lifecycle. | Domain model classes | Domain | Needs project-specific examples |
| dev_guides | Value Object | Typed domain wrapper for meaningful primitives such as money, SKU, transaction ID, or receipt ID. | `Money`, `Sku` | Domain | Prevents primitive obsession |
| dev_guides | DTO | Data transfer shape for API, listener, or persistence boundaries. | `fromJson`, `toJson`, `dtos/` | Data | Must not leak into domain contracts |
| dev_guides | Repository Contract | Domain interface describing data access in business terms. | `abstract class *Repository` | Domain | Implementation lives in data |
| dev_guides | Repository Implementation | Data-layer class that fulfills a domain repository contract using APIs, databases, or services. | `*RepositoryImpl` | Data | Returns domain types |
| dev_guides | Riverpod Codegen | Riverpod provider pattern using annotations and generated provider code. | `@riverpod`, `@Riverpod` | Providers | Preferred over legacy providers |
| dev_guides | Freezed Union | Immutable sealed state or result model represented with Freezed variants. | `@freezed sealed class` | Domain/Presentation | Use Dart 3 `switch` |
| dev_guides | Drift DAO | Database access object used with Drift modular code generation. | `daos/`, `.drift.dart` | Data | Avoid `.g.dart` for Drift |
| dev_guides | Scan Before Create | Rule to search for existing widgets, classes, providers, constants, and helpers before adding new ones. | `rg`, existing feature folders | Workflow | Reduces duplication |
| listener_package | Listener | The shelf HTTP server that receives third-party payment/print requests on port 6565 and translates them into pay-API calls. | `class Listener`, `startServer`, `stopServer` | Data/Service | Singleton; binds `InternetAddress.anyIPv4` |
| listener_package | Listener Server / Port 6565 | The local loopback+LAN HTTP endpoint that is the integration boundary for POS/integrator apps. | `serve(handler, ip, 6565)`, `localhost:6565` | Data/Service | Default port; also a `Setting` key `port` |
| listener_package | Integrator Endpoints | Simplified public HTTP routes for third-party integrators (sale, refund, settlement, print). | `/integrator/sale`, `integrator_controller.dart` | Data/Service | Distinct from internal `/performSaleTransaction` |
| listener_package | Payment Lock | Single-payment-in-progress guard that rejects concurrent payment requests as "busy". | `ListenerState.paymentInProgress`, `tryStartPayment()` | Domain | Serialises access to the one native pay SDK |
| listener_package | Permissions Middleware | Shelf middleware enforcing API-key validation (and admin password) before routing a request. | `_createPermissionsMiddleware` | Data/Service | Bypasses `admin/info`, `deviceSerial` |
| listener_package | API Key | Per-serial credential required in the `apiKey` header for listener requests; cached and refreshable. | `ApiKey`, `IApiKeyRepository`, `getApiKey(serial)` | Domain | Refetched on server (re)start |
| listener_package | API Key Failure | Sealed set of API-key retrieval outcomes. | `ApiKeyFailure.notFound/expired/fetchFailed/cacheError/timeout` | Domain | Freezed union |
| scotch_launcher | UI Engine | The launcher's primary Flutter engine (from `FlutterActivity`, entrypoint `main()`) that renders screens. | `main()`, `AppRoot` | Presentation | See [[launcher-listener-two-engines]] |
| scotch_launcher | Listener (Second) Engine | A separate Flutter engine hosting the listener server, started by the native foreground service. | `startSecondEngine`, `"scotch_listener_engine"`, `startScotchServer` | Data/Service | Own isolate; no shared heap with UI |
| scotch_launcher | FlutterListener Service | Native Android foreground service that hosts the second engine and keeps port 6565 alive when backgrounded. | `FlutterListener.java`, `startForeground()` | Platform | Bound via `initNativeCore()` |
| scotch_launcher | Native Core Init | Pigeon call that starts+binds the native service before the second engine/port come up. | `initNativeCore()`, `FlutterFirstEngineApi` | Platform | Precedes `waitForPort` |
| scotch_launcher | Wait For Port | Blocking check that the listener has opened 6565 before the Pay API is initialised. | `ListenerService.waitForPort(6565)` | Data/Service | Ordering gate in splash flow |
| scotch_pay | ScotchPayApi | Per-engine Dart proxy (channel-backed) over the native payment SDK; a singleton per isolate. | `ScotchPayApi.instance`, `channel.invokeMethod` | Data/Service | Not shared across engines |
| scotch_pay | Pay Ready | Future that resolves when the native pay device/SDK is ready. | `ScotchPayApi.instance.ready`, `PayDevice.instance.ready` | Data/Service | Awaited before serving/payment |
| listener_package | ScotchPayService | listener_package wrapper that initialises and holds the `ScotchPayApi` for the server. | `ScotchPayService`, `init(payApi:)` | Data/Service | Registered in GetIt locator |
| standard_bank_service | HttpServerListener | Standalone shelf HTTP server (port 6565) for the SBG service app, mirroring the listener pattern. | `HttpServerListener`, `_handlePayment` | Data/Service | Also copied in `newlands_service` |
| standard_bank_service | Payment Service App | A headless Flutter app whose background service hosts the HTTP server and drives native payment intents. | `flutter_background_service`, `background_service.dart` | Architecture | Two engines: UI + background service |
| standard_bank_api | SBG | Standard Bank Group — the acquirer whose POS app this plugin integrates via Android intents. | `Sbg*`, `com.scotchsoftware.payments.sbg` | Data/Service | Semi-integration, not in-process SDK |
| standard_bank_api | Semi-Integration | Payment model where our app hands off to an external acquirer app via Intent and gets results back asynchronously. | `PaymentActivity`, `launchSbgPosApp` | Architecture | Contrast with in-process pay SDK |
| standard_bank_api | SBG POS App | External Standard Bank acquirer payment app launched to perform the card transaction. | `com.ar.smartpos`, `TARGET_PACKAGE` | Platform | `SbgPosConstants` also names `com.ar.paymentApp` (stale?) |
| standard_bank_api | BroadPOS | PAX's on-device payment engine (EMV kernel, PIN, host comms) that the SBG POS app depends on. | error: `BROADPOS NOT FOUND` (external) | Platform | Provisioned via PAXSTORE/TMS; not in our code |
| standard_bank_api | Payment Trampoline | Our thin Activity that forwards the payment intent to the SBG POS app and rebroadcasts the result. | `PaymentActivity`, `paymentLauncher` | Platform | Needed because service has no Activity |
| standard_bank_api | Pending Purchase Result | The in-flight Pigeon completer for a purchase; a non-null value means "busy". | `purchaseResult`, `"Another operation in progress"` | Platform | Wedges if result broadcast hits wrong engine |
| standard_bank_api | Result Broadcast | Global broadcast used to return an intent result to the (Activity-less) plugin. | `ACTION_PAYMENT_RESULT`, `ACTION_TRANSACTION_RESPONSE` | Platform | `RECEIVER_EXPORTED`; misroutes across engines |
| standard_bank_api | UTI | Unique Transaction Identifier returned by SBG; used for reversals and voids. | `ReturnParameterConstants.UTI`, `SbgBaseTransactionResponse.uti` | Domain | Carried into `TransactionInformationLean.guid` |
| standard_bank_api | SBG Transaction Result | Outcome enum for an SBG transaction. | `SbgTransactionResult.approved/declined/cancelled/commsError` | Domain | Mapped from external `RESULT` string |
| pos_link_v2_api | POSLink | PAX semi-integration SDK used (via AIDL) to drive BroadPOS on PAX terminals. | `com.pax.poslink`, `BroadPOSCommunicator`, `CommSetting.AIDL` | Platform | Alternative PAX path to `standard_bank_api` intents |
