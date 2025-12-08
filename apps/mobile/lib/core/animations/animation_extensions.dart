import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../theme/app_spacing.dart';

/// Extensions on Widget for common animations
extension AnimationExtensions on Widget {
  /// Fade in animation
  Widget fadeIn({
    Duration? duration,
    Duration? delay,
    Curve curve = Curves.easeOut,
  }) {
    return animate(delay: delay).fadeIn(
      duration: duration ?? AppDurations.normal,
      curve: curve,
    );
  }

  /// Fade out animation
  Widget fadeOut({
    Duration? duration,
    Duration? delay,
    Curve curve = Curves.easeIn,
  }) {
    return animate(delay: delay).fadeOut(
      duration: duration ?? AppDurations.normal,
      curve: curve,
    );
  }

  /// Slide up and fade in (common entrance animation)
  Widget slideUpFadeIn({
    Duration? duration,
    Duration? delay,
    Curve curve = Curves.easeOutCubic,
    double offset = 0.1,
  }) {
    return animate(delay: delay)
        .fadeIn(duration: duration ?? AppDurations.normal, curve: curve)
        .slideY(
          begin: offset,
          end: 0,
          duration: duration ?? AppDurations.normal,
          curve: curve,
        );
  }

  /// Slide down and fade in
  Widget slideDownFadeIn({
    Duration? duration,
    Duration? delay,
    Curve curve = Curves.easeOutCubic,
    double offset = 0.1,
  }) {
    return animate(delay: delay)
        .fadeIn(duration: duration ?? AppDurations.normal, curve: curve)
        .slideY(
          begin: -offset,
          end: 0,
          duration: duration ?? AppDurations.normal,
          curve: curve,
        );
  }

  /// Slide from left and fade in
  Widget slideLeftFadeIn({
    Duration? duration,
    Duration? delay,
    Curve curve = Curves.easeOutCubic,
    double offset = 0.1,
  }) {
    return animate(delay: delay)
        .fadeIn(duration: duration ?? AppDurations.normal, curve: curve)
        .slideX(
          begin: -offset,
          end: 0,
          duration: duration ?? AppDurations.normal,
          curve: curve,
        );
  }

  /// Slide from right and fade in
  Widget slideRightFadeIn({
    Duration? duration,
    Duration? delay,
    Curve curve = Curves.easeOutCubic,
    double offset = 0.1,
  }) {
    return animate(delay: delay)
        .fadeIn(duration: duration ?? AppDurations.normal, curve: curve)
        .slideX(
          begin: offset,
          end: 0,
          duration: duration ?? AppDurations.normal,
          curve: curve,
        );
  }

  /// Scale up and fade in (pop effect)
  Widget popIn({
    Duration? duration,
    Duration? delay,
    Curve curve = Curves.easeOutBack,
    double beginScale = 0.9,
  }) {
    return animate(delay: delay)
        .fadeIn(duration: duration ?? AppDurations.normal, curve: Curves.easeOut)
        .scale(
          begin: Offset(beginScale, beginScale),
          end: const Offset(1, 1),
          duration: duration ?? AppDurations.normal,
          curve: curve,
        );
  }

  /// Scale down and fade out
  Widget popOut({
    Duration? duration,
    Duration? delay,
    Curve curve = Curves.easeIn,
    double endScale = 0.9,
  }) {
    return animate(delay: delay)
        .fadeOut(duration: duration ?? AppDurations.normal, curve: curve)
        .scale(
          begin: const Offset(1, 1),
          end: Offset(endScale, endScale),
          duration: duration ?? AppDurations.normal,
          curve: curve,
        );
  }

  /// Shake animation (for errors)
  Widget shake({
    Duration? duration,
    Duration? delay,
    double offset = 10,
    int count = 3,
  }) {
    return animate(delay: delay).shake(
      duration: duration ?? AppDurations.normal,
      hz: count.toDouble(),
      offset: Offset(offset, 0),
    );
  }

  /// Pulse animation (for attention)
  Widget pulse({
    Duration? duration,
    Duration? delay,
    double scale = 1.05,
  }) {
    return animate(
      delay: delay,
      onComplete: (controller) => controller.repeat(reverse: true),
    ).scale(
      begin: const Offset(1, 1),
      end: Offset(scale, scale),
      duration: duration ?? AppDurations.slow,
      curve: Curves.easeInOut,
    );
  }

  /// Blur in animation
  Widget blurIn({
    Duration? duration,
    Duration? delay,
    Curve curve = Curves.easeOut,
    double beginBlur = 10,
  }) {
    return animate(delay: delay)
        .fadeIn(duration: duration ?? AppDurations.normal, curve: curve)
        .blur(
          begin: Offset(beginBlur, beginBlur),
          end: Offset.zero,
          duration: duration ?? AppDurations.normal,
          curve: curve,
        );
  }

  /// Shimmer effect (for loading states)
  Widget shimmer({
    Duration? duration,
    Duration? delay,
    Color? color,
  }) {
    return animate(
      delay: delay,
      onComplete: (controller) => controller.repeat(),
    ).shimmer(
      duration: duration ?? AppDurations.shimmer,
      color: color ?? Colors.white.withValues(alpha: 0.3),
    );
  }

