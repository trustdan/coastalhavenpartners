import 'dart:async';
import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../data/services/deep_link_service.dart';

/// State class for deep link handling
class DeepLinkState {
  final DeepLinkData? lastLink;
  final String? pendingRoute;
  final bool isProcessing;
  final String? error;

  const DeepLinkState({
    this.lastLink,
    this.pendingRoute,
    this.isProcessing = false,
    this.error,
  });

  DeepLinkState copyWith({
    DeepLinkData? lastLink,
    String? pendingRoute,
    bool? isProcessing,
    String? error,
    bool clearPendingRoute = false,
    bool clearError = false,
  }) {
    return DeepLinkState(
      lastLink: lastLink ?? this.lastLink,
      pendingRoute: clearPendingRoute ? null : (pendingRoute ?? this.pendingRoute),
      isProcessing: isProcessing ?? this.isProcessing,
      error: clearError ? null : (error ?? this.error),
    );
  }
}

/// Provider for deep link state management
class DeepLinkNotifier extends Notifier<DeepLinkState> {
  StreamSubscription<DeepLinkData>? _linkSubscription;
  GoRouter? _router;

  @override
  DeepLinkState build() {
    // Initialize when provider is first read
    _initialize();

    // Clean up when provider is disposed
    ref.onDispose(() {
      _linkSubscription?.cancel();
    });

    return const DeepLinkState();
  }

  /// Set the router for navigation
  void setRouter(GoRouter router) {
    _router = router;

    // Process any pending route
    if (state.pendingRoute != null) {
      _navigateTo(state.pendingRoute!);
      state = state.copyWith(clearPendingRoute: true);
    }
  }

  void _initialize() {
    // Listen for deep links
    _linkSubscription = DeepLinkService.instance.linkStream.listen(
      _handleDeepLink,
      onError: (error) {
        debugPrint('DeepLinkNotifier: Error receiving link: $error');
        state = state.copyWith(error: error.toString());
      },
    );
  }

  /// Handle an incoming deep link
  void _handleDeepLink(DeepLinkData data) {
    debugPrint('DeepLinkNotifier: Handling link: ${data.type}');

    state = state.copyWith(
      lastLink: data,
      isProcessing: true,
      clearError: true,
    );

    // Handle based on link type
    switch (data.type) {
      case DeepLinkType.authCallback:
        _handleAuthCallback(data);
        break;
      case DeepLinkType.oauthCallback:
        _handleOAuthCallback(data);
        break;
      case DeepLinkType.navigation:
        _handleNavigationLink(data);
        break;
      case DeepLinkType.unknown:
        debugPrint('DeepLinkNotifier: Unknown link type');
        break;
    }

    state = state.copyWith(isProcessing: false);
  }

  /// Handle auth callback (email verification, password reset)
  void _handleAuthCallback(DeepLinkData data) {
    if (data.hasError) {
      debugPrint('DeepLinkNotifier: Auth error: ${data.error}');
      state = state.copyWith(
        error: data.errorDescription ?? data.error,
      );
      return;
    }

    if (data.hasAuthTokens) {
      // Tokens are handled by DeepLinkService automatically
      // Navigate to appropriate screen after auth
      debugPrint('DeepLinkNotifier: Auth tokens received, navigating...');

      // Check the type parameter to determine where to go
      final type = data.params['type'];
      switch (type) {
        case 'signup':
        case 'email_confirmation':
          // User just verified email - go to login
          _navigateTo('/login');
          break;
        case 'recovery':
        case 'password_recovery':
          // Password reset - the session is set, user can change password
          _navigateTo('/settings');
          break;
        case 'magiclink':
          // Magic link login - go to appropriate dashboard
          _navigateTo('/');
          break;
        default:
          // Default - go to splash to determine route
          _navigateTo('/');
      }
    }
  }

  /// Handle OAuth callback
  void _handleOAuthCallback(DeepLinkData data) {
    if (data.hasError) {
      debugPrint('DeepLinkNotifier: OAuth error: ${data.error}');
      state = state.copyWith(
        error: data.errorDescription ?? data.error,
      );
      return;
    }

    // OAuth success - navigate to splash to determine route
    debugPrint('DeepLinkNotifier: OAuth callback received');
    _navigateTo('/');
  }

  /// Handle navigation deep link
  void _handleNavigationLink(DeepLinkData data) {
    final route = data.route;
    if (route != null && route.isNotEmpty) {
      debugPrint('DeepLinkNotifier: Navigating to: $route');
      _navigateTo(route);
    }
  }

  /// Navigate to a route
  void _navigateTo(String route) {
    if (_router != null) {
      _router!.go(route);
    } else {
      // Router not ready yet, store pending route
      debugPrint('DeepLinkNotifier: Router not ready, storing pending route');
      state = state.copyWith(pendingRoute: route);
    }
  }

  /// Clear any error state
  void clearError() {
    state = state.copyWith(clearError: true);
  }
}

/// Provider for deep link state
final deepLinkProvider =
    NotifierProvider<DeepLinkNotifier, DeepLinkState>(DeepLinkNotifier.new);

/// Provider for just the pending route (for router integration)
final pendingDeepLinkRouteProvider = Provider<String?>((ref) {
  return ref.watch(deepLinkProvider).pendingRoute;
});

/// Provider for deep link errors
final deepLinkErrorProvider = Provider<String?>((ref) {
  return ref.watch(deepLinkProvider).error;
});
