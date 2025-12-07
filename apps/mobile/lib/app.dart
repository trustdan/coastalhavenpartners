import 'package:flutter/material.dart';
import 'core/theme/app_theme.dart';

/// Main app widget
class CoastalHavenApp extends StatelessWidget {
  const CoastalHavenApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Coastal Haven Partners',
      debugShowCheckedModeBanner: false,

      // Theme configuration
      theme: AppTheme.light,
      darkTheme: AppTheme.dark,
      themeMode: ThemeMode.system, // Follows system preference

      // Initial route - will be replaced with go_router
      home: const _DemoScreen(),
    );
  }
}

/// Temporary demo screen to showcase the design system
class _DemoScreen extends StatelessWidget {
  const _DemoScreen();

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Coastal Haven Partners'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Welcome card
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Welcome to Coastal Haven',
                      style: Theme.of(context).textTheme.headlineSmall,
                    ),
                    const SizedBox(height: 8),
                    Text(
                      'Your mobile app is set up and ready for development.',
                      style: Theme.of(context).textTheme.bodyMedium,
                    ),
                  ],
                ),
              ),
            ),

            const SizedBox(height: 24),

            // Design system preview
            Text(
              'Design System Preview',
              style: Theme.of(context).textTheme.titleLarge,
            ),

            const SizedBox(height: 16),

            // Standard button
            ElevatedButton(
              onPressed: () {},
              child: const Text('Standard Button'),
            ),

            const SizedBox(height: 12),

            // Outlined button
            OutlinedButton(
              onPressed: () {},
              child: const Text('Outlined Button'),
            ),

            const SizedBox(height: 12),

            // Text field
            const TextField(
              decoration: InputDecoration(
                labelText: 'Email',
                hintText: 'Enter your email',
              ),
            ),

            const SizedBox(height: 24),

            // Info text
            Text(
              'Next steps:',
              style: Theme.of(context).textTheme.titleMedium,
            ),
            const SizedBox(height: 8),
            Text(
              '1. Add dependencies to pubspec.yaml\n'
              '2. Set up Supabase integration\n'
              '3. Implement navigation with go_router\n'
              '4. Build onboarding screens\n'
              '5. Create authentication flows',
              style: Theme.of(context).textTheme.bodyMedium,
            ),
          ],
        ),
      ),
    );
  }
}
