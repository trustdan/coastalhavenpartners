import 'package:flutter/material.dart';
import 'package:cached_network_image/cached_network_image.dart';
import '../theme/app_spacing.dart';

/// Hero wrapper for profile photos with consistent animation
///
/// Usage:
/// ```dart
/// // Source screen
/// HeroAvatar(
///   tag: 'profile-${user.id}',
///   imageUrl: user.photoUrl,
///   name: user.name,
///   size: 48,
/// )
///
/// // Destination screen
/// HeroAvatar(
///   tag: 'profile-${user.id}',
///   imageUrl: user.photoUrl,
///   name: user.name,
///   size: 120,
/// )
/// ```
class HeroAvatar extends StatelessWidget {
  const HeroAvatar({
    super.key,
    required this.tag,
    this.imageUrl,
    this.name,
    this.size = 48,
    this.borderRadius,
    this.borderColor,
    this.borderWidth = 0,
    this.backgroundColor,
    this.textStyle,
    this.onTap,
    this.heroEnabled = true,
    this.placeholderIcon,
  });

  /// Unique tag for Hero animation (e.g., 'profile-{userId}')
  final String tag;

  /// URL of the profile image
  final String? imageUrl;

  /// Name to show initials from if no image
  final String? name;

  /// Size of the avatar (width and height)
  final double size;

  /// Custom border radius (defaults to circular)
  final BorderRadius? borderRadius;

  /// Border color
  final Color? borderColor;

  /// Border width
  final double borderWidth;

  /// Background color for placeholder
  final Color? backgroundColor;

  /// Text style for initials
  final TextStyle? textStyle;

  /// Tap callback
  final VoidCallback? onTap;

  /// Whether to enable Hero animation
  final bool heroEnabled;

  /// Custom placeholder icon when no image/name
  final IconData? placeholderIcon;

  @override
  Widget build(BuildContext context) {
    final avatar = _buildAvatar(context);

    if (!heroEnabled) return avatar;

    return Hero(
      tag: tag,
      flightShuttleBuilder: _flightShuttleBuilder,
      child: avatar,
    );
  }

  Widget _buildAvatar(BuildContext context) {
    final effectiveRadius = borderRadius ?? BorderRadius.circular(size / 2);
    final effectiveBgColor =
        backgroundColor ?? Theme.of(context).colorScheme.primaryContainer;

    Widget content;

    if (imageUrl != null && imageUrl!.isNotEmpty) {
      content = CachedNetworkImage(
        imageUrl: imageUrl!,
        width: size,
        height: size,
        fit: BoxFit.cover,
        placeholder: (context, url) => _buildPlaceholder(context, effectiveBgColor),
        errorWidget: (context, url, error) =>
            _buildPlaceholder(context, effectiveBgColor),
      );
    } else {
      content = _buildPlaceholder(context, effectiveBgColor);
    }

    Widget avatar = Container(
      width: size,
      height: size,
      decoration: BoxDecoration(
        borderRadius: effectiveRadius,
        border: borderWidth > 0
            ? Border.all(
                color: borderColor ?? Theme.of(context).colorScheme.outline,
                width: borderWidth,
              )
            : null,
      ),
      child: ClipRRect(
        borderRadius: effectiveRadius,
        child: content,
      ),
    );

    if (onTap != null) {
      avatar = GestureDetector(
        onTap: onTap,
        child: avatar,
      );
    }

    return avatar;
  }

  Widget _buildPlaceholder(BuildContext context, Color bgColor) {
    if (name != null && name!.isNotEmpty) {
      final initials = _getInitials(name!);
      final fontSize = size * 0.4;
      return Container(
        width: size,
        height: size,
        color: bgColor,
        alignment: Alignment.center,
        child: Text(
          initials,
          style: textStyle ??
              TextStyle(
                fontSize: fontSize,
                fontWeight: FontWeight.w600,
                color: Theme.of(context).colorScheme.onPrimaryContainer,
              ),
        ),
      );
    }

    return Container(
      width: size,
      height: size,
      color: bgColor,
      alignment: Alignment.center,
      child: Icon(
        placeholderIcon ?? Icons.person,
        size: size * 0.5,
        color: Theme.of(context).colorScheme.onPrimaryContainer,
      ),
    );
  }

