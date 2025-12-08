import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../services/connectivity_service.dart';
import '../services/sync_service.dart';

/// Widget that shows offline status and sync progress
class OfflineIndicator extends ConsumerWidget {
  const OfflineIndicator({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final isOffline = ref.watch(isOfflineProvider);
    final syncStatusAsync = ref.watch(syncStatusProvider);
    final pendingSyncsAsync = ref.watch(hasPendingSyncsProvider);

    final syncStatus = syncStatusAsync.when(
      data: (s) => s,
      loading: () => SyncStatus.idle,
      error: (_, __) => SyncStatus.idle,
    );
    final hasPending = pendingSyncsAsync.when(
      data: (p) => p,
      loading: () => false,
      error: (_, __) => false,
    );

    // Don't show anything if online and no pending syncs
    if (!isOffline && syncStatus != SyncStatus.syncing && !hasPending) {
      return const SizedBox.shrink();
    }

    return AnimatedContainer(
      duration: const Duration(milliseconds: 300),
      child: Material(
        color: _getBackgroundColor(isOffline, syncStatus),
        child: SafeArea(
          bottom: false,
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                _buildIcon(isOffline, syncStatus),
                const SizedBox(width: 8),
                Flexible(
                  child: Text(
                    _getMessage(isOffline, syncStatus, hasPending),
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 13,
                      fontWeight: FontWeight.w500,
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Color _getBackgroundColor(bool isOffline, SyncStatus? syncStatus) {
    if (isOffline) {
      return Colors.grey.shade700;
    }

    switch (syncStatus) {
      case SyncStatus.syncing:
        return Colors.blue.shade600;
      case SyncStatus.error:
        return Colors.orange.shade700;
      case SyncStatus.complete:
        return Colors.green.shade600;
      default:
        return Colors.grey.shade700;
    }
  }

  Widget _buildIcon(bool isOffline, SyncStatus? syncStatus) {
    if (isOffline) {
      return const Icon(Icons.cloud_off, color: Colors.white, size: 18);
    }

    switch (syncStatus) {
      case SyncStatus.syncing:
        return const SizedBox(
          width: 18,
          height: 18,
          child: CircularProgressIndicator(
            strokeWidth: 2,
            valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
          ),
        );
      case SyncStatus.error:
        return const Icon(Icons.warning_amber, color: Colors.white, size: 18);
      case SyncStatus.complete:
        return const Icon(Icons.check_circle, color: Colors.white, size: 18);
      default:
        return const Icon(Icons.sync, color: Colors.white, size: 18);
    }
  }

  String _getMessage(bool isOffline, SyncStatus? syncStatus, bool hasPending) {
    if (isOffline) {
      return hasPending
          ? 'Offline - Changes will sync when connected'
          : 'You are offline';
    }

    switch (syncStatus) {
      case SyncStatus.syncing:
        return 'Syncing changes...';
      case SyncStatus.error:
        return 'Some changes failed to sync';
      case SyncStatus.complete:
        return 'All changes synced';
      default:
        return hasPending ? 'Pending changes to sync' : '';
    }
  }
}

/// A banner that shows at the top of the app when offline
class OfflineBanner extends ConsumerWidget {
  final Widget child;

  const OfflineBanner({
    super.key,
    required this.child,
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Column(
      children: [
        const OfflineIndicator(),
        Expanded(child: child),
      ],
    );
  }
}

/// Wrapper that provides offline-aware functionality
class OfflineAwareScaffold extends ConsumerWidget {
  final PreferredSizeWidget? appBar;
  final Widget body;
  final Widget? floatingActionButton;
  final Widget? bottomNavigationBar;
  final bool showOfflineIndicator;

  const OfflineAwareScaffold({
    super.key,
    this.appBar,
    required this.body,
    this.floatingActionButton,
    this.bottomNavigationBar,
    this.showOfflineIndicator = true,
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Scaffold(
      appBar: appBar,
      body: showOfflineIndicator ? OfflineBanner(child: body) : body,
      floatingActionButton: floatingActionButton,
      bottomNavigationBar: bottomNavigationBar,
    );
  }
}

/// A widget that shows different content based on offline status
class OfflineContent extends ConsumerWidget {
  final Widget onlineContent;
  final Widget offlineContent;
  final Widget? loadingContent;

  const OfflineContent({
    super.key,
    required this.onlineContent,
    required this.offlineContent,
    this.loadingContent,
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final status = ref.watch(connectivityStatusProvider);

    return status.when(
      data: (connectivityStatus) {
        if (connectivityStatus == ConnectivityStatus.offline) {
          return offlineContent;
        }
        return onlineContent;
      },
      loading: () => loadingContent ?? onlineContent,
      error: (_, __) => offlineContent, // Assume offline on error
    );
  }
}

/// Badge showing pending sync count
class PendingSyncBadge extends ConsumerWidget {
  final Widget child;

  const PendingSyncBadge({
    super.key,
    required this.child,
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final pendingCount = ref.watch(pendingSyncCountProvider);

    return Stack(
      clipBehavior: Clip.none,
      children: [
        child,
        pendingCount.when(
          data: (count) {
            if (count == 0) return const SizedBox.shrink();
            return Positioned(
              right: -6,
              top: -6,
              child: Container(
                padding: const EdgeInsets.all(4),
                decoration: BoxDecoration(
                  color: Colors.orange,
                  borderRadius: BorderRadius.circular(10),
                ),
                constraints: const BoxConstraints(
                  minWidth: 18,
                  minHeight: 18,
                ),
                child: Text(
                  count > 99 ? '99+' : count.toString(),
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 10,
                    fontWeight: FontWeight.bold,
                  ),
                  textAlign: TextAlign.center,
                ),
              ),
            );
          },
          loading: () => const SizedBox.shrink(),
          error: (_, __) => const SizedBox.shrink(),
        ),
      ],
    );
  }
}
