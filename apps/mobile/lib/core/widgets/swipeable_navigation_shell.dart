import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'swipe_navigation_physics.dart';

/// A wrapper widget that adds swipe navigation between bottom nav tabs.
///
/// This widget uses a [PageView] internally to enable horizontal swiping
/// between screens while keeping the bottom [NavigationBar] in sync.
///
/// Key features:
/// - Two-way sync between PageView and GoRouter
/// - Hybrid swipe detection (edge swipes OR fast velocity swipes)
/// - Screen caching to preserve state
/// - Prevents infinite sync loops
class SwipeableNavigationShell extends ConsumerStatefulWidget {
  /// Route paths in order matching [destinations]
  final List<String> routes;

  /// Navigation destinations (icons + labels) for the bottom nav
  final List<NavigationDestination> destinations;

  /// Builders for each screen (called lazily and cached)
  final List<Widget Function()> screenBuilders;

  /// Optional custom physics for swipe behavior
  final ScrollPhysics? physics;

  /// Duration for page animation when tapping nav items
  final Duration animationDuration;

  /// Animation curve for page transitions
  final Curve animationCurve;

  const SwipeableNavigationShell({
    super.key,
    required this.routes,
    required this.destinations,
    required this.screenBuilders,
    this.physics,
    this.animationDuration = const Duration(milliseconds: 300),
    this.animationCurve = Curves.easeInOut,
  }) : assert(routes.length == destinations.length &&
            routes.length == screenBuilders.length,
            'routes, destinations, and screenBuilders must have the same length');

  @override
  ConsumerState<SwipeableNavigationShell> createState() =>
      _SwipeableNavigationShellState();
}

class _SwipeableNavigationShellState
    extends ConsumerState<SwipeableNavigationShell> {
  late PageController _pageController;

  // Flags to prevent infinite sync loops
  bool _updatingFromSwipe = false;
  bool _updatingFromRoute = false;

  // Cache for built screens
  final Map<int, Widget> _screenCache = {};

  // Track current index for bottom nav
  int _currentIndex = 0;

  @override
  void initState() {
    super.initState();
    _pageController = PageController(initialPage: _currentIndex);
  }

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    // Sync from route on dependency changes (e.g., deep links)
    _syncRouteToPage();
  }

  @override
  void dispose() {
    _pageController.dispose();
    super.dispose();
  }

  /// Converts a route location to a page index
  /// Checks routes in reverse order so longer/more specific routes match first
  /// e.g., /candidate/jobs matches before /candidate
  int _routeToIndex(String location) {
    for (int i = widget.routes.length - 1; i >= 0; i--) {
      if (location.startsWith(widget.routes[i])) {
        return i;
      }
    }
    return 0;
  }

  /// Syncs PageView position from GoRouter location
  void _syncRouteToPage() {
    if (_updatingFromSwipe) return;

    final location = GoRouterState.of(context).matchedLocation;
    final targetIndex = _routeToIndex(location);

    if (targetIndex != _currentIndex) {
      _updatingFromRoute = true;
      setState(() {
        _currentIndex = targetIndex;
      });

      // Jump immediately if page controller is attached
      if (_pageController.hasClients) {
        _pageController.jumpToPage(targetIndex);
      }
      _updatingFromRoute = false;
    }
  }

  /// Called when PageView page changes via swipe
  void _onPageChanged(int index) {
    if (_updatingFromRoute) return;

    _updatingFromSwipe = true;
    setState(() {
      _currentIndex = index;
    });

    // Navigate to the corresponding route
    context.go(widget.routes[index]);

    // Reset flag after frame to allow route change to propagate
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _updatingFromSwipe = false;
    });
  }

  /// Called when user taps a bottom nav item
  void _onNavItemTapped(int index) {
    if (index == _currentIndex) return;

    _updatingFromSwipe = true;
    setState(() {
      _currentIndex = index;
    });

    // Animate the page transition
    _pageController.animateToPage(
      index,
      duration: widget.animationDuration,
      curve: widget.animationCurve,
    );

    // Also update the route
    context.go(widget.routes[index]);

    // Reset flag after frame to allow route change to propagate
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _updatingFromSwipe = false;
    });
  }

  /// Builds or retrieves a cached screen
  Widget _buildScreen(int index) {
    return _screenCache.putIfAbsent(
      index,
      () => _KeepAliveWrapper(child: widget.screenBuilders[index]()),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: PageView.builder(
        controller: _pageController,
        onPageChanged: _onPageChanged,
        physics: widget.physics ?? const SwipeNavigationScrollPhysics(),
        itemCount: widget.routes.length,
        itemBuilder: (context, index) => _buildScreen(index),
      ),
      bottomNavigationBar: NavigationBar(
        selectedIndex: _currentIndex,
        onDestinationSelected: _onNavItemTapped,
        destinations: widget.destinations,
      ),
    );
  }
}

/// Wrapper to keep screens alive when swiping away
class _KeepAliveWrapper extends StatefulWidget {
  final Widget child;

  const _KeepAliveWrapper({required this.child});

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