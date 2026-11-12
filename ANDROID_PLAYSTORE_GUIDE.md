# Step-by-Step Guide: Publishing Kryso to the Google Play Store

This document guides you through generating the official Android App Bundle (`.aab`) and direct testing `.apk` for **Kryso Music Academy** and publishing it to the Google Play Console.

---

## 1. Prerequisites Already Configured in the Codebase

Everything required by Google Play and Android has already been built into this project:
- ✅ **Web App Manifest**: [`public/manifest.json`](file:///d:/Software%20Setup/SOsync_Company_work/Projects/APP_WORK/KRyso/public/manifest.json) (Standalone display, dark theme `#0B0F17`, portrait lock).
- ✅ **Compliant Android Icons**: Located in [`public/icons/`](file:///d:/Software%20Setup/SOsync_Company_work/Projects/APP_WORK/KRyso/public/icons/):
  - `playstore-icon.png` (512x512 px, 32-bit PNG, opaque background, strictly complies with Google Play Store graphic specs).
  - `icon-512.png` and `icon-192.png` (PWA launcher icons).
  - `maskable-icon-512.png` (Adaptive icon with safe-zone margin).
- ✅ **Digital Asset Links**: [`public/.well-known/assetlinks.json`](file:///d:/Software%20Setup/SOsync_Company_work/Projects/APP_WORK/KRyso/public/.well-known/assetlinks.json) (Pre-configured for `com.krysomusic.academy` to remove the browser address bar).
- ✅ **Privacy Policy URL**: Live at `https://your-domain.com/privacy` (Mandatory for Google Play Console submission).

---

## 2. Generating the Android Package (.aab and .apk)

Because Kryso uses modern Trusted Web Activity (TWA), you can generate both the Google Play `.aab` bundle and testing `.apk` in **under 3 minutes** using **PWABuilder** (Microsoft & Google's official open-source PWA packager).

### Steps:
1. **Deploy your latest website code** to your production domain (e.g. Vercel).
2. Go to **[PWABuilder.com](https://www.pwabuilder.com)** in your web browser.
3. Paste your live production URL (e.g. `https://kryso.vercel.app` or `https://kryso.in`) and click **Start**.
4. PWABuilder will analyze your site and show **Green Checkmarks** for Manifest, Security, and Icons.
5. Click **Package for Stores** and select **Android**.
6. In the Android settings popup, configure:
   - **Package ID**: `com.krysomusic.academy`
   - **App Name**: `Kryso Music Academy`
   - **Short Name**: `Kryso`
   - **Display Mode**: `Standalone`
   - **Status Bar Color**: `#0B0F17`
   - **Nav Bar Color**: `#0B0F17`
   - **Signing Key**: Select **Generate new key** (download and safely keep the generated `.keystore` file and password for future app updates).
7. Click **Generate Package** and download the resulting `.zip` file.

### Inside the Downloaded Package:
- `app-release-bundle.aab`: The official bundle file to upload to the Google Play Console.
- `app-debug.apk`: Can be sent to your phone (via WhatsApp, Google Drive, or USB) and installed directly to test the app right now.
- `assetlinks.json`: Contains your generated SHA-256 fingerprint.

---

## 3. Linking Digital Asset Links (Removes URL Bar)

To make your Android app 100% full-screen without any browser address bar:
1. Open the `assetlinks.json` inside the downloaded PWABuilder package (or copy the SHA-256 fingerprint from Google Play Console under **Release > Setup > App Integrity**).
2. Open [`public/.well-known/assetlinks.json`](file:///d:/Software%20Setup/SOsync_Company_work/Projects/APP_WORK/KRyso/public/.well-known/assetlinks.json) in this repository.
3. Replace `"__REPLACE_WITH_SHA256_FINGERPRINT__"` with your actual SHA-256 fingerprint:
   ```json
   [
     {
       "relation": ["delegate_permission/common.handle_all_urls"],
       "target": {
         "namespace": "android_app",
         "package_name": "com.krysomusic.academy",
         "sha256_cert_fingerprints": [
           "14:6D:E9:83:C5:73:06:50:D8:EE:B9:95:2F:34:FC:64:16:A0:83:42:E6:1D:BE:A8:8A:04:96:B2:3F:CF:44:E5"
         ]
       }
     }
   ]
   ```
4. Push to Git so Vercel deploys the file. Once live, Android will verify ownership and hide the URL bar completely.

---

## 4. Google Play Console Submission Steps

1. **Sign in to Google Play Console**:
   - Go to [play.google.com/console](https://play.google.com/console).
   - Click **Create app**.
   - App Name: `Kryso Music Academy`
   - Default language: `English (India)` or `English (United States)`
   - App or Game: `App`
   - Free or Paid: `Free`

2. **Complete the Store Listing**:
   - **Short description**: `Learn Pro DJing, Music Production & Audio Engineering in Pune.`
   - **Full description**: Introduce Kryso Music Academy, courses offered (DJing, Music Production, Piano, Guitar, Singing, Drums, Rapping), music track catalog, and admission enquiry.
   - **App icon**: Upload [`public/icons/playstore-icon.png`](file:///d:/Software%20Setup/SOsync_Company_work/Projects/APP_WORK/KRyso/public/icons/playstore-icon.png) (512x512 px).
   - **Feature graphic**: 1024x500 px graphic banner.
   - **Screenshots**: Upload at least 2 portrait screenshots (1080x1920 or 1080x2400) of the Kryso app running.

3. **Provide Policy & Privacy Details**:
   - **Privacy Policy URL**: Enter `https://your-domain.com/privacy`
   - **App Access**: All functionality is available without credentials (or provide `admin` credentials if you want reviewers to inspect the admin portal).
   - **Ads**: Select "No, my app does not contain ads".
   - **Content Rating**: Complete questionnaire (Select Category: Education / Entertainment $\to$ Rating will be Everyone / 12+).
   - **Target Audience**: Select 13 and above.
   - **Data Safety**:
     - Data collected: Name, Email address, Phone number (for course registration and invoices).
     - Financial information: Processed externally via Razorpay (PCI-DSS compliant).
     - Data encrypted in transit: Yes (HTTPS / TLS).

4. **Upload the App Bundle**:
   - Go to **Release > Production** (or **Closed testing** if on a new personal account).
   - Create new release.
   - Drag & drop your `app-release-bundle.aab`.
   - Name the release (e.g. `1.0.0 (1)`).
   - Click **Save** and **Review release**.
   - Submit for Google Review!
