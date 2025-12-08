/// Accessibility utilities and helpers for screen readers and assistive technologies
library;

import 'package:flutter/material.dart';
import 'package:flutter/semantics.dart';

/// Minimum touch target size per WCAG guidelines (44x44 logical pixels)
const double kMinTouchTargetSize = 44.0;

/// Semantic wrapper for interactive elements
class SemanticTappable extends StatelessWidget {
  const SemanticTappable({
    super.key,
    required this.child,
    required this.label,
    this.hint,
    this.onTap,
    this.isButton = true,
    this.isEnabled = true,
    this.isSelected,
    this.isChecked,
    this.isToggled,
  });

  final Widget child;
  final String label;
  final String? hint;
  final VoidCallback? onTap;
  final bool isButton;
  final bool isEnabled;
  final bool? isSelected;
  final bool? isChecked;
  final bool? isToggled;

  @override
  Widget build(BuildContext context) {
    return Semantics(
      label: label,
      hint: hint,
      button: isButton,
      enabled: isEnabled,
      selected: isSelected,
      checked: isChecked,
      toggled: isToggled,
      onTap: onTap,
      child: child,
    );
  }
}

/// Semantic wrapper for images
class SemanticImage extends StatelessWidget {
  const SemanticImage({
    super.key,
    required this.child,
    required this.label,
    this.isDecorative = false,
  });

  final Widget child;
  final String label;
  final bool isDecorative;

  @override
  Widget build(BuildContext context) {
    if (isDecorative) {
      return ExcludeSemantics(child: child);
    }
    return Semantics(
      label: label,
      image: true,
      child: child,
    );
  }
}

/// Semantic wrapper for headings
class SemanticHeading extends StatelessWidget {
  const SemanticHeading({
    super.key,
    required this.child,
    this.level = 1,
  });

  final Widget child;
  final int level;

  @override
  Widget build(BuildContext context) {
    return Semantics(
      header: true,
      child: child,
    );
  }
}

/// Semantic wrapper for live regions (announces changes to screen readers)
class SemanticLiveRegion extends StatelessWidget {
  const SemanticLiveRegion({
    super.key,
    required this.child,
    this.label,
  });

  final Widget child;
  final String? label;

  @override
  Widget build(BuildContext context) {
    return Semantics(
      liveRegion: true,
      label: label,
      child: child,
    );
  }
}

/// Wrapper that ensures minimum touch target size
class TouchTargetPadding extends StatelessWidget {
  const TouchTargetPadding({
    super.key,
    required this.child,
    this.minSize = kMinTouchTargetSize,
  });

  final Widget child;
  final double minSize;

  @override
  Widget build(BuildContext context) {
    return ConstrainedBox(
      constraints: BoxConstraints(
        minWidth: minSize,
        minHeight: minSize,
      ),
      child: Center(child: child),
    );
  }
}

/// Extension methods for accessibility
extension AccessibilityExtensions on Widget {
  /// Add semantic label to widget
  Widget withSemanticLabel(String label, {String? hint}) {
    return Semantics(
      label: label,
      hint: hint,
      child: this,
    );
  }

  /// Mark widget as a button with semantic label
  Widget asSemanticButton(String label, {VoidCallback? onTap, String? hint}) {
    return Semantics(
      label: label,
      hint: hint,
      button: true,
      onTap: onTap,
      child: this,
    );
  }

  /// Mark widget as a link
  Widget asSemanticLink(String label, {VoidCallback? onTap}) {
    return Semantics(
      label: label,
      link: true,
      onTap: onTap,
      child: this,
    );
  }

  /// Exclude widget from semantics tree (for decorative elements)
  Widget excludeFromSemantics() {
    return ExcludeSemantics(child: this);
  }

  /// Mark as heading
  Widget asSemanticHeading() {
    return Semantics(
      header: true,
      child: this,
    );
  }

  /// Ensure minimum touch target size
  Widget withMinTouchTarget([double size = kMinTouchTargetSize]) {
    return TouchTargetPadding(
      minSize: size,
      child: this,
    );
  }

  /// Add tooltip for accessibility
  Widget withTooltip(String message) {
    return Tooltip(
      message: message,
      child: this,
    );
  }
}

/// Accessibility-aware text scaling
class ScalableText extends StatelessWidget {
  const ScalableText(
    this.text, {
    super.key,
    this.style,
    this.textAlign,
    this.maxLines,
    this.overflow,
    this.minScale = 0.8,
    this.maxScale = 2.0,
  });

