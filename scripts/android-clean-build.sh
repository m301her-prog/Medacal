#!/usr/bin/env bash
set -Eeuo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

BUILD_VARIANT="${BUILD_VARIANT:-release}"
VERSION_CODE="${VERSION_CODE:-1}"
VERSION_NAME="${VERSION_NAME:-1.0.0}"

printf '\n== Medacal clean Android build ==\n'
printf 'variant: %s | version: %s (%s)\n' "$BUILD_VARIANT" "$VERSION_NAME" "$VERSION_CODE"

rm -rf node_modules dist android
npm ci
npm run build
npx cap add android
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
  (cd android && ./gradlew clean assembleRelease bundleRelease --no-daemon)
fi

printf '\nBuild outputs:\n'
find android/app/build/outputs -type f \( -name '*.apk' -o -name '*.aab' \) -print 2>/dev/null || true
