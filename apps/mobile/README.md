# Coastal Haven Partners Mobile App

A Flutter mobile application for the Coastal Haven Partners finance talent network, connecting elite undergraduate and MBA candidates with boutique investment banks, private equity firms, and venture capital funds.

## Overview

This app provides dedicated portals for three user types:

- **Candidates** - Browse jobs, track applications, view analytics on who's viewing their profile
- **Recruiters** - Search candidates, run outreach campaigns, view engagement analytics
- **School Admins** - Manage student cohorts and track placement metrics

## Tech Stack

- **Framework**: Flutter 3.32+
- **State Management**: Riverpod (flutter_riverpod)
- **Routing**: GoRouter
- **Backend**: Supabase (Auth, Database, Storage)
- **Local Storage**: Drift (SQLite) for offline support
- **Analytics**: Firebase Analytics
- **Code Generation**: Freezed + JSON Serializable

## Getting Started

### Prerequisites

- Flutter SDK >= 3.32.0
- Dart SDK >= 3.8.0
- Android Studio / Xcode (for emulators)
- Supabase project with required tables

### Installation

```bash
# Install dependencies
flutter pub get

# Generate code (freezed models, database)
dart run build_runner build --delete-conflicting-outputs

# Run the app
flutter run
```

### Environment Setup

Create a `.env` file in the project root (or configure via `--dart-define`):

```env
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_anon_key
```

## Project Structure

```text
lib/
├── core/
│   ├── providers/           # Riverpod providers
│   │   ├── auth_provider.dart
│   │   ├── candidate_analytics_provider.dart
│   │   ├── recruiter_analytics_provider.dart
│   │   └── ...
│   ├── router/              # GoRouter configuration
│   │   └── app_router.dart
│   └── theme/               # App theming
│       ├── app_colors.dart
│       ├── app_text_styles.dart
│       └── app_spacing.dart
├── data/
│   ├── models/              # Freezed data models
│   ├── repositories/        # Data access layer
│   ├── services/            # External services (analytics, push)
│   └── local/               # SQLite database for offline
├── features/
│   ├── auth/                # Authentication screens
│   ├── candidate/           # Candidate portal screens
│   ├── recruiter/           # Recruiter portal screens
│   ├── school/              # School admin screens
│   ├── messaging/           # Chat/inbox screens
│   └── shared/              # Shared screens (settings, etc.)
├── widgets/
│   └── magic_ui/            # Custom animated components
└── main.dart
```

## Features

### Candidate Portal

| Feature | Screen | Description |
|---------|--------|-------------|
| Dashboard | `candidate_dashboard.dart` | Profile completion, activity stats, job matches |
| Job Search | `job_listings_screen.dart` | Browse and filter jobs with full-text search |
| Job Details | `job_detail_screen.dart` | Full job info, apply button, deadline tracking |
| Applications | `applications_screen.dart` | Track submitted applications by status |
| **Analytics** | `candidate_analytics_screen.dart` | Profile views, firm engagement, activity metrics |
| Profile | `candidate_profile_screen.dart` | View/edit profile, upload resume/transcript |

### Recruiter Portal

| Feature | Screen | Description |
|---------|--------|-------------|
| Dashboard | `recruiter_dashboard.dart` | Overview stats, quick actions |
| Candidate Search | `candidate_search_screen.dart` | Filter and search candidates |
| Campaigns | `campaigns_screen.dart` | Email outreach campaigns |
| Analytics | `analytics_screen.dart` | Engagement metrics, campaign performance |

### Analytics System

The app implements a comprehensive analytics system matching the website functionality:

**Candidate Analytics** (implemented Dec 2024):

- Profile view tracking (total, monthly, weekly)
- Unique firms that viewed the candidate's profile
- "Who Viewed Your Profile" list with firm names and timestamps
- Week-over-week change percentages
- Activity summary (applications, saved by recruiters, conversations)
- Sample data mode for new users to preview the feature

**Recruiter Analytics**:

- Job listing views and applications
- Candidate engagement metrics
- Campaign performance (open rates, response rates)
- Monthly trends visualization

### Data Flow

```text
analytics_events (Supabase)
        │
        ▼
CandidateAnalyticsNotifier ◄──► ProfileRepository
        │
        ▼
candidateAnalyticsProvider (Riverpod)
        │
        ├──► CandidateDashboard (summary stats)
        └──► CandidateAnalyticsScreen (full analytics)
```

## Navigation

