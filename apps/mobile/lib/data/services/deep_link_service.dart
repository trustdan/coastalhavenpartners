import 'dart:async';
import 'package:app_links/app_links.dart';
import 'package:flutter/foundation.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

/// Types of deep links the app can handle
enum DeepLinkType {
  /// Auth callback (email verification, password reset, magic link)
  authCallback,

  /// Navigate to a specific screen
  navigation,

  /// OAuth callback
  oauthCallback,

  /// Unknown link type
  unknown,
}

/// Parsed deep link data
class DeepLinkData {
  final DeepLinkType type;
  final Uri uri;
  final String? route;
  final Map<String, String> params;
  final String? accessToken;
  final String? refreshToken;
  final String? error;
  final String? errorDescription;

  DeepLinkData({
    required this.type,
    required this.uri,
    this.route,
    this.params = const {},
    this.accessToken,
    this.refreshToken,
    this.error,
    this.errorDescription,
  });

  /// Whether this link contains auth tokens
  bool get hasAuthTokens => accessToken != null && refreshToken != null;

  /// Whether this link has an error
  bool get hasError => error != null;

  @override
  String toString() {
    return 'DeepLinkData(type: $type, uri: $uri, route: $route, hasTokens: $hasAuthTokens, error: $error)';
  }
}

/// Service for handling deep links
///
/// Supports:
/// - Custom scheme: `coastalhaven://`
/// - Android package scheme: `com.coastalhavenpartners.android://`
/// - iOS bundle scheme: `com.coastalhavenpartners.ios://`
/// - Universal links: `https://coastalhavenpartners.com/app/*`
/// - Auth callbacks: `https://coastalhavenpartners.com/auth/callback`
class DeepLinkService {
  DeepLinkService._();
  static final DeepLinkService _instance = DeepLinkService._();
  static DeepLinkService get instance => _instance;

  final _appLinks = AppLinks();
  bool _initialized = false;

  // Stream controllers
  final _linkStream = StreamController<DeepLinkData>.broadcast();
  final _authStream = StreamController<DeepLinkData>.broadcast();

  /// Stream of all parsed deep links
  Stream<DeepLinkData> get linkStream => _linkStream.stream;

  /// Stream of auth-related deep links (for handling in auth flow)
  Stream<DeepLinkData> get authStream => _authStream.stream;

  /// Whether the service is initialized
  bool get isInitialized => _initialized;

  /// Initialize the deep link service
  Future<void> initialize() async {
    if (_initialized) return;

    try {
      // Check for initial link (app was opened via deep link)
      final initialUri = await _appLinks.getInitialLink();
      if (initialUri != null) {
        debugPrint('DeepLinkService: Initial link: $initialUri');
        _handleIncomingLink(initialUri);
      }

      // Listen for subsequent links
      _appLinks.uriLinkStream.listen(
        _handleIncomingLink,
        onError: (error) {
          debugPrint('DeepLinkService: Error receiving link: $error');
        },
      );

      _initialized = true;
      debugPrint('DeepLinkService initialized successfully');
    } catch (e) {
      debugPrint('DeepLinkService initialization error: $e');
      // Don't throw - deep links are optional functionality
    }
  }

  /// Handle an incoming deep link URI
  void _handleIncomingLink(Uri uri) {
    debugPrint('DeepLinkService: Received link: $uri');

    final data = _parseDeepLink(uri);
    debugPrint('DeepLinkService: Parsed as: $data');

    // Emit to appropriate stream
    _linkStream.add(data);

    if (data.type == DeepLinkType.authCallback ||
        data.type == DeepLinkType.oauthCallback) {
      _authStream.add(data);

      // If we have auth tokens, try to set the session
      if (data.hasAuthTokens) {
        _handleAuthTokens(data);
      }
    }
  }

