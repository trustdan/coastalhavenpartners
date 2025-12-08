import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../theme/app_spacing.dart';

/// Animated button wrapper with press feedback
///
/// Usage:
/// ```dart
/// AnimatedPressButton(
///   onTap: () => doSomething(),
///   child: Container(
///     padding: EdgeInsets.all(16),
///     child: Text('Press me'),
///   ),
/// )
/// ```
class AnimatedPressButton extends StatefulWidget {
  const AnimatedPressButton({
    super.key,
    required this.child,
    this.onTap,
    this.onLongPress,
    this.enabled = true,
    this.hapticFeedback = true,
    this.scaleAmount = 0.95,
    this.duration,
    this.curve = Curves.easeOutCubic,
    this.opacityAmount = 0.9,
  });

  final Widget child;
  final VoidCallback? onTap;
  final VoidCallback? onLongPress;
  final bool enabled;
  final bool hapticFeedback;
  final double scaleAmount;
  final Duration? duration;
  final Curve curve;
  final double opacityAmount;

  @override
  State<AnimatedPressButton> createState() => _AnimatedPressButtonState();
}

class _AnimatedPressButtonState extends State<AnimatedPressButton>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _scaleAnimation;
  late Animation<double> _opacityAnimation;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: widget.duration ?? AppDurations.fast,
    );

    _scaleAnimation = Tween<double>(
      begin: 1.0,
      end: widget.scaleAmount,
    ).animate(CurvedAnimation(
      parent: _controller,
      curve: widget.curve,
    ));

    _opacityAnimation = Tween<double>(
      begin: 1.0,
      end: widget.opacityAmount,
    ).animate(CurvedAnimation(
      parent: _controller,
      curve: widget.curve,
    ));
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  void _onTapDown(TapDownDetails details) {
    if (!widget.enabled) return;
    _controller.forward();
  }

  void _onTapUp(TapUpDetails details) {
    if (!widget.enabled) return;
    _controller.reverse();
  }

  void _onTapCancel() {
    if (!widget.enabled) return;
    _controller.reverse();
  }

  void _onTap() {
    if (!widget.enabled) return;
    if (widget.hapticFeedback) {
      HapticFeedback.lightImpact();
    }
    widget.onTap?.call();
  }

  void _onLongPress() {
    if (!widget.enabled) return;
    if (widget.hapticFeedback) {
      HapticFeedback.mediumImpact();
    }
    widget.onLongPress?.call();
  }

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTapDown: _onTapDown,
      onTapUp: _onTapUp,
      onTapCancel: _onTapCancel,
      onTap: widget.onTap != null ? _onTap : null,
      onLongPress: widget.onLongPress != null ? _onLongPress : null,
      child: AnimatedBuilder(
        animation: _controller,
        builder: (context, child) {
          return Transform.scale(
            scale: _scaleAnimation.value,
            child: Opacity(
              opacity: _opacityAnimation.value,
              child: child,
            ),
          );
        },
        child: widget.child,
      ),
    );
  }
}

/// Bouncing button animation on tap
class BounceButton extends StatefulWidget {
  const BounceButton({
    super.key,
    required this.child,
    this.onTap,
    this.enabled = true,
    this.hapticFeedback = true,
    this.bounceScale = 0.9,
    this.duration,
  });

  final Widget child;
  final VoidCallback? onTap;
  final bool enabled;
  final bool hapticFeedback;
  final double bounceScale;
  final Duration? duration;

  @override
  State<BounceButton> createState() => _BounceButtonState();
}

class _BounceButtonState extends State<BounceButton>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _animation;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: widget.duration ?? AppDurations.fast,
    );

    _animation = TweenSequence<double>([
      TweenSequenceItem(
        tween: Tween(begin: 1.0, end: widget.bounceScale)
            .chain(CurveTween(curve: Curves.easeOut)),
        weight: 1,
      ),
      TweenSequenceItem(
        tween: Tween(begin: widget.bounceScale, end: 1.05)
            .chain(CurveTween(curve: Curves.easeOut)),
        weight: 1,
      ),
      TweenSequenceItem(
        tween:
            Tween(begin: 1.05, end: 1.0).chain(CurveTween(curve: Curves.easeIn)),
        weight: 1,
      ),
    ]).animate(_controller);
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  void _onTap() {
    if (!widget.enabled) return;
    if (widget.hapticFeedback) {
      HapticFeedback.lightImpact();
    }
    _controller.forward(from: 0);
    widget.onTap?.call();
  }

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: widget.onTap != null ? _onTap : null,
      child: AnimatedBuilder(
        animation: _animation,
        builder: (context, child) {
          return Transform.scale(
            scale: _animation.value,
            child: child,
          );
        },
        child: widget.child,
      ),
    );
  }
}

/// Ripple effect button (material ripple outside of Material widget)
class RippleButton extends StatelessWidget {
  const RippleButton({
    super.key,
    required this.child,
    this.onTap,
    this.onLongPress,
    this.borderRadius,
    this.splashColor,
    this.highlightColor,
    this.enabled = true,
  });

  final Widget child;
  final VoidCallback? onTap;
  final VoidCallback? onLongPress;
  final BorderRadius? borderRadius;
  final Color? splashColor;
  final Color? highlightColor;
  final bool enabled;

