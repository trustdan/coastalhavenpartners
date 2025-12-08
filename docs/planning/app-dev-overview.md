# Coastal Haven Partners - Flutter Mobile App Development Plan

## Overview

This document outlines the development plan for building native iOS and Android mobile apps using Flutter (Dart) that translate the existing Coastal Haven Partners web application UI and functionality.

**Tech Stack:**
- **Framework:** Flutter 3.38+
- **Language:** Dart
- **State Management:** Riverpod
- **Backend:** Supabase (shared with web app)
- **Navigation:** go_router

---

## Project Architecture

```
apps/mobile/
├── lib/
│   ├── main.dart
│   ├── app.dart
│   │
│   ├── core/
│   │   ├── theme/
│   │   │   ├── app_theme.dart          # Colors, typography, spacing
│   │   │   ├── app_colors.dart         # Teal/emerald/green palette
│   │   │   └── app_text_styles.dart
│   │   ├── constants/
│   │   │   ├── app_constants.dart
│   │   │   └── api_constants.dart
│   │   ├── utils/
│   │   │   ├── validators.dart
│   │   │   └── formatters.dart
│   │   └── extensions/
│   │       ├── context_extensions.dart
│   │       └── string_extensions.dart
│   │
│   ├── data/
│   │   ├── repositories/
│   │   │   ├── auth_repository.dart
│   │   │   ├── candidate_repository.dart
│   │   │   ├── recruiter_repository.dart
│   │   │   └── messaging_repository.dart
│   │   ├── models/
│   │   │   ├── user.dart
│   │   │   ├── candidate.dart
│   │   │   ├── recruiter.dart
│   │   │   ├── job.dart
│   │   │   └── message.dart
│   │   └── services/
│   │       ├── supabase_service.dart
│   │       ├── auth_service.dart
│   │       ├── storage_service.dart
│   │       └── notification_service.dart
│   │
│   ├── features/
│   │   ├── auth/
│   │   │   ├── screens/
│   │   │   ├── widgets/
│   │   │   └── providers/
│   │   ├── onboarding/
│   │   │   ├── screens/
│   │   │   └── widgets/
│   │   ├── candidate/
│   │   │   ├── screens/
│   │   │   ├── widgets/
│   │   │   └── providers/
│   │   ├── recruiter/
│   │   │   ├── screens/
│   │   │   ├── widgets/
│   │   │   └── providers/
│   │   ├── messaging/
│   │   │   ├── screens/
│   │   │   └── widgets/
│   │   └── shared/
│   │       ├── screens/
│   │       └── widgets/
│   │
│   └── widgets/
│       ├── magic_ui/                   # Port of Magic UI components
│       │   ├── shimmer_button.dart
│       │   ├── shimmer_text.dart
│       │   ├── aurora_text.dart
│       │   ├── shine_border.dart
│       │   ├── meteors.dart
│       │   ├── number_ticker.dart
│       │   └── typing_animation.dart
│       ├── forms/
│       │   ├── app_text_field.dart
│       │   ├── app_dropdown.dart
│       │   ├── app_multi_select.dart
│       │   └── file_upload_zone.dart
│       └── common/
│           ├── app_card.dart
│           ├── status_badge.dart
│           ├── loading_indicator.dart
│           └── empty_state.dart
│
├── assets/
│   ├── images/
│   │   ├── logo.png
│   │   ├── logo_dark.png
│   │   └── onboarding/
│   ├── icons/
│   │   └── firm_logos/
│   └── animations/                     # Lottie/Rive files
│       ├── splash.json
│       └── success.json
│
├── test/
│   ├── unit/
│   ├── widget/
│   └── integration/
│
└── pubspec.yaml
```

---

## Design System

### Color Palette

Matching the web application's teal/emerald/green theme:

```dart
class AppColors {
  // Primary brand colors
  static const teal = Color(0xFF14B8A6);
  static const emerald = Color(0xFF10B981);
  static const green = Color(0xFF047857);

  // Brand gradient (for shimmer effects)
  static const brandGradient = LinearGradient(
    colors: [teal, emerald, green],
  );

  // Status colors
  static const success = Color(0xFF22C55E);
  static const warning = Color(0xFFEAB308);
  static const error = Color(0xFFEF4444);
  static const info = Color(0xFF3B82F6);
  static const purple = Color(0xFF8B5CF6);  // "Interviewed" status

  // Light theme
  static const backgroundLight = Color(0xFFFAFAFA);
  static const surfaceLight = Colors.white;
  static const textPrimaryLight = Color(0xFF171717);
  static const textSecondaryLight = Color(0xFF737373);
  static const borderLight = Color(0xFFE5E5E5);

  // Dark theme
  static const backgroundDark = Color(0xFF0A0A0A);
  static const surfaceDark = Color(0xFF171717);
  static const textPrimaryDark = Color(0xFFFAFAFA);
  static const textSecondaryDark = Color(0xFFA3A3A3);
  static const borderDark = Color(0xFF262626);
}
```

### Typography

