import 'package:flutter/material.dart';

/// Configuration for hybrid swipe detection
class SwipeNavigationConfig {
  /// Width in pixels from screen edge where swipes always trigger
  final double edgeThreshold;

  /// Minimum velocity (px/s) for mid-screen swipes to trigger
  final double velocityThreshold;

  /// Spring configuration for page snap
  final SpringDescription spring;

  const SwipeNavigationConfig({
    this.edgeThreshold = 40.0,
    this.velocityThreshold = 500.0,
    this.spring = const SpringDescription(
      mass: 50,
      stiffness: 100,
      damping: 1,
    ),
  });

  static const defaultConfig = SwipeNavigationConfig();
}

/// Custom scroll physics for swipe navigation that:
/// - Requires higher velocity threshold to trigger page changes
/// - Only allows swiping one page at a time (no multi-page skips)
/// - Requires dragging past 50% of page width to change pages
class SwipeNavigationScrollPhysics extends PageScrollPhysics {
  final SwipeNavigationConfig config;

  const SwipeNavigationScrollPhysics({
    super.parent,
    this.config = SwipeNavigationConfig.defaultConfig,
  });

  @override
  SwipeNavigationScrollPhysics applyTo(ScrollPhysics? ancestor) {
    return SwipeNavigationScrollPhysics(
      parent: buildParent(ancestor),
      config: config,
    );
  }

  @override
  double get minFlingVelocity => config.velocityThreshold;

  /// Require higher drag velocity before treating as fling
  @override
  double get minFlingDistance => 50.0;

  /// Slower drag deceleration = less momentum = harder to skip pages
  @override
  double get dragStartDistanceMotionThreshold => 10.0;

  @override
  Simulation? createBallisticSimulation(
      ScrollMetrics position, double velocity) {
    final Tolerance tol = toleranceFor(position);

    // If velocity is too low, snap back based purely on position
    if (velocity.abs() < config.velocityThreshold) {
      // Calculate page boundaries
      final double page = position.pixels / position.viewportDimension;

      // If we're more than 50% to next page, go there; otherwise snap back
      final double dragPercent = (position.pixels % position.viewportDimension) /
          position.viewportDimension;

      final double finalTarget;
      if (dragPercent > 0.5) {
        finalTarget = (page.floor() + 1) * position.viewportDimension;
      } else if (dragPercent < -0.5) {
        finalTarget = (page.ceil() - 1) * position.viewportDimension;
      } else {
        finalTarget = page.round() * position.viewportDimension;
      }

      // Clamp to valid range
      final double clampedTarget = finalTarget.clamp(
        position.minScrollExtent,
        position.maxScrollExtent,
      );

      if ((position.pixels - clampedTarget).abs() < tol.distance) {
        return null;
      }

      return ScrollSpringSimulation(
        spring,
        position.pixels,
        clampedTarget,
        velocity,
        tolerance: tol,
      );
    }

    // With sufficient velocity, use parent physics but limit to one page
    final double page = position.pixels / position.viewportDimension;
    final double targetPage = velocity > 0 ? page.floor().toDouble() : page.ceil().toDouble();
    final double targetPixels = (targetPage * position.viewportDimension).clamp(
      position.minScrollExtent,
      position.maxScrollExtent,
    );

    if ((position.pixels - targetPixels).abs() < tol.distance) {
      return null;
    }

    return ScrollSpringSimulation(
      spring,
      position.pixels,
      targetPixels,
      velocity,
      tolerance: tol,
    );
  }
}

/// A wrapper widget that handles edge detection for swipe navigation.
///
/// This is needed because [ScrollPhysics] doesn't have access to the
/// touch start position. This wrapper tracks drag start position and
/// can enable/disable the inner scrollable based on whether the drag
/// started from an edge.
class SwipeNavigationWrapper extends StatefulWidget {
  final Widget child;
  final SwipeNavigationConfig config;
  final ValueChanged<bool>? onSwipeEnabledChanged;

  const SwipeNavigationWrapper({
    super.key,
    required this.child,
    this.config = SwipeNavigationConfig.defaultConfig,
    this.onSwipeEnabledChanged,
  });

  @override
  State<SwipeNavigationWrapper> createState() => _SwipeNavigationWrapperState();
}

class _SwipeNavigationWrapperState extends State<SwipeNavigationWrapper> {
  Offset? _dragStartPosition;
  bool _isFromEdge = false;

  void _onDragStart(DragStartDetails details) {
    _dragStartPosition = details.globalPosition;
    final screenWidth = MediaQuery.of(context).size.width;
    _isFromEdge = _dragStartPosition!.dx < widget.config.edgeThreshold ||
        _dragStartPosition!.dx > screenWidth - widget.config.edgeThreshold;

    // Notify parent if edge swipe
    widget.onSwipeEnabledChanged?.call(_isFromEdge);
  }

  void _onDragEnd(DragEndDetails details) {
    _dragStartPosition = null;
    _isFromEdge = false;
  }

  void _onDragCancel() {
    _dragStartPosition = null;
    _isFromEdge = false;
  }

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onHorizontalDragStart: _onDragStart,
      onHorizontalDragEnd: _onDragEnd,
      onHorizontalDragCancel: _onDragCancel,
      behavior: HitTestBehavior.translucent,
      child: widget.child,
    );
  }
}

/// Provides information about whether current swipe is from an edge
class SwipeEdgeNotifier extends InheritedNotifier<ValueNotifier<bool>> {
  const SwipeEdgeNotifier({
    super.key,
    required super.notifier,
    required super.child,
  });

  static bool isFromEdge(BuildContext context) {
    return context
            .dependOnInheritedWidgetOfExactType<SwipeEdgeNotifier>()
            ?.notifier
            ?.value ??
        false;
  }
}
