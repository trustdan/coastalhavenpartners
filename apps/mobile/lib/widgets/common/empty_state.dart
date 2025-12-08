import 'package:flutter/material.dart';
import '../../core/theme/app_text_styles.dart';
import '../../core/theme/app_spacing.dart';
import '../magic_ui/shimmer_button.dart';

/// Reusable empty state widget for displaying when there's no content
class EmptyState extends StatelessWidget {
  /// The message to display
  final String message;

  /// Optional title
  final String? title;

  /// Optional icon (defaults to inbox icon)
  final IconData? icon;

  /// Optional icon color (defaults to muted color)
  final Color? iconColor;

  /// Optional action callback
  final VoidCallback? onAction;

  /// Optional action button text
  final String? actionText;

  /// Optional secondary action widget
  final Widget? secondaryAction;

  /// Compact mode for inline empty states
  final bool compact;

  /// Custom illustration widget (replaces icon)
  final Widget? illustration;

  const EmptyState({
    super.key,
    required this.message,
    this.title,
    this.icon,
    this.iconColor,
    this.onAction,
    this.actionText,
    this.secondaryAction,
    this.compact = false,
    this.illustration,
  });

  /// Factory for empty search results
  factory EmptyState.noSearchResults({
    String? query,
    VoidCallback? onClearSearch,
    bool compact = false,
  }) {
    return EmptyState(
      title: 'No Results Found',
      message: query != null
          ? 'No results found for "$query". Try adjusting your search.'
          : 'No results match your search criteria.',
      icon: Icons.search_off_rounded,
      onAction: onClearSearch,
      actionText: 'Clear Search',
      compact: compact,
    );
  }

  /// Factory for empty messages/inbox
  factory EmptyState.noMessages({
    VoidCallback? onCompose,
    bool compact = false,
  }) {
    return EmptyState(
      title: 'No Messages Yet',
      message: 'When you receive messages, they\'ll appear here.',
      icon: Icons.chat_bubble_outline_rounded,
      onAction: onCompose,
      actionText: 'Start a Conversation',
      compact: compact,
    );
  }

  /// Factory for empty notifications
  factory EmptyState.noNotifications({
    bool compact = false,
  }) {
    return EmptyState(
      title: 'All Caught Up!',
      message: 'You have no new notifications.',
      icon: Icons.notifications_off_outlined,
      compact: compact,
    );
  }

  /// Factory for empty job listings
  factory EmptyState.noJobs({
    VoidCallback? onRefresh,
    bool compact = false,
  }) {
    return EmptyState(
      title: 'No Jobs Available',
      message: 'There are no open positions matching your criteria right now. Check back later!',
      icon: Icons.work_off_outlined,
      onAction: onRefresh,
      actionText: 'Refresh',
      compact: compact,
    );
  }

  /// Factory for empty applications
  factory EmptyState.noApplications({
    VoidCallback? onBrowseJobs,
    bool compact = false,
  }) {
    return EmptyState(
      title: 'No Applications Yet',
      message: 'Start applying to positions to track your applications here.',
      icon: Icons.assignment_outlined,
      onAction: onBrowseJobs,
      actionText: 'Browse Jobs',
      compact: compact,
    );
  }

  /// Factory for empty candidates (recruiter)
  factory EmptyState.noCandidates({
    VoidCallback? onAdjustFilters,
    bool compact = false,
  }) {
    return EmptyState(
      title: 'No Candidates Found',
      message: 'No candidates match your current filters. Try broadening your search criteria.',
      icon: Icons.person_search_outlined,
      onAction: onAdjustFilters,
      actionText: 'Adjust Filters',
      compact: compact,
    );
  }

  /// Factory for empty saved/bookmarks
  factory EmptyState.noSaved({
    String? itemType,
    VoidCallback? onBrowse,
    bool compact = false,
  }) {
    final type = itemType ?? 'items';
    return EmptyState(
      title: 'No Saved $type',
      message: 'Items you save will appear here for easy access.',
      icon: Icons.bookmark_border_rounded,
      onAction: onBrowse,
      actionText: 'Browse $type',
      compact: compact,
    );
  }

  /// Factory for empty campaigns
  factory EmptyState.noCampaigns({
    VoidCallback? onCreate,
    bool compact = false,
  }) {
    return EmptyState(
      title: 'No Campaigns Yet',
      message: 'Create your first outreach campaign to connect with candidates.',
      icon: Icons.campaign_outlined,
      onAction: onCreate,
      actionText: 'Create Campaign',
      compact: compact,
    );
  }

