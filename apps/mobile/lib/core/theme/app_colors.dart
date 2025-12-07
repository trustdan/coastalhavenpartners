import 'package:flutter/material.dart';

/// Coastal Haven Partners brand colors
/// Matches the web application's teal/emerald/green theme
class AppColors {
  AppColors._();

  // Primary brand colors
  static const teal = Color(0xFF14B8A6);
  static const emerald = Color(0xFF10B981);
  static const green = Color(0xFF047857);

  // Brand gradient (for shimmer effects)
  static const brandGradient = LinearGradient(
    colors: [teal, emerald, green],
  );

  static const brandGradientReversed = LinearGradient(
    colors: [green, emerald, teal],
  );

  // Status colors
  static const success = Color(0xFF22C55E);
  static const warning = Color(0xFFEAB308);
  static const error = Color(0xFFEF4444);
  static const info = Color(0xFF3B82F6);
  static const purple = Color(0xFF8B5CF6); // "Interviewed" status

  // Application status colors (matching web)
  static const statusPending = Color(0xFFEAB308); // Yellow
  static const statusReviewing = Color(0xFF3B82F6); // Blue
  static const statusInterviewed = Color(0xFF8B5CF6); // Purple
  static const statusAccepted = Color(0xFF22C55E); // Green
  static const statusRejected = Color(0xFFEF4444); // Red

  // Light theme colors
  static const backgroundLight = Color(0xFFFAFAFA);
  static const surfaceLight = Colors.white;
  static const cardLight = Colors.white;
  static const textPrimaryLight = Color(0xFF171717);
  static const textSecondaryLight = Color(0xFF737373);
  static const textMutedLight = Color(0xFFA3A3A3);
  static const borderLight = Color(0xFFE5E5E5);
  static const dividerLight = Color(0xFFF5F5F5);

  // Dark theme colors
  static const backgroundDark = Color(0xFF0A0A0A);
  static const surfaceDark = Color(0xFF171717);
  static const cardDark = Color(0xFF1F1F1F);
  static const textPrimaryDark = Color(0xFFFAFAFA);
  static const textSecondaryDark = Color(0xFFA3A3A3);
  static const textMutedDark = Color(0xFF737373);
  static const borderDark = Color(0xFF262626);
  static const dividerDark = Color(0xFF262626);

  // Shimmer/glow colors
  static const shimmerBase = Color(0xFF171717);
  static const shimmerHighlight = Color(0xFF2A2A2A);
  static const meteorGlow = Color(0x8010B981); // 50% opacity emerald

  // Overlay colors
  static const overlayLight = Color(0x0A000000); // 4% black
  static const overlayMedium = Color(0x1A000000); // 10% black
  static const overlayHeavy = Color(0x4D000000); // 30% black
}
