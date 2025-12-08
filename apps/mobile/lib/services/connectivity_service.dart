import 'dart:async';
import 'package:connectivity_plus/connectivity_plus.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

/// Connectivity status enum
enum ConnectivityStatus {
  online,
  offline,
  unknown,
}

/// Service to monitor network connectivity
class ConnectivityService {
  ConnectivityService._();

  static final ConnectivityService _instance = ConnectivityService._();
  static ConnectivityService get instance => _instance;

  final Connectivity _connectivity = Connectivity();
  final StreamController<ConnectivityStatus> _statusController =
      StreamController<ConnectivityStatus>.broadcast();

  ConnectivityStatus _currentStatus = ConnectivityStatus.unknown;
  StreamSubscription<List<ConnectivityResult>>? _subscription;

  /// Current connectivity status
  ConnectivityStatus get currentStatus => _currentStatus;

  /// Stream of connectivity status changes
  Stream<ConnectivityStatus> get statusStream => _statusController.stream;

  /// Whether the device is currently online
  bool get isOnline => _currentStatus == ConnectivityStatus.online;

  /// Whether the device is currently offline
  bool get isOffline => _currentStatus == ConnectivityStatus.offline;

  /// Initialize the connectivity service
  Future<void> initialize() async {
    // Get initial status
    final results = await _connectivity.checkConnectivity();
    _updateStatus(results);

    // Listen for changes
    _subscription = _connectivity.onConnectivityChanged.listen(_updateStatus);
  }

  void _updateStatus(List<ConnectivityResult> results) {
    final newStatus = _mapResultsToStatus(results);

    if (newStatus != _currentStatus) {
      _currentStatus = newStatus;
      _statusController.add(_currentStatus);
    }
  }

  ConnectivityStatus _mapResultsToStatus(List<ConnectivityResult> results) {
    if (results.isEmpty || results.contains(ConnectivityResult.none)) {
      return ConnectivityStatus.offline;
    }

    // If any connection is available, we're online
    if (results.any((r) =>
        r == ConnectivityResult.wifi ||
        r == ConnectivityResult.mobile ||
        r == ConnectivityResult.ethernet)) {
      return ConnectivityStatus.online;
    }

    return ConnectivityStatus.unknown;
  }

  /// Check current connectivity (force refresh)
  Future<ConnectivityStatus> checkConnectivity() async {
    final results = await _connectivity.checkConnectivity();
    _updateStatus(results);
    return _currentStatus;
  }

  /// Dispose the service
  void dispose() {
    _subscription?.cancel();
    _statusController.close();
  }
}

// =============================================================================
// RIVERPOD PROVIDERS
// =============================================================================

/// Provider for connectivity service instance
final connectivityServiceProvider = Provider<ConnectivityService>((ref) {
  return ConnectivityService.instance;
});

/// Provider for current connectivity status
final connectivityStatusProvider = StreamProvider<ConnectivityStatus>((ref) {
  final service = ref.watch(connectivityServiceProvider);
  return service.statusStream;
});

/// Provider for checking if device is online
final isOnlineProvider = Provider<bool>((ref) {
  final status = ref.watch(connectivityStatusProvider);
  return status.when(
    data: (s) => s == ConnectivityStatus.online,
    loading: () => true, // Assume online while loading
    error: (_, __) => false,
  );
});

/// Provider for checking if device is offline
final isOfflineProvider = Provider<bool>((ref) {
  final status = ref.watch(connectivityStatusProvider);
  return status.when(
    data: (s) => s == ConnectivityStatus.offline,
    loading: () => false,
    error: (_, __) => true, // Assume offline on error
  );
});
