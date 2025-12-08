import 'dart:math';
import 'package:flutter/material.dart';
import '../../core/theme/app_colors.dart';

/// Animated meteor particles falling in the background
/// Port of the web Magic UI Meteors component
class MeteorsBackground extends StatefulWidget {
  /// Child widget to display on top of meteors
  final Widget child;

  /// Number of meteors to display
  final int meteorCount;

  /// Whether meteors are enabled
  final bool enabled;

  const MeteorsBackground({
    super.key,
    required this.child,
    this.meteorCount = 6,
    this.enabled = true,
  });

  @override
  State<MeteorsBackground> createState() => _MeteorsBackgroundState();
}

class _MeteorsBackgroundState extends State<MeteorsBackground> {
  @override
  Widget build(BuildContext context) {
    if (!widget.enabled) {
      return widget.child;
    }

    return Stack(
      children: [
        // Meteors layer
        Positioned.fill(
          child: ClipRect(
            child: Stack(
              children: List.generate(
                widget.meteorCount,
                (index) => _Meteor(
                  key: ValueKey('meteor_$index'),
                  delay: Duration(milliseconds: index * 800),
                ),
              ),
            ),
          ),
        ),
        // Content layer
        widget.child,
      ],
    );
  }
}

class _Meteor extends StatefulWidget {
  final Duration delay;

  const _Meteor({
    super.key,
    required this.delay,
  });

  @override
  State<_Meteor> createState() => _MeteorState();
}

class _MeteorState extends State<_Meteor> with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late double _startX;
  late double _startY;
  late double _size;
  final Random _random = Random();

  @override
  void initState() {
    super.initState();
    _randomizePosition();

    _controller = AnimationController(
      duration: const Duration(seconds: 5),
      vsync: this,
    );

    // Start after delay
    Future.delayed(widget.delay, () {
      if (mounted) {
        _controller.repeat();
      }
    });

    _controller.addStatusListener((status) {
      if (status == AnimationStatus.completed) {
        _randomizePosition();
      }
    });
  }

  void _randomizePosition() {
    setState(() {
      _startX = _random.nextDouble();
      _startY = -0.1 - (_random.nextDouble() * 0.2);
      _size = 1.0 + _random.nextDouble() * 2.0;
    });
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: _controller,
      builder: (context, child) {
        final progress = _controller.value;
        final x = _startX + (progress * 0.3);
        final y = _startY + (progress * 1.3);
        final opacity = progress < 0.1
            ? progress * 10
            : progress > 0.8
                ? (1 - progress) * 5
                : 1.0;

        return Positioned(
          left: x * MediaQuery.of(context).size.width,
          top: y * MediaQuery.of(context).size.height,
          child: Transform.rotate(
            angle: 0.7, // ~40 degrees
            child: Opacity(
              opacity: opacity.clamp(0.0, 1.0),
              child: Container(
                width: _size,
                height: 80 + (_size * 20),
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    begin: Alignment.topCenter,
                    end: Alignment.bottomCenter,
                    colors: [
                      AppColors.emerald.withValues(alpha: 0.8),
                      AppColors.emerald.withValues(alpha: 0.4),
                      AppColors.emerald.withValues(alpha: 0.0),
                    ],
                  ),
                  borderRadius: BorderRadius.circular(_size / 2),
                  boxShadow: [
                    BoxShadow(
                      color: AppColors.emerald.withValues(alpha: 0.6),
                      blurRadius: 8,
                      spreadRadius: 2,
                    ),
                  ],
                ),
              ),
            ),
          ),
        );
      },
    );
  }
}

/// Simplified static meteors for low-performance mode
class StaticMeteorsBackground extends StatelessWidget {
  final Widget child;
  final int meteorCount;

  const StaticMeteorsBackground({
    super.key,
    required this.child,
    this.meteorCount = 4,
  });

  @override
  Widget build(BuildContext context) {
    final random = Random(42); // Fixed seed for consistency

    return Stack(
      children: [
        // Static meteor trails
        ...List.generate(meteorCount, (index) {
          final x = random.nextDouble();
          final y = random.nextDouble() * 0.6;
          final size = 1.0 + random.nextDouble() * 1.5;

          return Positioned(
            left: x * MediaQuery.of(context).size.width,
            top: y * MediaQuery.of(context).size.height,
            child: Transform.rotate(
              angle: 0.7,
              child: Opacity(
                opacity: 0.3 + (random.nextDouble() * 0.3),
                child: Container(
                  width: size,
                  height: 60 + (size * 15),
                  decoration: BoxDecoration(
                    gradient: LinearGradient(
                      begin: Alignment.topCenter,
                      end: Alignment.bottomCenter,
                      colors: [
                        AppColors.emerald.withValues(alpha: 0.5),
                        AppColors.emerald.withValues(alpha: 0.0),
                      ],
                    ),
                    borderRadius: BorderRadius.circular(size / 2),
                  ),
                ),
              ),
            ),
          );
        }),
        // Content
        child,
      ],
    );
  }
}
