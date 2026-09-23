#!/usr/bin/env bash
set -Eeuo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

BUILD_VARIANT="${BUILD_VARIANT:-release}"
VERSION_CODE="${VERSION_CODE:-1}"
VERSION_NAME="${VERSION_NAME:-1.0.0}"

printf '\n== Medacal clean Android build ==\n'
printf 'variant: %s | version: %s (%s)\n' "$BUILD_VARIANT" "$VERSION_NAME" "$VERSION_CODE"

NATIVE_BACKUP="$(mktemp -d)"
if [[ -f android/app/src/main/AndroidManifest.xml ]]; then
  cp android/app/src/main/AndroidManifest.xml "$NATIVE_BACKUP/AndroidManifest.xml"
fi
if [[ -f android/app/src/main/java/com/medacal/pharmacy/MainActivity.java ]]; then
  mkdir -p "$NATIVE_BACKUP/java/com/medacal/pharmacy"
  cp android/app/src/main/java/com/medacal/pharmacy/MainActivity.java "$NATIVE_BACKUP/java/com/medacal/pharmacy/MainActivity.java"
fi
for native_file in android/app/src/main/java/com/medacal/pharmacy/*.java; do
  [[ -f "$native_file" ]] || continue
  mkdir -p "$NATIVE_BACKUP/java/com/medacal/pharmacy"
  cp "$native_file" "$NATIVE_BACKUP/java/com/medacal/pharmacy/"
done
if [[ -d android/app/src/main/java/com/medacal/pharmacy/thermal ]]; then
  mkdir -p "$NATIVE_BACKUP/java/com/medacal/pharmacy/thermal"
  cp android/app/src/main/java/com/medacal/pharmacy/thermal/* "$NATIVE_BACKUP/java/com/medacal/pharmacy/thermal/"
fi
rm -rf node_modules dist android
npm ci
npm run build
npx cap add android

# Restore project-owned native code and manifest additions after Capacitor regeneration.
if [[ -f "$NATIVE_BACKUP/AndroidManifest.xml" ]]; then
  cp "$NATIVE_BACKUP/AndroidManifest.xml" android/app/src/main/AndroidManifest.xml
fi
if [[ -d "$NATIVE_BACKUP/java" ]]; then
  cp -R "$NATIVE_BACKUP/java/." android/app/src/main/java/
fi
npx @capacitor/assets generate --android
npx cap sync android

# Capacitor regenerates the wrapper; keep first-run downloads reliable.
sed -i 's/networkTimeout=10000/networkTimeout=120000/' android/gradle/wrapper/gradle-wrapper.properties

# Keep generated Android identity aligned with capacitor.config.json.
python3 - "$VERSION_CODE" "$VERSION_NAME" <<'PY'
from pathlib import Path
import re, sys
path = Path("android/app/build.gradle")
text = path.read_text()
version_code, version_name = sys.argv[1:]
text = re.sub(r'versionCode\s+\d+', f'versionCode {version_code}', text)
text = re.sub(r'versionName\s+"[^"]+"', f'versionName "{version_name}"', text)
path.write_text(text)
PY

if [[ -n "${ANDROID_KEYSTORE_BASE64:-}" ]]; then
  printf '%s' "$ANDROID_KEYSTORE_BASE64" | base64 --decode > android/medacal-release.jks
  cat > android/keystore.properties <<EOF
storeFile=../medacal-release.jks
storePassword=${ANDROID_KEYSTORE_PASSWORD:?ANDROID_KEYSTORE_PASSWORD is required}
keyAlias=${ANDROID_KEY_ALIAS:?ANDROID_KEY_ALIAS is required}
keyPassword=${ANDROID_KEY_PASSWORD:?ANDROID_KEY_PASSWORD is required}
EOF
  cat >> android/app/build.gradle <<'EOF'

def medacalKeystoreFile = rootProject.file("keystore.properties")
if (medacalKeystoreFile.exists()) {
    def medacalKeystore = new Properties()
    medacalKeystore.load(new FileInputStream(medacalKeystoreFile))
    android {
        signingConfigs {
            release {
                storeFile file(medacalKeystore['storeFile'])
                storePassword medacalKeystore['storePassword']
                keyAlias medacalKeystore['keyAlias']
                keyPassword medacalKeystore['keyPassword']
            }
        }
        buildTypes {
            release { signingConfig signingConfigs.release }
        }
    }
}
EOF
fi

chmod +x android/gradlew
if [[ "$BUILD_VARIANT" == "debug" ]]; then
  (cd android && ./gradlew clean assembleDebug --no-daemon)
else
  (cd android && ./gradlew clean assembleDebug assembleRelease bundleRelease --no-daemon)
fi

if [[ -f android/app/build/outputs/apk/debug/app-debug.apk ]]; then
  cp android/app/build/outputs/apk/debug/app-debug.apk android/app/build/outputs/apk/debug/Medacal-debug.apk
fi
if [[ -f android/app/build/outputs/bundle/release/app-release.aab ]]; then
  cp android/app/build/outputs/bundle/release/app-release.aab android/app/build/outputs/bundle/release/Medacal-production.aab
fi

printf '\nBuild outputs:\n'
find android/app/build/outputs -type f \( -name '*.apk' -o -name '*.aab' \) -print 2>/dev/null || true