  /// Parse a deep link URI into structured data
  DeepLinkData _parseDeepLink(Uri uri) {
    // Extract fragment params (Supabase puts tokens in fragment)
    final fragmentParams = _parseFragment(uri.fragment);

    // Check for auth tokens in fragment
    final accessToken = fragmentParams['access_token'];
    final refreshToken = fragmentParams['refresh_token'];
    final error = fragmentParams['error'] ?? uri.queryParameters['error'];
    final errorDescription = fragmentParams['error_description'] ??
        uri.queryParameters['error_description'];

    // Determine link type
    DeepLinkType type;
    String? route;
    Map<String, String> params = {...uri.queryParameters, ...fragmentParams};

    // Check for auth callback patterns
    if (_isAuthCallback(uri)) {
      type = accessToken != null
          ? DeepLinkType.authCallback
          : (error != null ? DeepLinkType.authCallback : DeepLinkType.unknown);
    } else if (_isOAuthCallback(uri)) {
      type = DeepLinkType.oauthCallback;
    } else {
      type = DeepLinkType.navigation;
      route = _extractRoute(uri);
    }

    return DeepLinkData(
      type: type,
      uri: uri,
      route: route,
      params: params,
      accessToken: accessToken,
      refreshToken: refreshToken,
      error: error,
      errorDescription: errorDescription,
    );
  }

  /// Parse URL fragment into key-value pairs
  Map<String, String> _parseFragment(String fragment) {
    if (fragment.isEmpty) return {};

    final params = <String, String>{};
    final pairs = fragment.split('&');
    for (final pair in pairs) {
      final parts = pair.split('=');
      if (parts.length == 2) {
        params[Uri.decodeComponent(parts[0])] = Uri.decodeComponent(parts[1]);
      }
    }
    return params;
  }

  /// Check if URI is an auth callback
  bool _isAuthCallback(Uri uri) {
    // HTTPS auth callbacks
    if (uri.scheme == 'https' &&
        uri.host == 'coastalhavenpartners.com' &&
        uri.path.startsWith('/auth/callback')) {
      return true;
    }

    // Custom scheme auth callbacks
    if ((uri.scheme == 'coastalhaven' ||
            uri.scheme == 'com.coastalhavenpartners.android' ||
            uri.scheme == 'com.coastalhavenpartners.ios') &&
        (uri.host == 'auth' ||
            uri.host == 'login-callback' ||
            uri.path.contains('callback'))) {
      return true;
    }

    // Check for tokens in fragment (Supabase magic link pattern)
    if (uri.fragment.contains('access_token')) {
      return true;
    }

    return false;
  }

  /// Check if URI is an OAuth callback
  bool _isOAuthCallback(Uri uri) {
    // OAuth uses the login-callback host
    return (uri.scheme == 'com.coastalhavenpartners.android' ||
            uri.scheme == 'com.coastalhavenpartners.ios') &&
        uri.host == 'login-callback';
  }

  /// Extract navigation route from URI
  String? _extractRoute(Uri uri) {
    // For HTTPS links: https://coastalhavenpartners.com/app/candidate/profile
    if (uri.scheme == 'https' && uri.path.startsWith('/app')) {
      return uri.path.replaceFirst('/app', '');
    }

    // For custom scheme: coastalhaven://candidate/profile
    if (uri.scheme == 'coastalhaven') {
      // Combine host and path for full route
      final route = '/${uri.host}${uri.path}';
      return route == '/' ? null : route;
    }

    return uri.path.isEmpty ? null : uri.path;
  }

  /// Handle auth tokens from deep link
  Future<void> _handleAuthTokens(DeepLinkData data) async {
    if (!data.hasAuthTokens) return;

    try {
      final supabase = Supabase.instance.client;

      // Set the session from the tokens
      await supabase.auth.setSession(data.refreshToken!);

      debugPrint('DeepLinkService: Auth session set from deep link');
    } catch (e) {
      debugPrint('DeepLinkService: Error setting auth session: $e');
    }
  }

  /// Manually handle a URI string (for testing or manual invocation)
  void handleUri(String uriString) {
    try {
      final uri = Uri.parse(uriString);
      _handleIncomingLink(uri);
    } catch (e) {
      debugPrint('DeepLinkService: Error parsing URI: $e');
    }
  }

  /// Get the redirect URL for Supabase auth
  ///
  /// Use this when calling Supabase auth methods that need a redirect URL
  static String getAuthRedirectUrl() {
    // Using custom scheme for mobile
    return 'coastalhaven://auth/callback';
  }

  /// Get the redirect URL for OAuth providers
  static String getOAuthRedirectUrl() {
    // OAuth needs the package scheme for Android
    return 'com.coastalhavenpartners.android://login-callback';
  }

  /// Dispose of resources
  void dispose() {
    _linkStream.close();
    _authStream.close();
  }
}
