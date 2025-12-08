import 'dart:async';
import 'package:flutter/material.dart';
import '../../core/theme/app_colors.dart';

/// Typewriter-style text animation
/// Port of the web Magic UI TypingAnimation component
class TypingAnimation extends StatefulWidget {
  /// The text to type out
  final String text;

  /// Text style
  final TextStyle? style;

  /// Speed of typing (characters per second)
  final double charactersPerSecond;

  /// Whether to show a blinking cursor
  final bool showCursor;

  /// Cursor character
  final String cursor;

  /// Cursor color
  final Color? cursorColor;

  /// Delay before starting
  final Duration delay;

  /// Callback when typing is complete
  final VoidCallback? onComplete;

  /// Whether to loop the animation
  final bool loop;

  /// Delay before restarting (if looping)
  final Duration loopDelay;

  const TypingAnimation({
    super.key,
    required this.text,
    this.style,
    this.charactersPerSecond = 20,
    this.showCursor = true,
    this.cursor = '|',
    this.cursorColor,
    this.delay = Duration.zero,
    this.onComplete,
    this.loop = false,
    this.loopDelay = const Duration(seconds: 2),
  });

  @override
  State<TypingAnimation> createState() => _TypingAnimationState();
}

class _TypingAnimationState extends State<TypingAnimation> {
  String _displayText = '';
  int _currentIndex = 0;
  Timer? _typingTimer;
  Timer? _cursorTimer;
  bool _showCursor = true;
  bool _isComplete = false;

  @override
  void initState() {
    super.initState();
    _startTyping();
    if (widget.showCursor) {
      _startCursorBlink();
    }
  }

  void _startTyping() {
    Future.delayed(widget.delay, () {
      if (!mounted) return;

      final interval = Duration(
        milliseconds: (1000 / widget.charactersPerSecond).round(),
      );

      _typingTimer = Timer.periodic(interval, (timer) {
        if (!mounted) {
          timer.cancel();
          return;
        }

        if (_currentIndex < widget.text.length) {
          setState(() {
            _displayText = widget.text.substring(0, _currentIndex + 1);
            _currentIndex++;
          });
        } else {
          timer.cancel();
          setState(() {
            _isComplete = true;
          });
          widget.onComplete?.call();

          if (widget.loop) {
            Future.delayed(widget.loopDelay, () {
              if (mounted) {
                setState(() {
                  _displayText = '';
                  _currentIndex = 0;
                  _isComplete = false;
                });
                _startTyping();
              }
            });
          }
        }
      });
    });
  }

  void _startCursorBlink() {
    _cursorTimer = Timer.periodic(const Duration(milliseconds: 600), (timer) {
      if (!mounted) {
        timer.cancel();
        return;
      }
      setState(() {
        _showCursor = !_showCursor;
      });
    });
  }

  @override
  void dispose() {
    _typingTimer?.cancel();
    _cursorTimer?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final cursorWidget = widget.showCursor && _showCursor
        ? Text(
            widget.cursor,
            style: (widget.style ?? const TextStyle()).copyWith(
              color: widget.cursorColor ?? AppColors.teal,
            ),
          )
        : const SizedBox(width: 8); // Invisible placeholder for consistent width

    return Row(
      mainAxisSize: MainAxisSize.min,
      crossAxisAlignment: CrossAxisAlignment.end,
      children: [
        Flexible(
          child: Text(
            _displayText,
            style: widget.style,
          ),
        ),
        if (widget.showCursor && !_isComplete) cursorWidget,
      ],
    );
  }
}

/// Multi-line typing animation that types line by line
class MultiLineTypingAnimation extends StatefulWidget {
  /// Lines of text to type
  final List<String> lines;

  /// Text style
  final TextStyle? style;

  /// Speed of typing
  final double charactersPerSecond;

  /// Delay between lines
  final Duration linePause;

  /// Initial delay
  final Duration delay;

  /// Whether to show cursor
  final bool showCursor;

  const MultiLineTypingAnimation({
    super.key,
    required this.lines,
    this.style,
    this.charactersPerSecond = 20,
    this.linePause = const Duration(milliseconds: 300),
    this.delay = Duration.zero,
    this.showCursor = true,
  });

  @override
  State<MultiLineTypingAnimation> createState() =>
      _MultiLineTypingAnimationState();
}

class _MultiLineTypingAnimationState extends State<MultiLineTypingAnimation> {
  List<String> _displayLines = [];
  int _currentLineIndex = 0;
  String _currentLineText = '';
  int _currentCharIndex = 0;
  Timer? _typingTimer;
  bool _showCursor = true;
  Timer? _cursorTimer;

  @override
  void initState() {
    super.initState();
    _displayLines = List.filled(widget.lines.length, '');
    _startTyping();
    if (widget.showCursor) {
      _startCursorBlink();
    }
  }

  void _startTyping() {
    Future.delayed(widget.delay, () {
      if (!mounted) return;
      _typeNextCharacter();
    });
  }

  void _typeNextCharacter() {
    if (!mounted) return;

    if (_currentLineIndex >= widget.lines.length) {
      return; // All lines complete
    }

    final currentLine = widget.lines[_currentLineIndex];

    if (_currentCharIndex < currentLine.length) {
      setState(() {
        _currentLineText = currentLine.substring(0, _currentCharIndex + 1);
        _displayLines[_currentLineIndex] = _currentLineText;
        _currentCharIndex++;
      });

      final interval = Duration(
        milliseconds: (1000 / widget.charactersPerSecond).round(),
      );
      Future.delayed(interval, _typeNextCharacter);
    } else {
      // Line complete, move to next
      Future.delayed(widget.linePause, () {
        if (!mounted) return;
        setState(() {
          _currentLineIndex++;
          _currentCharIndex = 0;
          _currentLineText = '';
        });
        _typeNextCharacter();
      });
    }
  }

  void _startCursorBlink() {
    _cursorTimer = Timer.periodic(const Duration(milliseconds: 600), (timer) {
      if (!mounted) {
        timer.cancel();
        return;
      }
      setState(() {
        _showCursor = !_showCursor;
      });
    });
  }

  @override
  void dispose() {
    _typingTimer?.cancel();
    _cursorTimer?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      mainAxisSize: MainAxisSize.min,
      children: [
        for (int i = 0; i < _displayLines.length; i++)
          Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(
                _displayLines[i],
                style: widget.style,
              ),
              if (widget.showCursor &&
                  i == _currentLineIndex &&
                  _currentLineIndex < widget.lines.length &&
                  _showCursor)
                Text(
                  '|',
                  style: (widget.style ?? const TextStyle()).copyWith(
                    color: AppColors.teal,
                  ),
                ),
            ],
          ),
      ],
    );
  }
}
