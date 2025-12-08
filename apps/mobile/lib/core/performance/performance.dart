/// Performance optimization utilities for the mobile app
library;

import 'dart:async';
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter/scheduler.dart';
import 'package:cached_network_image/cached_network_image.dart';

// ============================================================================
// IMAGE CACHING & OPTIMIZATION
// ============================================================================

/// Optimized network image with caching, placeholder, and error handling
class OptimizedNetworkImage extends StatelessWidget {
  const OptimizedNetworkImage({
    super.key,
    required this.imageUrl,
    this.width,
    this.height,
    this.fit = BoxFit.cover,
    this.placeholder,
    this.errorWidget,
    this.borderRadius,
    this.memCacheWidth,
    this.memCacheHeight,
    this.fadeInDuration = const Duration(milliseconds: 300),
  });

  final String imageUrl;
  final double? width;
  final double? height;
  final BoxFit fit;
  final Widget? placeholder;
  final Widget? errorWidget;
  final BorderRadius? borderRadius;
  final int? memCacheWidth;
  final int? memCacheHeight;
  final Duration fadeInDuration;

  @override
  Widget build(BuildContext context) {
    Widget image = CachedNetworkImage(
      imageUrl: imageUrl,
      width: width,
      height: height,
      fit: fit,
      memCacheWidth: memCacheWidth,
      memCacheHeight: memCacheHeight,
      fadeInDuration: fadeInDuration,
      placeholder: (context, url) =>
          placeholder ??
          Container(
            width: width,
            height: height,
            color: Theme.of(context).colorScheme.surfaceContainerHighest,
            child: const Center(
              child: CircularProgressIndicator(strokeWidth: 2),
            ),
          ),
      errorWidget: (context, url, error) =>
          errorWidget ??
          Container(
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

    return image;
  }
}

/// Avatar with optimized caching
class OptimizedAvatar extends StatelessWidget {
  const OptimizedAvatar({
    super.key,
    this.imageUrl,
    required this.name,
    this.radius = 24,
    this.backgroundColor,
  });

  final String? imageUrl;
  final String name;
  final double radius;
  final Color? backgroundColor;

  String get _initials {
    final parts = name.trim().split(' ');
    if (parts.isEmpty) return '?';
    if (parts.length == 1) return parts[0][0].toUpperCase();
    return '${parts[0][0]}${parts[parts.length - 1][0]}'.toUpperCase();
  }

  @override
  Widget build(BuildContext context) {
    final bgColor = backgroundColor ?? Theme.of(context).colorScheme.primary;

    if (imageUrl == null || imageUrl!.isEmpty) {
      return CircleAvatar(
        radius: radius,
        backgroundColor: bgColor,
        child: Text(
          _initials,
          style: TextStyle(
            color: Theme.of(context).colorScheme.onPrimary,
            fontWeight: FontWeight.w600,
            fontSize: radius * 0.7,
          ),
        ),
      );
    }

    return CachedNetworkImage(
      imageUrl: imageUrl!,
      imageBuilder: (context, imageProvider) => CircleAvatar(
        radius: radius,
        backgroundImage: imageProvider,
      ),
      placeholder: (context, url) => CircleAvatar(
        radius: radius,
        backgroundColor: bgColor,
        child: const CircularProgressIndicator(strokeWidth: 2),
      ),
      errorWidget: (context, url, error) => CircleAvatar(
        radius: radius,
        backgroundColor: bgColor,
        child: Text(
          _initials,
          style: TextStyle(
            color: Theme.of(context).colorScheme.onPrimary,
            fontWeight: FontWeight.w600,
            fontSize: radius * 0.7,
          ),
        ),
      ),
      memCacheWidth: (radius * 2 * 2).toInt(), // 2x for retina
      memCacheHeight: (radius * 2 * 2).toInt(),
    );
  }
}

// ============================================================================
// LAZY LOADING & PAGINATION
// ============================================================================

/// Callback type for loading more items
typedef LoadMoreCallback = Future<void> Function();

/// Lazy loading list with infinite scroll
class LazyLoadingList<T> extends StatefulWidget {
  const LazyLoadingList({
    super.key,
    required this.items,
    required this.itemBuilder,
    required this.onLoadMore,
    this.hasMore = true,
    this.isLoading = false,
    this.loadingWidget,
    this.emptyWidget,
    this.errorWidget,
    this.error,
    this.onRetry,
    this.threshold = 200,
    this.separatorBuilder,
    this.padding,
    this.physics,
    this.shrinkWrap = false,
  });

  final List<T> items;
  final Widget Function(BuildContext context, T item, int index) itemBuilder;
  final LoadMoreCallback onLoadMore;
  final bool hasMore;
  final bool isLoading;
  final Widget? loadingWidget;
  final Widget? emptyWidget;
  final Widget? errorWidget;
  final Object? error;
  final VoidCallback? onRetry;
  final double threshold;
  final Widget Function(BuildContext context, int index)? separatorBuilder;
  final EdgeInsetsGeometry? padding;
  final ScrollPhysics? physics;
  final bool shrinkWrap;

  @override
  State<LazyLoadingList<T>> createState() => _LazyLoadingListState<T>();
}

class _LazyLoadingListState<T> extends State<LazyLoadingList<T>> {
  final ScrollController _scrollController = ScrollController();
  bool _isLoadingMore = false;

  @override
  void initState() {
    super.initState();
    _scrollController.addListener(_onScroll);
  }

  @override
  void dispose() {
    _scrollController.removeListener(_onScroll);
    _scrollController.dispose();
    super.dispose();
  }

  void _onScroll() {
    if (_isLoadingMore || !widget.hasMore || widget.isLoading) return;

    final maxScroll = _scrollController.position.maxScrollExtent;
    final currentScroll = _scrollController.position.pixels;

    if (maxScroll - currentScroll <= widget.threshold) {
      _loadMore();
    }
  }

  Future<void> _loadMore() async {
    if (_isLoadingMore) return;
    setState(() => _isLoadingMore = true);
    try {
      await widget.onLoadMore();
    } finally {
      if (mounted) {
        setState(() => _isLoadingMore = false);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    if (widget.error != null && widget.items.isEmpty) {
      return widget.errorWidget ??
          Center(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                const Icon(Icons.error_outline, size: 48),
                const SizedBox(height: 16),
                Text('Error: ${widget.error}'),
                if (widget.onRetry != null) ...[
                  const SizedBox(height: 16),
                  ElevatedButton(
                    onPressed: widget.onRetry,
                    child: const Text('Retry'),
                  ),
                ],
              ],
            ),
          );
    }

    if (widget.items.isEmpty && !widget.isLoading) {
      return widget.emptyWidget ?? const Center(child: Text('No items'));
    }

    final itemCount = widget.items.length + (widget.hasMore ? 1 : 0);

    return ListView.separated(
      controller: _scrollController,
      padding: widget.padding,
      physics: widget.physics,
      shrinkWrap: widget.shrinkWrap,
      itemCount: itemCount,
      separatorBuilder: widget.separatorBuilder ??
          (context, index) => const SizedBox(height: 8),
      itemBuilder: (context, index) {
        if (index >= widget.items.length) {
          return widget.loadingWidget ??
              const Padding(
                padding: EdgeInsets.all(16),
                child: Center(child: CircularProgressIndicator()),
              );
        }
        return widget.itemBuilder(context, widget.items[index], index);
      },
    );
  }
}

/// Lazy loading grid with infinite scroll
class LazyLoadingGrid<T> extends StatefulWidget {
  const LazyLoadingGrid({
    super.key,
    required this.items,
    required this.itemBuilder,
    required this.onLoadMore,
    required this.crossAxisCount,
    this.hasMore = true,
    this.isLoading = false,
    this.loadingWidget,
    this.emptyWidget,
    this.threshold = 200,
    this.mainAxisSpacing = 8,
    this.crossAxisSpacing = 8,
    this.childAspectRatio = 1,
    this.padding,
    this.physics,
    this.shrinkWrap = false,
  });

  final List<T> items;
  final Widget Function(BuildContext context, T item, int index) itemBuilder;
  final LoadMoreCallback onLoadMore;
  final int crossAxisCount;
  final bool hasMore;
  final bool isLoading;
  final Widget? loadingWidget;
  final Widget? emptyWidget;
  final double threshold;
  final double mainAxisSpacing;
  final double crossAxisSpacing;
  final double childAspectRatio;
  final EdgeInsetsGeometry? padding;
  final ScrollPhysics? physics;
  final bool shrinkWrap;

  @override
  State<LazyLoadingGrid<T>> createState() => _LazyLoadingGridState<T>();
}

class _LazyLoadingGridState<T> extends State<LazyLoadingGrid<T>> {
  final ScrollController _scrollController = ScrollController();
  bool _isLoadingMore = false;

  @override
  void initState() {
    super.initState();
    _scrollController.addListener(_onScroll);
  }

  @override
  void dispose() {
    _scrollController.removeListener(_onScroll);
    _scrollController.dispose();
    super.dispose();
  }

  void _onScroll() {
    if (_isLoadingMore || !widget.hasMore || widget.isLoading) return;

    final maxScroll = _scrollController.position.maxScrollExtent;
    final currentScroll = _scrollController.position.pixels;

    if (maxScroll - currentScroll <= widget.threshold) {
      _loadMore();
    }
  }

  Future<void> _loadMore() async {
    if (_isLoadingMore) return;
    setState(() => _isLoadingMore = true);
    try {
      await widget.onLoadMore();
    } finally {
      if (mounted) {
        setState(() => _isLoadingMore = false);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    if (widget.items.isEmpty && !widget.isLoading) {
      return widget.emptyWidget ?? const Center(child: Text('No items'));
    }

    return CustomScrollView(
      controller: _scrollController,
      physics: widget.physics,
      shrinkWrap: widget.shrinkWrap,
      slivers: [
        SliverPadding(
          padding: widget.padding ?? EdgeInsets.zero,
          sliver: SliverGrid(
            gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
              crossAxisCount: widget.crossAxisCount,
              mainAxisSpacing: widget.mainAxisSpacing,
              crossAxisSpacing: widget.crossAxisSpacing,
              childAspectRatio: widget.childAspectRatio,
            ),
            delegate: SliverChildBuilderDelegate(
              (context, index) =>
                  widget.itemBuilder(context, widget.items[index], index),
              childCount: widget.items.length,
            ),
          ),
        ),
        if (widget.hasMore)
          SliverToBoxAdapter(
            child: widget.loadingWidget ??
                const Padding(
                  padding: EdgeInsets.all(16),
                  child: Center(child: CircularProgressIndicator()),
                ),
          ),
      ],
    );
  }
}

// ============================================================================
// DEBOUNCING & THROTTLING
// ============================================================================

/// Debouncer for search and text input
class Debouncer {
  Debouncer({this.duration = const Duration(milliseconds: 300)});

  final Duration duration;
  Timer? _timer;

  void run(VoidCallback action) {
    _timer?.cancel();
    _timer = Timer(duration, action);
  }

  void cancel() {
    _timer?.cancel();
  }

  void dispose() {
    _timer?.cancel();
    _timer = null;
  }
}

/// Throttler to limit function call frequency
class Throttler {
  Throttler({this.duration = const Duration(milliseconds: 300)});

  final Duration duration;
  DateTime? _lastCall;

  bool call(VoidCallback action) {
    final now = DateTime.now();
    if (_lastCall == null || now.difference(_lastCall!) >= duration) {
      _lastCall = now;
      action();
      return true;
    }
    return false;
  }

  void reset() {
    _lastCall = null;
  }
}

// ============================================================================
// WIDGET REBUILD OPTIMIZATION
// ============================================================================

/// Widget that only rebuilds when value changes
class ValueListenableConsumer<T> extends StatelessWidget {
  const ValueListenableConsumer({
    super.key,
    required this.valueListenable,
    required this.builder,
    this.child,
  });

  final ValueListenable<T> valueListenable;
  final Widget Function(BuildContext context, T value, Widget? child) builder;
  final Widget? child;

  @override
  Widget build(BuildContext context) {
    return ValueListenableBuilder<T>(
      valueListenable: valueListenable,
      builder: builder,
      child: child,
    );
  }
}

/// Memoized widget that rebuilds only when dependencies change
class MemoizedBuilder extends StatefulWidget {
  const MemoizedBuilder({
    super.key,
    required this.dependencies,
    required this.builder,
  });

  final List<Object?> dependencies;
  final WidgetBuilder builder;

  @override
  State<MemoizedBuilder> createState() => _MemoizedBuilderState();
}

class _MemoizedBuilderState extends State<MemoizedBuilder> {
  late Widget _cachedWidget;
  late List<Object?> _previousDependencies;

  @override
  void initState() {
    super.initState();
    _previousDependencies = List.from(widget.dependencies);
    _cachedWidget = widget.builder(context);
  }

  @override
  void didUpdateWidget(MemoizedBuilder oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (!_dependenciesEqual(widget.dependencies, _previousDependencies)) {
      _previousDependencies = List.from(widget.dependencies);
      _cachedWidget = widget.builder(context);
    }
  }

  bool _dependenciesEqual(List<Object?> a, List<Object?> b) {
    if (a.length != b.length) return false;
    for (int i = 0; i < a.length; i++) {
      if (a[i] != b[i]) return false;
    }
    return true;
  }

  @override
  Widget build(BuildContext context) => _cachedWidget;
}

// ============================================================================
// FRAME SCHEDULING
// ============================================================================

/// Schedule work after frame is rendered
void scheduleAfterFrame(VoidCallback callback) {
  SchedulerBinding.instance.addPostFrameCallback((_) => callback());
}

/// Schedule microtask
void scheduleMicrotask(VoidCallback callback) {
  Future.microtask(callback);
}

// ============================================================================
// MEMORY MANAGEMENT
// ============================================================================

/// Clear image cache
void clearImageCache() {
  PaintingBinding.instance.imageCache.clear();
  PaintingBinding.instance.imageCache.clearLiveImages();
}

/// Get image cache stats
Map<String, int> getImageCacheStats() {
  final cache = PaintingBinding.instance.imageCache;
  return {
    'currentSize': cache.currentSize,
    'maximumSize': cache.maximumSize,
    'currentSizeBytes': cache.currentSizeBytes,
    'maximumSizeBytes': cache.maximumSizeBytes,
  };
}

/// Set image cache limits
void setImageCacheLimits({int? maximumSize, int? maximumSizeBytes}) {
  final cache = PaintingBinding.instance.imageCache;
  if (maximumSize != null) cache.maximumSize = maximumSize;
  if (maximumSizeBytes != null) cache.maximumSizeBytes = maximumSizeBytes;
}

// ============================================================================
// PERFORMANCE MONITORING
// ============================================================================

/// Simple performance tracker
class PerformanceTracker {
  final Map<String, Stopwatch> _stopwatches = {};
  final Map<String, List<int>> _measurements = {};

  void start(String label) {
    _stopwatches[label] = Stopwatch()..start();
  }

  int stop(String label) {
    final stopwatch = _stopwatches[label];
    if (stopwatch == null) return 0;
    stopwatch.stop();
    final elapsed = stopwatch.elapsedMilliseconds;
    _measurements.putIfAbsent(label, () => []).add(elapsed);
    _stopwatches.remove(label);
    return elapsed;
  }

  double average(String label) {
    final measurements = _measurements[label];
    if (measurements == null || measurements.isEmpty) return 0;
    return measurements.reduce((a, b) => a + b) / measurements.length;
  }

  int max(String label) {
    final measurements = _measurements[label];
    if (measurements == null || measurements.isEmpty) return 0;
    return measurements.reduce((a, b) => a > b ? a : b);
  }

  int min(String label) {
    final measurements = _measurements[label];
    if (measurements == null || measurements.isEmpty) return 0;
    return measurements.reduce((a, b) => a < b ? a : b);
  }

  void clear([String? label]) {
    if (label != null) {
      _measurements.remove(label);
    } else {
      _measurements.clear();
    }
  }

  Map<String, Map<String, num>> report() {
    return Map.fromEntries(
      _measurements.entries.map((e) => MapEntry(e.key, {
            'count': e.value.length,
            'average': average(e.key),
            'min': min(e.key),
            'max': max(e.key),
          })),
    );
  }
}

/// Global performance tracker instance
final performanceTracker = PerformanceTracker();

// ============================================================================
// EXTENSIONS
// ============================================================================

/// Performance extensions for widgets
extension PerformanceExtensions on Widget {
  /// Wrap widget with RepaintBoundary for isolation
  Widget withRepaintBoundary() {
    return RepaintBoundary(child: this);
  }

  /// Add AutomaticKeepAlive for tab views
  Widget keepAlive() {
    return _KeepAliveWrapper(child: this);
  }
}

class _KeepAliveWrapper extends StatefulWidget {
  const _KeepAliveWrapper({required this.child});
  final Widget child;

  @override
  State<_KeepAliveWrapper> createState() => _KeepAliveWrapperState();
}

class _KeepAliveWrapperState extends State<_KeepAliveWrapper>
    with AutomaticKeepAliveClientMixin {
  @override
  bool get wantKeepAlive => true;

  @override
  Widget build(BuildContext context) {
    super.build(context);
    return widget.child;
  }
}