```dart
class AppTextStyles {
  // Headings
  static const h1 = TextStyle(
    fontSize: 32,
    fontWeight: FontWeight.bold,
    height: 1.2,
  );

  static const h2 = TextStyle(
    fontSize: 24,
    fontWeight: FontWeight.bold,
    height: 1.3,
  );

  static const h3 = TextStyle(
    fontSize: 20,
    fontWeight: FontWeight.w600,
    height: 1.4,
  );

  // Body
  static const bodyLarge = TextStyle(
    fontSize: 16,
    fontWeight: FontWeight.normal,
    height: 1.5,
  );

  static const bodyMedium = TextStyle(
    fontSize: 14,
    fontWeight: FontWeight.normal,
    height: 1.5,
  );

  static const bodySmall = TextStyle(
    fontSize: 12,
    fontWeight: FontWeight.normal,
    height: 1.4,
  );

  // Labels
  static const label = TextStyle(
    fontSize: 14,
    fontWeight: FontWeight.w500,
    height: 1.4,
  );

  static const caption = TextStyle(
    fontSize: 12,
    fontWeight: FontWeight.normal,
    height: 1.4,
  );
}
```

### Spacing & Sizing

```dart
class AppSpacing {
  static const xs = 4.0;
  static const sm = 8.0;
  static const md = 16.0;
  static const lg = 24.0;
  static const xl = 32.0;
  static const xxl = 48.0;
}

class AppRadius {
  static const sm = 8.0;
  static const md = 12.0;
  static const lg = 16.0;
  static const xl = 24.0;
  static const full = 9999.0;
}
```

---

## Magic UI Component Translations

The web app uses Magic UI components (React). These need to be recreated in Flutter:

| Web Component | Flutter Widget | Implementation |
|---------------|----------------|----------------|
| `<Meteors />` | `MeteorsBackground` | `CustomPainter` with particle system |
| `<ShimmerButton />` | `ShimmerButton` | `AnimationController` + `ShaderMask` |
| `<AnimatedShinyText />` | `ShimmerText` | Gradient animation with `ShaderMask` |
| `<AuroraText />` | `AuroraText` | Animated gradient with transforms |
| `<ShineBorder />` | `ShineBorderCard` | `CustomPainter` gradient border |
| `<TextAnimate />` | `AnimatedText` | `flutter_animate` slide-up effect |
| `<AnimatedBeam />` | `AnimatedBeam` | `CustomPainter` with `PathMetric` |
| `<IconCloud />` | `FirmCarousel` | Simplified horizontal carousel |
| `<NumberTicker />` | `NumberTicker` | `countup` package or custom |
| `<TypingAnimation />` | `TypingText` | `animated_text_kit` typewriter |

### Example: ShimmerButton Implementation

```dart
import 'dart:math';
import 'package:flutter/material.dart';

class ShimmerButton extends StatefulWidget {
  final String text;
  final VoidCallback onPressed;
  final List<Color> shimmerColors;
  final double height;
  final double? width;

  const ShimmerButton({
    super.key,
    required this.text,
    required this.onPressed,
    this.shimmerColors = const [
      Color(0xFF14B8A6), // teal
      Color(0xFF10B981), // emerald
      Color(0xFF047857), // green
    ],
    this.height = 48,
    this.width,
  });

  @override
  State<ShimmerButton> createState() => _ShimmerButtonState();
}

class _ShimmerButtonState extends State<ShimmerButton>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      duration: const Duration(seconds: 2),
      vsync: this,
    )..repeat();
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: _controller,
      builder: (context, child) {
        return Container(
          height: widget.height,
          width: widget.width,
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(12),
            gradient: SweepGradient(
              center: Alignment.center,
              startAngle: _controller.value * 2 * pi,
              endAngle: _controller.value * 2 * pi + pi * 2,
              colors: [
                ...widget.shimmerColors,
                widget.shimmerColors.first,
              ],
            ),
          ),
          child: Padding(
            padding: const EdgeInsets.all(2),
            child: ElevatedButton(
              onPressed: widget.onPressed,
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF171717),
                foregroundColor: Colors.white,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(10),
                ),
                elevation: 0,
              ),
              child: Text(
                widget.text,
                style: const TextStyle(
                  fontWeight: FontWeight.w600,
                  fontSize: 16,
                ),
              ),
            ),
          ),
        );
      },
    );
  }
}
```

### Example: Meteors Background (Simplified)

```dart
class MeteorsBackground extends StatefulWidget {
  final int meteorCount;
  final Widget child;

  const MeteorsBackground({
    super.key,
    this.meteorCount = 6,
    required this.child,
  });

  @override
  State<MeteorsBackground> createState() => _MeteorsBackgroundState();
}

class _MeteorsBackgroundState extends State<MeteorsBackground>
    with TickerProviderStateMixin {
  late List<MeteorData> meteors;

  @override
  void initState() {
    super.initState();
    meteors = List.generate(
      widget.meteorCount,
      (i) => MeteorData.random(this),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Stack(
      children: [
        widget.child,
        ...meteors.map((m) => AnimatedMeteor(data: m)),
      ],
    );
  }
}
```

---

## Screen Layouts