  @override
  Widget build(BuildContext context) {
    return Material(
      type: MaterialType.transparency,
      child: InkWell(
        onTap: enabled ? onTap : null,
        onLongPress: enabled ? onLongPress : null,
        borderRadius: borderRadius ?? BorderRadius.circular(AppRadius.md),
        splashColor: splashColor,
        highlightColor: highlightColor,
        child: child,
      ),
    );
  }
}

/// Icon button with rotation animation
class AnimatedIconButton extends StatefulWidget {
  const AnimatedIconButton({
    super.key,
    required this.icon,
    this.onTap,
    this.size = 24,
    this.color,
    this.backgroundColor,
    this.padding,
    this.rotationAngle = 0.0,
    this.animateRotation = false,
    this.hapticFeedback = true,
  });

  final IconData icon;
  final VoidCallback? onTap;
  final double size;
  final Color? color;
  final Color? backgroundColor;
  final EdgeInsets? padding;
  final double rotationAngle;
  final bool animateRotation;
  final bool hapticFeedback;

  @override
  State<AnimatedIconButton> createState() => _AnimatedIconButtonState();
}

class _AnimatedIconButtonState extends State<AnimatedIconButton>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: AppDurations.normal,
    );
  }

  @override
  void didUpdateWidget(AnimatedIconButton oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (widget.animateRotation && widget.rotationAngle != oldWidget.rotationAngle) {
      _controller.forward(from: 0);
    }
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  void _onTap() {
    if (widget.hapticFeedback) {
      HapticFeedback.selectionClick();
    }
    widget.onTap?.call();
  }

  @override
  Widget build(BuildContext context) {
    final effectiveColor =
        widget.color ?? Theme.of(context).colorScheme.onSurface;

    Widget icon = AnimatedRotation(
      turns: widget.rotationAngle / 360,
      duration: AppDurations.normal,
      curve: Curves.easeOutBack,
      child: Icon(
        widget.icon,
        size: widget.size,
        color: effectiveColor,
      ),
    );

    if (widget.backgroundColor != null) {
      icon = Container(
        padding: widget.padding ?? const EdgeInsets.all(8),
        decoration: BoxDecoration(
          color: widget.backgroundColor,
          shape: BoxShape.circle,
        ),
        child: icon,
      );
    }

    return AnimatedPressButton(
      onTap: widget.onTap != null ? _onTap : null,
      hapticFeedback: false, // Already handled above
      child: icon,
    );
  }
}

/// FAB with entrance animation
class AnimatedFab extends StatelessWidget {
  const AnimatedFab({
    super.key,
    required this.icon,
    required this.onPressed,
    this.label,
    this.extended = false,
    this.heroTag,
    this.backgroundColor,
    this.foregroundColor,
    this.elevation = 6,
    this.mini = false,
  });

  final IconData icon;
  final VoidCallback onPressed;
  final String? label;
  final bool extended;
  final String? heroTag;
  final Color? backgroundColor;
  final Color? foregroundColor;
  final double elevation;
  final bool mini;

  @override
  Widget build(BuildContext context) {
    Widget fab;

    if (extended && label != null) {
      fab = FloatingActionButton.extended(
        heroTag: heroTag,
        onPressed: onPressed,
        backgroundColor: backgroundColor,
        foregroundColor: foregroundColor,
        elevation: elevation,
        icon: Icon(icon),
        label: Text(label!),
      );
    } else {
      fab = FloatingActionButton(
        heroTag: heroTag,
        onPressed: onPressed,
        backgroundColor: backgroundColor,
        foregroundColor: foregroundColor,
        elevation: elevation,
        mini: mini,
        child: Icon(icon),
      );
    }

    return TweenAnimationBuilder<double>(
      tween: Tween(begin: 0, end: 1),
      duration: AppDurations.normal,
      curve: Curves.elasticOut,
      builder: (context, value, child) {
        return Transform.scale(
          scale: value,
          child: child,
        );
      },
      child: fab,
    );
  }
}

/// Toggle button with animated state change
class AnimatedToggle extends StatelessWidget {
  const AnimatedToggle({
    super.key,
    required this.value,
    required this.onChanged,
    this.activeIcon,
    this.inactiveIcon,
    this.activeColor,
    this.inactiveColor,
    this.size = 24,
    this.duration,
  });

  final bool value;
  final ValueChanged<bool> onChanged;
  final IconData? activeIcon;
  final IconData? inactiveIcon;
  final Color? activeColor;
  final Color? inactiveColor;
  final double size;
  final Duration? duration;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final effectiveActiveColor = activeColor ?? theme.colorScheme.primary;
    final effectiveInactiveColor =
        inactiveColor ?? theme.colorScheme.onSurface.withValues(alpha: 0.5);

    return AnimatedPressButton(
      onTap: () => onChanged(!value),
      child: AnimatedSwitcher(
        duration: duration ?? AppDurations.fast,
        transitionBuilder: (child, animation) {
          return ScaleTransition(
            scale: animation,
            child: FadeTransition(
              opacity: animation,
              child: child,
            ),
          );
        },
        child: Icon(
          value
              ? (activeIcon ?? Icons.check_circle)
              : (inactiveIcon ?? Icons.circle_outlined),
          key: ValueKey(value),
          size: size,
          color: value ? effectiveActiveColor : effectiveInactiveColor,
        ),
      ),
    );
  }
}