  /// Factory for no data available
  factory EmptyState.noData({
    String? customMessage,
    VoidCallback? onRetry,
    bool compact = false,
  }) {
    return EmptyState(
      title: 'No Data',
      message: customMessage ?? 'There\'s nothing to display here yet.',
      icon: Icons.inbox_outlined,
      onAction: onRetry,
      actionText: onRetry != null ? 'Refresh' : null,
      compact: compact,
    );
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final effectiveIconColor = iconColor ??
        (isDark ? Colors.white38 : Colors.black26);

    if (compact) {
      return _buildCompact(context, isDark, effectiveIconColor);
    }

    return _buildFull(context, isDark, effectiveIconColor);
  }

  Widget _buildCompact(BuildContext context, bool isDark, Color effectiveIconColor) {
    return Container(
      padding: const EdgeInsets.all(24),
      child: Row(
        children: [
          if (illustration != null)
            illustration!
          else
            Icon(
              icon ?? Icons.inbox_outlined,
              color: effectiveIconColor,
              size: 32,
            ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisSize: MainAxisSize.min,
              children: [
                if (title != null)
                  Text(
                    title!,
                    style: AppTextStyles.labelMedium.copyWith(
                      color: isDark ? Colors.white70 : Colors.black87,
                    ),
                  ),
                Text(
                  message,
                  style: AppTextStyles.bodySmall.copyWith(
                    color: isDark ? Colors.white54 : Colors.black54,
                  ),
                ),
              ],
            ),
          ),
          if (onAction != null && actionText != null) ...[
            const SizedBox(width: 12),
            TextButton(
              onPressed: onAction,
              child: Text(actionText!),
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
            // Illustration or Icon
            if (illustration != null)
              illustration!
            else
              Container(
                width: 100,
                height: 100,
                decoration: BoxDecoration(
                  color: effectiveIconColor.withValues(alpha: 0.1),
                  shape: BoxShape.circle,
                ),
                child: Icon(
                  icon ?? Icons.inbox_outlined,
                  color: effectiveIconColor,
                  size: 48,
                ),
              ),
            const SizedBox(height: 24),

            // Title
            if (title != null) ...[
              Text(
                title!,
                style: AppTextStyles.h3.copyWith(
                  color: isDark ? Colors.white : Colors.black87,
                ),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 8),
            ],

            // Message
            Text(
              message,
              style: AppTextStyles.bodyMedium.copyWith(
                color: isDark ? Colors.white54 : Colors.black54,
              ),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 24),

            // Action button
            if (onAction != null && actionText != null)
              ShimmerButton(
                onPressed: onAction!,
                text: actionText!,
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

/// A simple placeholder for when content is loading or empty
class PlaceholderContent extends StatelessWidget {
  final IconData icon;
  final String text;
  final Color? color;

  const PlaceholderContent({
    super.key,
    required this.icon,
    required this.text,
    this.color,
  });

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final effectiveColor = color ?? (isDark ? Colors.white38 : Colors.black26);

    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            icon,
            size: 64,
            color: effectiveColor,
          ),
          const SizedBox(height: 16),
          Text(
            text,
            style: AppTextStyles.bodyMedium.copyWith(
              color: effectiveColor,
            ),
            textAlign: TextAlign.center,
          ),
        ],
      ),
    );
  }
}

/// Empty state specifically for lists with pull-to-refresh
class EmptyListState extends StatelessWidget {
  final String title;
  final String message;
  final IconData icon;
  final VoidCallback? onRefresh;

  const EmptyListState({
    super.key,
    required this.title,
    required this.message,
    this.icon = Icons.inbox_outlined,
    this.onRefresh,
  });

  @override
  Widget build(BuildContext context) {
    return LayoutBuilder(
      builder: (context, constraints) {
        return SingleChildScrollView(
          physics: const AlwaysScrollableScrollPhysics(),
          child: ConstrainedBox(
            constraints: BoxConstraints(
              minHeight: constraints.maxHeight,
            ),
            child: EmptyState(
              title: title,
              message: message,
              icon: icon,
              onAction: onRefresh,
              actionText: onRefresh != null ? 'Refresh' : null,
            ),
          ),
        );
      },
    );
  }
}
