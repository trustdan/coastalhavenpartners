import 'package:flutter/material.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_text_styles.dart';
import '../../core/theme/app_spacing.dart';
import '../magic_ui/shimmer_button.dart';

/// Reusable error state widget for displaying errors with retry option
class ErrorState extends StatelessWidget {
  /// The error message to display
  final String message;

  /// Optional title (defaults to "Something went wrong")
  final String? title;

  /// Optional icon (defaults to error icon)
  final IconData? icon;

  /// Optional icon color (defaults to error color)
  final Color? iconColor;

  /// Optional retry callback
  final VoidCallback? onRetry;

  /// Optional retry button text (defaults to "Try Again")
  final String retryText;

  /// Optional secondary action
  final Widget? secondaryAction;

  /// Compact mode for inline errors
  final bool compact;

  const ErrorState({
    super.key,
    required this.message,
    this.title,
    this.icon,
    this.iconColor,
    this.onRetry,
    this.retryText = 'Try Again',
    this.secondaryAction,
    this.compact = false,
  });

  /// Factory for network errors
  factory ErrorState.network({
    VoidCallback? onRetry,
    bool compact = false,
  }) {
    return ErrorState(
      title: 'No Connection',
      message: 'Please check your internet connection and try again.',
      icon: Icons.wifi_off_rounded,
      onRetry: onRetry,
      compact: compact,
    );
  }

  /// Factory for server errors
  factory ErrorState.server({
    VoidCallback? onRetry,
    bool compact = false,
  }) {
    return ErrorState(
      title: 'Server Error',
      message: 'We\'re having trouble connecting to our servers. Please try again later.',
      icon: Icons.cloud_off_rounded,
      onRetry: onRetry,
      compact: compact,
    );
  }

  /// Factory for permission denied errors
  factory ErrorState.permission({
    String? message,
    VoidCallback? onRetry,
    bool compact = false,
  }) {
    return ErrorState(
      title: 'Access Denied',
      message: message ?? 'You don\'t have permission to access this content.',
      icon: Icons.lock_outline_rounded,
      iconColor: AppColors.warning,
      onRetry: onRetry,
      compact: compact,
    );
  }

  /// Factory for timeout errors
  factory ErrorState.timeout({
    VoidCallback? onRetry,
    bool compact = false,
  }) {
    return ErrorState(
      title: 'Request Timeout',
      message: 'The request took too long. Please try again.',
      icon: Icons.timer_off_rounded,
      onRetry: onRetry,
      compact: compact,
    );
  }

  /// Factory for generic errors with custom message
  factory ErrorState.custom({
    required String title,
    required String message,
    IconData icon = Icons.error_outline_rounded,
    Color? iconColor,
    VoidCallback? onRetry,
    bool compact = false,
  }) {
    return ErrorState(
      title: title,
      message: message,
      icon: icon,
      iconColor: iconColor,
      onRetry: onRetry,
      compact: compact,
    );
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final effectiveIconColor = iconColor ?? AppColors.error;

    if (compact) {
      return _buildCompact(context, isDark, effectiveIconColor);
    }

    return _buildFull(context, isDark, effectiveIconColor);
  }

  Widget _buildCompact(BuildContext context, bool isDark, Color effectiveIconColor) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: effectiveIconColor.withValues(alpha: 0.1),
        borderRadius: AppRadius.card,
        border: Border.all(
          color: effectiveIconColor.withValues(alpha: 0.3),
        ),
      ),
      child: Row(
        children: [
          Icon(
            icon ?? Icons.error_outline_rounded,
            color: effectiveIconColor,
            size: 24,
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisSize: MainAxisSize.min,
              children: [
                if (title != null)
                  Text(
                    title!,
                    style: AppTextStyles.labelMedium.copyWith(
                      color: effectiveIconColor,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                Text(
                  message,
                  style: AppTextStyles.bodySmall.copyWith(
                    color: isDark ? Colors.white70 : Colors.black87,
                  ),
                ),
              ],
            ),
          ),
          if (onRetry != null) ...[
            const SizedBox(width: 12),
            IconButton(
              onPressed: onRetry,
              icon: const Icon(Icons.refresh_rounded),
              color: effectiveIconColor,
              tooltip: retryText,
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildFull(BuildContext context, bool isDark, Color effectiveIconColor) {
    return Center(
      child: Padding(
        padding: AppSpacing.screenPadding,
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          mainAxisSize: MainAxisSize.min,
          children: [
            // Icon with background
            Container(
              width: 80,
              height: 80,
              decoration: BoxDecoration(
                color: effectiveIconColor.withValues(alpha: 0.1),
                shape: BoxShape.circle,
              ),
              child: Icon(
                icon ?? Icons.error_outline_rounded,
                color: effectiveIconColor,
                size: 40,
              ),
            ),
            const SizedBox(height: 24),

            // Title
            if (title != null) ...[
              Text(
                title!,
                style: AppTextStyles.h3,
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 8),
            ],

            // Message
            Text(
              message,
              style: AppTextStyles.bodyMedium.copyWith(
                color: isDark ? Colors.white70 : Colors.black54,
              ),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 24),

            // Retry button
            if (onRetry != null)
              ShimmerButton(
                onPressed: onRetry!,
                text: retryText,
              ),

            // Secondary action
            if (secondaryAction != null) ...[
              const SizedBox(height: 12),
              secondaryAction!,
            ],
          ],
        ),
      ),
    );
  }
}

/// Inline error banner for forms and lists
class ErrorBanner extends StatelessWidget {
  final String message;
  final VoidCallback? onDismiss;
  final VoidCallback? onRetry;

  const ErrorBanner({
    super.key,
    required this.message,
    this.onDismiss,
    this.onRetry,
  });

  @override
  Widget build(BuildContext context) {
    return MaterialBanner(
      content: Text(message),
      leading: const Icon(
        Icons.error_outline_rounded,
        color: AppColors.error,
      ),
      backgroundColor: AppColors.error.withValues(alpha: 0.1),
      actions: [
        if (onRetry != null)
          TextButton(
            onPressed: onRetry,
            child: const Text('Retry'),
          ),
        if (onDismiss != null)
          TextButton(
            onPressed: onDismiss,
            child: const Text('Dismiss'),
          ),
      ],
    );
  }
}

/// Error dialog helper
class ErrorDialog {
  static Future<void> show(
    BuildContext context, {
    required String message,
    String? title,
    VoidCallback? onRetry,
  }) {
    return showDialog(
      context: context,
      builder: (context) => AlertDialog(
        icon: const Icon(
          Icons.error_outline_rounded,
          color: AppColors.error,
          size: 48,
        ),
        title: Text(title ?? 'Error'),
        content: Text(message),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('OK'),
          ),
          if (onRetry != null)
            FilledButton(
              onPressed: () {
                Navigator.pop(context);
                onRetry();
              },
              child: const Text('Retry'),
            ),
        ],
      ),
    );
  }
}
