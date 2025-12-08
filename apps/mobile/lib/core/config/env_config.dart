/// Environment configuration
/// Manages Supabase, Firebase, and other API keys
///
/// In production, these should be provided via:
/// - flutter run --dart-define=SUPABASE_URL=xxx
/// - Or environment variables during build
class EnvConfig {
  EnvConfig._();

  // ============================================
  // Supabase Configuration
  // ============================================

  /// Supabase project URL
  static const String supabaseUrl = String.fromEnvironment(
    'SUPABASE_URL',
    defaultValue: 'https://pstjxdrneytefheqhreo.supabase.co',
  );

  /// Supabase anon/public key
  static const String supabaseAnonKey = String.fromEnvironment(
    'SUPABASE_ANON_KEY',
    defaultValue:
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBzdGp4ZHJuZXl0ZWZoZXFocmVvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM4MjU4NjEsImV4cCI6MjA3OTQwMTg2MX0.fN-zCj3rOrY1oFQwNgaCblluXac5WcD6em6mmQ7zhkY',
  );

  /// Check if Supabase is configured
  static bool get isSupabaseConfigured =>
      supabaseUrl.isNotEmpty && supabaseAnonKey.isNotEmpty;

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
}