### Candidate Bottom Navigation

1. **Home** - Dashboard with profile completion and activity summary
2. **Jobs** - Browse job listings
3. **Apply** - Track submitted applications
4. **Analytics** - Full analytics dashboard
5. **Profile** - View/edit profile and settings

### Recruiter Bottom Navigation

1. **Home** - Dashboard overview
2. **Candidates** - Search and save candidates
3. **Campaigns** - Manage outreach
4. **Analytics** - Engagement metrics
5. **Settings** - Account settings

## Development Notes

### Recent Updates (December 2024)

#### Candidate Analytics Feature

Implemented full analytics parity with the website:

**Files Created:**

- `lib/core/providers/candidate_analytics_provider.dart` - Provider + model
- `lib/features/candidate/screens/candidate_analytics_screen.dart` - Full screen

**Files Modified:**

- `lib/core/router/app_router.dart` - Added Analytics tab to bottom nav
- `lib/features/candidate/screens/candidate_dashboard.dart` - Real-time stats

**Key Implementation Details:**

- Uses `analytics_events` Supabase table (same as website)
- Queries events where `target_id` = candidate's user ID and `event_type` = 'profile_view'
- Groups views by firm name from `metadata.recruiter_firm`
- Calculates week-over-week change percentages
- Sample data shown by default, auto-clears when real data arrives

### Architecture Patterns

**Repository Pattern**: All Supabase queries go through repository classes with:

- Local-first caching (SQLite via Drift)
- Connectivity-aware fallbacks
- Error handling with safe defaults

**Provider Pattern**: Riverpod providers handle:

- Auth state management
- Data fetching and caching
- UI state (loading, error, data)

**Sample Data Pattern** (for analytics):

- Show realistic sample data for new users
- Yellow banner indicates sample mode
- Auto-switch to real data when available
- Manual clear option with confirmation dialog

### Known Issues & Solutions

1. **Profile views not showing**: Ensure `analytics_events` table has proper RLS policies for candidates to read events targeting them.

2. **Messages tab removed from bottom nav**: Moved to accommodate Analytics tab. Messages still accessible via dashboard notification icon and direct navigation.

3. **Week labels in chart**: Uses `intl` package's `DateFormat` for locale-aware formatting.

4. **Firms Directory “All” category not working**: Caused by a `copyWith` implementation that could not set nullable fields back to `null`. Fixed by updating `FirmsDirectoryParams.copyWith()` to allow explicitly clearing fields (so tapping “All” actually clears `category`).

5. **Firms Directory “Load More” missing**: Implemented paged state (total count + appended pages) and a “Load More” action, so the UI can fetch beyond the first page.

### Debugging (Android on Windows)

When you’re running the Flutter Android app on Windows, UI click/tap logs come from the **Flutter process**:

- **See logs in**:
  - the terminal running `flutter run`
  - `flutter logs`
  - `adb logcat`
- **Note**: `pnpm dev` is the Next.js dev server for the web apps and will not show Flutter button clicks.

#### Optional: force Coastal debug logs on

Debug logging is enabled automatically in debug builds. You can also force it with:

```bash
flutter run --dart-define=COASTAL_DEBUG=true
```

Useful files:
- `lib/core/utils/app_debug.dart` (logger + Riverpod observer)
- `lib/core/providers/job_provider.dart` (firms directory params + paging + logs)
- `lib/features/shared/screens/firms_directory_screen.dart` (tap logs + load more UI)

## Commands

```bash
# Development
flutter run                          # Run on connected device
flutter run -d chrome                # Run on web (if enabled)

# Code Generation
dart run build_runner build          # Generate freezed/json code
dart run build_runner watch          # Watch mode

# Analysis
flutter analyze                      # Run static analysis
flutter test                         # Run tests

# Build
flutter build apk                    # Android APK
flutter build appbundle              # Android App Bundle
flutter build ios                    # iOS (requires macOS)
```

## Related Documentation

- [Main Project CLAUDE.md](../../CLAUDE.md) - Project-wide conventions
- [Supabase Migrations](../../supabase/migrations/) - Database schema
- [Website Portal](../www/app/(portal)/) - Web implementation reference

## Resources

- [Flutter Documentation](https://docs.flutter.dev/)
- [Riverpod Documentation](https://riverpod.dev/)
- [GoRouter Documentation](https://pub.dev/packages/go_router)
- [Supabase Flutter SDK](https://supabase.com/docs/reference/dart/introduction)
