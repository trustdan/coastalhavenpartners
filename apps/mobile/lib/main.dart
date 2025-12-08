import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'app.dart';
import 'data/services/supabase_service.dart';
import 'data/services/local_storage_service.dart';
import 'data/services/notification_service.dart';

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

  // Run the app with Riverpod
  runApp(
    const ProviderScope(
      child: CoastalHavenApp(),
    ),
  );
}