  /// Flip animation
  Widget flipIn({
    Duration? duration,
    Duration? delay,
    Curve curve = Curves.easeOutBack,
    bool horizontal = false,
  }) {
    if (horizontal) {
      return animate(delay: delay)
          .fadeIn(duration: duration ?? AppDurations.normal, curve: curve)
          .flipH(
            begin: 0.5,
            end: 0,
            duration: duration ?? AppDurations.normal,
            curve: curve,
          );
    }
    return animate(delay: delay)
        .fadeIn(duration: duration ?? AppDurations.normal, curve: curve)
        .flipV(
          begin: 0.5,
          end: 0,
          duration: duration ?? AppDurations.normal,
          curve: curve,
        );
  }

  /// Rotate in animation
  Widget rotateIn({
    Duration? duration,
    Duration? delay,
    Curve curve = Curves.easeOutBack,
    double beginAngle = 0.1,
  }) {
    return animate(delay: delay)
        .fadeIn(duration: duration ?? AppDurations.normal, curve: Curves.easeOut)
        .rotate(
          begin: beginAngle,
          end: 0,
          duration: duration ?? AppDurations.normal,
          curve: curve,
        );
  }

  /// Bounce animation
  Widget bounce({
    Duration? duration,
    Duration? delay,
    double height = 10,
  }) {
    return animate(
      delay: delay,
      onComplete: (controller) => controller.repeat(reverse: true),
    ).moveY(
      begin: 0,
      end: -height,
      duration: duration ?? AppDurations.normal,
      curve: Curves.easeInOut,
    );
  }

  /// Loading dots animation (3 dots bouncing)
  /// Note: This should be applied to a Row of 3 Container dots
  Widget loadingDot(int index) {
    return animate(
      delay: Duration(milliseconds: index * 150),
      onComplete: (controller) => controller.repeat(reverse: true),
    ).moveY(
      begin: 0,
      end: -6,
      duration: AppDurations.normal,
      curve: Curves.easeInOut,
    );
  }
}

/// Extension for animated visibility
extension AnimatedVisibilityExtension on Widget {
  /// Show/hide with animation
  Widget animatedVisibility({
    required bool visible,
    Duration? duration,
    Curve curve = Curves.easeInOut,
    bool maintainSize = false,
    bool maintainAnimation = false,
    bool maintainState = true,
  }) {
    return AnimatedOpacity(
      opacity: visible ? 1.0 : 0.0,
      duration: duration ?? AppDurations.normal,
      curve: curve,
      child: Visibility(
        visible: visible || maintainSize || maintainAnimation || maintainState,
        maintainSize: maintainSize,
        maintainAnimation: maintainAnimation,
        maintainState: maintainState,
        child: this,
      ),
    );
  }

  /// Animated cross-fade between two widgets
  static Widget crossFade({
    required Widget first,
    required Widget second,
    required bool showFirst,
    Duration? duration,
    Curve curve = Curves.easeInOut,
    CrossFadeState? crossFadeState,
  }) {
    return AnimatedCrossFade(
      firstChild: first,
      secondChild: second,
      crossFadeState:
          crossFadeState ?? (showFirst ? CrossFadeState.showFirst : CrossFadeState.showSecond),
      duration: duration ?? AppDurations.normal,
      firstCurve: curve,
      secondCurve: curve,
    );
  }
}

/// Animated container size changes
class AnimatedSizeChange extends StatelessWidget {
  const AnimatedSizeChange({
    super.key,
    required this.child,
    this.duration,
    this.curve = Curves.easeInOut,
    this.alignment = Alignment.topCenter,
    this.clipBehavior = Clip.none,
  });

  final Widget child;
  final Duration? duration;
  final Curve curve;
  final Alignment alignment;
  final Clip clipBehavior;

  @override
  Widget build(BuildContext context) {
    return AnimatedSize(
      duration: duration ?? AppDurations.normal,
      curve: curve,
      alignment: alignment,
      clipBehavior: clipBehavior,
      child: child,
    );
  }
}

/// Animated switching between widgets
class AnimatedSwitch extends StatelessWidget {
  const AnimatedSwitch({
    super.key,
    required this.child,
    this.duration,
    this.switchInCurve = Curves.easeOut,
    this.switchOutCurve = Curves.easeIn,
    this.transitionBuilder,
  });

  final Widget child;
  final Duration? duration;
  final Curve switchInCurve;
  final Curve switchOutCurve;
  final AnimatedSwitcherTransitionBuilder? transitionBuilder;

  @override
  Widget build(BuildContext context) {
    return AnimatedSwitcher(
      duration: duration ?? AppDurations.normal,
      switchInCurve: switchInCurve,
      switchOutCurve: switchOutCurve,
      transitionBuilder: transitionBuilder ??
          (child, animation) {
            return FadeTransition(
              opacity: animation,
              child: child,
            );
          },
      child: child,
    );
  }
}
