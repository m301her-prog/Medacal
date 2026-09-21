# تكامل API فرما تيك

## روابط الخدمة

- الشات: `https://medacal.vercel.app/api/chat`
- العملاء: `https://medacal.vercel.app/api/customers`
- لوحة التحكم: `https://medacal.vercel.app/api/dashboard`
- التكاملات: `https://medacal.vercel.app/api/integrations`
- الأدوية والمخزون: `https://medacal.vercel.app/api/medicines`
- المبيعات: `https://medacal.vercel.app/api/sales`

تم جمع الروابط في `src/lib/ApiService.js`. تستخدم الواجهة `fetch` المتوافق مع الويب وCapacitor Native، مع `Accept: application/json`، وفحص `Content-Type`، ومعالجة أخطاء الشبكة وHTTP وHTML.

فتح رابط API مباشرة في المتصفح ليس اختبارًا كافيًا؛ بعض المسارات تقبل `POST` فقط، والمتصفح قد يعرض SPA عند إعداد نشر غير صحيح. الاختبار الصحيح هو طلب HTTP من الخدمة. إعداد `vercel.json` الحالي يجعل وظائف `api/**/*.js` تُكتشف كـ Serverless Functions قبل fallback الخاص بتطبيق Vite.

يمكن تغيير نطاق الباك دون تعديل الصفحات عبر:

```text
VITE_API_ORIGIN=https://medacal.vercel.app
```

تم ربط لوحة التحكم، الشات، المخزون، العملاء، ونقطة البيع بالخدمة الموحدة. جميع استجابات HTML أو الأخطاء تظهر للمستخدم برسالة واضحة بدل عرض بيانات وهمية بصمت.
