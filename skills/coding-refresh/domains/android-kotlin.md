# android-kotlin

Native Android code and its build: Kotlin, coroutines, the Android Gradle
plugin, Gradle, the JDK, Activity APIs, manifests, Google Play policy, Android
security, Pigeon and Flutter's Android embedding.

## Targets

All paths are under `D:/Github/dev_guides/`.

- `skills/scotch-flutter/references/pigeon_platform.md` - payment-adjacent; see
  the edit rules in `skills/coding-refresh/SKILL.md`.
- `agents/platform.md` - its "Device SDKs" section is payment-adjacent.
- `skills/scotch-flutter/references/naming_conventions.md` - the "Android/Java
  Naming" section only.
- `skills/scotch-flutter/SKILL.md` - the Android, Pigeon and `_api` package parts.
- `skills/scotch-flutter/references/melos_tooling.md` - the APK build and
  install lines.
- `skills/scotch-flutter/references/external_sources.md` - the Pigeon and
  platform-channel links.

## Sources

- https://kotlinlang.org/docs/releases.html - Use for: current Kotlin stable version and release dates.
- https://kotlinlang.org/docs/coding-conventions.html - Use for: Kotlin naming and style rules.
- https://developer.android.com/kotlin/coroutines/coroutines-best-practices - Use for: Google's coroutine rules on Android.
- https://developer.android.com/topic/architecture/recommendations - Use for: Google's ranked Android architecture recommendations.
- https://developer.android.com/reference/android/app/Activity - Use for: whether a framework `Activity` method is deprecated (long page; read with offset).
- https://developer.android.com/training/basics/intents/result - Use for: the Activity Result API.
- https://developer.android.com/build/releases/gradle-plugin - Use for: the AGP compatibility table (Gradle, JDK, Build Tools, NDK).
- https://dl.google.com/dl/android/maven2/com/android/tools/build/gradle/maven-metadata.xml - Use for: the newest stable AGP version (skip previews).
- https://services.gradle.org/versions/current - Use for: the current Gradle version.
- https://developer.android.com/build/jdks - Use for: which JDK and Java language level each Android version supports.
- https://support.google.com/googleplay/android-developer/answer/11926878 - Use for: Google Play target API level rules (the binding text).
- https://developer.android.com/guide/practices/page-sizes - Use for: the 16 KB memory page requirement.
- https://developer.android.com/privacy-and-security/risks - Use for: exported components, intents and logging risks.
- https://mas.owasp.org/MASVS/ - Use for: the mobile security verification baseline.
- https://pub.dev/api/packages/pigeon - Use for: latest stable Pigeon version and its published date.
- https://pub.dev/packages/pigeon/changelog - Use for: generator and generated-API changes by Pigeon version.
- https://github.com/flutter/packages/blob/main/packages/pigeon/README.md - Use for: supported generators and annotations; check version-specific claims against the changelog.
- https://docs.flutter.dev/platform-integration/platform-channels - Use for: platform channel threading and type rules.
- https://docs.flutter.dev/release/breaking-changes - Use for: Flutter's Android build migrations (Gradle plugin, built-in Kotlin).
- https://storage.googleapis.com/flutter_infra_release/releases/releases_windows.json - Use for: the current Flutter stable tag, to read its Android template versions.
- https://github.com/flutter/flutter - Use for: Flutter's Android template and Gradle files at the stable tag, never `master`.
- https://learn.microsoft.com/powershell/module/microsoft.powershell.core/about/about_automatic_variables - Use for: checking the PowerShell commands in the ADB debugging section.

## Notes

- Some `scotch_software` Android apps are published on Google Play and some are
  not (user, 2026-11-14). A Play policy finding goes to the Watch list with
  "check which app this guide covers".
- Deprecations are per class and per overload. Framework `Activity`'s
  `startActivityForResult` is not deprecated; AndroidX `ComponentActivity`'s is.
  Production payment code in `scotch_software` still calls it.
- Compare Android build versions (AGP, Gradle, Kotlin Gradle plugin, compileSdk,
  targetSdk, minSdk, NDK) with Flutter stable's Android template, not with the
  newest AGP.
- A Pigeon API finding must name the Pigeon version it applies to, and be checked
  against the version `scotch_software` pins and the code it generated.
- The 16 KB page rule applies only to apps that contain native code.
