import 'package:flutter/material.dart';
import '../../core/theme/app_spacing.dart';

/// Shimmer effect for skeleton loading states
class ShimmerEffect extends StatefulWidget {
  final Widget child;
  final bool enabled;

  const ShimmerEffect({
    super.key,
    required this.child,
    this.enabled = true,
  });

  @override
  State<ShimmerEffect> createState() => _ShimmerEffectState();
}

class _ShimmerEffectState extends State<ShimmerEffect>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _animation;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      duration: const Duration(milliseconds: 1500),
      vsync: this,
    )..repeat();

    _animation = Tween<double>(begin: -2, end: 2).animate(
      CurvedAnimation(parent: _controller, curve: Curves.easeInOut),
    );
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    if (!widget.enabled) {
      return widget.child;
    }

    final isDark = Theme.of(context).brightness == Brightness.dark;
    final baseColor = isDark ? Colors.white10 : Colors.grey.shade300;
    final highlightColor = isDark ? Colors.white24 : Colors.grey.shade100;

    return AnimatedBuilder(
      animation: _animation,
      builder: (context, child) {
        return ShaderMask(
          shaderCallback: (bounds) {
            return LinearGradient(
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
              colors: [
                baseColor,
                highlightColor,
                baseColor,
              ],
              stops: const [0.0, 0.5, 1.0],
              transform: _SlidingGradientTransform(_animation.value),
            ).createShader(bounds);
          },
          blendMode: BlendMode.srcATop,
          child: widget.child,
        );
      },
    );
  }
}

class _SlidingGradientTransform extends GradientTransform {
  final double slidePercent;

  const _SlidingGradientTransform(this.slidePercent);

  @override
  Matrix4? transform(Rect bounds, {TextDirection? textDirection}) {
    return Matrix4.translationValues(bounds.width * slidePercent, 0, 0);
  }
}

/// Base skeleton box
class SkeletonBox extends StatelessWidget {
  final double? width;
  final double height;
  final BorderRadius? borderRadius;

  const SkeletonBox({
    super.key,
    this.width,
    required this.height,
    this.borderRadius,
  });

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Container(
      width: width,
      height: height,
      decoration: BoxDecoration(
        color: isDark ? Colors.white10 : Colors.grey.shade300,
        borderRadius: borderRadius ?? BorderRadius.circular(4),
      ),
    );
  }
}

/// Skeleton for text lines
class SkeletonText extends StatelessWidget {
  final int lines;
  final double? width;
  final double lineHeight;
  final double spacing;

  const SkeletonText({
    super.key,
    this.lines = 1,
    this.width,
    this.lineHeight = 14,
    this.spacing = 8,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: List.generate(lines, (index) {
        // Make last line shorter
        final isLast = index == lines - 1;
        final lineWidth = isLast && lines > 1 ? (width ?? 200) * 0.7 : width;

        return Padding(
          padding: EdgeInsets.only(bottom: index < lines - 1 ? spacing : 0),
          child: SkeletonBox(
            width: lineWidth,
            height: lineHeight,
          ),
        );
      }),
    );
  }
}

/// Skeleton for circular avatar
class SkeletonAvatar extends StatelessWidget {
  final double size;

  const SkeletonAvatar({
    super.key,
    this.size = 40,
  });

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Container(
      width: size,
      height: size,
      decoration: BoxDecoration(
        color: isDark ? Colors.white10 : Colors.grey.shade300,
        shape: BoxShape.circle,
      ),
    );
  }
}

/// Skeleton for list tile
class SkeletonListTile extends StatelessWidget {
  final bool hasLeading;
  final bool hasTrailing;
  final double? leadingSize;

  const SkeletonListTile({
    super.key,
    this.hasLeading = true,
    this.hasTrailing = false,
    this.leadingSize,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      child: Row(
        children: [
          if (hasLeading) ...[
            SkeletonAvatar(size: leadingSize ?? 40),
            const SizedBox(width: 16),
          ],
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                SkeletonBox(width: 150, height: 14),
                const SizedBox(height: 8),
                SkeletonBox(width: 100, height: 12),
              ],
            ),
          ),
          if (hasTrailing) ...[
            const SizedBox(width: 16),
            SkeletonBox(width: 60, height: 14),
          ],
        ],
      ),
    );
  }
}

/// Skeleton for card
class SkeletonCard extends StatelessWidget {
  final double? height;
  final bool hasImage;
  final int textLines;

