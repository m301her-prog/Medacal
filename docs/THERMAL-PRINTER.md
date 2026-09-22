# Bluetooth Thermal Printer Plugin

تمت إضافة Native Plugin باسم `ThermalPrinter` داخل Android. يستخدم Bluetooth Classic SPP عبر UUID القياسي `00001101-0000-1000-8000-00805F9B34FB`، وهو البروتوكول الشائع في طابعات ESC/POS المحمولة.

## الملفات

- `android/app/src/main/java/com/medacal/pharmacy/thermal/ThermalPrinterPlugin.java`: الاتصال، الأذونات، اكتشاف الطابعات المقترنة، ESC/POS، وتحويل العربية إلى Bitmap.
- `android/app/src/main/java/com/medacal/pharmacy/MainActivity.java`: تسجيل الإضافة.
- `src/lib/ThermalPrinter.js`: واجهة JavaScript للتطبيق.
- `android/app/src/main/AndroidManifest.xml`: أذونات Bluetooth.

## مثال الاستخدام

```js
import {
  requestPrinterPermissions,
  listPairedPrinters,
  connectPrinter,
  printReceipt,
} from './lib/ThermalPrinter';

await requestPrinterPermissions();
const printers = await listPairedPrinters();
await connectPrinter(printers[0].address);
await printReceipt({
  invoiceNumber: 'INV-000124',
  date: new Date().toLocaleString('ar-SA'),
  payment: 'نقدي',
  total: '52.00',
  paperSize: '58mm', // أو 80mm
  items: [
    { name: 'باراسيتامول', quantity: 2, total: '24.00' },
    { name: 'فيتامين د', quantity: 1, total: '28.00' },
  ],
});
```

## معالجة العربية

لا تعتمد الإضافة على Code Page خاص بالطابعة. يتم رسم النص العربي والمختلط على Bitmap أبيض وأسود ثم إرساله بأمر ESC/POS `GS v 0`. يضمن ذلك ظهور العربية بشكل صحيح في أغلب الطابعات حتى عندما لا تدعم الطابعة العربية كنص مباشر.

العرض المستخدم هو **384 نقطة تقريبًا لـ 58mm** و**576 نقطة تقريبًا لـ 80mm**. يجب أن تكون الطابعة متصلة ومقترنة من إعدادات Android قبل استدعاء `listPairedPrinters`.

## حدود الدعم

هذا التنفيذ مخصص لطابعات Android التي تدعم Bluetooth Classic/SPP. طابعات BLE فقط تحتاج طبقة GATT منفصلة، ولا ينبغي اعتبارها متوافقة مع SPP تلقائيًا. نسخة الويب لا تستطيع استخدام هذا Native Plugin؛ لذلك يجب إبقاء طباعة PDF/المتصفح كخيار احتياطي.
