import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../theme/app_spacing.dart';

/// Custom page route transitions for go_router
///
/// Usage in go_router:
/// ```dart
/// GoRoute(
///   path: '/profile',
///   pageBuilder: (context, state) => AppPageTransitions.slide(
///     state: state,
///     child: ProfileScreen(),
///   ),
/// )
/// ```
class AppPageTransitions {
  AppPageTransitions._();

  /// Slide transition from right to left
  static CustomTransitionPage<T> slide<T>({
    required GoRouterState state,
    required Widget child,
    Duration? duration,
    Curve curve = Curves.easeInOutCubic,
    SlideDirection direction = SlideDirection.rightToLeft,
  }) {
    return CustomTransitionPage<T>(
      key: state.pageKey,
      child: child,
      transitionDuration: duration ?? AppDurations.normal,
      reverseTransitionDuration: duration ?? AppDurations.normal,
      transitionsBuilder: (context, animation, secondaryAnimation, child) {
        final offset = _getOffset(direction);
        return SlideTransition(
          position: Tween<Offset>(
            begin: offset,
            end: Offset.zero,
          ).animate(CurvedAnimation(
            parent: animation,
            curve: curve,
          )),
          child: child,
        );
      },
    );
  }

  /// Fade transition
  static CustomTransitionPage<T> fade<T>({
    required GoRouterState state,
    required Widget child,
    Duration? duration,
    Curve curve = Curves.easeInOut,
  }) {
    return CustomTransitionPage<T>(
      key: state.pageKey,
      child: child,
      transitionDuration: duration ?? AppDurations.normal,
      reverseTransitionDuration: duration ?? AppDurations.normal,
      transitionsBuilder: (context, animation, secondaryAnimation, child) {
        return FadeTransition(
          opacity: CurvedAnimation(
            parent: animation,
            curve: curve,
          ),
          child: child,
        );
      },
    );
  }

  /// Scale transition (zoom in/out)
  static CustomTransitionPage<T> scale<T>({
    required GoRouterState state,
    required Widget child,
    Duration? duration,
    Curve curve = Curves.easeOutBack,
    double beginScale = 0.9,
    Alignment alignment = Alignment.center,
  }) {
    return CustomTransitionPage<T>(
      key: state.pageKey,
      child: child,
      transitionDuration: duration ?? AppDurations.normal,
      reverseTransitionDuration: duration ?? AppDurations.fast,
      transitionsBuilder: (context, animation, secondaryAnimation, child) {
        return ScaleTransition(
          scale: Tween<double>(
            begin: beginScale,
            end: 1.0,
          ).animate(CurvedAnimation(
            parent: animation,
            curve: curve,
          )),
          alignment: alignment,
          child: FadeTransition(
            opacity: animation,
            child: child,
          ),
        );
      },
    );
  }

  /// Combined slide and fade transition
  static CustomTransitionPage<T> slideAndFade<T>({
    required GoRouterState state,
    required Widget child,
    Duration? duration,
    Curve curve = Curves.easeInOutCubic,
    SlideDirection direction = SlideDirection.rightToLeft,
  }) {
    return CustomTransitionPage<T>(
      key: state.pageKey,
      child: child,
      transitionDuration: duration ?? AppDurations.normal,
      reverseTransitionDuration: duration ?? AppDurations.normal,
      transitionsBuilder: (context, animation, secondaryAnimation, child) {
        final offset = _getOffset(direction, magnitude: 0.2);
        return SlideTransition(
          position: Tween<Offset>(
            begin: offset,
            end: Offset.zero,
          ).animate(CurvedAnimation(
            parent: animation,
            curve: curve,
          )),
          child: FadeTransition(
            opacity: CurvedAnimation(
              parent: animation,
              curve: curve,
            ),
            child: child,
          ),
        );
      },
    );
  }

  /// Bottom sheet style transition (slide up from bottom)
  static CustomTransitionPage<T> bottomSheet<T>({
    required GoRouterState state,
    required Widget child,
    Duration? duration,
    Curve curve = Curves.easeOutCubic,
  }) {
    return CustomTransitionPage<T>(
      key: state.pageKey,
      child: child,
      opaque: false,
      barrierColor: Colors.black54,
      transitionDuration: duration ?? AppDurations.normal,
      reverseTransitionDuration: duration ?? AppDurations.fast,
      transitionsBuilder: (context, animation, secondaryAnimation, child) {
        return SlideTransition(
          position: Tween<Offset>(
            begin: const Offset(0, 1),
            end: Offset.zero,
          ).animate(CurvedAnimation(
            parent: animation,
            curve: curve,
          )),
          child: child,
        );
      },
    );
  }

  /// Modal/dialog style transition (scale + fade)
  static CustomTransitionPage<T> modal<T>({
    required GoRouterState state,
    required Widget child,
    Duration? duration,
    Curve curve = Curves.easeOutBack,
    Color barrierColor = Colors.black54,
  }) {
    return CustomTransitionPage<T>(
      key: state.pageKey,
      child: child,
      opaque: false,
      barrierDismissible: true,
      barrierColor: barrierColor,
      transitionDuration: duration ?? AppDurations.normal,
      reverseTransitionDuration: duration ?? AppDurations.fast,
      transitionsBuilder: (context, animation, secondaryAnimation, child) {
        return ScaleTransition(
          scale: Tween<double>(
            begin: 0.85,
            end: 1.0,
          ).animate(CurvedAnimation(
            parent: animation,
            curve: curve,
          )),
          child: FadeTransition(
            opacity: CurvedAnimation(
              parent: animation,
              curve: Curves.easeIn,
            ),
            child: child,
          ),
        );
      },
    );
  }

  /// No transition (instant)
  static CustomTransitionPage<T> none<T>({
    required GoRouterState state,
    required Widget child,
  }) {
    return CustomTransitionPage<T>(
      key: state.pageKey,
      child: child,
      transitionDuration: Duration.zero,
      reverseTransitionDuration: Duration.zero,
      transitionsBuilder: (context, animation, secondaryAnimation, child) {
        return child;
      },
    );
  }

  static Offset _getOffset(SlideDirection direction, {double magnitude = 1.0}) {
    switch (direction) {
      case SlideDirection.leftToRight:
        return Offset(-magnitude, 0);
      case SlideDirection.rightToLeft:
        return Offset(magnitude, 0);
      case SlideDirection.topToBottom:
        return Offset(0, -magnitude);
      case SlideDirection.bottomToTop:
        return Offset(0, magnitude);
    }
  }
}

/// Slide direction for page transitions
enum SlideDirection {
  leftToRight,
  rightToLeft,
  topToBottom,
  bottomToTop,
}