### Onboarding / Marketing Screens

#### Splash Screen
```
┌─────────────────────────┐
│                         │
│    [Meteor Background]  │
│                         │
│         ┌───┐           │
│         │ ◇ │           │  ← Animated logo
│         └───┘           │
│                         │
│    Coastal Haven        │
│      Partners           │
│                         │
│       [Loading...]      │
│                         │
└─────────────────────────┘
```

#### Onboarding Carousel
```
┌─────────────────────────┐
│    [Meteor Background]  │
│                         │
│   ✨ Where Elite        │
│   Talent Meets          │  ← AnimatedShinyText
│   Opportunity           │
│                         │
│   Connect with top      │
│   finance firms         │  ← AuroraText subtitle
│                         │
│                         │
│   ● ○ ○  (page dots)    │
│                         │
│  ┌─────────────────┐    │
│  │  Get Started ➜  │    │  ← ShimmerButton
│  └─────────────────┘    │
│                         │
│  Already have account?  │
│  Sign in →              │
└─────────────────────────┘
```

#### Role Selection Screen
```
┌─────────────────────────┐
│         ← Back          │
│                         │
│   I am a...             │
│                         │
│  ┌───────────────────┐  │
│  │ 🎓 Candidate      │  │  ← ShineBorderCard
│  │ Looking for roles │  │
│  │ in finance        │  │
│  └───────────────────┘  │
│                         │
│  ┌───────────────────┐  │
│  │ 💼 Recruiter      │  │  ← ShineBorderCard
│  │ Hiring elite      │  │
│  │ talent            │  │
│  └───────────────────┘  │
│                         │
│  ┌───────────────────┐  │
│  │ 🏫 Career Services│  │  ← ShineBorderCard
│  │ Supporting        │  │
│  │ students          │  │
│  └───────────────────┘  │
└─────────────────────────┘
```

---

### Authentication Screens

#### Login Screen
```
┌─────────────────────────┐
│                         │
│      ┌───┐              │
│      │ ◇ │              │  ← Logo
│      └───┘              │
│   Coastal Haven         │
│                         │
│  Email                  │
│  ┌───────────────────┐  │
│  │ you@example.com   │  │
│  └───────────────────┘  │
│                         │
│  Password               │
│  ┌───────────────────┐  │
│  │ ••••••••••    👁  │  │
│  └───────────────────┘  │
│                         │
│  ☑ Remember me          │
│           Forgot pass?  │
│                         │
│  ┌─────────────────┐    │
│  │    Sign In      │    │  ← ShimmerButton
│  └─────────────────┘    │
│                         │
│  ─── or continue with ──│
│                         │
│  ┌─────┐     ┌─────┐    │
│  │  G  │     │ in  │    │  ← OAuth buttons
│  └─────┘     └─────┘    │
│                         │
│  Don't have account?    │
│  Sign up →              │
└─────────────────────────┘
```

#### MFA Verification
```
┌─────────────────────────┐
│         ← Back          │
│                         │
│         🔐              │
│                         │
│   Enter verification    │
│   code                  │
│                         │
│   ┌─┐ ┌─┐ ┌─┐ ┌─┐ ┌─┐ ┌─┐│
│   │ │ │ │ │ │ │ │ │ │ │ ││  ← OTP input
│   └─┘ └─┘ └─┘ └─┘ └─┘ └─┘│
│                         │
│   We sent a code to     │
│   d***@email.com        │
│                         │
│   Didn't get code?      │
│   Resend (45s)          │
│                         │
│  ┌─────────────────┐    │
│  │     Verify      │    │
│  └─────────────────┘    │
└─────────────────────────┘
```

---

### Candidate Portal Screens

#### Dashboard (Home Tab)
```
┌─────────────────────────┐
│ 👤 Hi, Alex      🔔 ⚙️  │
│                         │
│ ┌───────────────────┐   │
│ │ Profile           │   │
│ │ ████████░░ 75%    │   │  ← Progress bar
│ │                   │   │
│ │ Complete profile →│   │
│ └───────────────────┘   │
│                         │
│ 📊 Your Activity        │
│ ┌─────────┬─────────┐   │
│ │ 👁 12   │ 🏢 8    │   │
│ │ Views   │ Firms   │   │  ← NumberTicker
│ ├─────────┴─────────┤   │
│ │ 📈 +23% this week │   │
│ └───────────────────┘   │
│                         │
│ 🏢 Recent Viewers       │
│ ┌───────────────────┐   │
│ │ Goldman Sachs  2h │   │
│ │ Blackstone    1d  │   │
│ │ Citadel       3d  │   │
│ │ See all →         │   │
│ └───────────────────┘   │
│                         │
│ 📅 Upcoming Deadlines   │
│ ┌───────────────────┐   │
│ │ Morgan Stanley    │   │
│ │ Application · 3d  │   │
│ └───────────────────┘   │
│                         │
├─────────────────────────┤
│ 🏠  🔍  📋  💬  👤     │  ← Bottom nav
└─────────────────────────┘
```

