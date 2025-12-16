import 'dart:async';
import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:supabase_flutter/supabase_flutter.dart' as supabase;
import 'package:http/http.dart' as http;
import '../../data/services/supabase_service.dart';
import '../../data/services/profile_service.dart';
import '../utils/app_debug.dart';

// Re-export types we need from supabase
typedef User = supabase.User;
typedef Session = supabase.Session;
typedef AuthException = supabase.AuthException;
typedef AuthChangeEvent = supabase.AuthChangeEvent;

/// Authentication state for the app
class AuthState {
  final User? user;
  final Session? session;
  final bool isLoading;
  final String? error;
  final String? userRole;

  const AuthState({
    this.user,
    this.session,
    this.isLoading = false,
    this.error,
    this.userRole,
  });

  bool get isAuthenticated => user != null && session != null;

  AuthState copyWith({
    User? user,
    Session? session,
    bool? isLoading,
    String? error,
    String? userRole,
  }) {
    return AuthState(
      user: user ?? this.user,
      session: session ?? this.session,
      isLoading: isLoading ?? this.isLoading,
      error: error,
      userRole: userRole ?? this.userRole,
    );
  }
}

/// Auth state notifier
class AuthNotifier extends AsyncNotifier<AuthState> {
  StreamSubscription<supabase.AuthState>? _authSubscription;

  // Web API base used for observability + transactional emails.
  // (This is intentionally separate from Supabase Auth emails.)
  static const String _webApiBaseUrl = 'https://coastalhavenpartners.com';

  Future<void> _notifyWebSignupEvent({
    required String userId,
    required String email,
    required String role,
    String? fullName,
  }) async {
    try {
      final uri = Uri.parse('$_webApiBaseUrl/api/mobile/signup-event');
      final res = await http.post(
        uri,
        headers: const {'Content-Type': 'application/json'},
        body: jsonEncode({
          'userId': userId,
          'email': email,
          'role': role,
          'fullName': fullName,
          'platform': defaultTargetPlatform.name,
        }),
      );

      if (res.statusCode >= 400) {
        AppDebug.log(
          'auth',
          'signup-event webhook failed',
          data: {'status': res.statusCode, 'body': res.body},
        );
      } else {
        AppDebug.log(
          'auth',
          'signup-event webhook ok',
          data: {'status': res.statusCode},
        );
      }
    } catch (e, st) {
      AppDebug.log(
        'auth',
        'signup-event webhook exception',
        error: e,
        stackTrace: st,
      );
    }
  }

  @override
  Future<AuthState> build() async {
    // Listen to auth state changes
    _authSubscription?.cancel();
    _authSubscription = SupabaseService.instance.authStateChanges?.listen((
      event,
    ) async {
      final authEvent = event.event;
      final session = event.session;

      if (authEvent == AuthChangeEvent.signedIn ||
          authEvent == AuthChangeEvent.tokenRefreshed) {
        if (session?.user != null) {
          final role = await _fetchUserRole(session!.user.id);
          state = AsyncData(
            AuthState(user: session.user, session: session, userRole: role),
          );
        }
      } else if (authEvent == AuthChangeEvent.signedOut) {
        state = const AsyncData(AuthState());
      }
    });

    // Clean up subscription when provider is disposed
    ref.onDispose(() {
      _authSubscription?.cancel();
    });

    // Get initial state
    final supabase = SupabaseService.instance;
    final user = supabase.currentUser;
    final session = supabase.currentSession;

    if (user != null) {
      final role = await _fetchUserRole(user.id);
      return AuthState(user: user, session: session, userRole: role);
    }

    return const AuthState();
  }

  Future<String?> _fetchUserRole(String userId) async {
    try {
      final client = SupabaseService.instance.client;
      if (client == null) return null;

      // First try to get role from profiles table
      final response = await client
          .from('profiles')
          .select('role')
          .eq('id', userId)
          .maybeSingle();

      final dbRole = response?['role'] as String?;
      if (dbRole != null && dbRole.isNotEmpty) {
        return dbRole;
      }

      // Fallback: Check user metadata (set during signup)
      final user = SupabaseService.instance.currentUser;
      if (user != null && user.id == userId) {
        final metaRole = user.userMetadata?['role'] as String?;
        if (metaRole != null && metaRole.isNotEmpty) {
          // Sync role from metadata to profiles table
          await _syncRoleFromMetadata(userId, metaRole);
          return metaRole;
        }
      }

      return null;
    } catch (e) {
      debugPrint('AuthProvider: Error fetching user role: $e');
      return null;
    }
  }