  const SkeletonCard({
    super.key,
    this.height,
    this.hasImage = false,
    this.textLines = 3,
  });

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Container(
      height: height,
      decoration: BoxDecoration(
        color: isDark ? Colors.white.withValues(alpha: 0.05) : Colors.white,
        borderRadius: AppRadius.card,
        border: Border.all(
          color: isDark ? Colors.white10 : Colors.grey.shade200,
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          if (hasImage)
            SkeletonBox(
              height: 120,
              borderRadius: const BorderRadius.vertical(
                top: Radius.circular(12),
              ),
            ),
          Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                SkeletonBox(width: 180, height: 18),
                const SizedBox(height: 12),
                SkeletonText(lines: textLines, width: double.infinity),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

/// Skeleton for job card
class SkeletonJobCard extends StatelessWidget {
  const SkeletonJobCard({super.key});

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: isDark ? Colors.white.withValues(alpha: 0.05) : Colors.white,
        borderRadius: AppRadius.card,
        border: Border.all(
          color: isDark ? Colors.white10 : Colors.grey.shade200,
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              SkeletonAvatar(size: 48),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    SkeletonBox(width: 150, height: 16),
                    const SizedBox(height: 6),
                    SkeletonBox(width: 100, height: 12),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          SkeletonText(lines: 2, width: double.infinity),
          const SizedBox(height: 12),
          Row(
            children: [
              SkeletonBox(width: 60, height: 24, borderRadius: BorderRadius.circular(12)),
              const SizedBox(width: 8),
              SkeletonBox(width: 80, height: 24, borderRadius: BorderRadius.circular(12)),
              const SizedBox(width: 8),
              SkeletonBox(width: 50, height: 24, borderRadius: BorderRadius.circular(12)),
            ],
          ),
        ],
      ),
    );
  }
}

/// Skeleton for candidate card
class SkeletonCandidateCard extends StatelessWidget {
  const SkeletonCandidateCard({super.key});

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: isDark ? Colors.white.withValues(alpha: 0.05) : Colors.white,
        borderRadius: AppRadius.card,
        border: Border.all(
          color: isDark ? Colors.white10 : Colors.grey.shade200,
        ),
      ),
      child: Row(
        children: [
          SkeletonAvatar(size: 56),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                SkeletonBox(width: 120, height: 16),
                const SizedBox(height: 6),
                SkeletonBox(width: 160, height: 12),
                const SizedBox(height: 6),
                Row(
                  children: [
                    SkeletonBox(width: 40, height: 20, borderRadius: BorderRadius.circular(4)),
                    const SizedBox(width: 8),
                    SkeletonBox(width: 60, height: 20, borderRadius: BorderRadius.circular(10)),
                  ],
                ),
              ],
            ),
          ),
          SkeletonBox(width: 32, height: 32, borderRadius: BorderRadius.circular(16)),
        ],
      ),
    );
  }
}

/// Skeleton for conversation/message item
class SkeletonConversationItem extends StatelessWidget {
  const SkeletonConversationItem({super.key});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      child: Row(
        children: [
          SkeletonAvatar(size: 52),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    SkeletonBox(width: 100, height: 14),
                    SkeletonBox(width: 40, height: 12),
                  ],
                ),
                const SizedBox(height: 6),
                SkeletonBox(width: 180, height: 12),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

/// Skeleton list with multiple items
class SkeletonList extends StatelessWidget {
  final int itemCount;
  final Widget Function(BuildContext, int) itemBuilder;
  final bool hasShimmer;

  const SkeletonList({
    super.key,
    this.itemCount = 5,
    required this.itemBuilder,
    this.hasShimmer = true,
  });

  /// Factory for list tile skeletons
  factory SkeletonList.listTiles({
    int count = 5,
    bool hasLeading = true,
    bool hasShimmer = true,
  }) {
    return SkeletonList(
      itemCount: count,
      hasShimmer: hasShimmer,
      itemBuilder: (_, __) => SkeletonListTile(hasLeading: hasLeading),
    );
  }

  /// Factory for job card skeletons
  factory SkeletonList.jobCards({
    int count = 3,
    bool hasShimmer = true,
  }) {
    return SkeletonList(
      itemCount: count,
      hasShimmer: hasShimmer,
      itemBuilder: (_, __) => const Padding(
        padding: EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        child: SkeletonJobCard(),
      ),
    );
  }

  /// Factory for candidate card skeletons
  factory SkeletonList.candidateCards({
    int count = 3,
    bool hasShimmer = true,
  }) {
    return SkeletonList(
      itemCount: count,
      hasShimmer: hasShimmer,
      itemBuilder: (_, __) => const Padding(
        padding: EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        child: SkeletonCandidateCard(),
      ),
    );
  }

  /// Factory for conversation skeletons
  factory SkeletonList.conversations({
    int count = 5,
    bool hasShimmer = true,
  }) {
    return SkeletonList(
      itemCount: count,
      hasShimmer: hasShimmer,
      itemBuilder: (_, __) => const SkeletonConversationItem(),
    );
  }

  @override
  Widget build(BuildContext context) {
    final list = ListView.builder(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      itemCount: itemCount,
      itemBuilder: itemBuilder,
    );

    if (hasShimmer) {
      return ShimmerEffect(child: list);
    }

    return list;
  }
}

/// Dashboard stat skeleton
class SkeletonStat extends StatelessWidget {
  const SkeletonStat({super.key});

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: isDark ? Colors.white.withValues(alpha: 0.05) : Colors.white,
        borderRadius: AppRadius.card,
        border: Border.all(
          color: isDark ? Colors.white10 : Colors.grey.shade200,
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SkeletonBox(width: 80, height: 12),
          const SizedBox(height: 8),
          SkeletonBox(width: 60, height: 28),
          const SizedBox(height: 8),
          SkeletonBox(width: 100, height: 10),
        ],
      ),
    );
  }
}

/// Profile header skeleton
class SkeletonProfileHeader extends StatelessWidget {
  const SkeletonProfileHeader({super.key});

  @override
  Widget build(BuildContext context) {
    return ShimmerEffect(
      child: Column(
        children: [
          SkeletonAvatar(size: 80),
          const SizedBox(height: 16),
          SkeletonBox(width: 150, height: 20),
          const SizedBox(height: 8),
          SkeletonBox(width: 200, height: 14),
          const SizedBox(height: 8),
          SkeletonBox(width: 120, height: 12),
        ],
      ),
    );
  }
}