#### Edit Profile - Tab Based
```
┌─────────────────────────┐
│ ← Edit Profile    Save  │
│                         │
│ [Basic][Edu][Docs][Pref]│  ← Tab bar
│ ═══════                 │
│                         │
│      ┌─────┐            │
│      │ 👤  │  📷        │  ← Profile photo
│      └─────┘            │
│                         │
│ First Name *            │
│ ┌───────────────────┐   │
│ │ Alex              │   │
│ └───────────────────┘   │
│                         │
│ Last Name *             │
│ ┌───────────────────┐   │
│ │ Johnson           │   │
│ └───────────────────┘   │
│                         │
│ LinkedIn URL            │
│ ┌───────────────────┐   │
│ │ linkedin.com/in/..│   │
│ └───────────────────┘   │
│                         │
│ Scheduling URL          │
│ ┌───────────────────┐   │
│ │ calendly.com/...  │   │
│ └───────────────────┘   │
│                         │
└─────────────────────────┘
```

#### Edit Profile - Education Tab
```
┌─────────────────────────┐
│ ← Edit Profile    Save  │
│                         │
│ [Basic][Edu][Docs][Pref]│
│      ═════              │
│                         │
│ Undergraduate           │
│ ─────────────────────   │
│                         │
│ School *                │
│ ┌───────────────────┐   │
│ │ Wharton         ▼ │   │
│ └───────────────────┘   │
│                         │
│ Major *                 │
│ ┌───────────────────┐   │
│ │ Finance           │   │
│ └───────────────────┘   │
│                         │
│ Degree    GPA           │
│ ┌───────┐ ┌───────┐     │
│ │ BS  ▼ │ │ 3.85  │     │
│ └───────┘ └───────┘     │
│                         │
│ Graduation Year         │
│ ┌───────────────────┐   │
│ │ 2025            ▼ │   │
│ └───────────────────┘   │
│                         │
│ ☐ Add graduate degree   │
│                         │
└─────────────────────────┘
```

#### Edit Profile - Documents Tab
```
┌─────────────────────────┐
│ ← Edit Profile    Save  │
│                         │
│ [Basic][Edu][Docs][Pref]│
│           ════          │
│                         │
│ 📄 Resume               │
│ ┌───────────────────┐   │
│ │ resume_2024.pdf   │   │
│ │ 245 KB · Dec 5    │   │
│ │ [View] [Replace]  │   │
│ └───────────────────┘   │
│                         │
│ ┌─ ─ ─ ─ ─ ─ ─ ─ ─ ─┐   │
│ │                   │   │
│ │  📤 Upload New    │   │  ← Dashed border
│ │  Tap to select    │   │
│ │                   │   │
│ └─ ─ ─ ─ ─ ─ ─ ─ ─ ─┘   │
│                         │
│ 📑 Transcripts          │
│ ┌───────────────────┐   │
│ │ wharton_trans.pdf │ ✕ │
│ │ 128 KB · Nov 20   │   │
│ └───────────────────┘   │
│                         │
│ ┌───────────────────┐   │
│ │ + Add transcript  │   │
│ └───────────────────┘   │
│                         │
└─────────────────────────┘
```

#### Edit Profile - Preferences Tab
```
┌─────────────────────────┐
│ ← Edit Profile    Save  │
│                         │
│ [Basic][Edu][Docs][Pref]│
│                 ════    │
│                         │
│ Target Roles            │
│ ┌───────────────────┐   │
│ │[IB][PE][VC]     + │   │  ← Multi-select chips
│ └───────────────────┘   │
│                         │
│ Preferred Locations     │
│ ┌───────────────────┐   │
│ │[NYC][SF][Chicago]+│   │
│ └───────────────────┘   │
│                         │
│ Visibility Settings     │
│ ─────────────────────   │
│                         │
│ Show to Recruiters      │
│ ☑ LinkedIn URL          │
│ ☑ Email                 │
│ ☑ Resume                │
│ ☐ Transcript            │
│                         │
│ Show to Schools         │
│ ☑ LinkedIn URL          │
│ ☑ Email                 │
│ ☑ Resume                │
│ ☑ Transcript            │
│                         │
└─────────────────────────┘
```

---

### Recruiter Portal Screens

#### Candidate Search
```
┌─────────────────────────┐
│ 🔍 Search Candidates    │
│                         │
│ ┌───────────────────┐   │
│ │ Search by name... │ 🔍│
│ └───────────────────┘   │
│                         │
│ Filters ▼        Clear  │  ← Tap to expand
│ ┌───────────────────┐   │
│ │ GPA: 3.7+        ×│   │  ← Active filter chips
│ │ Wharton          ×│   │
│ │ 0-3 yrs exp      ×│   │
│ └───────────────────┘   │
│                         │
│ 47 candidates found     │
│                         │
│ ┌───────────────────┐   │
│ │ 👤 Sarah Chen     │   │
│ │ Wharton '25       │   │
│ │ Finance · 3.92    │   │
│ │ ┌────┐┌────┐┌────┐│   │
│ │ │ PE ││ IB ││ VC ││   │  ← Role chips
│ │ └────┘└────┘└────┘│   │
│ │ [View] [⭐ Save]  │   │
│ └───────────────────┘   │
│                         │
│ ┌───────────────────┐   │
│ │ 👤 Mike Ross      │   │
│ │ Harvard '24       │   │
│ │ Economics · 3.87  │   │
│ │ [View] [⭐ Save]  │   │
│ └───────────────────┘   │
│                         │
│           ...           │
├─────────────────────────┤
│ 🏠  🔍  📧  📊  ⚙️     │
└─────────────────────────┘
```

