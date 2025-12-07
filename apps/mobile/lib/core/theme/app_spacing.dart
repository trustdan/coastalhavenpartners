import 'package:flutter/material.dart';

/// Spacing and sizing constants
/// Consistent spacing scale used throughout the app
class AppSpacing {
  AppSpacing._();

  // Base spacing scale (4px increments)
  static const double xxs = 2;
  static const double xs = 4;
  static const double sm = 8;
  static const double md = 16;
  static const double lg = 24;
  static const double xl = 32;
  static const double xxl = 48;
  static const double xxxl = 64;

  // Common padding presets
  static const screenPadding = EdgeInsets.all(md);
  static const screenPaddingHorizontal = EdgeInsets.symmetric(horizontal: md);
  static const cardPadding = EdgeInsets.all(md);
  static const cardPaddingCompact = EdgeInsets.all(sm);
  static const listItemPadding = EdgeInsets.symmetric(horizontal: md, vertical: sm);
  static const buttonPadding = EdgeInsets.symmetric(horizontal: lg, vertical: md);
  static const chipPadding = EdgeInsets.symmetric(horizontal: sm, vertical: xs);
  static const inputPadding = EdgeInsets.symmetric(horizontal: md, vertical: sm);

  // Section spacing
  static const sectionGap = SizedBox(height: xl);
  static const subsectionGap = SizedBox(height: md);
  static const itemGap = SizedBox(height: sm);
  static const tinyGap = SizedBox(height: xs);

  // Horizontal spacing
  static const hGapXs = SizedBox(width: xs);
  static const hGapSm = SizedBox(width: sm);
  static const hGapMd = SizedBox(width: md);
  static const hGapLg = SizedBox(width: lg);
}

/// Border radius constants
class AppRadius {
  AppRadius._();

  static const double xs = 4;
  static const double sm = 8;
  static const double md = 12;
  static const double lg = 16;
  static const double xl = 24;
  static const double xxl = 32;
  static const double full = 9999;

  // Common border radius presets
  static final button = BorderRadius.circular(md);
  static final card = BorderRadius.circular(lg);
  static final input = BorderRadius.circular(md);
  static final chip = BorderRadius.circular(full);
  static final dialog = BorderRadius.circular(xl);
  static final bottomSheet = BorderRadius.vertical(top: Radius.circular(xl));
}

/// Size constants
class AppSizes {
  AppSizes._();

  // Icon sizes
  static const double iconXs = 12;
  static const double iconSm = 16;
  static const double iconMd = 20;
  static const double iconLg = 24;
  static const double iconXl = 32;
  static const double iconXxl = 48;

  // Avatar sizes
  static const double avatarSm = 32;
  static const double avatarMd = 40;
  static const double avatarLg = 56;
  static const double avatarXl = 80;
  static const double avatarXxl = 120;

  // Button heights
  static const double buttonHeightSm = 36;
  static const double buttonHeightMd = 48;
  static const double buttonHeightLg = 56;

  // Input heights
  static const double inputHeight = 48;
  static const double inputHeightLg = 56;

  // App bar height
  static const double appBarHeight = 56;

  // Bottom nav height
  static const double bottomNavHeight = 64;

  // Bottom sheet min height
  static const double bottomSheetMinHeight = 200;

  // Max content width (for tablets)
  static const double maxContentWidth = 600;
}

/// Durations for animations
class AppDurations {
  AppDurations._();

  static const fastest = Duration(milliseconds: 100);
  static const fast = Duration(milliseconds: 200);
  static const normal = Duration(milliseconds: 300);
  static const slow = Duration(milliseconds: 500);
  static const slower = Duration(milliseconds: 800);
  static const slowest = Duration(milliseconds: 1000);

  // Specific animation durations
  static const shimmer = Duration(seconds: 2);
  static const meteor = Duration(seconds: 5);
  static const aurora = Duration(seconds: 8);
  static const fadeIn = Duration(milliseconds: 400);
  static const slideUp = Duration(milliseconds: 500);
}
