import 'package:flutter/foundation.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

/// Local storage service for app preferences and secure data
/// Uses flutter_secure_storage for encrypted storage
class LocalStorageService {
  LocalStorageService._();

  static LocalStorageService? _instance;
  static LocalStorageService get instance =>
      _instance ??= LocalStorageService._();

  // Storage keys
  static const String _keyOnboardingComplete = 'onboarding_complete';
  static const String _keyRememberEmail = 'remember_email';
  static const String _keySavedEmail = 'saved_email';
  static const String _keyThemeMode = 'theme_mode';
  static const String _keyUserRole = 'user_role';
  // Reserved for future use: device_id
  static const String _keyMfaTrustedDevice = 'mfa_trusted_device';
  static const String _keyLastLoginTime = 'last_login_time';

  late FlutterSecureStorage _storage;
  bool _isInitialized = false;

  /// Initialize the storage service
  Future<void> initialize() async {
    if (_isInitialized) return;

    // Configure secure storage with platform-specific options
    const androidOptions = AndroidOptions(
      encryptedSharedPreferences: true,
    );
    const iosOptions = IOSOptions(
      accessibility: KeychainAccessibility.first_unlock_this_device,
    );

    _storage = const FlutterSecureStorage(
      aOptions: androidOptions,
      iOptions: iosOptions,
    );

    _isInitialized = true;
    debugPrint('LocalStorageService initialized');
  }

  void _checkInitialized() {
    if (!_isInitialized) {
      throw Exception(
        'LocalStorageService not initialized. Call initialize() first.',
      );
    }
  }

  // ============================================
  // Onboarding
  // ============================================

  /// Check if user has completed onboarding
  Future<bool> hasCompletedOnboarding() async {
    _checkInitialized();
    final value = await _storage.read(key: _keyOnboardingComplete);
    return value == 'true';
  }

  /// Mark onboarding as complete
  Future<void> setOnboardingComplete(bool complete) async {
    _checkInitialized();
    await _storage.write(
      key: _keyOnboardingComplete,
      value: complete.toString(),
    );
  }

  // ============================================
  // Remember Me (Login)
  // ============================================

  /// Check if "remember me" is enabled
  Future<bool> isRememberMeEnabled() async {
    _checkInitialized();
    final value = await _storage.read(key: _keyRememberEmail);
    return value == 'true';
  }

  /// Set "remember me" preference
  Future<void> setRememberMe(bool enabled) async {
    _checkInitialized();
    await _storage.write(
      key: _keyRememberEmail,
      value: enabled.toString(),
    );
  }

  /// Get saved email (if remember me is enabled)
  Future<String?> getSavedEmail() async {
    _checkInitialized();
    if (await isRememberMeEnabled()) {
      return _storage.read(key: _keySavedEmail);
    }
    return null;
  }

  /// Save email for remember me
  Future<void> saveEmail(String email) async {
    _checkInitialized();
    await _storage.write(key: _keySavedEmail, value: email);
  }

  /// Clear saved email
  Future<void> clearSavedEmail() async {
    _checkInitialized();
    await _storage.delete(key: _keySavedEmail);
  }

  // ============================================
  // Theme
  // ============================================

  /// Get saved theme mode ('light', 'dark', or 'system')
  Future<String> getThemeMode() async {
    _checkInitialized();
    final value = await _storage.read(key: _keyThemeMode);
    return value ?? 'system';
  }

  /// Save theme mode preference
  Future<void> setThemeMode(String mode) async {
    _checkInitialized();
    await _storage.write(key: _keyThemeMode, value: mode);
  }

  // ============================================
  // User Role (for quick routing)
  // ============================================

  /// Get cached user role
  Future<String?> getCachedUserRole() async {
    _checkInitialized();
    return _storage.read(key: _keyUserRole);
  }

  /// Cache user role for faster routing
  Future<void> cacheUserRole(String role) async {
    _checkInitialized();
    await _storage.write(key: _keyUserRole, value: role);
  }

  /// Clear cached user role
  Future<void> clearCachedUserRole() async {
    _checkInitialized();
    await _storage.delete(key: _keyUserRole);
  }

  // ============================================
  // MFA Trusted Device
  // ============================================

  /// Check if device is trusted for MFA (skip MFA for 30 days)
  Future<bool> isMfaTrustedDevice() async {
    _checkInitialized();
    final trustedUntil = await _storage.read(key: _keyMfaTrustedDevice);
    if (trustedUntil == null) return false;

    try {
      final expiry = DateTime.parse(trustedUntil);
      return DateTime.now().isBefore(expiry);
    } catch (e) {
      return false;
    }
  }

  /// Mark device as trusted for MFA (30 days)
  Future<void> trustDeviceForMfa() async {
    _checkInitialized();
    final expiry = DateTime.now().add(const Duration(days: 30));
    await _storage.write(
      key: _keyMfaTrustedDevice,
      value: expiry.toIso8601String(),
    );
  }

  /// Clear MFA device trust
  Future<void> clearMfaTrust() async {
    _checkInitialized();
    await _storage.delete(key: _keyMfaTrustedDevice);
  }

  // ============================================
  // Last Login Time
  // ============================================

  /// Get last login time
  Future<DateTime?> getLastLoginTime() async {
    _checkInitialized();
    final value = await _storage.read(key: _keyLastLoginTime);
    if (value == null) return null;
    try {
      return DateTime.parse(value);
    } catch (e) {
      return null;
    }
  }

  /// Record login time
  Future<void> recordLoginTime() async {
    _checkInitialized();
    await _storage.write(
      key: _keyLastLoginTime,
      value: DateTime.now().toIso8601String(),
    );
  }

  // ============================================
  // Clear All Data
  // ============================================

  /// Clear all stored data (for logout)
  Future<void> clearAll() async {
    _checkInitialized();
    await _storage.deleteAll();
    debugPrint('LocalStorageService: All data cleared');
  }

  /// Clear user-specific data but keep preferences
  Future<void> clearUserData() async {
    _checkInitialized();
    await _storage.delete(key: _keyUserRole);
    await _storage.delete(key: _keyMfaTrustedDevice);
    await _storage.delete(key: _keyLastLoginTime);
    debugPrint('LocalStorageService: User data cleared');
  }
}