#### Filter Bottom Sheet
```
┌─────────────────────────┐
│ ══════════════════════  │  ← Drag handle
│                         │
│ Filters          Reset  │
│                         │
│ GPA Range               │
│ ┌─────────────────────┐ │
│ │ 3.0 ═══●═══════ 4.0 │ │  ← Range slider
│ │     Min: 3.5        │ │
│ └─────────────────────┘ │
│                         │
│ Schools                 │
│ ☑ Wharton               │
│ ☑ Harvard               │
│ ☐ Stanford              │
│ ☐ Yale                  │
│ ☐ Columbia              │
│ + Show 15 more          │
│                         │
│ Target Roles            │
│ [IB] [PE] [VC] [HF]     │  ← Toggle chips
│ [ER] [S&T] [Corp Dev]   │
│                         │
│ Graduation Year         │
│ ┌──────┐  to  ┌──────┐  │
│ │ 2024 │      │ 2026 │  │
│ └──────┘      └──────┘  │
│                         │
│ Experience Level        │
│ ○ Any                   │
│ ● 0-2 years             │
│ ○ 3-5 years             │
│ ○ 5+ years              │
│                         │
│ Profile Completeness    │
│ ☑ Has resume            │
│ ☑ Has transcript        │
│ ☐ Has calendar link     │
│                         │
│ ┌─────────────────────┐ │
│ │   Apply Filters     │ │
│ └─────────────────────┘ │
└─────────────────────────┘
```

#### Candidate Detail View
```
┌─────────────────────────┐
│ ←                ⭐ ⋮   │
│                         │
│      ┌─────┐            │
│      │ 👤  │            │
│      └─────┘            │
│    Sarah Chen           │
│    Wharton '25          │
│                         │
│ ┌─────────────────────┐ │
│ │ Finance    │  3.92  │ │
│ │ Major      │  GPA   │ │
│ └─────────────────────┘ │
│                         │
│ ┌────┐┌────┐┌────┐      │
│ │ PE ││ IB ││ VC │      │  ← Target roles
│ └────┘└────┘└────┘      │
│                         │
│ 📍 NYC, SF, Boston      │
│                         │
│ About                   │
│ ─────                   │
│ Passionate about value  │
│ investing with exp in...│
│                         │
│ Documents               │
│ ─────                   │
│ ┌───────────────────┐   │
│ │ 📄 Resume    View │   │
│ └───────────────────┘   │
│ ┌───────────────────┐   │
│ │ 📑 Transcript View│   │
│ └───────────────────┘   │
│                         │
│ ┌─────────────────────┐ │
│ │   💬 Message        │ │
│ └─────────────────────┘ │
│ ┌─────────────────────┐ │
│ │   📅 Schedule       │ │
│ └─────────────────────┘ │
└─────────────────────────┘
```

#### Campaign Builder - Step 1
```
┌─────────────────────────┐
│ ← New Campaign          │
│                         │
│ Step 1 of 4: Details    │
│ ●───○───○───○           │  ← Progress indicator
│                         │
│ Campaign Name *         │
│ ┌───────────────────┐   │
│ │ Spring Outreach   │   │
│ └───────────────────┘   │
│                         │
│ Subject Line *          │
│ ┌───────────────────┐   │
│ │ Exciting opportu..│   │
│ └───────────────────┘   │
│                         │
│ Email Template          │
│ ┌───────────────────┐   │
│ │ Introduction    ▼ │   │
│ └───────────────────┘   │
│                         │
│ Preview:                │
│ ┌───────────────────┐   │
│ │ Hi {{first_name}},│   │
│ │                   │   │
│ │ I'm reaching out..│   │
│ │ ...               │   │
│ └───────────────────┘   │
│                         │
│                         │
│ ┌─────────────────┐     │
│ │   Next Step →   │     │
│ └─────────────────┘     │
└─────────────────────────┘
```

#### Campaign Builder - Step 4 (Preview)
```
┌─────────────────────────┐
│ ← New Campaign          │
│                         │
│ Step 4 of 4: Review     │
│ ●───●───●───●           │
│                         │
│ ┌───────────────────┐   │
│ │ 📊 Summary        │   │
│ │                   │   │
│ │ Recipients: 47    │   │
│ │ Template: Intro   │   │
│ │ Scheduled: Now    │   │
│ └───────────────────┘   │
│                         │
│ Sample Preview          │
│ ┌───────────────────┐   │
│ │ To: sarah@wh.edu  │   │
│ │ ───────────────── │   │
│ │ Hi Sarah,         │   │
│ │                   │   │
│ │ I'm Jane from     │   │
│ │ Goldman Sachs...  │   │
│ │                   │   │  ← TypingAnimation
│ │ Your background   │   │
│ │ in finance at     │   │
│ │ Wharton caught... │   │
│ └───────────────────┘   │
│                         │
│ ┌─────────────────┐     │
│ │ ← Back          │     │
│ └─────────────────┘     │
│ ┌─────────────────┐     │
│ │ 🚀 Send Campaign│     │  ← ShimmerButton
│ └─────────────────┘     │
└─────────────────────────┘
```

