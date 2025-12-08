import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../theme/app_spacing.dart';

/// Staggered list item animation wrapper
///
/// Usage:
/// ```dart
/// ListView.builder(
///   itemCount: items.length,
///   itemBuilder: (context, index) {
///     return AnimatedListItem(
///       index: index,
///       child: ItemCard(item: items[index]),
///     );
///   },
/// )
/// ```
class AnimatedListItem extends StatelessWidget {
  const AnimatedListItem({
    super.key,
    required this.index,
    required this.child,
    this.baseDelay = Duration.zero,
    this.staggerDelay = const Duration(milliseconds: 50),
    this.duration,
    this.curve = Curves.easeOutCubic,
    this.animation = ListAnimationType.fadeSlideUp,
    this.maxIndex = 20,
  });

  /// Index of the item in the list (used for stagger delay)
  final int index;

  /// The child widget to animate
  final Widget child;

  /// Initial delay before any animation starts
  final Duration baseDelay;

  /// Delay between each item's animation start
  final Duration staggerDelay;

  /// Duration of the animation
  final Duration? duration;

  /// Animation curve
  final Curve curve;

  /// Type of animation to apply
  final ListAnimationType animation;

  /// Maximum index to apply stagger to (prevents very long delays)
  final int maxIndex;

  @override
  Widget build(BuildContext context) {
    final effectiveIndex = index.clamp(0, maxIndex);
    final totalDelay = baseDelay + (staggerDelay * effectiveIndex);
    final effectiveDuration = duration ?? AppDurations.normal;

    switch (animation) {
      case ListAnimationType.fadeSlideUp:
        return child
            .animate(delay: totalDelay)
            .fadeIn(duration: effectiveDuration, curve: curve)
            .slideY(
              begin: 0.2,
              end: 0,
              duration: effectiveDuration,
              curve: curve,
            );

      case ListAnimationType.fadeSlideLeft:
        return child
            .animate(delay: totalDelay)
            .fadeIn(duration: effectiveDuration, curve: curve)
            .slideX(
              begin: 0.2,
              end: 0,
              duration: effectiveDuration,
              curve: curve,
            );

      case ListAnimationType.fadeSlideRight:
        return child
            .animate(delay: totalDelay)
            .fadeIn(duration: effectiveDuration, curve: curve)
            .slideX(
              begin: -0.2,
              end: 0,
              duration: effectiveDuration,
              curve: curve,
            );

      case ListAnimationType.fadeScale:
        return child
            .animate(delay: totalDelay)
            .fadeIn(duration: effectiveDuration, curve: curve)
            .scale(
              begin: const Offset(0.95, 0.95),
              end: const Offset(1, 1),
              duration: effectiveDuration,
              curve: curve,
            );

      case ListAnimationType.fadeOnly:
        return child
            .animate(delay: totalDelay)
            .fadeIn(duration: effectiveDuration, curve: curve);

      case ListAnimationType.slideUp:
        return child.animate(delay: totalDelay).slideY(
              begin: 0.3,
              end: 0,
              duration: effectiveDuration,
              curve: curve,
            );
    }
  }
}

/// Types of list item animations
enum ListAnimationType {
  fadeSlideUp,
  fadeSlideLeft,
  fadeSlideRight,
  fadeScale,
  fadeOnly,
  slideUp,
}

/// A widget that animates its children in a staggered fashion
/// when they first appear on screen
///
/// Usage:
/// ```dart
/// StaggeredAnimationList(
///   children: [
///     Text('Item 1'),
///     Text('Item 2'),
///     Text('Item 3'),
///   ],
/// )
/// ```
class StaggeredAnimationList extends StatelessWidget {
  const StaggeredAnimationList({
    super.key,
    required this.children,
    this.staggerDelay = const Duration(milliseconds: 50),
    this.duration,
    this.curve = Curves.easeOutCubic,
    this.animation = ListAnimationType.fadeSlideUp,
    this.spacing = 0,
    this.crossAxisAlignment = CrossAxisAlignment.start,
    this.mainAxisSize = MainAxisSize.min,
  });

