import 'package:flutter/material.dart';
import '../../core/theme/app_colors.dart';

/// Animated shimmering gradient text
/// Port of the web Magic UI AnimatedShinyText component
class ShimmerText extends StatefulWidget {
  /// The text to display
  final String text;

  /// Text style (color will be overridden by gradient)
  final TextStyle? style;

  /// Gradient colors for the shimmer effect
  final List<Color> colors;

  /// Animation duration
  final Duration duration;

  /// Text alignment
  final TextAlign? textAlign;

  /// Maximum lines
  final int? maxLines;

  const ShimmerText({
    super.key,
    required this.text,
    this.style,
    this.colors = const [
      AppColors.teal,
      AppColors.emerald,
      AppColors.green,
      AppColors.teal,
    ],
    this.duration = const Duration(seconds: 3),
    this.textAlign,
    this.maxLines,
  });

  @override
  State<ShimmerText> createState() => _ShimmerTextState();
}

class _ShimmerTextState extends State<ShimmerText>
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
    return AnimatedBuilder(
      animation: _controller,
      builder: (context, child) {
        return ShaderMask(
          shaderCallback: (bounds) {
            return LinearGradient(
              colors: widget.colors,
              stops: const [0.0, 0.4, 0.6, 1.0],
              begin: Alignment(-1.0 + (_controller.value * 3), 0),
              end: Alignment(1.0 + (_controller.value * 3), 0),
            ).createShader(bounds);
          },
          child: Text(
            widget.text,
            style: (widget.style ?? const TextStyle()).copyWith(
              color: Colors.white, // Required for ShaderMask
            ),
            textAlign: widget.textAlign,
            maxLines: widget.maxLines,
          ),
        );
      },
    );
  }
}

/// Aurora gradient text with animated color shifts
/// Port of the web Magic UI AuroraText component
class AuroraText extends StatefulWidget {
  /// The text to display
  final String text;

  /// Text style
  final TextStyle? style;

  /// Gradient colors
  final List<Color> colors;

  /// Animation duration
  final Duration duration;

  /// Text alignment
  final TextAlign? textAlign;

  const AuroraText({
    super.key,
    required this.text,
    this.style,
    this.colors = const [
      AppColors.teal,
      AppColors.emerald,
      AppColors.green,
    ],
    this.duration = const Duration(seconds: 8),
    this.textAlign,
  });

  @override
  State<AuroraText> createState() => _AuroraTextState();
}

class _AuroraTextState extends State<AuroraText>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      duration: widget.duration,
      vsync: this,
    )..repeat(reverse: true);
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

        return ShaderMask(
          shaderCallback: (bounds) {
            return LinearGradient(
              colors: widget.colors,
              begin: Alignment(-1.0 + progress, -1.0 + progress),
              end: Alignment(1.0 - progress, 1.0 - progress),
              transform: GradientRotation(progress * 0.5),
            ).createShader(bounds);
          },
          child: Text(
            widget.text,
            style: (widget.style ?? const TextStyle()).copyWith(
              color: Colors.white,
            ),
            textAlign: widget.textAlign,
          ),
        );
      },
    );
  }
}

/// Static gradient text (no animation)
class GradientText extends StatelessWidget {
  final String text;
  final TextStyle? style;
  final List<Color> colors;
  final TextAlign? textAlign;
  final int? maxLines;

  const GradientText({
    super.key,
    required this.text,
    this.style,
    this.colors = const [
      AppColors.teal,
      AppColors.emerald,
      AppColors.green,
    ],
    this.textAlign,
    this.maxLines,
  });

  @override
  Widget build(BuildContext context) {
    return ShaderMask(
      shaderCallback: (bounds) {
        return LinearGradient(
          colors: colors,
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ).createShader(bounds);
      },
      child: Text(
        text,
        style: (style ?? const TextStyle()).copyWith(
          color: Colors.white,
        ),
        textAlign: textAlign,
        maxLines: maxLines,
      ),
    );
  }
}
