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
