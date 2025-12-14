import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../data/services/local_storage_service.dart';

/// Provider for the current theme mode
final themeModeProvider = NotifierProvider<ThemeModeNotifier, ThemeMode>(() {
  return ThemeModeNotifier();
});

/// Notifier that manages theme mode state and persistence
class ThemeModeNotifier extends Notifier<ThemeMode> {
  final _storage = LocalStorageService.instance;

  @override
  ThemeMode build() {
    // Load saved theme asynchronously
    _loadTheme();
    // Default to dark while loading
    return ThemeMode.dark;
  }

  /// Load saved theme from storage
  Future<void> _loadTheme() async {
    try {
      final savedMode = await _storage.getThemeMode();
      state = _stringToThemeMode(savedMode);
    } catch (e) {
      // Keep default dark mode on error
      debugPrint('Error loading theme: $e');
    }
  }

  /// Set and persist theme mode
  Future<void> setThemeMode(ThemeMode mode) async {
    state = mode;
    await _storage.setThemeMode(_themeModeToString(mode));
  }

  /// Convert string to ThemeMode
  ThemeMode _stringToThemeMode(String mode) {
    switch (mode) {
      case 'light':
        return ThemeMode.light;
      case 'dark':
        return ThemeMode.dark;
      case 'system':
      default:
        return ThemeMode.system;
    }
  }

  /// Convert ThemeMode to string
  String _themeModeToString(ThemeMode mode) {
    switch (mode) {
      case ThemeMode.light:
        return 'light';
      case ThemeMode.dark:
        return 'dark';
      case ThemeMode.system:
        return 'system';
    }
  }
}
