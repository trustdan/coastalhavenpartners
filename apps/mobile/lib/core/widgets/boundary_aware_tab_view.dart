import 'package:flutter/material.dart';

/// A TabBarView wrapper that detects boundary swipes and triggers
/// navigation to the previous/next bottom nav tab.
///
/// Uses raw pointer tracking to reliably detect when user swipes
/// at boundaries, regardless of scroll physics.
class BoundaryAwareTabView extends StatefulWidget {
  final TabController controller;
  final List<Widget> children;
  final ScrollPhysics? physics;

  /// Callback when user tries to swipe past the first tab (swipe right at index 0)
  final VoidCallback? onSwipePastStart;

  /// Callback when user tries to swipe past the last tab (swipe left at last index)
  final VoidCallback? onSwipePastEnd;

  /// Drag distance threshold before triggering boundary callback
  final double dragThreshold;

  const BoundaryAwareTabView({
    super.key,
    required this.controller,
    required this.children,
    this.physics,
    this.onSwipePastStart,
    this.onSwipePastEnd,
    this.dragThreshold = 80.0,
  });

  @override
  State<BoundaryAwareTabView> createState() => _BoundaryAwareTabViewState();
}

class _BoundaryAwareTabViewState extends State<BoundaryAwareTabView> {
  double? _dragStartX;
  bool _hasFiredCallback = false;
  bool _isAtStart = true;
  bool _isAtEnd = false;

  @override
  void initState() {
    super.initState();
    _updateBoundaryState();
    widget.controller.addListener(_updateBoundaryState);
  }

  @override
  void dispose() {
    widget.controller.removeListener(_updateBoundaryState);
    super.dispose();
  }

  void _updateBoundaryState() {
    final newIsAtStart = widget.controller.index == 0;
    final newIsAtEnd = widget.controller.index == widget.children.length - 1;
    if (newIsAtStart != _isAtStart || newIsAtEnd != _isAtEnd) {
      setState(() {
        _isAtStart = newIsAtStart;
        _isAtEnd = newIsAtEnd;
      });
    }
  }

  void _onPointerDown(PointerDownEvent event) {
    _dragStartX = event.position.dx;
    _hasFiredCallback = false;
  }

  void _onPointerMove(PointerMoveEvent event) {
    if (_dragStartX == null || _hasFiredCallback) return;

    final dragDelta = event.position.dx - _dragStartX!;

    // At first tab, swiping right (positive delta) -> go to previous nav tab
    if (_isAtStart && dragDelta > widget.dragThreshold) {
      if (widget.onSwipePastStart != null) {
        _hasFiredCallback = true;
        widget.onSwipePastStart!();
      }
    }

    // At last tab, swiping left (negative delta) -> go to next nav tab
    if (_isAtEnd && dragDelta < -widget.dragThreshold) {
      if (widget.onSwipePastEnd != null) {
        _hasFiredCallback = true;
        widget.onSwipePastEnd!();
      }
    }
  }

  void _onPointerUp(PointerUpEvent event) {
    _dragStartX = null;
    _hasFiredCallback = false;
  }

  void _onPointerCancel(PointerCancelEvent event) {
    _dragStartX = null;
    _hasFiredCallback = false;
  }

  @override
  Widget build(BuildContext context) {
    return Listener(
      onPointerDown: _onPointerDown,
      onPointerMove: _onPointerMove,
      onPointerUp: _onPointerUp,
      onPointerCancel: _onPointerCancel,
      child: TabBarView(
        controller: widget.controller,
        physics: widget.physics,
        children: widget.children,
      ),
    );
  }
}
