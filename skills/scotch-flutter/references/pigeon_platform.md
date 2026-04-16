# Pigeon Platform Channels — Scotch Software Standards

## Overview

The `_api` packages use **Pigeon** to generate type-safe platform channel
bindings between Flutter (Dart) and native Android (Java/Kotlin).

## Pigeon Configuration

```dart
// pigeons/payment_api.dart
import 'package:pigeon/pigeon.dart';

@ConfigurePigeon(PigeonOptions(
  dartOut: 'lib/src/generated/payment_api.g.dart',
  javaOut: 'android/src/main/java/com/scotch/payment/PaymentApi.java',
  javaOptions: JavaOptions(package: 'com.scotch.payment'),
))

class PaymentRequest {
  String? transactionType;
  String? amount;
  String? cashback;
}

class PaymentResponse {
  String? resultCode;
  String? resultDescription;
  String? receiptNumber;
  bool? isApproved;
}

@HostApi()
abstract class PaymentHostApi {
  @async
  PaymentResponse processPayment(PaymentRequest request);
}

@FlutterApi()
abstract class PaymentFlutterApi {
  void onPaymentResult(PaymentResponse response);
}
```

## Trampoline Activity Pattern

For POS device communication via Android Intents, use a transparent
trampoline activity that starts the POS app and waits for the result:

```java
// android/src/main/java/com/scotch/standardbank/TrampolineActivity.java

public class TrampolineActivity extends Activity {

    private static PaymentFlutterApi flutterApi;
    private static boolean resultSent = false;  // Prevent double-sending

    public static void setFlutterApi(PaymentFlutterApi api) {
        flutterApi = api;
    }

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        resultSent = false;

        Intent posIntent = getIntent().getParcelableExtra("pos_intent");
        if (posIntent != null) {
            try {
                startActivityForResult(posIntent, 1001);
            } catch (ActivityNotFoundException e) {
                sendFailureResult("POS app not found");
                finish();
            }
        }
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        if (requestCode == 1001 && !resultSent) {
            resultSent = true;
            if (resultCode == RESULT_OK && data != null) {
                PaymentResponse response = parseResponse(data);
                flutterApi.onPaymentResult(response, reply -> {});
            } else {
                sendFailureResult("Transaction cancelled or failed");
            }
            finish();
        }
    }
}
```

## AndroidManifest Requirements

```xml
<manifest>
    <!-- Query the POS app -->
    <queries>
        <package android:name="com.ar.smartpos" />
        <package android:name="com.ar.nedbankpos" />
    </queries>

    <application>
        <!-- Trampoline Activity — transparent, exported -->
        <activity
            android:name=".TrampolineActivity"
            android:theme="@style/TransparentTheme"
            android:exported="false"
            android:launchMode="singleTop" />

        <!-- Response Activity — receives POS results -->
        <activity
            android:name=".PosResponseActivity"
            android:exported="true"
            android:theme="@style/TransparentTheme">
            <intent-filter>
                <action android:name="com.scotch.PAYMENT_RESULT" />
                <category android:name="android.intent.category.DEFAULT" />
            </intent-filter>
        </activity>
    </application>
</manifest>
```

## Transparent Theme (No Black Screen Flash)

```xml
<!-- android/src/main/res/values/styles.xml -->
<resources>
    <style name="TransparentTheme" parent="android:Theme.Translucent.NoTitleBar">
        <item name="android:windowIsTranslucent">true</item>
        <item name="android:windowBackground">@android:color/transparent</item>
        <item name="android:windowNoTitle">true</item>
        <item name="android:backgroundDimEnabled">false</item>
    </style>
</resources>
```

## SYSTEM_ALERT_WINDOW Permission

Some POS devices (PAX A920Pro) require overlay permission:

```dart
// Check and request at runtime
Future<bool> ensureOverlayPermission() async {
  if (Platform.isAndroid) {
    if (!await FlutterOverlayWindow.isPermissionGranted()) {
      await FlutterOverlayWindow.requestPermission();
      return await FlutterOverlayWindow.isPermissionGranted();
    }
  }
  return true;
}
```

## Amount Formatting (CRITICAL)

Different POS apps expect different amount formats:

```dart
// Standard Bank (SBG) — raw integer in cents, NO decimals
// R 12.50 → "1250"
String formatForSbg(int amountInCents) => amountInCents.toString();

// Newlands/Nedbank — decimal string
// R 12.50 → "12.50"
String formatForNewlands(int amountInCents) =>
    (amountInCents / 100).toStringAsFixed(2);
```

## ADB Debugging Commands (PAX A920Pro)

```powershell
# View logs from the POS app
adb logcat | Select-String "smartpos|INTENT"

# Attach Java debugger
$pid = (adb shell pidof com.scotch.standardbank).Trim()
adb forward tcp:5005 jdwp:$pid
# Then connect IntelliJ Remote JVM Debug to localhost:5005

# Check if POS app is installed
adb shell pm list packages | Select-String "smartpos"
```