  /// Sync role from user metadata to profiles table
  Future<void> _syncRoleFromMetadata(String userId, String role) async {
    try {
      debugPrint(
        'AuthProvider: Syncing role "$role" from metadata to profiles table',
      );
      await ProfileService.instance.ensureProfileExists(
        userId,
        role: role,
        email: SupabaseService.instance.currentUser?.email,
        fullName:
            SupabaseService.instance.currentUser?.userMetadata?['full_name']
                as String?,
      );
    } catch (e) {
      debugPrint('AuthProvider: Failed to sync role from metadata: $e');
    }
  }

  /// Get current state value safely
  AuthState? get _currentValue {
    return state.hasValue ? state.value : null;
  }

  /// Sign in with email and password
  Future<void> signIn({required String email, required String password}) async {
    state = AsyncData(
      _currentValue?.copyWith(isLoading: true) ??
          const AuthState(isLoading: true),
    );

    try {
      final response = await SupabaseService.instance.signInWithEmail(
        email: email,
        password: password,
      );

      if (response.user != null) {
        final role = await _fetchUserRole(response.user!.id);
        state = AsyncData(
          AuthState(
            user: response.user,
            session: response.session,
            userRole: role,
          ),
        );
      }
    } on AuthException catch (e) {
      state = AsyncData(AuthState(error: e.message));
    } catch (e) {
      state = AsyncData(AuthState(error: e.toString()));
    }
  }

  /// Sign up with email and password
  Future<void> signUp({
    required String email,
    required String password,
    required String role,
    Map<String, dynamic>? userData,
  }) async {
    state = AsyncData(
      _currentValue?.copyWith(isLoading: true) ??
          const AuthState(isLoading: true),
    );

    try {
      final response = await SupabaseService.instance.signUpWithEmail(
        email: email,
        password: password,
        data: {'role': role, ...?userData},
      );

      if (response.user != null) {
        // Fire-and-forget: log signup to web (Vercel) + send transactional welcome email.
        // This does NOT affect Supabase's own verification email flow.
        unawaited(
          _notifyWebSignupEvent(
            userId: response.user!.id,
            email: response.user!.email ?? email,
            role: role,
            fullName: (userData?['full_name'] as String?),
          ),
        );

        // Update the role in the profiles table
        // The handle_new_user trigger creates the profile, but we need to set the role
        try {
          await ProfileService.instance.updateUserRole(response.user!.id, role);
          debugPrint('AuthProvider: Updated user role to $role');
        } catch (e) {
          debugPrint(
            'AuthProvider: Failed to update role (may need email verification first): $e',
          );
        }

        state = AsyncData(
          AuthState(
            user: response.user,
            session: response.session,
            userRole: role,
          ),
        );
      }
    } on AuthException catch (e) {
      state = AsyncData(AuthState(error: e.message));
    } catch (e) {
      state = AsyncData(AuthState(error: e.toString()));
    }
  }

  /// Sign out
  Future<void> signOut() async {
    state = AsyncData(
      _currentValue?.copyWith(isLoading: true) ??
          const AuthState(isLoading: true),
    );

    try {
      await SupabaseService.instance.signOut();
      state = const AsyncData(AuthState());
    } catch (e) {
      state = AsyncData(AuthState(error: e.toString()));
    }
  }

  /// Send password reset email
  Future<void> resetPassword(String email) async {
    state = AsyncData(
      _currentValue?.copyWith(isLoading: true) ??
          const AuthState(isLoading: true),
    );

    try {
      await SupabaseService.instance.resetPassword(email);
      state = AsyncData(
        _currentValue?.copyWith(isLoading: false) ?? const AuthState(),
      );
    } catch (e) {
      state = AsyncData(AuthState(error: e.toString()));
    }
  }

  /// Change password (requires current password verification)
  Future<({bool success, String? error})> changePassword({
    required String currentPassword,
    required String newPassword,
  }) async {
    try {
      // Verify current password first
      final isValid = await SupabaseService.instance.reauthenticate(
        currentPassword,
      );
      if (!isValid) {
        return (success: false, error: 'Current password is incorrect');
      }

      // Update to new password
      await SupabaseService.instance.updatePassword(newPassword);
      return (success: true, error: null);
    } on AuthException catch (e) {
      return (success: false, error: e.message);
    } catch (e) {
      return (success: false, error: e.toString());
    }
  }

