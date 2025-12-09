import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../../core/theme/app_colors.dart';
import '../../services/connectivity_service.dart';
import '../../services/sync_service.dart';

/// A banner that displays when the device is offline
/// Shows at the top of the screen with an animated slide-in effect
class OfflineBanner extends ConsumerWidget {
  const OfflineBanner({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final connectivityAsync = ref.watch(connectivityStatusProvider);
    final syncStatus = ref.watch(syncStatusProvider);

    return connectivityAsync.when(
      data: (status) {
        final isOffline = status == ConnectivityStatus.offline;
        final isSyncing = syncStatus.whenOrNull(
              data: (s) => s == SyncStatus.syncing,
            ) ??
            false;

        return AnimatedContainer(
          duration: const Duration(milliseconds: 300),
          curve: Curves.easeInOut,
          height: isOffline || isSyncing ? null : 0,
          child: AnimatedOpacity(
            duration: const Duration(milliseconds: 300),
            opacity: isOffline || isSyncing ? 1 : 0,
            child: Material(
              child: Container(
                width: double.infinity,
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    colors: isOffline
                        ? [Colors.orange.shade700, Colors.orange.shade800]
                        : [AppColors.teal, AppColors.emerald],
                  ),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withValues(alpha: 0.1),
                      blurRadius: 4,
                      offset: const Offset(0, 2),
                    ),
                  ],
                ),
                child: SafeArea(
                  bottom: false,
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      if (isOffline) ...[
                        const Icon(
                          LucideIcons.wifiOff,
                          size: 16,
                          color: Colors.white,
                        ),
                        const SizedBox(width: 8),
                        const Text(
                          'You\'re offline',
                          style: TextStyle(
                            color: Colors.white,
                            fontSize: 13,
                            fontWeight: FontWeight.w500,
                          ),
                        ),
                        const SizedBox(width: 4),
                        const Text(
                          '• Showing cached data',
                          style: TextStyle(
                            color: Colors.white70,
                            fontSize: 13,
                          ),
                        ),
                      ] else if (isSyncing) ...[
                        const SizedBox(
                          width: 14,
                          height: 14,
                          child: CircularProgressIndicator(
                            strokeWidth: 2,
                            valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                          ),
                        ),
                        const SizedBox(width: 8),
                        const Text(
                          'Syncing...',
                          style: TextStyle(
                            color: Colors.white,
                            fontSize: 13,
                            fontWeight: FontWeight.w500,
                          ),
                        ),
                      ],
                    ],
                  ),
                ),
              ),
            ),
          ),
        );
      },
      loading: () => const SizedBox.shrink(),
      error: (_, __) => const SizedBox.shrink(),
    );
  }
}

/// A more compact offline indicator for use in app bars
class OfflineIndicator extends ConsumerWidget {
  const OfflineIndicator({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final isOffline = ref.watch(isOfflineProvider);

    if (!isOffline) return const SizedBox.shrink();

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: Colors.orange.shade700,
        borderRadius: BorderRadius.circular(12),
      ),
      child: const Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(
            LucideIcons.wifiOff,
            size: 12,
            color: Colors.white,
          ),
          SizedBox(width: 4),
          Text(
            'Offline',
            style: TextStyle(
              color: Colors.white,
              fontSize: 11,
              fontWeight: FontWeight.w500,
            ),
          ),
        ],
      ),
    );
  }
}

