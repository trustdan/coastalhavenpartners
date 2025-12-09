# iOS Setup Guide - Coastal Haven Partners Mobile App

This guide walks you through setting up the iOS build on your Mac.

## Prerequisites

- [ ] macOS computer
- [ ] Xcode installed (from Mac App Store)
- [ ] Apple Developer account ($99/year) - for device testing & App Store

## Quick Start (Simulator Only - No Apple Developer Account Needed)

### 1. Install Dependencies

```bash
# Install Xcode Command Line Tools (if not already installed)
xcode-select --install

# Install CocoaPods
sudo gem install cocoapods

# Navigate to project
cd apps/mobile

# Get Flutter dependencies
flutter pub get

# Install iOS pods
cd ios
pod install
cd ..
```

### 2. Run on iOS Simulator

```bash
# List available simulators
flutter devices

# Run on iOS Simulator
flutter run -d "iPhone 15 Pro"
# or just
flutter run  # will prompt to choose device
```

---

## Full Setup (Device Testing & Push Notifications)

### Step 1: Firebase iOS Configuration

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select project: **coastal-haven-partners-11819**
3. Click **Add app** → **iOS**
4. Enter Bundle ID: `com.coastalhavenpartners.ios`
5. Download `GoogleService-Info.plist`
6. Place it in: `apps/mobile/ios/Runner/GoogleService-Info.plist`

### Step 2: Apple Developer Setup

1. Go to [Apple Developer](https://developer.apple.com)
2. Create an App ID:
   - Identifier: `com.coastalhavenpartners.ios`
   - Capabilities: Enable **Push Notifications**

3. Create APNs Key (for Firebase):
   - Go to: Certificates, Identifiers & Profiles → Keys
   - Create new key with **Apple Push Notifications service (APNs)**
   - Download the `.p8` file
   - Note the Key ID

4. Upload APNs Key to Firebase:
   - Firebase Console → Project Settings → Cloud Messaging
   - Under "Apple app configuration", upload the APNs key
   - Enter Key ID and Team ID

### Step 3: Xcode Configuration

1. Open `ios/Runner.xcworkspace` in Xcode (NOT `.xcodeproj`)
2. Select the Runner target
3. Under **Signing & Capabilities**:
   - Select your Team
   - Ensure Bundle Identifier is `com.coastalhavenpartners.ios`
4. Add capability: **Push Notifications**
5. Add capability: **Background Modes** → enable "Remote notifications"

### Step 4: Build & Run

```bash
# Debug build on connected device
flutter run -d <device-id>

# Release build
flutter build ios --release

# Open in Xcode for App Store submission
open ios/Runner.xcworkspace
```

---

## Project Configuration Summary

| Setting | Value |
|---------|-------|
| Bundle ID | `com.coastalhavenpartners.ios` |
| Display Name | Coastal Haven |
| Firebase Project | coastal-haven-partners-11819 |
| Min iOS Version | 12.0 (Flutter default) |

## Files Already Configured

- [x] `Info.plist` - App permissions and push notification setup
- [x] `project.pbxproj` - Bundle identifier set
- [x] App Icons - All 15 sizes in `Assets.xcassets`

## Files You Need to Add

- [ ] `ios/Runner/GoogleService-Info.plist` - Download from Firebase Console

## Troubleshooting

### "No signing certificate" error
- Open Xcode, go to Preferences → Accounts
- Sign in with your Apple ID
- Let Xcode manage signing automatically

### "Pod install" fails
```bash
cd ios
pod repo update
pod install --repo-update
```

### Simulator not showing
```bash
# Open iOS Simulator manually
open -a Simulator

# Or list available simulators
xcrun simctl list devices
```

### Push notifications not working on simulator
- Push notifications only work on **real devices**
- Simulator will show permission prompt but won't receive actual pushes

---

## App Store Submission Checklist

When ready to submit:

- [ ] Create app in App Store Connect
- [ ] Generate screenshots (6.7", 6.5", 5.5" iPhones + iPad)
- [ ] Write app description
- [ ] Set pricing (Free)
- [ ] Add privacy policy URL
- [ ] Archive build in Xcode
- [ ] Upload to App Store Connect
- [ ] Submit for review

---

*Last Updated: 2025-12-08*
