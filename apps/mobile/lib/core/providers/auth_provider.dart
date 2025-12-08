import 'dart:async';
import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:supabase_flutter/supabase_flutter.dart' as supabase;
import '../../data/services/supabase_service.dart';
import '../../data/services/profile_service.dart';

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

  @override
  Future<AuthState> build() async {
    // Listen to auth state changes
    _authSubscription?.cancel();
    _authSubscription =
        SupabaseService.instance.authStateChanges?.listen((event) async {
      final authEvent = event.event;
      final session = event.session;

      if (authEvent == AuthChangeEvent.signedIn ||
          authEvent == AuthChangeEvent.tokenRefreshed) {
        if (session?.user != null) {
          final role = await _fetchUserRole(session!.user.id);
          state = AsyncData(AuthState(
            user: session.user,
            session: session,
            userRole: role,
          ));
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
      return AuthState(
        user: user,
        session: session,
        userRole: role,
      );
    }

    return const AuthState();
  }

  Future<String?> _fetchUserRole(String userId) async {
    try {
      final client = SupabaseService.instance.client;
      if (client == null) return null;

      final response = await client
          .from('profiles')
          .select('role')
          .eq('id', userId)
          .maybeSingle();

      return response?['role'] as String?;
    } catch (e) {
      return null;
    }
  }

  /// Get current state value safely
  AuthState? get _currentValue {
    return state.hasValue ? state.value : null;
  }

  /// Sign in with email and password
  Future<void> signIn({
    required String email,
    required String password,
  }) async {
    state = AsyncData(_currentValue?.copyWith(isLoading: true) ??
        const AuthState(isLoading: true));

    try {
      final response = await SupabaseService.instance.signInWithEmail(
        email: email,
        password: password,
      );

      if (response.user != null) {
        final role = await _fetchUserRole(response.user!.id);
        state = AsyncData(AuthState(
          user: response.user,
          session: response.session,
          userRole: role,
        ));
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
    state = AsyncData(_currentValue?.copyWith(isLoading: true) ??
        const AuthState(isLoading: true));

    try {
      final response = await SupabaseService.instance.signUpWithEmail(
        email: email,
        password: password,
        data: {
          'role': role,
          ...?userData,
        },
      );

      if (response.user != null) {
        // Update the role in the profiles table
        // The handle_new_user trigger creates the profile, but we need to set the role
        try {
          await ProfileService.instance.updateUserRole(response.user!.id, role);
          debugPrint('AuthProvider: Updated user role to $role');
        } catch (e) {
          debugPrint('AuthProvider: Failed to update role (may need email verification first): $e');
        }

        state = AsyncData(AuthState(
          user: response.user,
          session: response.session,
          userRole: role,
        ));
      }
    } on AuthException catch (e) {
      state = AsyncData(AuthState(error: e.message));
    } catch (e) {
      state = AsyncData(AuthState(error: e.toString()));
    }
  }

  /// Sign out
  Future<void> signOut() async {
    state = AsyncData(_currentValue?.copyWith(isLoading: true) ??
        const AuthState(isLoading: true));

    try {
      await SupabaseService.instance.signOut();
      state = const AsyncData(AuthState());
    } catch (e) {
      state = AsyncData(AuthState(error: e.toString()));
    }
  }

  /// Send password reset email
  Future<void> resetPassword(String email) async {
    state = AsyncData(_currentValue?.copyWith(isLoading: true) ??
        const AuthState(isLoading: true));

    try {
      await SupabaseService.instance.resetPassword(email);
      state = AsyncData(_currentValue?.copyWith(isLoading: false) ??
          const AuthState());
    } catch (e) {
      state = AsyncData(AuthState(error: e.toString()));
    }
  }

  /// Clear any errors
  void clearError() {
    state = AsyncData(_currentValue?.copyWith(error: null) ?? const AuthState());
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