  /// Change email (requires password verification)
  Future<({bool success, String? error})> changeEmail({
    required String newEmail,
    required String password,
  }) async {
    try {
      // Verify password first
      final isValid = await SupabaseService.instance.reauthenticate(password);
      if (!isValid) {
        return (success: false, error: 'Password is incorrect');
      }

      // Update email (Supabase will send verification to new email)
      await SupabaseService.instance.updateEmail(newEmail);
      return (success: true, error: null);
    } on AuthException catch (e) {
      return (success: false, error: e.message);
    } catch (e) {
      return (success: false, error: e.toString());
    }
  }

  /// Clear any errors
  void clearError() {
    state = AsyncData(
      _currentValue?.copyWith(error: null) ?? const AuthState(),
    );
  }

  /// Update user role (for logged-in users selecting role from role-selection screen)
  Future<bool> updateRole(String role) async {
    final currentState = _currentValue;
    if (currentState?.user == null) return false;

    try {
      await ProfileService.instance.updateUserRole(
        currentState!.user!.id,
        role,
      );
      state = AsyncData(currentState.copyWith(userRole: role));
      debugPrint('AuthProvider: Updated user role to $role');
      return true;
    } catch (e) {
      debugPrint('AuthProvider: Failed to update role: $e');
      return false;
    }
  }

  // ==================== OAuth Sign-In Methods ====================

  /// Sign in with Google
  /// Opens a browser for Google OAuth flow
  /// Returns true if the OAuth flow was initiated successfully
  Future<bool> signInWithGoogle() async {
    state = AsyncData(
      _currentValue?.copyWith(isLoading: true, error: null) ??
          const AuthState(isLoading: true),
    );

    try {
      final success = await SupabaseService.instance.signInWithGoogle();
      // The auth state listener will handle the signed-in event
      // We just need to reset loading state if OAuth didn't start
      if (!success) {
        state = AsyncData(
          _currentValue?.copyWith(isLoading: false) ?? const AuthState(),
        );
      }
      return success;
    } catch (e) {
      state = AsyncData(
        AuthState(error: 'Google sign-in failed: ${e.toString()}'),
      );
      return false;
    }
  }

  /// Sign in with Discord
  /// Opens a browser for Discord OAuth flow
  Future<bool> signInWithDiscord() async {
    state = AsyncData(
      _currentValue?.copyWith(isLoading: true, error: null) ??
          const AuthState(isLoading: true),
    );

    try {
      final success = await SupabaseService.instance.signInWithDiscord();
      if (!success) {
        state = AsyncData(
          _currentValue?.copyWith(isLoading: false) ?? const AuthState(),
        );
      }
      return success;
    } catch (e) {
      state = AsyncData(
        AuthState(error: 'Discord sign-in failed: ${e.toString()}'),
      );
      return false;
    }
  }

  /// Sign in with LinkedIn
  /// Opens a browser for LinkedIn OAuth flow
  Future<bool> signInWithLinkedIn() async {
    state = AsyncData(
      _currentValue?.copyWith(isLoading: true, error: null) ??
          const AuthState(isLoading: true),
    );

    try {
      final success = await SupabaseService.instance.signInWithLinkedIn();
      if (!success) {
        state = AsyncData(
          _currentValue?.copyWith(isLoading: false) ?? const AuthState(),
        );
      }
      return success;
    } catch (e) {
      state = AsyncData(
        AuthState(error: 'LinkedIn sign-in failed: ${e.toString()}'),
      );
      return false;
    }
  }
}

/// Provider for auth state
final authStateProvider = AsyncNotifierProvider<AuthNotifier, AuthState>(
  AuthNotifier.new,
);

/// Convenience provider for checking if user is authenticated
final isAuthenticatedProvider = Provider<bool>((ref) {
  final authAsync = ref.watch(authStateProvider);
  return authAsync.hasValue ? authAsync.value!.isAuthenticated : false;
});

/// Convenience provider for current user
final currentUserProvider = Provider<User?>((ref) {
  final authAsync = ref.watch(authStateProvider);
  return authAsync.hasValue ? authAsync.value!.user : null;
});

/// Convenience provider for user role
final userRoleProvider = Provider<String?>((ref) {
  final authAsync = ref.watch(authStateProvider);
  return authAsync.hasValue ? authAsync.value!.userRole : null;
});
