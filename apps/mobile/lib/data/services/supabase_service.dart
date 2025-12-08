import 'package:flutter/foundation.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import '../../core/config/env_config.dart';

/// Supabase service wrapper
/// Provides centralized access to Supabase client and common operations
class SupabaseService {
  SupabaseService._();

  static SupabaseService? _instance;
  static SupabaseService get instance => _instance ??= SupabaseService._();

  /// Initialize Supabase
  /// Call this in main.dart before runApp
  static Future<void> initialize() async {
    if (!EnvConfig.isSupabaseConfigured) {
      // In development, you might want to skip or use mock data
      if (EnvConfig.isDevelopment) {
        debugPrint('⚠️ Supabase not configured. Running in offline mode.');
        return;
      }
      throw Exception(
        'Supabase is not configured. '
        'Please provide SUPABASE_URL and SUPABASE_ANON_KEY.',
      );
    }

    await Supabase.initialize(
      url: EnvConfig.supabaseUrl,
      anonKey: EnvConfig.supabaseAnonKey,
      authOptions: const FlutterAuthClientOptions(
        authFlowType: AuthFlowType.pkce,
      ),
      realtimeClientOptions: const RealtimeClientOptions(
        logLevel: RealtimeLogLevel.info,
      ),
    );
  }

  /// Get the Supabase client
  /// Returns null if not initialized
  SupabaseClient? get client {
    try {
      return Supabase.instance.client;
    } catch (e) {
      return null;
    }
  }

  /// Get the current user
  User? get currentUser => client?.auth.currentUser;

  /// Get the current session
  Session? get currentSession => client?.auth.currentSession;

  /// Check if user is authenticated
  bool get isAuthenticated => currentUser != null;

  /// Auth state changes stream
  Stream<AuthState>? get authStateChanges => client?.auth.onAuthStateChange;

  /// Sign in with email and password
  Future<AuthResponse> signInWithEmail({
    required String email,
    required String password,
  }) async {
    final client = this.client;
    if (client == null) {
      throw Exception('Supabase not initialized');
    }

    return client.auth.signInWithPassword(
      email: email,
      password: password,
    );
  }

  /// Sign up with email and password
  Future<AuthResponse> signUpWithEmail({
    required String email,
    required String password,
    Map<String, dynamic>? data,
  }) async {
    final client = this.client;
    if (client == null) {
      throw Exception('Supabase not initialized');
    }

    return client.auth.signUp(
      email: email,
      password: password,
      data: data,
    );
  }

  /// Sign out
  Future<void> signOut() async {
    await client?.auth.signOut();
  }

  /// Send password reset email
  Future<void> resetPassword(String email) async {
    final client = this.client;
    if (client == null) {
      throw Exception('Supabase not initialized');
    }

    await client.auth.resetPasswordForEmail(email);
  }

  /// Verify OTP (for MFA or email verification)
  Future<AuthResponse> verifyOTP({
    required String email,
    required String token,
    required OtpType type,
  }) async {
    final client = this.client;
    if (client == null) {
      throw Exception('Supabase not initialized');
    }

    return client.auth.verifyOTP(
      email: email,
      token: token,
      type: type,
    );
  }

  /// Get a reference to a storage bucket
  StorageFileApi bucket(String name) {
    final client = this.client;
    if (client == null) {
      throw Exception('Supabase not initialized');
    }
    return client.storage.from(name);
  }

  /// Query a table
  SupabaseQueryBuilder table(String name) {
    final client = this.client;
    if (client == null) {
      throw Exception('Supabase not initialized');
    }
    return client.from(name);
  }
}
