import 'package:flutter/material.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_text_styles.dart';

/// Animated number that counts up from 0 to target value
/// Port of the web Magic UI NumberTicker component
class NumberTicker extends StatefulWidget {
  /// The target number to count to
  final int value;

  /// Text style for the number
  final TextStyle? style;

  /// Duration of the animation
  final Duration duration;

  /// Optional prefix (e.g., "$", "+")
  final String prefix;

  /// Optional suffix (e.g., "%", "K")
  final String suffix;

  /// Number of decimal places (0 for integers)
  final int decimalPlaces;

  /// Whether to use gradient coloring
  final bool useGradient;

  /// Gradient colors
  final List<Color> gradientColors;

  /// Delay before starting animation
  final Duration delay;

  const NumberTicker({
    super.key,
    required this.value,
    this.style,
    this.duration = const Duration(milliseconds: 1500),
    this.prefix = '',
    this.suffix = '',
    this.decimalPlaces = 0,
    this.useGradient = false,
    this.gradientColors = const [
      AppColors.teal,
      AppColors.emerald,
      AppColors.green,
    ],
    this.delay = Duration.zero,
  });

  @override
  State<NumberTicker> createState() => _NumberTickerState();
}

class _NumberTickerState extends State<NumberTicker>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _animation;
  bool _started = false;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      duration: widget.duration,
      vsync: this,
    );

    _animation = CurvedAnimation(
      parent: _controller,
      curve: Curves.easeOutCubic,
    );

    if (widget.delay == Duration.zero) {
      _controller.forward();
      _started = true;
    } else {
      Future.delayed(widget.delay, () {
        if (mounted) {
          _controller.forward();
          _started = true;
        }
      });
    }
  }

  @override
  void didUpdateWidget(NumberTicker oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.value != widget.value && _started) {
      _controller.reset();
      _controller.forward();
    }
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  String _formatNumber(double value) {
    if (widget.decimalPlaces == 0) {
      return value.round().toString();
    }
    return value.toStringAsFixed(widget.decimalPlaces);
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: _animation,
      builder: (context, child) {
        final currentValue = _animation.value * widget.value;
        final displayText =
            '${widget.prefix}${_formatNumber(currentValue)}${widget.suffix}';

        final textStyle = widget.style ?? AppTextStyles.stat;

        if (widget.useGradient) {
          return ShaderMask(
            shaderCallback: (bounds) {
              return LinearGradient(
                colors: widget.gradientColors,
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ).createShader(bounds);
            },
            child: Text(
              displayText,
              style: textStyle.copyWith(color: Colors.white),
            ),
          );
        }

        return Text(displayText, style: textStyle);
      },
    );
  }
}

/// Double version of NumberTicker for decimal values
class NumberTickerDouble extends StatefulWidget {
  final double value;
  final TextStyle? style;
  final Duration duration;
  final String prefix;
  final String suffix;
  final int decimalPlaces;
  final bool useGradient;
  final List<Color> gradientColors;
  final Duration delay;

  const NumberTickerDouble({
    super.key,
    required this.value,
    this.style,
    this.duration = const Duration(milliseconds: 1500),
    this.prefix = '',
    this.suffix = '',
    this.decimalPlaces = 1,
    this.useGradient = false,
    this.gradientColors = const [
      AppColors.teal,
      AppColors.emerald,
      AppColors.green,
    ],
    this.delay = Duration.zero,
  });

  @override
  State<NumberTickerDouble> createState() => _NumberTickerDoubleState();
}

class _NumberTickerDoubleState extends State<NumberTickerDouble>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _animation;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      duration: widget.duration,
      vsync: this,
    );

    _animation = CurvedAnimation(
      parent: _controller,
      curve: Curves.easeOutCubic,
    );

    Future.delayed(widget.delay, () {
      if (mounted) {
        _controller.forward();
      }
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
      animation: _animation,
      builder: (context, child) {
        final currentValue = _animation.value * widget.value;
        final displayText =
            '${widget.prefix}${currentValue.toStringAsFixed(widget.decimalPlaces)}${widget.suffix}';

        final textStyle = widget.style ?? AppTextStyles.stat;

        if (widget.useGradient) {
          return ShaderMask(
            shaderCallback: (bounds) {
              return LinearGradient(
                colors: widget.gradientColors,
              ).createShader(bounds);
            },
            child: Text(
              displayText,
              style: textStyle.copyWith(color: Colors.white),
            ),
          );
        }

        return Text(displayText, style: textStyle);
      },
    );
  }
}
