# eSim WebView Test

This is the first minimal Android/WebView experiment for the eSim project.

The APK contains a tiny HTML page inside `app/src/main/assets/index.html` and opens it in a fullscreen Android WebView.

## Build with GitHub Actions

This project is intentionally designed so that **Gradle does not need to be installed on your Android device**.

1. Create a new GitHub repository.
2. Upload/push the contents of this project into the repository.
3. GitHub Actions will run automatically on push, or use **Actions → Build APK → Run workflow**.
4. Open the completed workflow run.
5. Under **Artifacts**, download `eSim-WebView-Test-debug`.
6. Extract the APK and install it on the Android device.

The workflow installs:

- Java 17
- Android SDK platform 35
- Android build tools 35.0.0
- Gradle 8.10.2

No local Android Studio or local Gradle installation is required.

## Current test

The APK loads:

`file:///android_asset/index.html`

The test page verifies that HTML, CSS, JavaScript, and the Android WebView are functioning.

## Next step

Once this APK works, replace the test page with a minimal Phaser project. After that we can determine whether the final eSim application should use packaged WebView assets or a localhost server.
# eSimBuildAPK