/// Shows the sync status with pending operation count
class SyncStatusIndicator extends ConsumerWidget {
  const SyncStatusIndicator({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final syncStatus = ref.watch(syncStatusProvider);
    final pendingCount = ref.watch(pendingSyncCountProvider);

    return syncStatus.when(
      data: (status) {
        if (status == SyncStatus.idle) {
          return pendingCount.when(
            data: (count) {
              if (count == 0) return const SizedBox.shrink();

              return _buildIndicator(
                icon: LucideIcons.cloudOff,
                label: '$count pending',
                color: Colors.orange,
              );
            },
            loading: () => const SizedBox.shrink(),
            error: (_, __) => const SizedBox.shrink(),
          );
        }

        switch (status) {
          case SyncStatus.syncing:
            return _buildIndicator(
              icon: LucideIcons.refreshCw,
              label: 'Syncing',
              color: AppColors.teal,
              showSpinner: true,
            );
          case SyncStatus.error:
            return _buildIndicator(
              icon: LucideIcons.alertTriangle,
              label: 'Sync failed',
              color: Colors.red,
            );
          case SyncStatus.complete:
            return _buildIndicator(
              icon: LucideIcons.checkCircle,
              label: 'Synced',
              color: Colors.green,
            );
          default:
            return const SizedBox.shrink();
        }
      },
      loading: () => const SizedBox.shrink(),
      error: (_, __) => const SizedBox.shrink(),
    );
  }

  Widget _buildIndicator({
    required IconData icon,
    required String label,
    required Color color,
    bool showSpinner = false,
  }) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.15),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: color.withValues(alpha: 0.3)),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          if (showSpinner)
            SizedBox(
              width: 14,
              height: 14,
              child: CircularProgressIndicator(
                strokeWidth: 2,
                valueColor: AlwaysStoppedAnimation<Color>(color),
              ),
            )
          else
            Icon(icon, size: 14, color: color),
          const SizedBox(width: 6),
          Text(
            label,
            style: TextStyle(
              color: color,
              fontSize: 12,
              fontWeight: FontWeight.w500,
            ),
          ),
        ],
      ),
    );
  }
}

/// A builder widget that provides offline-aware UI capabilities
/// Allows showing different content based on connectivity status
class OfflineAwareBuilder extends ConsumerWidget {
  /// Builder for online state
  final Widget Function(BuildContext context) onlineBuilder;

  /// Builder for offline state (optional - defaults to showing onlineBuilder with overlay)
  final Widget Function(BuildContext context)? offlineBuilder;

  /// Whether to show an offline overlay instead of using offlineBuilder
  final bool showOfflineOverlay;

  /// Message to show in offline overlay
  final String? offlineMessage;

