/// Typed result pattern for repository operations.
///
/// This replaces the anti-pattern of returning `null` or empty lists on errors,
/// which makes real issues (RLS, auth, network) look like "no data found".
///
/// Usage:
/// ```dart
/// final result = await repo.getFirmsDirectory(...);
/// switch (result) {
///   case Success(:final data, :final isFromCache):
///     // Use data, optionally show "cached" banner
///   case Failure(:final kind, :final message):
///     // Show appropriate error UI based on kind
/// }
/// ```
library;

/// The kind of failure that occurred.
enum FailureKind {
  /// No network connectivity
  offline,

  /// User not authenticated (401)
  auth,

  /// Permission denied / RLS violation (403)
  permission,

  /// Resource not found (404)
  notFound,

  /// Network request failed (timeout, DNS, etc.)
  network,

  /// Server error (500+)
  server,

  /// Unexpected error
  unknown,
}

/// Base sealed class for operation results.
sealed class Result<T> {
  const Result();

  /// Returns true if this is a successful result.
  bool get isSuccess => this is Success<T>;

  /// Returns true if this is a failure.
  bool get isFailure => this is Failure<T>;

  /// Returns the data if successful, otherwise null.
  T? get dataOrNull => switch (this) {
    Success(:final data) => data,
    Failure() => null,
  };

  /// Returns the data if successful, otherwise throws.
  T get dataOrThrow => switch (this) {
    Success(:final data) => data,
    Failure(:final message, :final error) =>
      throw Exception('$message${error != null ? ': $error' : ''}'),
  };

  /// Map over the success value.
  Result<R> map<R>(R Function(T data) transform) => switch (this) {
    Success(:final data, :final isFromCache) =>
      Success(transform(data), isFromCache: isFromCache),
    Failure(:final kind, :final message, :final error) =>
      Failure(kind, message, error),
  };

  /// Execute different callbacks based on result type.
  R when<R>({
    required R Function(T data, bool isFromCache) success,
    required R Function(FailureKind kind, String message, Object? error) failure,
  }) => switch (this) {
    Success(:final data, :final isFromCache) => success(data, isFromCache),
    Failure(:final kind, :final message, :final error) =>
      failure(kind, message, error),
  };

  /// Execute callback only on success.
  void onSuccess(void Function(T data, bool isFromCache) callback) {
    if (this case Success(:final data, :final isFromCache)) {
      callback(data, isFromCache);
    }
  }

  /// Execute callback only on failure.
  void onFailure(
    void Function(FailureKind kind, String message, Object? error) callback,
  ) {
    if (this case Failure(:final kind, :final message, :final error)) {
      callback(kind, message, error);
    }
  }
}

/// Successful result with data.
class Success<T> extends Result<T> {
  /// The successful data.
  final T data;

  /// Whether the data came from local cache (offline mode).
  final bool isFromCache;

  const Success(this.data, {this.isFromCache = false});

  @override
  String toString() =>
      'Success(data: $data${isFromCache ? ', isFromCache: true' : ''})';

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is Success<T> &&
          data == other.data &&
          isFromCache == other.isFromCache;

  @override
  int get hashCode => Object.hash(data, isFromCache);
}

/// Failed result with error information.
class Failure<T> extends Result<T> {
  /// The category of failure.
  final FailureKind kind;

  /// Human-readable error message.
  final String message;

  /// The original error/exception (for logging).
  final Object? error;

  const Failure(this.kind, this.message, [this.error]);

  @override
  String toString() => 'Failure($kind: $message${error != null ? ', error: $error' : ''})';

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is Failure<T> &&
          kind == other.kind &&
          message == other.message;

  @override
  int get hashCode => Object.hash(kind, message);

  /// Create an auth failure.
  static Failure<T> auth<T>([String message = 'Not authenticated']) =>
      Failure(FailureKind.auth, message);

  /// Create a permission failure.
  static Failure<T> permission<T>([String message = 'Permission denied']) =>
      Failure(FailureKind.permission, message);

  /// Create an offline failure.
  static Failure<T> offline<T>([String message = 'No internet connection']) =>
      Failure(FailureKind.offline, message);

  /// Create a network failure.
  static Failure<T> network<T>(Object error, [String? message]) =>
      Failure(FailureKind.network, message ?? 'Network request failed', error);

  /// Create a not found failure.
  static Failure<T> notFound<T>([String message = 'Not found']) =>
      Failure(FailureKind.notFound, message);

  /// Create a server failure.
  static Failure<T> server<T>(Object error, [String? message]) =>
      Failure(FailureKind.server, message ?? 'Server error', error);

  /// Create an unknown failure.
  static Failure<T> unknown<T>(Object error, [String? message]) =>
      Failure(FailureKind.unknown, message ?? 'An unexpected error occurred', error);
}

/// Extension to parse Supabase/PostgrestException errors into FailureKind.
extension FailureKindFromError on Object {
  /// Determine the FailureKind from an error object.
  FailureKind toFailureKind() {
    final errorStr = toString().toLowerCase();
    final runtimeType = this.runtimeType.toString().toLowerCase();

    // Check for auth errors
    if (errorStr.contains('jwt') ||
        errorStr.contains('token') ||
        errorStr.contains('unauthorized') ||
        errorStr.contains('401') ||
        errorStr.contains('not authenticated') ||
        runtimeType.contains('authexception')) {
      return FailureKind.auth;
    }

    // Check for permission errors (RLS)
    if (errorStr.contains('permission') ||
        errorStr.contains('forbidden') ||
        errorStr.contains('403') ||
        errorStr.contains('rls') ||
        errorStr.contains('policy')) {
      return FailureKind.permission;
    }

    // Check for not found
    if (errorStr.contains('not found') ||
        errorStr.contains('404') ||
        errorStr.contains('pgrst116')) {  // PostgREST "no rows returned"
      return FailureKind.notFound;
    }

    // Check for server errors
    if (errorStr.contains('500') ||
        errorStr.contains('502') ||
        errorStr.contains('503') ||
        errorStr.contains('internal server')) {
      return FailureKind.server;
    }

    // Check for network errors
    if (errorStr.contains('socket') ||
        errorStr.contains('timeout') ||
        errorStr.contains('connection') ||
        errorStr.contains('network') ||
        errorStr.contains('dns') ||
        errorStr.contains('unreachable')) {
      return FailureKind.network;
    }

    return FailureKind.unknown;
  }
}