---

### Messaging Screens

#### Inbox
```
┌─────────────────────────┐
│ Messages           ✏️   │
│                         │
│ ┌───────────────────┐   │
│ │ 🔍 Search...      │   │
│ └───────────────────┘   │
│                         │
│ ┌───────────────────┐   │
│ │ 🏢 Goldman Sachs  │   │
│ │ Jane Smith        │   │
│ │ Thanks for your...│   │
│ │             2h  ● │   │  ← Unread indicator
│ └───────────────────┘   │
│                         │
│ ┌───────────────────┐   │
│ │ 👤 Mike (Citadel) │   │
│ │ Looking forward...│   │
│ │             1d    │   │
│ └───────────────────┘   │
│                         │
│ ┌───────────────────┐   │
│ │ 🏢 Blackstone     │   │
│ │ Tom Anderson      │   │
│ │ We reviewed your..│   │
│ │             3d    │   │
│ └───────────────────┘   │
│                         │
│ ┌───────────────────┐   │
│ │ 🏢 KKR            │   │
│ │ Lisa Park         │   │
│ │ Great chatting... │   │
│ │             1w    │   │
│ └───────────────────┘   │
│                         │
├─────────────────────────┤
│ 🏠  🔍  📋  💬  👤     │
└─────────────────────────┘
```

#### Conversation Thread
```
┌─────────────────────────┐
│ ← Jane Smith     📞  ⋮  │
│   Goldman Sachs         │
├─────────────────────────┤
│                         │
│              ┌────────┐ │
│              │Hi Alex!│ │
│              │        │ │
│              │We were │ │
│              │impress-│ │
│              │ed by...│ │
│              └────────┘ │
│               10:30 AM  │
│                         │
│ ┌────────────┐          │
│ │Thank you   │          │
│ │so much for │          │
│ │reaching out│          │
│ │I'd love to │          │
│ │learn more..│          │
│ └────────────┘          │
│ 10:45 AM ✓✓             │
│                         │
│              ┌────────┐ │
│              │Perfect!│ │
│              │How does│ │
│              │Thursday│ │
│              │work?   │ │
│              └────────┘ │
│               11:02 AM  │
│                         │
├─────────────────────────┤
│ ┌───────────────────┐ ➤ │
│ │ Type a message... │   │
│ └───────────────────┘   │
└─────────────────────────┘
```

---

### Settings Screen

```
┌─────────────────────────┐
│ ← Settings              │
│                         │
│ Account                 │
│ ┌───────────────────┐   │
│ │ 👤 Profile        → │ │
│ ├───────────────────┤   │
│ │ 🔐 Security       → │ │
│ ├───────────────────┤   │
│ │ 🔔 Notifications  → │ │
│ └───────────────────┘   │
│                         │
│ Preferences             │
│ ┌───────────────────┐   │
│ │ 🌙 Dark Mode      🔘│ │  ← Toggle
│ ├───────────────────┤   │
│ │ 📧 Email Prefs    → │ │
│ ├───────────────────┤   │
│ │ 🔒 Privacy        → │ │
│ └───────────────────┘   │
│                         │
│ Support                 │
│ ┌───────────────────┐   │
│ │ ❓ Help Center    → │ │
│ ├───────────────────┤   │
│ │ 💬 Contact Us     → │ │
│ ├───────────────────┤   │
│ │ 📋 Terms          → │ │
│ ├───────────────────┤   │
│ │ 🔒 Privacy Policy → │ │
│ └───────────────────┘   │
│                         │
│ ┌───────────────────┐   │
│ │    Sign Out       │   │
│ └───────────────────┘   │
│                         │
│ Version 1.0.0           │
└─────────────────────────┘
```

---

## Navigation Structure

### Bottom Navigation

```dart
// Candidate Navigation
enum CandidateTab {
  home,        // Dashboard, stats, viewers
  search,      // Job listings, opportunities
  applications,// My applications tracker
  messages,    // Messaging center
  profile,     // Profile & settings
}

// Recruiter Navigation
enum RecruiterTab {
  home,        // Dashboard, recommended candidates
  candidates,  // Candidate search & filters
  campaigns,   // Email campaign management
  analytics,   // Insights & metrics
  settings,    // Firm settings, team
}

// School Admin Navigation
enum SchoolTab {
  home,        // Dashboard, placement stats
  students,    // Student directory
  recruiters,  // Recruiter connections
  insights,    // Placement analytics
  settings,    // School settings
}
```

### Route Structure

