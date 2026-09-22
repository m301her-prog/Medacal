# Medacal — Pharmacy OS

تطبيق إدارة صيدلية مبني بـ **Vite + React + JavaScript** مع واجهة عربية متجاوبة، API Serverless متوافق مع Vercel، وقاعدة PostgreSQL على Neon. يضم نسخة تجريبية تعمل دون أسرار، وتتحول تلقائيًا إلى التكاملات الحقيقية عند ضبط متغيرات البيئة.

## التشغيل

```bash
npm install
cp .env.example .env
npm run dev
```

لتشغيل قاعدة البيانات، نفّذ [`db/schema.sql`](./db/schema.sql) في Neon ثم ضع `DATABASE_URL`. عند غيابها تستخدم API بيانات تجريبية حتى يمكن تجربة الواجهة ومساعد البحث.

## أهم المسارات

| المسار | الوظيفة |
|---|---|
| `/api/medicines` | البحث والإضافة والحذف من المخزون |
| `/api/chat` | بحث المخزون + إجابة AI اختيارية عبر OpenAI-compatible API |
| `/api/dashboard` | إحصائيات المبيعات والتنبيهات |
| `/api/sales` | إنشاء فاتورة وخصم المخزون وتحديث الدين |
| `/api/customers` | العملاء والمدفوعات وسجل الديون |
| `/api/integrations` | WhatsApp Intent/Provider، Zapier Webhook، Bitly |

## الموصلات المدمجة

- **Neon:** عبر `@neondatabase/serverless` ومتغير `DATABASE_URL`، مع استعلامات حقيقية في API.
- **Vercel:** عبر `vercel.json`، حيث تُبنى الواجهة وتُشغل ملفات `/api` كـ Serverless Functions.
- **Zapier:** عبر `ZAPIER_WEBHOOK_URL` لتلقي حدث `sale.created` وأي أحداث مستقبلية.
- **Bitly:** عبر `BITLY_ACCESS_TOKEN` لإنشاء روابط مختصرة من `/api/integrations`.
- **WhatsApp:** رابط `wa.me` يعمل مباشرةً، أو مزود API اختياري عبر `WHATSAPP_PROVIDER_URL` و`WHATSAPP_PROVIDER_TOKEN`.
- **AI:** يقرأ المخزون أولًا ثم يستدعي `OPENAI_API_KEY` أو بيئة Manus `BUILT_IN_FORGE_API_URL`، ولا يرسل وصفات أو جرعات.

## Android

بعد البناء، يمكن إضافة Capacitor Android:

```bash
npm run build
npx cap add android
npx cap sync android
npx cap open android
```

## الأمان

لا تضع أسرارًا في الواجهة أو المستودع. انسخ `.env.example` إلى `.env` محليًا، واضبط نفس المتغيرات في Vercel Project Settings. مساعد العملاء مصمم للبحث عن التوفر فقط، مع تنبيه واضح بأن القرار الطبي للصيدلي/الطبيب.

## خريطة الصفحات المستقلة

كل وحدة في الواجهة لها ملف JSX مستقل، ومسار React مستقل، وأيقونة تنقل مستقلة في الشريط الجانبي:

| الأيقونة | المسار | الملف | الوظيفة |
|---|---|---|---|
| لوحة التحكم | `/` | `src/pages/Dashboard.jsx` | الملخص والإحصائيات اليومية |
| مساعد العملاء | `/chat` | `src/pages/CustomerChat.jsx` | المحادثة والبحث في المخزون |
| المخزون | `/inventory` | `src/pages/Inventory.jsx` | البحث وإضافة وحذف الأدوية |
| نقطة البيع | `/pos` | `src/pages/POS.jsx` | سلة البيع وإنشاء الفاتورة |
| العملاء | `/customers` | `src/pages/Customers.jsx` | العملاء والديون ومطالبات واتساب |
| الموردون | `/suppliers` | `src/pages/Suppliers.jsx` | الموردون والطلبيات |
| التقارير | `/reports` | `src/pages/Reports.jsx` | المبيعات والأرباح والأصناف الأكثر مبيعًا |
| التنبيهات | `/notifications` | `src/pages/Notifications.jsx` | تنبيهات المخزون والصلاحية والتكاملات |
| الإعدادات | `/settings` | `src/pages/Settings.jsx` | الملف الشخصي والتكاملات والمظهر |

تسجيل المسارات والأيقونات موجود بشكل مركزي في `src/App.jsx`، لكن محتوى كل شاشة وسلوكها موجود في ملفها المستقل، ويمكن تطوير كل صفحة أو ربطها بـ API خاص بها دون التأثير على بقية الصفحات.

## إصلاح تشغيل Android وسبب Crash

تمت مراجعة مشروع Android وإصلاح السبب الجذري للإغلاق عند التشغيل. المشروع كان يحتوي على `capacitor.config.json` فقط، من دون حزم Capacitor أو مجلد `android` أو Gradle wrapper؛ لذلك لم يكن هناك تطبيق Android native صحيح مرتبط بواجهة Vite.

