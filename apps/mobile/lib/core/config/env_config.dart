/// Environment configuration
/// Manages Supabase, Firebase, and other API keys
///
/// In production, these MUST be provided via:
/// - flutter run --dart-define=SUPABASE_URL=xxx --dart-define=SUPABASE_ANON_KEY=xxx
/// - Or environment variables during build
///
/// The app will fail fast in production if required env vars are missing.
class EnvConfig {
  EnvConfig._();

  // ============================================
  // Environment Settings
  // ============================================

  /// App environment
  static const String environment = String.fromEnvironment(
    'ENVIRONMENT',
    defaultValue: 'development',
  );

  /// Whether we're in production
  static bool get isProduction => environment == 'production';

  /// Whether we're in development
  static bool get isDevelopment => environment == 'development';

  // ============================================
  // Supabase Configuration
  // ============================================

  /// Raw Supabase URL from environment (may be empty in production)
  static const String _supabaseUrlRaw = String.fromEnvironment('SUPABASE_URL');

  /// Raw Supabase anon key from environment (may be empty in production)
  static const String _supabaseAnonKeyRaw = String.fromEnvironment('SUPABASE_ANON_KEY');

  /// Development fallback credentials
  /// These are ONLY used in development mode for convenience.
  /// In production, env vars MUST be provided.
  static const String _devSupabaseUrl = 'https://pstjxdrneytefheqhreo.supabase.co';
  static const String _devSupabaseAnonKey =
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBzdGp4ZHJuZXl0ZWZoZXFocmVvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM4MjU4NjEsImV4cCI6MjA3OTQwMTg2MX0.fN-zCj3rOrY1oFQwNgaCblluXac5WcD6em6mmQ7zhkY';

  /// Supabase project URL
  /// Throws [StateError] in production if not configured.
  static String get supabaseUrl {
    if (_supabaseUrlRaw.isNotEmpty) {
      return _supabaseUrlRaw;
    }
    if (isDevelopment) {
      return _devSupabaseUrl;
    }
    throw StateError(
      'SUPABASE_URL not provided in production build.\n'
      'Run with: --dart-define=SUPABASE_URL=your-url',
    );
  }

  /// Supabase anon/public key
  /// Throws [StateError] in production if not configured.
  static String get supabaseAnonKey {
    if (_supabaseAnonKeyRaw.isNotEmpty) {
      return _supabaseAnonKeyRaw;
    }
    if (isDevelopment) {
      return _devSupabaseAnonKey;
    }
    throw StateError(
      'SUPABASE_ANON_KEY not provided in production build.\n'
      'Run with: --dart-define=SUPABASE_ANON_KEY=your-key',
    );
  }

  /// Check if Supabase is configured
  static bool get isSupabaseConfigured {
    try {
      return supabaseUrl.isNotEmpty && supabaseAnonKey.isNotEmpty;
    } catch (_) {
      return false;
    }
  }

  /// Validate all required configuration.
  /// Call this at app startup to fail fast if misconfigured.
  /// Throws [StateError] if required configuration is missing.
  static void validate() {
    final errors = <String>[];

    try {
      // Access getters to trigger validation
      supabaseUrl;
      supabaseAnonKey;
    } on StateError catch (e) {
      errors.add(e.message);
    }

    if (errors.isNotEmpty) {
      throw StateError(
        'Environment configuration errors:\n${errors.join('\n')}',
      );
    }
  }

  // ============================================
  // Firebase Configuration
  // ============================================

  /// Firebase project ID (for reference)
  /// Note: Firebase configuration is handled via google-services.json (Android)
  /// and GoogleService-Info.plist (iOS). This is just for documentation.
  static const String firebaseProjectId = String.fromEnvironment(
    'FIREBASE_PROJECT_ID',
    defaultValue: '',
  );

  /// Check if Firebase is configured
  /// Firebase is considered configured if google-services.json exists
  /// This is determined at runtime by Firebase initialization success
  static bool firebaseConfigured = false;

  // ============================================
  // Feature Flags
  // ============================================

  /// Enable push notifications (requires Firebase setup)
  static const bool enablePushNotifications = bool.fromEnvironment(
    'ENABLE_PUSH_NOTIFICATIONS',
    defaultValue: true,
  );

  /// Enable analytics (requires Firebase Analytics)
  static const bool enableAnalytics = bool.fromEnvironment(
    'ENABLE_ANALYTICS',
    defaultValue: false,
  );

  /// Enable crash reporting (requires Firebase Crashlytics)
  static const bool enableCrashReporting = bool.fromEnvironment(
    'ENABLE_CRASH_REPORTING',
    defaultValue: false,
  );

  /// Debug info for logging
  static String get debugInfo => '''
EnvConfig:
  environment: $environment
  isProduction: $isProduction
  isDevelopment: $isDevelopment
  supabaseConfigured: $isSupabaseConfigured
  firebaseConfigured: $firebaseConfigured
  pushNotifications: $enablePushNotifications
  analytics: $enableAnalytics
  crashReporting: $enableCrashReporting
''';
}