  String _getInitials(String name) {
    final parts = name.trim().split(RegExp(r'\s+'));
    if (parts.length >= 2) {
      return '${parts.first[0]}${parts.last[0]}'.toUpperCase();
    } else if (parts.isNotEmpty && parts.first.isNotEmpty) {
      return parts.first[0].toUpperCase();
    }
    return '';
  }

  Widget _flightShuttleBuilder(
    BuildContext flightContext,
    Animation<double> animation,
    HeroFlightDirection flightDirection,
    BuildContext fromHeroContext,
    BuildContext toHeroContext,
  ) {
    return AnimatedBuilder(
      animation: animation,
      builder: (context, child) {
        return _buildAvatar(context);
      },
    );
  }
}

/// Hero wrapper for any widget with custom flight animation
class HeroWrapper extends StatelessWidget {
  const HeroWrapper({
    super.key,
    required this.tag,
    required this.child,
    this.enabled = true,
    this.placeholderBuilder,
  });

  final String tag;
  final Widget child;
  final bool enabled;
  final Widget Function(BuildContext, Size, Widget)? placeholderBuilder;

  @override
  Widget build(BuildContext context) {
    if (!enabled) return child;

    return Hero(
      tag: tag,
      placeholderBuilder: placeholderBuilder,
      child: Material(
        type: MaterialType.transparency,
        child: child,
      ),
    );
  }
}

/// Hero wrapper for cards with elevation animation
class HeroCard extends StatelessWidget {
  const HeroCard({
    super.key,
    required this.tag,
    required this.child,
    this.enabled = true,
    this.borderRadius,
    this.color,
    this.elevation = 1,
    this.padding,
  });

  final String tag;
  final Widget child;
  final bool enabled;
  final BorderRadius? borderRadius;
  final Color? color;
  final double elevation;
  final EdgeInsets? padding;

  @override
  Widget build(BuildContext context) {
    final effectiveRadius = borderRadius ?? AppRadius.card;

    final card = Material(
      elevation: elevation,
      borderRadius: effectiveRadius,
      color: color ?? Theme.of(context).colorScheme.surface,
      child: Padding(
        padding: padding ?? EdgeInsets.zero,
        child: child,
      ),
    );

    if (!enabled) return card;

    return Hero(
      tag: tag,
      child: card,
    );
  }
}

/// Hero image with loading and error states
class HeroImage extends StatelessWidget {
  const HeroImage({
    super.key,
    required this.tag,
    required this.imageUrl,
    this.width,
    this.height,
    this.fit = BoxFit.cover,
    this.borderRadius,
    this.enabled = true,
    this.onTap,
  });

  final String tag;
  final String imageUrl;
  final double? width;
  final double? height;
  final BoxFit fit;
  final BorderRadius? borderRadius;
  final bool enabled;
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    Widget image = CachedNetworkImage(
      imageUrl: imageUrl,
      width: width,
      height: height,
      fit: fit,
      placeholder: (context, url) => Container(
        width: width,
        height: height,
        color: Theme.of(context).colorScheme.surfaceContainerHighest,
        child: const Center(
          child: CircularProgressIndicator(strokeWidth: 2),
        ),
      ),
      errorWidget: (context, url, error) => Container(
        width: width,
        height: height,
        color: Theme.of(context).colorScheme.surfaceContainerHighest,
        child: Icon(
          Icons.broken_image_outlined,
          color: Theme.of(context).colorScheme.onSurfaceVariant,
        ),
      ),
    );

    if (borderRadius != null) {
      image = ClipRRect(
        borderRadius: borderRadius!,
        child: image,
      );
    }

    if (onTap != null) {
      image = GestureDetector(
        onTap: onTap,
        child: image,
      );
    }

    if (!enabled) return image;

    return Hero(
      tag: tag,
      child: Material(
        type: MaterialType.transparency,
        child: image,
      ),
    );
  }
}
