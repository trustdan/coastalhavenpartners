import 'package:supabase_flutter/supabase_flutter.dart';
import '../services/supabase_service.dart';
import '../../core/utils/app_debug.dart';

/// Base repository with common Supabase operations
abstract class BaseRepository {
  /// Get the Supabase client
  SupabaseClient? get client => SupabaseService.instance.client;

  /// Get current user ID
  String? get currentUserId => client?.auth.currentUser?.id;

  /// Check if Supabase is available
  bool get isAvailable => client != null;

  /// Safely execute a database operation with error handling
  /// Returns null on error, rethrows if needed
  Future<T?> safeExecute<T>(
    Future<T?> Function() operation, {
    String? errorMessage,
    bool rethrowError = true,
  }) async {
    try {
      return await operation();
    } catch (e, st) {
      AppDebug.log(
        'repo',
        errorMessage ?? 'Repository error',
        error: e,
        stackTrace: st,
      );
      if (rethrowError) rethrow;
      return null;
    }
  }

  /// Query a table
  SupabaseQueryBuilder table(String name) {
    if (client == null) {
      throw Exception('Supabase not initialized');
    }
    return client!.from(name);
  }
}