```dart
final router = GoRouter(
  routes: [
    // Onboarding
    GoRoute(path: '/', builder: (_, __) => SplashScreen()),
    GoRoute(path: '/onboarding', builder: (_, __) => OnboardingScreen()),
    GoRoute(path: '/role-select', builder: (_, __) => RoleSelectScreen()),

    // Auth
    GoRoute(path: '/login', builder: (_, __) => LoginScreen()),
    GoRoute(path: '/signup/:role', builder: (_, state) => SignupScreen(role: state.pathParameters['role']!)),
    GoRoute(path: '/mfa', builder: (_, __) => MfaScreen()),
    GoRoute(path: '/forgot-password', builder: (_, __) => ForgotPasswordScreen()),

    // Candidate Portal
    ShellRoute(
      builder: (_, __, child) => CandidateShell(child: child),
      routes: [
        GoRoute(path: '/candidate', builder: (_, __) => CandidateDashboard()),
        GoRoute(path: '/candidate/jobs', builder: (_, __) => JobListingsScreen()),
        GoRoute(path: '/candidate/applications', builder: (_, __) => ApplicationsScreen()),
        GoRoute(path: '/candidate/messages', builder: (_, __) => MessagesScreen()),
        GoRoute(path: '/candidate/profile', builder: (_, __) => CandidateProfileScreen()),
        GoRoute(path: '/candidate/edit-profile', builder: (_, __) => EditProfileScreen()),
      ],
    ),

    // Recruiter Portal
    ShellRoute(
      builder: (_, __, child) => RecruiterShell(child: child),
      routes: [
        GoRoute(path: '/recruiter', builder: (_, __) => RecruiterDashboard()),
        GoRoute(path: '/recruiter/candidates', builder: (_, __) => CandidateSearchScreen()),
        GoRoute(path: '/recruiter/candidates/:id', builder: (_, state) => CandidateDetailScreen(id: state.pathParameters['id']!)),
        GoRoute(path: '/recruiter/campaigns', builder: (_, __) => CampaignsScreen()),
        GoRoute(path: '/recruiter/campaigns/new', builder: (_, __) => CampaignBuilderScreen()),
        GoRoute(path: '/recruiter/analytics', builder: (_, __) => AnalyticsScreen()),
        GoRoute(path: '/recruiter/settings', builder: (_, __) => RecruiterSettingsScreen()),
      ],
    ),

    // Shared
    GoRoute(path: '/messages/:conversationId', builder: (_, state) => ConversationScreen(id: state.pathParameters['conversationId']!)),
    GoRoute(path: '/settings', builder: (_, __) => SettingsScreen()),
  ],
);
```

---

## State Management

Using **Riverpod** for clean, testable state management.

### Provider Examples

```dart
// Auth state
@riverpod
class AuthNotifier extends _$AuthNotifier {
  @override
  FutureOr<User?> build() async {
    return ref.read(authRepositoryProvider).getCurrentUser();
  }

  Future<void> signIn(String email, String password) async {
    state = const AsyncLoading();
    state = await AsyncValue.guard(() =>
      ref.read(authRepositoryProvider).signIn(email, password)
    );
  }

  Future<void> signOut() async {
    await ref.read(authRepositoryProvider).signOut();
    state = const AsyncData(null);
  }
}

// Candidate filters
@riverpod
class CandidateFilters extends _$CandidateFilters {
  @override
  FilterState build() => const FilterState();

  void updateGpaRange(double min, double max) {
    state = state.copyWith(gpaMin: min, gpaMax: max);
  }

  void toggleSchool(String school) {
    final schools = Set<String>.from(state.schools);
    schools.contains(school) ? schools.remove(school) : schools.add(school);
    state = state.copyWith(schools: schools);
  }

  void toggleRole(String role) {
    final roles = Set<String>.from(state.targetRoles);
    roles.contains(role) ? roles.remove(role) : roles.add(role);
    state = state.copyWith(targetRoles: roles);
  }

  void reset() {
    state = const FilterState();
  }
}

// Filtered candidates (derived)
@riverpod
Future<List<Candidate>> filteredCandidates(FilteredCandidatesRef ref) async {
  final filters = ref.watch(candidateFiltersProvider);
  return ref.read(candidateRepositoryProvider).searchCandidates(filters);
}
```

---

## Dependencies

```yaml
name: coastal_haven_mobile
description: Coastal Haven Partners mobile app

environment:
  sdk: '>=3.0.0 <4.0.0'

dependencies:
  flutter:
    sdk: flutter

  # State Management
  flutter_riverpod: ^2.4.9
  riverpod_annotation: ^2.3.3

  # Navigation
  go_router: ^13.0.1

  # Backend
  supabase_flutter: ^2.3.0

  # UI & Animations
  flutter_animate: ^4.3.0
  shimmer: ^3.0.0
  animated_text_kit: ^4.2.2
  lottie: ^2.7.0
  flutter_svg: ^2.0.9
  cached_network_image: ^3.3.1

  # Forms & Input
  flutter_form_builder: ^9.2.1
  form_builder_validators: ^9.1.0
  file_picker: ^6.1.1
  image_picker: ^1.0.7

  # Utilities
  intl: ^0.18.1
  url_launcher: ^6.2.4
  share_plus: ^7.2.1
  path_provider: ^2.1.2
  flutter_secure_storage: ^9.0.0

  # Push Notifications
  firebase_messaging: ^14.7.10
  flutter_local_notifications: ^16.3.0

  # Analytics
  firebase_analytics: ^10.8.0

  # Icons
  lucide_icons: ^0.257.0  # Match web app's Lucide icons

dev_dependencies:
  flutter_test:
    sdk: flutter
  flutter_lints: ^3.0.1
  riverpod_generator: ^2.3.9
  build_runner: ^2.4.8
  freezed: ^2.4.6
  freezed_annotation: ^2.4.1
  json_serializable: ^6.7.1
```

