import 'package:flutter/material.dart';
import '../../../core/router/navigation_configs.dart';
import '../../../core/widgets/swipeable_navigation_shell.dart';

/// School Shell - Swipeable bottom navigation wrapper for school portal
class SchoolShell extends StatelessWidget {
  final Widget child;

  const SchoolShell({super.key, required this.child});

  @override
  Widget build(BuildContext context) {
    // Use SwipeableNavigationShell for swipe navigation between tabs.
    // The 'child' from GoRouter is not used directly - SwipeableNavigationShell
    // builds all screens internally and syncs with GoRouter via context.go().
    return SwipeableNavigationShell(
      routes: schoolNavConfig.routes,
      destinations: schoolNavConfig.destinations,
      screenBuilders: schoolNavConfig.screenBuilders,
    );
  }
}