  const OfflineAwareBuilder({
    super.key,
    required this.onlineBuilder,
    this.offlineBuilder,
    this.showOfflineOverlay = false,
    this.offlineMessage,
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final isOffline = ref.watch(isOfflineProvider);

    if (isOffline && offlineBuilder != null) {
      return offlineBuilder!(context);
    }

    if (isOffline && showOfflineOverlay) {
      return Stack(
        children: [
          onlineBuilder(context),
          Positioned.fill(
            child: Container(
              color: Colors.black.withValues(alpha: 0.6),
              child: Center(
                child: Container(
                  margin: const EdgeInsets.all(32),
                  padding: const EdgeInsets.all(24),
                  decoration: BoxDecoration(
                    color: Theme.of(context).colorScheme.surface,
                    borderRadius: BorderRadius.circular(16),
                  ),
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      const Icon(
                        LucideIcons.wifiOff,
                        size: 48,
                        color: Colors.orange,
                      ),
                      const SizedBox(height: 16),
                      Text(
                        offlineMessage ?? 'You\'re offline',
                        style: Theme.of(context).textTheme.titleMedium,
                        textAlign: TextAlign.center,
                      ),
                      const SizedBox(height: 8),
                      Text(
                        'This feature requires an internet connection',
                        style: Theme.of(context).textTheme.bodySmall?.copyWith(
                              color: Colors.grey,
                            ),
                        textAlign: TextAlign.center,
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ),
        ],
      );
    }

    return onlineBuilder(context);
  }
}

/// A wrapper widget that blocks interactions when offline
/// Useful for forms or actions that require network
class OfflineBlocker extends ConsumerWidget {
  final Widget child;
  final String? message;
  final bool showMessage;

  const OfflineBlocker({
    super.key,
    required this.child,
    this.message,
    this.showMessage = true,
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final isOffline = ref.watch(isOfflineProvider);

    return AbsorbPointer(
      absorbing: isOffline,
      child: AnimatedOpacity(
        duration: const Duration(milliseconds: 200),
        opacity: isOffline ? 0.5 : 1.0,
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            child,
            if (isOffline && showMessage) ...[
              const SizedBox(height: 8),
              Text(
                message ?? 'This action requires an internet connection',
                style: TextStyle(
                  color: Colors.orange.shade700,
                  fontSize: 12,
                ),
                textAlign: TextAlign.center,
              ),
            ],
          ],
        ),
      ),
    );
  }
}

/// A floating action button that shows sync status
class SyncFab extends ConsumerWidget {
  final VoidCallback? onPressed;

  const SyncFab({super.key, this.onPressed});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final syncStatus = ref.watch(syncStatusProvider);
    final pendingCount = ref.watch(pendingSyncCountProvider);
    final isOffline = ref.watch(isOfflineProvider);

    final count = pendingCount.whenOrNull(data: (c) => c) ?? 0;
    final status = syncStatus.whenOrNull(data: (s) => s) ?? SyncStatus.idle;

    // Don't show if nothing to sync and online
    if (count == 0 && status == SyncStatus.idle && !isOffline) {
      return const SizedBox.shrink();
    }

    return FloatingActionButton.small(
      onPressed: isOffline
          ? null
          : () {
              SyncService.instance.syncPendingOperations();
              onPressed?.call();
            },
      backgroundColor: isOffline
          ? Colors.grey
          : status == SyncStatus.error
              ? Colors.red
              : AppColors.teal,
      child: status == SyncStatus.syncing
          ? const SizedBox(
              width: 20,
              height: 20,
              child: CircularProgressIndicator(
                strokeWidth: 2,
                valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
              ),
            )
          : Badge(
              isLabelVisible: count > 0,
              label: Text(count.toString()),
              child: Icon(
                isOffline
                    ? LucideIcons.cloudOff
                    : status == SyncStatus.error
                        ? LucideIcons.alertTriangle
                        : LucideIcons.refreshCw,
                size: 20,
              ),
            ),
    );
  }
}

/// A simple connection status dot indicator
class ConnectionStatusDot extends ConsumerWidget {
  final double size;

  const ConnectionStatusDot({super.key, this.size = 8});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final isOnline = ref.watch(isOnlineProvider);

    return Container(
      width: size,
      height: size,
      decoration: BoxDecoration(
        shape: BoxShape.circle,
        color: isOnline ? Colors.green : Colors.orange,
        boxShadow: [
          BoxShadow(
            color: (isOnline ? Colors.green : Colors.orange).withValues(alpha: 0.4),
            blurRadius: 4,
            spreadRadius: 1,
          ),
        ],
      ),
    );
  }
}

/// Shows a snackbar when connectivity changes
class ConnectivitySnackbarListener extends ConsumerWidget {
  final Widget child;

  const ConnectivitySnackbarListener({
    super.key,
    required this.child,
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    ref.listen<AsyncValue<ConnectivityStatus>>(
      connectivityStatusProvider,
      (previous, next) {
        final prevStatus = previous?.whenOrNull(data: (s) => s);
        final nextStatus = next.whenOrNull(data: (s) => s);

        if (prevStatus == null || nextStatus == null) return;

        // Only show snackbar on status change
        if (prevStatus == nextStatus) return;

        if (nextStatus == ConnectivityStatus.offline) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: const Row(
                children: [
                  Icon(LucideIcons.wifiOff, color: Colors.white, size: 18),
                  SizedBox(width: 12),
                  Text('You\'re offline. Changes will sync when back online.'),
                ],
              ),
              backgroundColor: Colors.orange.shade700,
              behavior: SnackBarBehavior.floating,
              duration: const Duration(seconds: 4),
            ),
          );
        } else if (nextStatus == ConnectivityStatus.online &&
            prevStatus == ConnectivityStatus.offline) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: const Row(
                children: [
                  Icon(LucideIcons.wifi, color: Colors.white, size: 18),
                  SizedBox(width: 12),
                  Text('Back online! Syncing your changes...'),
                ],
              ),
              backgroundColor: Colors.green,
              behavior: SnackBarBehavior.floating,
              duration: const Duration(seconds: 3),
            ),
          );
        }
      },
    );

    return child;
  }
}
