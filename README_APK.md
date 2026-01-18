# Muskan PCO - APK Conversion Guide

This project is a high-performance PWA. To turn this into a literal `.apk` file for Android, follow these instructions:

## Option A: Bubblewrap (Official Google Method)
*Best for: Professional Play Store apps.*

1. **Prerequisites**: Install [Node.js](https://nodejs.org/) and [Java (JDK 11+)](https://adoptium.net/).
2. **Install CLI**:
   ```bash
   npm install -g @bubblewrap/cli
   ```
3. **Initialize**:
   ```bash
   bubblewrap init --manifest=https://your-hosted-url.com/manifest.json
   ```
4. **Build**:
   ```bash
   bubblewrap build
   ```
5. **Output**: Your APK will be in the root folder named `app-release-signed.apk`.

## Option B: Web-to-APK (Fastest)
*Best for: Sending an APK to customers via WhatsApp.*

1. Deploy this code to a hosting provider (like Vercel, Netlify, or Firebase).
2. Go to [PWA2APK](https://www.pwa2apk.com/).
3. Enter your deployed URL.
4. Download the generated APK file.

## Option C: Capacitor (Native Features)
*Best for: Future expansion.*

1. Run: `npm install @capacitor/core @capacitor/cli @capacitor/android`
2. Run: `npx cap init "Muskan PCO" "com.muskan.gonda"`
3. Run: `npx cap add android`
4. Run: `npx cap open android` (This opens Android Studio to build the APK).

---
**Note:** Always ensure your `manifest.json` has valid 512x512 icons before building, as the APK uses these for the home screen icon.
