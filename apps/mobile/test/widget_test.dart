import 'package:flutter_test/flutter_test.dart';
import 'package:coastal_haven_mobile/app.dart';

void main() {
  testWidgets('App renders smoke test', (WidgetTester tester) async {
    // Build our app and trigger a frame.
    await tester.pumpWidget(const CoastalHavenApp());

    // Verify that the app title is displayed
    expect(find.text('Coastal Haven Partners'), findsOneWidget);

    // Verify that the welcome message is displayed
    expect(find.text('Welcome to Coastal Haven'), findsOneWidget);
  });
}
