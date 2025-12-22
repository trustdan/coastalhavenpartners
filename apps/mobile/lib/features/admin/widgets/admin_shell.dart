import 'package:flutter/material.dart';
import '../../../core/router/navigation_configs.dart';
import '../../../core/widgets/swipeable_navigation_shell.dart';

/// Admin navigation shell with swipeable bottom nav bar
class AdminShell extends StatelessWidget {
  final Widget child;

  const AdminShell({super.key, required this.child});

  @override
  Widget build(BuildContext context) {
    // Use SwipeableNavigationShell for swipe navigation between tabs.
    // The 'child' from GoRouter is not used directly - SwipeableNavigationShell
    // builds all screens internally and syncs with GoRouter via context.go().
    return SwipeableNavigationShell(
      routes: adminNavConfig.routes,
      destinations: adminNavConfig.destinations,
      screenBuilders: adminNavConfig.screenBuilders,
    );
  }
}
