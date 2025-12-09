import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'core/theme/app_theme.dart';
import 'core/router/app_router.dart';
import 'core/providers/deep_link_provider.dart';
import 'widgets/common/offline_widgets.dart';

/// Main app widget
class CoastalHavenApp extends ConsumerStatefulWidget {
  const CoastalHavenApp({super.key});

  @override
  ConsumerState<CoastalHavenApp> createState() => _CoastalHavenAppState();
}

class _CoastalHavenAppState extends ConsumerState<CoastalHavenApp> {
  @override
  void initState() {
    super.initState();
    // Connect the router to the deep link handler after the first frame
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final router = ref.read(appRouterProvider);
      ref.read(deepLinkProvider.notifier).setRouter(router);
    });
  }

  @override
  Widget build(BuildContext context) {
    final router = ref.watch(appRouterProvider);

    // Watch for deep link errors to show them
    final deepLinkError = ref.watch(deepLinkErrorProvider);
    if (deepLinkError != null) {
      // Schedule showing a snackbar for next frame
      WidgetsBinding.instance.addPostFrameCallback((_) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text('Link error: $deepLinkError'),
              backgroundColor: Colors.red,
            ),
          );
          ref.read(deepLinkProvider.notifier).clearError();
        }
      });
    }

    return ConnectivitySnackbarListener(
      child: MaterialApp.router(
        title: 'Coastal Haven Partners',
        debugShowCheckedModeBanner: false,

        // Theme configuration
        theme: AppTheme.light,
        darkTheme: AppTheme.dark,
        themeMode: ThemeMode.dark, // Default to dark for premium feel

        // Router configuration
        routerConfig: router,

        // Builder to add offline banner at the top of the app
        builder: (context, child) {
          return Column(
            children: [
              const OfflineBanner(),
              Expanded(child: child ?? const SizedBox.shrink()),
            ],
          );
        },
      ),
    );
  }
}
