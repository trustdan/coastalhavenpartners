import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../../core/router/app_router.dart';

/// School Shell - Bottom navigation wrapper for school portal
class SchoolShell extends StatelessWidget {
  final Widget child;

  const SchoolShell({super.key, required this.child});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: child,
      bottomNavigationBar: _SchoolBottomNav(),
    );
  }
}

class _SchoolBottomNav extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    final location = GoRouterState.of(context).matchedLocation;

    int currentIndex = 0;
    if (location.startsWith('${AppRoutes.school}/students')) {
      currentIndex = 1;
    } else if (location.startsWith('${AppRoutes.school}/messages')) {
      currentIndex = 2;
    } else if (location.startsWith('${AppRoutes.school}/settings')) {
      currentIndex = 3;
    }

    return NavigationBar(
      selectedIndex: currentIndex,
      onDestinationSelected: (index) {
        switch (index) {
          case 0:
            context.go(AppRoutes.school);
            break;
          case 1:
            context.go('${AppRoutes.school}/students');
            break;
          case 2:
            context.go('${AppRoutes.school}/messages');
            break;
          case 3:
            context.go('${AppRoutes.school}/settings');
            break;
        }
      },
      destinations: const [
        NavigationDestination(
          icon: Icon(Icons.dashboard_outlined),
          selectedIcon: Icon(Icons.dashboard),
          label: 'Dashboard',
        ),
        NavigationDestination(
          icon: Icon(Icons.people_outline),
          selectedIcon: Icon(Icons.people),
          label: 'Students',
        ),
        NavigationDestination(
          icon: Icon(Icons.message_outlined),
          selectedIcon: Icon(Icons.message),
          label: 'Messages',
        ),
        NavigationDestination(
          icon: Icon(Icons.settings_outlined),
          selectedIcon: Icon(Icons.settings),
          label: 'Settings',
        ),
      ],
    );
  }
}
