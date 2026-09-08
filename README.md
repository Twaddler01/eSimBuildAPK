eSim WebView Test

This is the first Android/WebView project for eSim.

The APK contains the eSim web application inside the Android app's assets and opens it in a fullscreen Android WebView.

The WebView uses AndroidX "WebViewAssetLoader" to serve the local files through:

"https://appassets.androidplatform.net/assets/"

This allows the eSim application to continue using ES modules and normal JavaScript imports without requiring an external web server.

Build with GitHub Actions

This project is intentionally designed so that Gradle does not need to be installed on the Android device.

1. Create a new GitHub repository.
2. Upload/push the contents of this project into the repository.
3. GitHub Actions will run automatically on push, or use Actions → Build APK → Run workflow.
4. Open the completed workflow run.
5. Under Artifacts, download "eSim-WebView-Test-debug".
6. Extract the APK and install it on the Android device.

The GitHub Actions workflow installs/configures:

- Java 17
- Android SDK platform 35
- Android build tools 35.0.0
- Gradle 8.10.2

No local Android Studio or local Gradle installation is required.

WebView Configuration

The Android app uses a fullscreen WebView configured for the eSim application.

Important WebView settings include:

- JavaScript enabled
- DOM storage enabled
- Local file/content access disabled
- Wide viewport enabled
- Overview mode disabled
- "WebViewAssetLoader" used to serve application assets

The WebView loads:

"https://appassets.androidplatform.net/assets/index.html"

rather than directly loading:

"file:///android_asset/index.html"

This provides a local HTTPS-like origin for the application's HTML, JavaScript modules, and other assets.

Phaser Scaling

The current Phaser configuration uses "Phaser.Scale.FIT".

The WebView itself provides the actual device viewport, while Phaser maintains a logical coordinate system.

The logical game width is currently being reduced from "1200" to approximately "600" so that existing UI elements and text have a more appropriate physical size on mobile devices.

The logical game height is calculated automatically from the device's aspect ratio rather than using a fixed height.

This allows the game to maintain its proportions without stretching while providing additional vertical coordinate space on taller devices.

Current eSim UI Work

The existing eSim stage UI originally placed several information panels side-by-side:

- Messages
- Inventory
- Discovery Tracker / Objectives

With the reduced Phaser width, dividing the screen into thirds makes each panel unnecessarily narrow.

The planned layout is therefore to use a full-width information area with tabs:

- MESSAGES
- INVENTORY
- OBJECTIVES

This allows each panel to use the full available width while preserving the existing vertical card-based layout.

A small unread indicator may also be added to these tabs so that changes such as new messages, newly acquired items, or objective updates can be indicated when the corresponding panel is not currently selected.

Next Steps

- Finish adapting the eSim UI for mobile/WebView viewing.
- Test the reduced Phaser logical width across devices.
- Complete the top information tabs.
- Add unread indicators for relevant information updates.
- Move the working Android/WebView project into the main eSim repository once the APK wrapper is stable.
- Update the GitHub Actions build so the APK is built directly from the main eSim project rather than maintaining separate copies of the web application files.