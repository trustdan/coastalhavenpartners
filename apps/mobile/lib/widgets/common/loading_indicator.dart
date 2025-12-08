import 'package:flutter/material.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_text_styles.dart';

/// Reusable loading indicator widget with various styles
class LoadingIndicator extends StatelessWidget {
  /// Optional message to display
  final String? message;

  /// Size of the indicator
  final LoadingSize size;

  /// Color of the indicator (defaults to teal)
  final Color? color;

  /// Whether to show a background overlay
  final bool overlay;

  const LoadingIndicator({
    super.key,
    this.message,
    this.size = LoadingSize.medium,
    this.color,
    this.overlay = false,
  });

  /// Factory for a full-screen loading overlay
  factory LoadingIndicator.fullScreen({
    String? message,
    Color? color,
  }) {
    return LoadingIndicator(
      message: message,
      size: LoadingSize.large,
      color: color,
      overlay: true,
    );
  }

  /// Factory for inline loading
  factory LoadingIndicator.inline({
    String? message,
    Color? color,
  }) {
    return LoadingIndicator(
      message: message,
      size: LoadingSize.small,
      color: color,
    );
  }

  @override
  Widget build(BuildContext context) {
    final effectiveColor = color ?? AppColors.teal;
    final indicatorSize = _getIndicatorSize();
    final strokeWidth = _getStrokeWidth();

    Widget indicator = SizedBox(
      width: indicatorSize,
      height: indicatorSize,
      child: CircularProgressIndicator(
        strokeWidth: strokeWidth,
        valueColor: AlwaysStoppedAnimation<Color>(effectiveColor),
      ),
    );

    if (message != null) {
      indicator = Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          indicator,
          SizedBox(height: size == LoadingSize.small ? 8 : 16),
          Text(
            message!,
            style: size == LoadingSize.small
                ? AppTextStyles.caption
                : AppTextStyles.bodyMedium,
            textAlign: TextAlign.center,
          ),
        ],
      );
    }

    if (overlay) {
      return Container(
        color: Colors.black54,
        child: Center(
          child: Container(
            padding: const EdgeInsets.all(24),
            decoration: BoxDecoration(
              color: Theme.of(context).scaffoldBackgroundColor,
              borderRadius: BorderRadius.circular(16),
            ),
            child: indicator,
          ),
        ),
      );
    }

    return Center(child: indicator);
  }

  double _getIndicatorSize() {
    switch (size) {
      case LoadingSize.small:
        return 20;
      case LoadingSize.medium:
        return 36;
      case LoadingSize.large:
        return 48;
    }
  }

  double _getStrokeWidth() {
    switch (size) {
      case LoadingSize.small:
        return 2;
      case LoadingSize.medium:
        return 3;
      case LoadingSize.large:
        return 4;
    }
  }
}

/// Loading size options
enum LoadingSize { small, medium, large }

/// A button with loading state
class LoadingButton extends StatelessWidget {
  final VoidCallback? onPressed;
  final String text;
  final bool isLoading;
  final bool isPrimary;
  final IconData? icon;

  const LoadingButton({
    super.key,
    required this.onPressed,
    required this.text,
    this.isLoading = false,
    this.isPrimary = true,
    this.icon,
  });

  @override
  Widget build(BuildContext context) {
    final child = isLoading
        ? const SizedBox(
            width: 20,
            height: 20,
            child: CircularProgressIndicator(
              strokeWidth: 2,
              valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
            ),
          )
        : Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              if (icon != null) ...[
                Icon(icon, size: 18),
                const SizedBox(width: 8),
              ],
              Text(text),
            ],
          );

    if (isPrimary) {
      return FilledButton(
        onPressed: isLoading ? null : onPressed,
        child: child,
      );
    }

    return OutlinedButton(
      onPressed: isLoading ? null : onPressed,
      child: child,
    );
  }
}

/// Linear progress indicator with label
class ProgressIndicatorWithLabel extends StatelessWidget {
  final double value;
  final String? label;
  final Color? color;
  final Color? backgroundColor;

