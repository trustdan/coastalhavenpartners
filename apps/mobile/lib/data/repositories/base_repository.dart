import 'package:supabase_flutter/supabase_flutter.dart';
import '../services/supabase_service.dart';
import '../../core/utils/app_debug.dart';
import '../../core/utils/result.dart';

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
  ///
  /// @deprecated Use [safeExecuteResult] instead for proper error handling.
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

  /// Execute a database operation and return a typed Result.
  ///
  /// This replaces `safeExecute` with `rethrowError: false` pattern which
  /// silently returns null/empty data on errors. With Result, callers can
  /// distinguish between: success, offline+cached, auth error, permission
  /// error, network error, etc.
  ///
  /// Usage:
  /// ```dart
  /// final result = await safeExecuteResult(
  ///   () async => fetchData(),
  ///   errorMessage: 'Error fetching data',
  /// );
  /// return switch (result) {
  ///   Success(:final data) => data,
  ///   Failure(:final kind, :final message) => handleError(kind, message),
  /// };
  /// ```
  Future<Result<T>> safeExecuteResult<T>(
    Future<T> Function() operation, {
    String? errorMessage,
  }) async {
    try {
      final data = await operation();
      return Success(data);
    } catch (e, st) {
      AppDebug.log(
        'repo',
        errorMessage ?? 'Repository error',
        error: e,
        stackTrace: st,
      );

      final kind = e.toFailureKind();
      final message = errorMessage ?? 'An error occurred';

      return Failure(kind, message, e);
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
