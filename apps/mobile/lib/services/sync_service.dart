import 'dart:async';
import 'dart:convert';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import '../data/local/database.dart';
import 'connectivity_service.dart';

/// Sync operation types
enum SyncOperationType {
  create,
  update,
  delete,
}

/// Sync status for tracking
enum SyncStatus {
  idle,
  syncing,
  error,
  complete,
}

/// Sync result for a single operation
class SyncResult {
  final bool success;
  final String? error;
  final int operationId;

  SyncResult({
    required this.success,
    this.error,
    required this.operationId,
  });
}

/// Service to handle offline sync operations
class SyncService {
  SyncService._();

  static final SyncService _instance = SyncService._();
  static SyncService get instance => _instance;

  final AppDatabase _db = AppDatabase();
  Timer? _syncTimer;
  bool _isSyncing = false;

  final StreamController<SyncStatus> _statusController =
      StreamController<SyncStatus>.broadcast();

  /// Stream of sync status changes
  Stream<SyncStatus> get statusStream => _statusController.stream;

  /// Whether sync is currently in progress
  bool get isSyncing => _isSyncing;

  /// Initialize the sync service
  void initialize() {
    // Listen for connectivity changes
    ConnectivityService.instance.statusStream.listen((status) {
      if (status == ConnectivityStatus.online) {
        // When coming online, trigger sync
        syncPendingOperations();
      }
    });

    // Start periodic sync timer (every 30 seconds when online)
    _syncTimer = Timer.periodic(const Duration(seconds: 30), (_) {
      if (ConnectivityService.instance.isOnline && !_isSyncing) {
        syncPendingOperations();
      }
    });
  }

  /// Add a create operation to the sync queue
  Future<void> queueCreate({
    required String entityTable,
    required String recordId,
    required Map<String, dynamic> data,
  }) async {
    await _db.addToSyncQueue(
      operationType: 'create',
      entityTable: entityTable,
      recordId: recordId,
      payload: data,
    );

    // If online, trigger immediate sync
    if (ConnectivityService.instance.isOnline) {
      syncPendingOperations();
    }
  }

  /// Add an update operation to the sync queue
  Future<void> queueUpdate({
    required String entityTable,
    required String recordId,
    required Map<String, dynamic> data,
  }) async {
    await _db.addToSyncQueue(
      operationType: 'update',
      entityTable: entityTable,
      recordId: recordId,
      payload: data,
    );

    if (ConnectivityService.instance.isOnline) {
      syncPendingOperations();
    }
  }

  /// Add a delete operation to the sync queue
  Future<void> queueDelete({
    required String entityTable,
    required String recordId,
  }) async {
    await _db.addToSyncQueue(
      operationType: 'delete',
      entityTable: entityTable,
      recordId: recordId,
      payload: {},
    );

    if (ConnectivityService.instance.isOnline) {
      syncPendingOperations();
    }
  }

  /// Sync all pending operations
  Future<List<SyncResult>> syncPendingOperations() async {
    if (_isSyncing) return [];
    if (!ConnectivityService.instance.isOnline) return [];

    _isSyncing = true;
    _statusController.add(SyncStatus.syncing);

    final results = <SyncResult>[];

    try {
      final operations = await _db.getPendingSyncOperations();

      for (final op in operations) {
        final result = await _syncOperation(op);
        results.add(result);
      }

      _statusController.add(
        results.every((r) => r.success) ? SyncStatus.complete : SyncStatus.error,
      );
    } catch (e) {
      _statusController.add(SyncStatus.error);
    } finally {
      _isSyncing = false;

      // After a short delay, reset to idle
      Future.delayed(const Duration(seconds: 2), () {
        _statusController.add(SyncStatus.idle);
      });
    }

    return results;
  }

  Future<SyncResult> _syncOperation(SyncQueueData op) async {
    try {
      final supabase = Supabase.instance.client;
      final payload = jsonDecode(op.payload) as Map<String, dynamic>;

      switch (op.operationType) {
        case 'create':
          await supabase.from(op.entityTable).insert(payload);
          break;
        case 'update':
          await supabase
              .from(op.entityTable)
              .update(payload)
              .eq('id', op.recordId);
          break;
        case 'delete':
          await supabase.from(op.entityTable).delete().eq('id', op.recordId);
          break;
      }

      // Success - remove from queue
      await _db.removeSyncOperation(op.id);

      return SyncResult(success: true, operationId: op.id);
    } catch (e) {
      // Mark attempt and record error
      await _db.markSyncAttempt(op.id, error: e.toString());

      return SyncResult(
        success: false,
        error: e.toString(),
        operationId: op.id,
      );
    }
  }

  /// Get count of pending sync operations
  Future<int> getPendingCount() async {
    return _db.getPendingSyncCount();
  }

  /// Clear all pending operations (use with caution)
  Future<void> clearPendingOperations() async {
    final operations = await _db.getPendingSyncOperations();
    for (final op in operations) {
      await _db.removeSyncOperation(op.id);
    }
  }

  /// Dispose the service
  void dispose() {
    _syncTimer?.cancel();
    _statusController.close();
  }
}

// =============================================================================
// RIVERPOD PROVIDERS
// =============================================================================

/// Provider for sync service instance
final syncServiceProvider = Provider<SyncService>((ref) {
  return SyncService.instance;
});

/// Provider for sync status stream
final syncStatusProvider = StreamProvider<SyncStatus>((ref) {
  final service = ref.watch(syncServiceProvider);
  return service.statusStream;
});

/// Provider for pending sync count
final pendingSyncCountProvider = FutureProvider<int>((ref) async {
  final service = ref.watch(syncServiceProvider);
  return service.getPendingCount();
});

/// Provider to check if there are pending syncs
final hasPendingSyncsProvider = FutureProvider<bool>((ref) async {
  final count = await ref.watch(pendingSyncCountProvider.future);
  return count > 0;
});
