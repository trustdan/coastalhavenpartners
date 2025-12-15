import 'dart:developer' as developer;

import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

/// Lightweight debug logging that works well in Android-on-Windows runs.
///
/// Enable in debug builds automatically, or in any build via:
/// `--dart-define=COASTAL_DEBUG=true`
class AppDebug {
  static const bool enabledByDefine = bool.fromEnvironment(
    'COASTAL_DEBUG',
    defaultValue: false,
  );

  static bool get enabled => kDebugMode || enabledByDefine;

  static void log(
    String tag,
    String message, {
    Object? error,
    StackTrace? stackTrace,
    Map<String, Object?>? data,
  }) {
    if (!enabled) return;

    final payload = <String, Object?>{
      if (data != null) ...data,
      if (error != null) 'error': error.toString(),
    };

    developer.log(
      message,
      name: 'coastalhaven/$tag',
      error: error,
      stackTrace: stackTrace,
    );

    // Also print a concise line for terminals that don't show developer logs.
    final extra = payload.isEmpty ? '' : ' | $payload';
    debugPrint('[${DateTime.now().toIso8601String()}][$tag] $message$extra');
  }
}

final class AppProviderObserver extends ProviderObserver {
  const AppProviderObserver();

  @override
  void didUpdateProvider(
    ProviderObserverContext context,
    Object? previousValue,
    Object? newValue,
  ) {
    if (!AppDebug.enabled) return;
    // Avoid very noisy logs for all providers; keep it readable.
    final provider = context.provider;
    final name = provider.name ?? provider.runtimeType.toString();
    if (name.contains('firmsDirectory') ||
        name.contains('jobListings') ||
        name.contains('savedFirms') ||
        name.contains('savedJobs')) {
      AppDebug.log(
        'riverpod',
        'provider update: $name',
        data: {'prev': previousValue?.toString(), 'next': newValue?.toString()},
      );
    }
  }
}
