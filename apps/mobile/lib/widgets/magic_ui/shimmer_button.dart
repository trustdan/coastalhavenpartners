import 'dart:math';
import 'package:flutter/material.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_spacing.dart';

/// A button with an animated shimmer border effect
/// Port of the web Magic UI ShimmerButton component
class ShimmerButton extends StatefulWidget {
  /// The button text
  final String text;

  /// Callback when button is pressed
  final VoidCallback? onPressed;

  /// Colors for the shimmer gradient
  final List<Color> shimmerColors;

  /// Button height
  final double height;

  /// Button width (null for auto-sizing)
  final double? width;

  /// Whether the button is in loading state
  final bool isLoading;

  /// Whether the button fills its parent width
  final bool fullWidth;

  /// Text style override
  final TextStyle? textStyle;

  /// Child widget (overrides text)
  final Widget? child;

  const ShimmerButton({
    super.key,
    required this.text,
    this.onPressed,
    this.shimmerColors = const [
      AppColors.teal,
      AppColors.emerald,
      AppColors.green,
    ],
    this.height = 48,
    this.width,
    this.isLoading = false,
    this.fullWidth = false,
    this.textStyle,
    this.child,
  });

  @override
  State<ShimmerButton> createState() => _ShimmerButtonState();
}

class _ShimmerButtonState extends State<ShimmerButton>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      duration: const Duration(seconds: 2),
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
    final isDisabled = widget.onPressed == null || widget.isLoading;

    return AnimatedBuilder(
      animation: _controller,
      builder: (context, child) {
        return Container(
          height: widget.height,
          width: widget.fullWidth ? double.infinity : widget.width,
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(AppRadius.md),
            gradient: SweepGradient(
              center: Alignment.center,
              startAngle: _controller.value * 2 * pi,
              endAngle: _controller.value * 2 * pi + pi * 2,
              colors: [
                ...widget.shimmerColors,
                widget.shimmerColors.first,
              ],
            ),
          ),
          child: Padding(
            padding: const EdgeInsets.all(2),
            child: Material(
              color: const Color(0xFF171717),
              borderRadius: BorderRadius.circular(AppRadius.md - 2),
              child: InkWell(
                onTap: isDisabled ? null : widget.onPressed,
                borderRadius: BorderRadius.circular(AppRadius.md - 2),
                child: Center(
                  child: widget.isLoading
                      ? SizedBox(
                          width: 20,
                          height: 20,
                          child: CircularProgressIndicator(
                            strokeWidth: 2,
                            valueColor: AlwaysStoppedAnimation(Colors.white),
                          ),
                        )
                      : widget.child ??
                          Text(
                            widget.text,
                            style: widget.textStyle ??
                                const TextStyle(
                                  color: Colors.white,
                                  fontWeight: FontWeight.w600,
                                  fontSize: 16,
                                ),
                          ),
                ),
              ),
            ),
          ),
        );
      },
    );
  }
}

/// A simpler shimmer button with static gradient border
class ShimmerButtonStatic extends StatelessWidget {
  final String text;
  final VoidCallback? onPressed;
  final List<Color> gradientColors;
  final double height;
  final double? width;
  final bool fullWidth;
  final bool isLoading;

  const ShimmerButtonStatic({
    super.key,
    required this.text,
    this.onPressed,
    this.gradientColors = const [
      AppColors.teal,
      AppColors.emerald,
      AppColors.green,
    ],
    this.height = 48,
    this.width,
    this.fullWidth = false,
    this.isLoading = false,
  });

  @override
  Widget build(BuildContext context) {
    final isDisabled = onPressed == null || isLoading;

    return Container(
      height: height,
      width: fullWidth ? double.infinity : width,
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(AppRadius.md),
        gradient: LinearGradient(
          colors: gradientColors,
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
      ),
      child: Padding(
        padding: const EdgeInsets.all(2),
        child: Material(
          color: const Color(0xFF171717),
          borderRadius: BorderRadius.circular(AppRadius.md - 2),
          child: InkWell(
            onTap: isDisabled ? null : onPressed,
            borderRadius: BorderRadius.circular(AppRadius.md - 2),
            child: Center(
              child: isLoading
                  ? const SizedBox(
                      width: 20,
                      height: 20,
                      child: CircularProgressIndicator(
                        strokeWidth: 2,
                        valueColor: AlwaysStoppedAnimation(Colors.white),
                      ),
                    )
                  : Text(
                      text,
                      style: const TextStyle(
                        color: Colors.white,
                        fontWeight: FontWeight.w600,
                        fontSize: 16,
                      ),
                    ),
            ),
          ),
        ),
      ),
    );
  }
}
