import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../providers/firms_providers.dart';

/// A widget that wraps content and detects horizontal swipes to change
/// the filter category.
///
/// This is designed for the Firms Directory screen where swiping left/right
/// on the firms list changes the active category filter (All, IB, PE, etc.).
class SwipeableFilterList extends ConsumerStatefulWidget {
  /// The child widget (typically a ListView of firms)
  final Widget child;

  /// Edge threshold in pixels for triggering swipe from edges
  final double edgeThreshold;

  /// Minimum velocity (px/s) for mid-screen swipes to trigger
  final double velocityThreshold;

  /// Callback when category changes (optional, for triggering animations)
  final void Function(int newIndex)? onCategoryChanged;

  const SwipeableFilterList({
    super.key,
    required this.child,
    this.edgeThreshold = 40.0,
    this.velocityThreshold = 500.0,
    this.onCategoryChanged,
  });

  @override
  ConsumerState<SwipeableFilterList> createState() =>
      _SwipeableFilterListState();
}

class _SwipeableFilterListState extends ConsumerState<SwipeableFilterList> {
  Offset? _dragStartPosition;
  bool _isSwipeGesture = false;
  double _swipeDirection = 0; // -1 for left, 1 for right

  void _onHorizontalDragStart(DragStartDetails details) {
    _dragStartPosition = details.globalPosition;
    _isSwipeGesture = false;
    _swipeDirection = 0;
  }

  void _onHorizontalDragUpdate(DragUpdateDetails details) {
    if (_dragStartPosition == null) return;

    final delta = details.globalPosition.dx - _dragStartPosition!.dx;
    final screenWidth = MediaQuery.of(context).size.width;

    // Check if drag started from edge
    final isFromEdge = _dragStartPosition!.dx < widget.edgeThreshold ||
        _dragStartPosition!.dx > screenWidth - widget.edgeThreshold;

    // For edge drags, allow swipe even with slower velocity
    if (isFromEdge && delta.abs() > 30) {
      _isSwipeGesture = true;
      _swipeDirection = delta > 0 ? -1 : 1; // Right drag = prev, Left drag = next
    }
  }

  void _onHorizontalDragEnd(DragEndDetails details) {
    if (_dragStartPosition == null) return;

    final velocity = details.primaryVelocity ?? 0;
    final screenWidth = MediaQuery.of(context).size.width;

    // Check if drag started from edge
    final isFromEdge = _dragStartPosition!.dx < widget.edgeThreshold ||
        _dragStartPosition!.dx > screenWidth - widget.edgeThreshold;

    // Determine if this should trigger a category change
    final isFastSwipe = velocity.abs() > widget.velocityThreshold;
    final shouldTrigger = isFromEdge || isFastSwipe || _isSwipeGesture;

    if (shouldTrigger) {
      // Determine direction: positive velocity = swipe right = previous category
      // negative velocity = swipe left = next category
      final direction = velocity != 0
          ? (velocity > 0 ? -1 : 1)
          : _swipeDirection.toInt();

      if (direction != 0) {
        _changeCategory(direction);
      }
    }

    _dragStartPosition = null;
    _isSwipeGesture = false;
    _swipeDirection = 0;
  }

  void _changeCategory(int direction) {
    final currentIndex = ref.read(firmsCategoryIndexProvider);
    final newIndex = currentIndex + direction;

    // Bounds check
    if (newIndex >= 0 && newIndex < firmsCategoryValues.length) {
      ref.read(firmsCategoryIndexProvider.notifier).setIndex(newIndex);
      widget.onCategoryChanged?.call(newIndex);
    }
  }

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onHorizontalDragStart: _onHorizontalDragStart,
      onHorizontalDragUpdate: _onHorizontalDragUpdate,
      onHorizontalDragEnd: _onHorizontalDragEnd,
      behavior: HitTestBehavior.translucent,
      child: widget.child,
    );
  }
}
