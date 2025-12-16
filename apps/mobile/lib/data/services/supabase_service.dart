import 'dart:convert';
import 'dart:math';
import 'package:crypto/crypto.dart';
import 'package:flutter/foundation.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import '../../core/config/env_config.dart';
import '../../core/utils/app_debug.dart';

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

    // Non-secret diagnostics: log the project host + environment to help
    // debug “wrong Supabase project” issues (e.g., mobile vs Vercel mismatch).
    try {
      final host = Uri.parse(EnvConfig.supabaseUrl).host;
      AppDebug.log(
        'supabase',
        'init completed',
        data: {'host': host, 'environment': EnvConfig.environment},
      );
    } catch (_) {
      // ignore
    }
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

    return client.auth.signInWithPassword(email: email, password: password);
  }

  /// Sign up with email and password
  /// Uses deep link redirect for email verification
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
      emailRedirectTo: 'coastalhaven://auth/callback',
    );
  }

  /// Sign out
  Future<void> signOut() async {
    await client?.auth.signOut();
  }

  /// Send password reset email
  /// Uses deep link redirect for password reset callback
  Future<void> resetPassword(String email) async {
    final client = this.client;
    if (client == null) {
      throw Exception('Supabase not initialized');
    }

    await client.auth.resetPasswordForEmail(
      email,
      redirectTo: 'coastalhaven://auth/callback',
    );
  }

  /// Update user password
  /// Requires user to be authenticated
  Future<UserResponse> updatePassword(String newPassword) async {
    final client = this.client;
    if (client == null) {
      throw Exception('Supabase not initialized');
    }

    return client.auth.updateUser(UserAttributes(password: newPassword));
  }

  /// Update user email
  /// Sends verification email to new address
  Future<UserResponse> updateEmail(String newEmail) async {
    final client = this.client;
    if (client == null) {
      throw Exception('Supabase not initialized');
    }

    return client.auth.updateUser(UserAttributes(email: newEmail));
  }

  /// Re-authenticate user with password
  /// Used to verify identity before sensitive operations
  Future<bool> reauthenticate(String password) async {
    final client = this.client;
    if (client == null) {
      throw Exception('Supabase not initialized');
    }

    final email = currentUser?.email;
    if (email == null) {
      throw Exception('No user logged in');
    }

    try {
      await client.auth.signInWithPassword(email: email, password: password);
      return true;
    } on AuthException {
      return false;
    }
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

    return client.auth.verifyOTP(email: email, token: token, type: type);
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

  // ==================== OAuth Methods ====================

  /// The redirect URL for OAuth callbacks
  /// This must match what's configured in Supabase dashboard
  static const String _oauthRedirectUrl =
      'com.coastalhavenpartners.android://login-callback';

  /// Sign in with Google OAuth
  Future<bool> signInWithGoogle() async {
    return _signInWithOAuth(OAuthProvider.google);
  }

  /// Sign in with Discord OAuth
  Future<bool> signInWithDiscord() async {
    return _signInWithOAuth(OAuthProvider.discord);
  }

  /// Sign in with LinkedIn OAuth (via OIDC)
  Future<bool> signInWithLinkedIn() async {
    return _signInWithOAuth(OAuthProvider.linkedinOidc);
  }

  /// Generic OAuth sign-in method
  Future<bool> _signInWithOAuth(OAuthProvider provider) async {
    final client = this.client;
    if (client == null) {
      throw Exception('Supabase not initialized');
    }

    try {
      final response = await client.auth.signInWithOAuth(
        provider,
        redirectTo: _oauthRedirectUrl,
        authScreenLaunchMode: LaunchMode.externalApplication,
      );
      return response;
    } catch (e) {
      debugPrint('OAuth error: $e');
      rethrow;
    }
  }

  // ==================== MFA Methods ====================

  /// Enroll a new TOTP factor for MFA
  /// Returns the factor details including QR code URI and secret
  Future<AuthMFAEnrollResponse> mfaEnroll({
    String friendlyName = 'Coastal Haven',
  }) async {
    final client = this.client;
    if (client == null) {
      throw Exception('Supabase not initialized');
    }

    return client.auth.mfa.enroll(
      factorType: FactorType.totp,
      friendlyName: friendlyName,
    );
  }

  /// Verify a TOTP code to complete MFA enrollment or challenge
  Future<AuthMFAVerifyResponse> mfaVerify({
    required String factorId,
    required String challengeId,
    required String code,
  }) async {
    final client = this.client;
    if (client == null) {
      throw Exception('Supabase not initialized');
    }

    return client.auth.mfa.verify(
      factorId: factorId,
      challengeId: challengeId,
      code: code,
    );
  }

  /// Create a challenge for an MFA factor (used during login)
  Future<AuthMFAChallengeResponse> mfaChallenge({
    required String factorId,
  }) async {
    final client = this.client;
    if (client == null) {
      throw Exception('Supabase not initialized');
    }

    return client.auth.mfa.challenge(factorId: factorId);
  }

  /// List all enrolled MFA factors for the current user
  Future<AuthMFAListFactorsResponse> mfaListFactors() async {
    final client = this.client;
    if (client == null) {
      throw Exception('Supabase not initialized');
    }

    return client.auth.mfa.listFactors();
  }

  /// Remove an MFA factor
  Future<AuthMFAUnenrollResponse> mfaUnenroll({
    required String factorId,
  }) async {
    final client = this.client;
    if (client == null) {
      throw Exception('Supabase not initialized');
    }

    return client.auth.mfa.unenroll(factorId);
  }

  /// Get the current MFA authentication level
  AuthMFAGetAuthenticatorAssuranceLevelResponse?
  mfaGetAuthenticatorAssuranceLevel() {
    final client = this.client;
    if (client == null) return null;

    return client.auth.mfa.getAuthenticatorAssuranceLevel();
  }

  // ============================================================
  // Recovery Codes
  // ============================================================

  /// Generate random recovery codes
  /// Returns a list of 10 codes in format XXXX-XXXX-XXXX
  static List<String> generateRecoveryCodes({int count = 10}) {
    final random = Random.secure();
    const chars =
        'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // No I, O, 0, 1 for clarity

    List<String> codes = [];
    for (int i = 0; i < count; i++) {
      final parts = <String>[];
      for (int p = 0; p < 3; p++) {
        final part = List.generate(
          4,
          (_) => chars[random.nextInt(chars.length)],
        ).join();
        parts.add(part);
      }
      codes.add(parts.join('-'));
    }
    return codes;
  }

  /// Hash a recovery code using SHA-256
  /// Normalizes the code (uppercase, no dashes) before hashing
  static String hashRecoveryCode(String code) {
    // Normalize: uppercase, remove non-alphanumeric
    final normalized = code.toUpperCase().replaceAll(RegExp(r'[^A-Z0-9]'), '');
    final bytes = utf8.encode(normalized);
    final digest = sha256.convert(bytes);
    return digest.toString();
  }

  /// Store recovery codes for the current user
  /// Generates codes, hashes them, and stores via RPC
  /// Returns the plain-text codes (show these to user ONCE)
  Future<Map<String, dynamic>> storeRecoveryCodes() async {
    final client = this.client;
    if (client == null) {
      return {
        'success': false,
        'message': 'Supabase not initialized',
        'codes': <String>[],
      };
    }

    try {
      // Generate codes
      final codes = generateRecoveryCodes();

      // Hash codes for storage
      final hashes = codes.map((c) => hashRecoveryCode(c)).toList();

      // Store hashes via RPC
      final response = await client
          .rpc('store_recovery_codes', params: {'code_hashes': hashes})
          .single();

      if (response['success'] == true) {
        return {
          'success': true,
          'message': response['message'],
          'codes': codes, // Return plain-text codes to show user
          'count': response['count'],
        };
      } else {
        return {
          'success': false,
          'message': response['message'] ?? 'Failed to store recovery codes',
          'codes': <String>[],
        };
      }
    } catch (e) {
      return {
        'success': false,
        'message': 'Error storing recovery codes: ${e.toString()}',
        'codes': <String>[],
      };
    }
  }

  /// Verify a recovery code
  /// Returns success if valid, and the code is marked as used
  Future<Map<String, dynamic>> verifyRecoveryCode(String code) async {
    final client = this.client;
    if (client == null) {
      return {'success': false, 'message': 'Supabase not initialized'};
    }

    try {
      final response = await client
          .rpc('verify_recovery_code', params: {'input_code': code})
          .single();

      return {
        'success': response['success'] == true,
        'message': response['message'],
        'remaining_codes': response['remaining_codes'],
      };
    } catch (e) {
      return {
        'success': false,
        'message': 'Error verifying recovery code: ${e.toString()}',
      };
    }
  }

  /// Get the count of remaining recovery codes
  Future<Map<String, dynamic>> getRecoveryCodesCount() async {
    final client = this.client;
    if (client == null) {
      return {'success': false, 'message': 'Supabase not initialized'};
    }

    try {
      final response = await client.rpc('get_recovery_codes_count').single();

      return {
        'success': response['success'] == true,
        'total': response['total'] ?? 0,
        'unused': response['unused'] ?? 0,
        'used': response['used'] ?? 0,
      };
    } catch (e) {
      return {
        'success': false,
        'message': 'Error getting recovery codes count: ${e.toString()}',
        'total': 0,
        'unused': 0,
        'used': 0,
      };
    }
  }

  // ============================================================
  // Account Management
  // ============================================================

  /// Delete the current user's account and all associated data
  /// This action is irreversible!
  /// Returns a map with 'success' boolean and 'message' string
  Future<Map<String, dynamic>> deleteAccount() async {
    final client = this.client;
    if (client == null) {
      return {'success': false, 'message': 'Supabase not initialized'};
    }

    if (currentUser == null) {
      return {'success': false, 'message': 'Not authenticated'};
    }

    try {
      // Call the RPC function to delete the account
      final response = await client.rpc('delete_user_account').single();

      // The RPC returns a jsonb object with success, message, and files_deleted
      if (response['success'] == true) {
        return {
          'success': true,
          'message': response['message'] ?? 'Account deleted successfully',
          'files_deleted': response['files_deleted'] ?? 0,
        };
      } else {
        return {
          'success': false,
          'message': response['message'] ?? 'Failed to delete account',
        };
      }
    } catch (e) {
      return {
        'success': false,
        'message': 'Error deleting account: ${e.toString()}',
      };
    }
  }
}
