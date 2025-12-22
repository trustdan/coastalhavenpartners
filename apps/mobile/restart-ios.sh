#!/bin/bash
# restart-ios.sh
# Recompiles and restarts the Flutter app on iOS Simulator

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
GRAY='\033[0;90m'
NC='\033[0m' # No Color

# Parse arguments
RELEASE=false
DEVICE=""
DEEP_CLEAN=false

while [[ $# -gt 0 ]]; do
    case $1 in
        --release|-r)
            RELEASE=true
            shift
            ;;
        --device|-d)
            DEVICE="$2"
            shift 2
            ;;
        --deep-clean|-c)
            DEEP_CLEAN=true
            shift
            ;;
        --help|-h)
            echo "Usage: ./restart-ios.sh [options]"
            echo ""
            echo "Options:"
            echo "  -r, --release     Build in release mode"
            echo "  -d, --device ID   Specify device ID (run 'flutter devices' to list)"
            echo "  -c, --deep-clean  Deep clean including CocoaPods cache"
            echo "  -h, --help        Show this help message"
            exit 0
            ;;
        *)
            echo -e "${RED}Unknown option: $1${NC}"
            exit 1
            ;;
    esac
done

# Navigate to script directory
cd "$(dirname "$0")"

echo -e "${CYAN}🔄 Restarting Flutter app for iOS...${NC}"

# Flutter clean
echo -e "${YELLOW}🧹 Running flutter clean...${NC}"
flutter clean

# Deep clean CocoaPods if requested
if [ "$DEEP_CLEAN" = true ]; then
    echo -e "${YELLOW}🧹 Deep cleaning iOS build...${NC}"
    cd ios

    # Remove Pods directory and Podfile.lock
    rm -rf Pods
    rm -f Podfile.lock

    # Clear CocoaPods cache
    pod cache clean --all 2>/dev/null || true

    # Remove derived data for this project
    rm -rf ~/Library/Developer/Xcode/DerivedData/*coastal* 2>/dev/null || true

    cd ..
fi

# Get dependencies
echo -e "${YELLOW}📦 Getting Flutter dependencies...${NC}"
flutter pub get

# Install CocoaPods dependencies
echo -e "${YELLOW}🍫 Installing CocoaPods dependencies...${NC}"
cd ios
pod install
cd ..

# Build arguments
DEVICE_ARG=""
if [ -n "$DEVICE" ]; then
    DEVICE_ARG="-d $DEVICE"
fi

MODE_ARG=""
if [ "$RELEASE" = true ]; then
    MODE_ARG="--release"
fi

# Run the app
echo -e "${GREEN}🚀 Launching app on iOS...${NC}"
COMMAND="flutter run $DEVICE_ARG $MODE_ARG"
echo -e "${GRAY}Running: $COMMAND${NC}"
eval $COMMAND