  const ProgressIndicatorWithLabel({
    super.key,
    required this.value,
    this.label,
    this.color,
    this.backgroundColor,
  });

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      mainAxisSize: MainAxisSize.min,
      children: [
        if (label != null) ...[
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                label!,
                style: AppTextStyles.caption,
              ),
              Text(
                '${(value * 100).toInt()}%',
                style: AppTextStyles.caption.copyWith(
                  fontWeight: FontWeight.bold,
                ),
              ),
            ],
          ),
          const SizedBox(height: 4),
        ],
        ClipRRect(
          borderRadius: BorderRadius.circular(4),
          child: LinearProgressIndicator(
            value: value,
            backgroundColor: backgroundColor ??
                (isDark ? Colors.white12 : Colors.black12),
            valueColor: AlwaysStoppedAnimation<Color>(
              color ?? AppColors.teal,
            ),
            minHeight: 6,
          ),
        ),
      ],
    );
  }
}

/// Refresh indicator wrapper with custom styling
class StyledRefreshIndicator extends StatelessWidget {
  final Widget child;
  final Future<void> Function() onRefresh;
  final Color? color;

  const StyledRefreshIndicator({
    super.key,
    required this.child,
    required this.onRefresh,
    this.color,
  });

  @override
  Widget build(BuildContext context) {
    return RefreshIndicator(
      onRefresh: onRefresh,
      color: color ?? AppColors.teal,
      backgroundColor: Theme.of(context).scaffoldBackgroundColor,
      child: child,
    );
  }
}

/// Pulsing loading dot animation
class PulsingDots extends StatefulWidget {
  final Color? color;
  final double size;

  const PulsingDots({
    super.key,
    this.color,
    this.size = 8,
  });

  @override
  State<PulsingDots> createState() => _PulsingDotsState();
}

class _PulsingDotsState extends State<PulsingDots>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      duration: const Duration(milliseconds: 1200),
      vsync: this,
    )..repeat();
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final color = widget.color ?? AppColors.teal;

    return Row(
      mainAxisSize: MainAxisSize.min,
      children: List.generate(3, (index) {
        return AnimatedBuilder(
          animation: _controller,
          builder: (context, child) {
            final delay = index * 0.2;
            final value = (_controller.value - delay).clamp(0.0, 1.0);
            final scale = 0.5 + (0.5 * _pulse(value));

            return Transform.scale(
              scale: scale,
              child: Container(
                margin: EdgeInsets.symmetric(horizontal: widget.size / 4),
                width: widget.size,
                height: widget.size,
                decoration: BoxDecoration(
                  color: color.withValues(alpha: 0.3 + (0.7 * _pulse(value))),
                  shape: BoxShape.circle,
                ),
              ),
            );
          },
        );
      }),
    );
  }

  double _pulse(double t) {
    if (t < 0.5) {
      return t * 2;
    } else {
      return 2 - (t * 2);
    }
  }
}

/// Typing indicator (three bouncing dots)
class TypingIndicator extends StatefulWidget {
  final Color? color;

  const TypingIndicator({super.key, this.color});

  @override
  State<TypingIndicator> createState() => _TypingIndicatorState();
}

class _TypingIndicatorState extends State<TypingIndicator>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      duration: const Duration(milliseconds: 800),
      vsync: this,
    )..repeat();
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final color = widget.color ?? AppColors.teal;

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.1),
        borderRadius: BorderRadius.circular(16),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: List.generate(3, (index) {
          return AnimatedBuilder(
            animation: _controller,
            builder: (context, child) {
              final delay = index * 0.15;
              final value = ((_controller.value - delay) % 1.0);
              final y = -4 * _bounce(value);

              return Transform.translate(
                offset: Offset(0, y),
                child: Container(
                  margin: const EdgeInsets.symmetric(horizontal: 2),
                  width: 6,
                  height: 6,
                  decoration: BoxDecoration(
                    color: color,
                    shape: BoxShape.circle,
                  ),
                ),
              );
            },
          );
        }),
      ),
    );
  }

  double _bounce(double t) {
    if (t < 0.5) {
      return 4 * t * t * (3 - 4 * t);
    } else {
      return 0;
    }
  }
}
