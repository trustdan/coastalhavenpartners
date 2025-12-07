import 'dart:math';
import 'package:flutter/material.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_spacing.dart';

/// A card with an animated gradient border effect
/// Port of the web Magic UI ShineBorder component
class ShineBorderCard extends StatefulWidget {
  /// Child widget to display inside the card
  final Widget child;

  /// Colors for the shine gradient
  final List<Color> shineColors;

  /// Border radius
  final double borderRadius;

  /// Border width
  final double borderWidth;

  /// Animation duration
  final Duration duration;

  /// Background color of the card
  final Color? backgroundColor;

  /// Padding inside the card
  final EdgeInsetsGeometry? padding;

  /// Callback when card is tapped
  final VoidCallback? onTap;

  const ShineBorderCard({
    super.key,
    required this.child,
    this.shineColors = const [
      AppColors.teal,
      AppColors.emerald,
      AppColors.green,
    ],
    this.borderRadius = AppRadius.lg,
    this.borderWidth = 2,
    this.duration = const Duration(seconds: 8),
    this.backgroundColor,
    this.padding,
    this.onTap,
  });

  @override
  State<ShineBorderCard> createState() => _ShineBorderCardState();
}

class _ShineBorderCardState extends State<ShineBorderCard>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      duration: widget.duration,
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
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final bgColor = widget.backgroundColor ??
        (isDark ? AppColors.cardDark : AppColors.cardLight);

    return AnimatedBuilder(
      animation: _controller,
      builder: (context, child) {
        return Container(
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(widget.borderRadius),
            gradient: SweepGradient(
              center: Alignment.center,
              startAngle: _controller.value * 2 * pi,
              endAngle: _controller.value * 2 * pi + pi * 2,
              colors: [
                ...widget.shineColors,
                widget.shineColors.first,
              ],
            ),
          ),
          child: Padding(
            padding: EdgeInsets.all(widget.borderWidth),
            child: Material(
              color: bgColor,
              borderRadius:
                  BorderRadius.circular(widget.borderRadius - widget.borderWidth),
              child: InkWell(
                onTap: widget.onTap,
                borderRadius:
                    BorderRadius.circular(widget.borderRadius - widget.borderWidth),
                child: Padding(
                  padding: widget.padding ?? AppSpacing.cardPadding,
                  child: widget.child,
                ),
              ),
            ),
          ),
        );
      },
    );
  }
}

/// A simpler card with static gradient border
class GradientBorderCard extends StatelessWidget {
  final Widget child;
  final List<Color> gradientColors;
  final double borderRadius;
  final double borderWidth;
  final Color? backgroundColor;
  final EdgeInsetsGeometry? padding;
  final VoidCallback? onTap;

  const GradientBorderCard({
    super.key,
    required this.child,
    this.gradientColors = const [
      AppColors.teal,
      AppColors.emerald,
      AppColors.green,
    ],
    this.borderRadius = AppRadius.lg,
    this.borderWidth = 2,
    this.backgroundColor,
    this.padding,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final bgColor = backgroundColor ??
        (isDark ? AppColors.cardDark : AppColors.cardLight);

    return Container(
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(borderRadius),
        gradient: LinearGradient(
          colors: gradientColors,
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
      ),
      child: Padding(
        padding: EdgeInsets.all(borderWidth),
        child: Material(
          color: bgColor,
          borderRadius: BorderRadius.circular(borderRadius - borderWidth),
          child: InkWell(
            onTap: onTap,
            borderRadius: BorderRadius.circular(borderRadius - borderWidth),
            child: Padding(
              padding: padding ?? AppSpacing.cardPadding,
              child: child,
            ),
          ),
        ),
      ),
    );
  }
}