  final List<Widget> children;
  final Duration staggerDelay;
  final Duration? duration;
  final Curve curve;
  final ListAnimationType animation;
  final double spacing;
  final CrossAxisAlignment crossAxisAlignment;
  final MainAxisSize mainAxisSize;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: crossAxisAlignment,
      mainAxisSize: mainAxisSize,
      children: [
        for (int i = 0; i < children.length; i++) ...[
          AnimatedListItem(
            index: i,
            staggerDelay: staggerDelay,
            duration: duration,
            curve: curve,
            animation: animation,
            child: children[i],
          ),
          if (spacing > 0 && i < children.length - 1) SizedBox(height: spacing),
        ],
      ],
    );
  }
}

/// A horizontal staggered animation list
class StaggeredHorizontalList extends StatelessWidget {
  const StaggeredHorizontalList({
    super.key,
    required this.children,
    this.staggerDelay = const Duration(milliseconds: 50),
    this.duration,
    this.curve = Curves.easeOutCubic,
    this.spacing = 0,
    this.mainAxisAlignment = MainAxisAlignment.start,
    this.mainAxisSize = MainAxisSize.min,
  });

  final List<Widget> children;
  final Duration staggerDelay;
  final Duration? duration;
  final Curve curve;
  final double spacing;
  final MainAxisAlignment mainAxisAlignment;
  final MainAxisSize mainAxisSize;

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisAlignment: mainAxisAlignment,
      mainAxisSize: mainAxisSize,
      children: [
        for (int i = 0; i < children.length; i++) ...[
          AnimatedListItem(
            index: i,
            staggerDelay: staggerDelay,
            duration: duration,
            curve: curve,
            animation: ListAnimationType.fadeSlideLeft,
            child: children[i],
          ),
          if (spacing > 0 && i < children.length - 1) SizedBox(width: spacing),
        ],
      ],
    );
  }
}

/// Grid version of staggered animation
class StaggeredAnimationGrid extends StatelessWidget {
  const StaggeredAnimationGrid({
    super.key,
    required this.children,
    required this.crossAxisCount,
    this.staggerDelay = const Duration(milliseconds: 50),
    this.duration,
    this.curve = Curves.easeOutCubic,
    this.animation = ListAnimationType.fadeScale,
    this.mainAxisSpacing = 8,
    this.crossAxisSpacing = 8,
    this.childAspectRatio = 1.0,
  });

  final List<Widget> children;
  final int crossAxisCount;
  final Duration staggerDelay;
  final Duration? duration;
  final Curve curve;
  final ListAnimationType animation;
  final double mainAxisSpacing;
  final double crossAxisSpacing;
  final double childAspectRatio;

  @override
  Widget build(BuildContext context) {
    return GridView.builder(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: crossAxisCount,
        mainAxisSpacing: mainAxisSpacing,
        crossAxisSpacing: crossAxisSpacing,
        childAspectRatio: childAspectRatio,
      ),
      itemCount: children.length,
      itemBuilder: (context, index) {
        return AnimatedListItem(
          index: index,
          staggerDelay: staggerDelay,
          duration: duration,
          curve: curve,
          animation: animation,
          child: children[index],
        );
      },
    );
  }
}

/// Extension to easily animate lists
extension AnimatedListExtension on List<Widget> {
  /// Convert list to staggered animated list
  Widget toStaggeredColumn({
    Duration staggerDelay = const Duration(milliseconds: 50),
    Duration? duration,
    Curve curve = Curves.easeOutCubic,
    ListAnimationType animation = ListAnimationType.fadeSlideUp,
    double spacing = 0,
    CrossAxisAlignment crossAxisAlignment = CrossAxisAlignment.start,
    MainAxisSize mainAxisSize = MainAxisSize.min,
  }) {
    return StaggeredAnimationList(
      staggerDelay: staggerDelay,
      duration: duration,
      curve: curve,
      animation: animation,
      spacing: spacing,
      crossAxisAlignment: crossAxisAlignment,
      mainAxisSize: mainAxisSize,
      children: this,
    );
  }

  /// Convert list to staggered animated row
  Widget toStaggeredRow({
    Duration staggerDelay = const Duration(milliseconds: 50),
    Duration? duration,
    Curve curve = Curves.easeOutCubic,
    double spacing = 0,
    MainAxisAlignment mainAxisAlignment = MainAxisAlignment.start,
    MainAxisSize mainAxisSize = MainAxisSize.min,
  }) {
    return StaggeredHorizontalList(
      staggerDelay: staggerDelay,
      duration: duration,
      curve: curve,
      spacing: spacing,
      mainAxisAlignment: mainAxisAlignment,
      mainAxisSize: mainAxisSize,
      children: this,
    );
  }
}