---

## Animation Strategy

| Web Effect | Mobile Implementation | Performance |
|------------|----------------------|-------------|
| Meteors | Simplified (4-6 particles), splash only | GPU-accelerated |
| ShimmerButton | Custom `AnimatedBuilder` | Lightweight |
| ShineBorder | `CustomPainter` gradient | Medium |
| NumberTicker | `countup` or custom tween | Lightweight |
| IconCloud | Horizontal carousel with parallax | Simplified |
| TextAnimate | `flutter_animate` fadeIn/slideUp | Lightweight |
| TypingAnimation | `animated_text_kit` | Lightweight |
| AuroraText | `ShaderMask` + gradient tween | Medium |

### Performance Guidelines

1. **Limit concurrent animations** - Max 2-3 simultaneous animations per screen
2. **Use `RepaintBoundary`** - Isolate expensive animations
3. **Lazy load** - Only animate visible widgets
4. **Simplify on low-end devices** - Detect and reduce effects
5. **Profile regularly** - Use Flutter DevTools

---

## Implementation Phases

### Phase 1: Foundation (Week 1-2)
- [ ] Project setup with folder structure
- [ ] Design system implementation (colors, typography, spacing)
- [ ] Core Magic UI components (ShimmerButton, ShineBorderCard)
- [ ] Supabase integration & auth service
- [ ] Splash screen with basic animation
- [ ] Onboarding carousel
- [ ] Role selection screen
- [ ] Login/signup flows
- [ ] MFA verification

### Phase 2: Candidate Portal (Week 3-4)
- [ ] Candidate dashboard with stats
- [ ] Edit profile (all tabs)
- [ ] Document upload functionality
- [ ] Profile completion tracking
- [ ] Job listings view
- [ ] Application tracker
- [ ] Firm viewer list

### Phase 3: Recruiter Portal (Week 5-6)
- [ ] Recruiter dashboard
- [ ] Candidate search with filters
- [ ] Filter bottom sheet
- [ ] Candidate detail view
- [ ] Saved candidates
- [ ] Campaign builder (4-step wizard)
- [ ] Campaign history

### Phase 4: Messaging & Notifications (Week 7)
- [ ] Message inbox
- [ ] Conversation threads
- [ ] Real-time messaging (Supabase Realtime)
- [ ] Push notification setup
- [ ] In-app notification handling

### Phase 5: Polish & Launch (Week 8)
- [ ] Settings screens
- [ ] Dark mode implementation
- [ ] Performance optimization
- [ ] Error handling & empty states
- [ ] App Store assets & metadata
- [ ] Beta testing
- [ ] Launch preparation

---

## Design Assets Needed

### App Icons
- [ ] iOS app icon (1024x1024)
- [ ] Android adaptive icon (foreground + background)
- [ ] Notification icons

### Splash Screen
- [ ] Animated logo (Lottie preferred)
- [ ] Background with subtle meteor effect

### Onboarding
- [ ] 3-4 illustration slides
- [ ] Role selection icons

### Empty States
- [ ] No messages
- [ ] No candidates found
- [ ] No applications
- [ ] No notifications

### Status Icons
- [ ] Verified badge
- [ ] Premium/Capital badge
- [ ] Role badges (IB, PE, VC, etc.)

### Firm Logos
- [ ] Collection of firm logos for IconCloud equivalent

---

## Testing Strategy

### Unit Tests
- Repository methods
- Provider logic
- Utility functions
- Form validators

### Widget Tests
- Individual components
- Form interactions
- Navigation flows

### Integration Tests
- Authentication flow
- Profile completion flow
- Candidate search flow
- Campaign creation flow

### E2E Tests
- Full user journeys
- Cross-role interactions

---

## Deployment

### Android
- Google Play Console setup
- Signing key generation
- Internal testing track → Closed beta → Production

### iOS
- Apple Developer account
- App Store Connect setup
- TestFlight beta → App Store review

### CI/CD
- GitHub Actions or Codemagic
- Automated builds on PR
- Automated deployment to test tracks

---

## Resources

- [Flutter Documentation](https://docs.flutter.dev/)
- [Riverpod Documentation](https://riverpod.dev/)
- [Supabase Flutter Guide](https://supabase.com/docs/guides/getting-started/quickstarts/flutter)
- [go_router Documentation](https://pub.dev/packages/go_router)
- [Material 3 Design](https://m3.material.io/)
