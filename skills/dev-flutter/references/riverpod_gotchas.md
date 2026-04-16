# Riverpod 3.x Gotchas — Lessons Learned

Hard-won patterns from real project debugging. Apply these whenever
you create a FutureProvider that can fail and has a manual retry UI.

## 1. Automatic Retry (default: 10 retries with exponential backoff)

Riverpod 3.x automatically retries any provider that throws an exception.
The default is **10 retries** with exponential backoff (200ms → 6.4s).
A FutureProvider that fails will silently re-run up to 10 times before
the error state reaches the UI.

**Fix:** Disable or customize retry on providers with manual retry:

```dart
final myProvider = FutureProvider<MyData>(
  // Disable auto-retry — we use a manual Retry button
  retry: (_, __) => null,
  (ref) async {
    return myService.load();
  },
);

// Or allow 3 automatic retries with 2s delay:
final myProvider = FutureProvider<MyData>(
  retry: (retryCount, _) =>
      retryCount < 2 ? const Duration(seconds: 2) : null,
  (ref) async {
    return myService.load();
  },
);
```

Ref: https://riverpod.dev/docs/concepts2/retry

## 2. `when()` Keeps Previous Error During Refresh

When a FutureProvider is invalidated (e.g. Retry button calls
`ref.invalidate()`), Riverpod goes back to `AsyncLoading` but
`state.when()` keeps showing the **previous error** instead of the
loading spinner. This is Riverpod's "keep previous data during refresh"
behavior.

**Fix:** Check `isLoading` explicitly before calling `when()`:

```dart
@override
Widget build(BuildContext context, WidgetRef ref) {
  final state = ref.watch(myProvider);

  // Catch loading state during retry — when() won't switch from
  // the previous error to loading on its own.
  if (state.isLoading) {
    return const LoadingView();
  }

  return state.when(
    loading: () => const LoadingView(),
    error: (error, _) => ErrorView(
      message: error.toString(),
      onRetry: () => ref.invalidate(myProvider),
    ),
    data: (_) => const SuccessView(),
  );
}
```

Without this fix, the Retry button stays visible and tappable while
`load()` is already running in the background, leading to stacked
duplicate calls.

## 3. Use `ref.read()` for Stable Dependencies

If a provider depends on a service or singleton that never changes (e.g.
`SharedPreferences`, `ConfigurationService`), use `ref.read()` instead
of `ref.watch()`. Using `ref.watch()` creates a dependency link that can
cause unexpected provider rebuilds and re-evaluations when upstream
disposes or recreates.

```dart
// Good — stable dependency, only re-run on explicit invalidate
final myProvider = FutureProvider<MyData>((ref) async {
  final service = ref.read(myServiceProvider);
  return service.load();
});

// Bad — creates dependency chain that can trigger unwanted re-runs
final myProvider = FutureProvider<MyData>((ref) async {
  final service = ref.watch(myServiceProvider);
  return service.load();
});
```

## 4. TCP Socket Check Instead of HTTP Health Check

When a service has no `/health` endpoint, use a raw `Socket.connect()`
to verify reachability instead of an HTTP GET:

```dart
Future<bool> isServiceReachable(String ip, int port) async {
  try {
    final socket = await Socket.connect(ip, port,
        timeout: const Duration(seconds: 5));
    socket.destroy();
    return true;
  } catch (_) {
    return false;
  }
}
```

This just checks if something is listening on that IP:port — no endpoint
required.

## 5. Bootstrap/Configuration Gate Pattern

When your app requires a configuration step before showing the main UI
(e.g. fetching an API IP, loading site config), use a "gate" widget
that switches between loading → error → success states:

```dart
class AppBootstrapGate extends ConsumerWidget {
  const AppBootstrapGate({super.key, required this.child});
  final Widget child;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final configState = ref.watch(configurationProvider);

    // CRITICAL: Check isLoading before when() — see gotcha #2
    if (configState.isLoading) {
      return const Scaffold(
        body: Center(child: CircularProgressIndicator()),
      );
    }

    return configState.when(
      loading: () => const Scaffold(
        body: Center(child: CircularProgressIndicator()),
      ),
      error: (error, _) => Scaffold(
        body: Center(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text('Configuration failed: $error'),
              const SizedBox(height: 16),
              ElevatedButton(
                onPressed: () => ref.invalidate(configurationProvider),
                child: const Text('Retry'),
              ),
            ],
          ),
        ),
      ),
      data: (_) => child,
    );
  }
}
```

This pattern ensures the app can't proceed until configuration succeeds,
and provides a clean retry mechanism without stacking calls.