  final String text;
  final TextStyle? style;
  final TextAlign? textAlign;
  final int? maxLines;
  final TextOverflow? overflow;
  final double minScale;
  final double maxScale;

  @override
  Widget build(BuildContext context) {
    final mediaQuery = MediaQuery.of(context);
    final scaleFactor = mediaQuery.textScaler.scale(1.0).clamp(minScale, maxScale);

    return MediaQuery(
      data: mediaQuery.copyWith(
        textScaler: TextScaler.linear(scaleFactor),
      ),
      child: Text(
        text,
        style: style,
        textAlign: textAlign,
        maxLines: maxLines,
        overflow: overflow,
      ),
    );
  }
}

/// Announce message to screen reader
void announceToScreenReader(BuildContext context, String message) {
  // Use the view from context for multi-window support
  final view = View.of(context);
  SemanticsService.sendAnnouncement(view, message, TextDirection.ltr);
}

/// Check if screen reader is enabled
Future<bool> isScreenReaderEnabled() async {
  final binding = WidgetsBinding.instance;
  return binding.platformDispatcher.accessibilityFeatures.accessibleNavigation;
}

/// Check if reduce motion is enabled
bool isReduceMotionEnabled(BuildContext context) {
  return MediaQuery.of(context).disableAnimations;
}

/// Get appropriate animation duration based on reduce motion preference
Duration getAccessibleDuration(BuildContext context, Duration normal) {
  if (isReduceMotionEnabled(context)) {
    return Duration.zero;
  }
  return normal;
}

/// Semantic sort keys for ordering focus
class AccessibilitySortKeys {
  static const header = OrdinalSortKey(0);
  static const navigation = OrdinalSortKey(1);
  static const mainContent = OrdinalSortKey(2);
  static const actions = OrdinalSortKey(3);
  static const footer = OrdinalSortKey(4);
}

/// Focus node manager for keyboard navigation
class FocusManager {
  final List<FocusNode> _nodes = [];

  FocusNode createNode({String? debugLabel}) {
    final node = FocusNode(debugLabel: debugLabel);
    _nodes.add(node);
    return node;
  }

  void dispose() {
    for (final node in _nodes) {
      node.dispose();
    }
    _nodes.clear();
  }

  void focusFirst() {
    if (_nodes.isNotEmpty) {
      _nodes.first.requestFocus();
    }
  }

  void focusNext() {
    final currentIndex = _nodes.indexWhere((node) => node.hasFocus);
    if (currentIndex >= 0 && currentIndex < _nodes.length - 1) {
      _nodes[currentIndex + 1].requestFocus();
    }
  }

  void focusPrevious() {
    final currentIndex = _nodes.indexWhere((node) => node.hasFocus);
    if (currentIndex > 0) {
      _nodes[currentIndex - 1].requestFocus();
    }
  }
}

/// Color contrast checker
class ContrastChecker {
  /// Calculate relative luminance of a color
  static double luminance(Color color) {
    final r = _linearize(color.r / 255);
    final g = _linearize(color.g / 255);
    final b = _linearize(color.b / 255);
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  }

  static double _linearize(double value) {
    return value <= 0.03928
        ? value / 12.92
        : ((value + 0.055) / 1.055).clamp(0, 1);
  }

  /// Calculate contrast ratio between two colors
  static double contrastRatio(Color foreground, Color background) {
    final l1 = luminance(foreground);
    final l2 = luminance(background);
    final lighter = l1 > l2 ? l1 : l2;
    final darker = l1 > l2 ? l2 : l1;
    return (lighter + 0.05) / (darker + 0.05);
  }

  /// Check if contrast meets WCAG AA standard (4.5:1 for normal text)
  static bool meetsWcagAA(Color foreground, Color background) {
    return contrastRatio(foreground, background) >= 4.5;
  }

  /// Check if contrast meets WCAG AAA standard (7:1 for normal text)
  static bool meetsWcagAAA(Color foreground, Color background) {
    return contrastRatio(foreground, background) >= 7.0;
  }

  /// Check if contrast meets WCAG AA standard for large text (3:1)
  static bool meetsWcagAALargeText(Color foreground, Color background) {
    return contrastRatio(foreground, background) >= 3.0;
  }
}