الإصلاحات المنفذة:

- إضافة `@capacitor/core` و`@capacitor/android` و`@capacitor/cli`.
- توليد مجلد `android/` كامل مع `MainActivity` وGradle وManifest.
- تثبيت `applicationId` على `com.medacal.pharmacy`.
- مزامنة `dist` تلقائيًا إلى `android/app/src/main/assets/public`.
- إضافة أوامر البناء والمزامنة:

```bash
npm run cap:sync       # build + capacitor sync
npm run android:build  # تجهيز وبناء APK Debug
npm run android:release
```

- رفع مهلة تنزيل Gradle إلى 120 ثانية لتقليل فشل البناء بسبب الشبكة.
- منح التطبيق صلاحية الإنترنت اللازمة لاتصالات API.

فحص `npx cap doctor` يمر بنجاح. إذا ظهر فشل في `./gradlew` أثناء أول بناء، يكون سببه تنزيل توزيعة Gradle من الخادم الخارجي، ويمكن إعادة تنفيذ الأمر بعد عودة الاتصال أو توفير Gradle cache محليًا؛ وليس خطأً في كود التطبيق أو إعداد Capacitor.

## دورة Android Production النظيفة

تم توحيد بناء Android في مسار واحد قابل للتكرار من الصفر. السكربت [`scripts/android-clean-build.sh`](./scripts/android-clean-build.sh) ينفذ بالترتيب: حذف `node_modules` و`dist` و`android`، تثبيت الاعتماديات من `package-lock.json` عبر `npm ci`، بناء Vite، توليد منصة Android من `capacitor.config.json`، مزامنة الملفات، ضبط رقم الإصدار، ثم بناء Release.

للتشغيل المحلي:

```bash
npm run android:clean-build
```

ولنسخة Debug:

```bash
BUILD_VARIANT=debug npm run android:clean-build
```

يمكن توقيع نسخة Release من خلال متغيرات بيئة محلية أو GitHub Secrets فقط:

```text
ANDROID_KEYSTORE_BASE64
ANDROID_KEYSTORE_PASSWORD
ANDROID_KEY_ALIAS
ANDROID_KEY_PASSWORD
```

لا يتم إنشاء أو رفع keystore تجريبي، ولا توجد مفاتيح توقيع أو مفاتيح Firebase داخل المستودع. Workflow الإنتاج الوحيد هو [android-production.yml](./.github/workflows/android-production.yml)، ويستخدم Java 21 وNode 22 و`npm ci` وبناءً نظيفًا في كل تشغيل.

## AAB وأيقونات Android

كل بناء نظيف يستخدم `assets/icon-foreground.png` كمصدر الهوية البصرية. قبل تشغيل `@capacitor/assets` يتم تطبيع الملف إلى PNG حقيقي وإنشاء مصادر مربعة قياسية (`icon.png`, `icon-background.png`, `icon-only.png`) ثم توليد أيقونات جميع كثافات Android.

الـ Release ينتج:

```text
Medacal-debug.apk
Medacal-production.aab
```

ملف AAB هو حزمة Google Play. إذا لم تكن أسرار التوقيع الأربعة موجودة، يبقى AAB غير موقّع لأغراض البناء/المراجعة؛ ولإرساله إلى Google Play يجب ضبط `ANDROID_KEYSTORE_BASE64` وبيانات المفتاح في GitHub Secrets. أما APK Debug المنشور فهو قابل للتثبيت المباشر للاختبار ويحمل أيقونات Medacal المولدة من المصدر المذكور.

## زر الرجوع في Android

تمت إضافة `@capacitor/app` في `src/main.jsx`. عند ضغط زر الرجوع الأصلي في الهاتف، يرجع التطبيق إلى الصفحة السابقة داخل سجل React Router. إذا كان المستخدم في الصفحة الرئيسية ولا توجد صفحة سابقة، يُغلق التطبيق عبر Capacitor بدل أن يتنقل إلى صفحة بيضاء أو يخرج من WebView بشكل غير متوقع.

## الفواتير ومسح الباركود

أضيفت صفحة `/invoices` لسجل الفواتير، وصفحة عرض منفصلة لكل فاتورة. بعد إتمام البيع تُحفظ الفاتورة في الخادم وفي التخزين المحلي كنسخة عرض، ثم تُفتح مباشرة مع زر **طباعة / حفظ PDF**. يستخدم الزر نافذة الطباعة الأصلية في Android والويب، ومنها يمكن اختيار **Save as PDF** مع دعم كامل للنص العربي.

تدعم نقطة البيع زر **مسح بالكاميرا** عبر `@capacitor-mlkit/barcode-scanning` لصيغ EAN-8 وEAN-13 وCode128 وUPC، وتضيف الدواء المطابق مباشرة إلى السلة. يوجد إدخال يدوي احتياطي عند رفض إذن الكاميرا أو عدم توفرها.
