import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'app.dart';
import 'core/utils/app_debug.dart';
import 'data/services/supabase_service.dart';
import 'data/services/local_storage_service.dart';
import 'data/services/notification_service.dart';
import 'data/services/deep_link_service.dart';
import 'data/services/analytics_service.dart';
import 'services/connectivity_service.dart';
import 'services/sync_service.dart';

void main() async {
  // Ensure Flutter bindings are initialized
  WidgetsFlutterBinding.ensureInitialized();

  // Set preferred orientations (portrait only for now)
  await SystemChrome.setPreferredOrientations([
    DeviceOrientation.portraitUp,
    DeviceOrientation.portraitDown,
  ]);

  // Set system UI overlay style for dark theme
  SystemChrome.setSystemUIOverlayStyle(
    const SystemUiOverlayStyle(
      statusBarColor: Colors.transparent,
      statusBarIconBrightness: Brightness.light,
      systemNavigationBarColor: Colors.transparent,
      systemNavigationBarIconBrightness: Brightness.light,
    ),
  );

  // Initialize local storage
  await LocalStorageService.instance.initialize();

  // Initialize Supabase (will skip if not configured)
  try {
    await SupabaseService.initialize();
  } catch (e) {
    debugPrint('Supabase initialization skipped: $e');
  }

  // Initialize push notifications (will skip if Firebase not configured)
  try {
    await NotificationService.instance.initialize();
  } catch (e) {
    debugPrint('Push notifications initialization skipped: $e');
  }

  // Initialize deep link handling
  try {
    await DeepLinkService.instance.initialize();
  } catch (e) {
    debugPrint('Deep link service initialization failed: $e');
  }

  // Initialize analytics (will skip if Firebase not configured)
  try {
    await AnalyticsService.instance.initialize();
  } catch (e) {
    debugPrint('Analytics initialization skipped: $e');
  }

  // Initialize connectivity monitoring for offline support
  try {
    await ConnectivityService.instance.initialize();
    SyncService.instance.initialize();
  } catch (e) {
    debugPrint('Offline support initialization failed: $e');
  }

  // Run the app with Riverpod
  runApp(
    ProviderScope(
      observers: AppDebug.enabled ? const [AppProviderObserver()] : const [],
      child: CoastalHavenApp(),
    ),
  );
}
