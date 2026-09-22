import { json, method } from './_lib.js';
// استدعاء واجهة برمجة التطبيقات الخاصة ببيانات الأدوية والمخزون
import medicinesApi from './medicines.js';

export default async function handler(req, res) {
  if (!method(req, res, ['POST'])) return;
  
  try {
    const { message = '', history = [] } = req.body || {};
    
    if (!message.trim()) {
      return json(res, { error: 'اكتب سؤالك أولاً' }, 400);
    }

    // البحث مباشرة داخل جدول بيانات العلاج والأدوية باستخدام المدخلات
    let medicines = [];
    if (typeof medicinesApi === 'function') {
      // محاكاة أو استدعاء البحث من ملف medicines.js إذا كان يدعم تصفية أو جلب البيانات
      medicines = await medicinesApi(req, res) || [];
    } else {
      // البحث المباشر أو تصفية النتائج بناءً على استعلام البحث للعميل
      const allMedicines = await searchInventoryDatabase(message);
      medicines = allMedicines;
    }

    // تجهيز سياق النتائج المستخرجة من جدول الأدوية لعرضها أو إرسالها للذكاء الاصطناعي
    const context = medicines.map(m => 
      `- ${m.trade_name} | المادة: ${m.active_ingredient || 'غير مسجلة'} | المتوفر: ${m.stock_quantity} | السعر: ${m.selling_price} | الصلاحية: ${m.expiry_date || 'غير محددة'}`
    ).join('\n') || 'لا توجد نتائج مطابقة في مخزون الصيدلية.';

    const base = process.env.OPENAI_API_KEY 
      ? process.env.OPENAI_API_BASE || 'https://api.openai.com/v1' 
      : process.env.BUILT_IN_FORGE_API_URL;
      
    const key = process.env.OPENAI_API_KEY || process.env.BUILT_IN_FORGE_API_KEY;

    // في حال عدم توفر مفتاح الذكاء الاصطناعي، يتم الرد مباشرة بنتائج جدول الأدوية
    if (!base || !key) {
      return json(res, {
        reply: `بحثت في جدول الأدوية عن «${message}».\n\n${context}\n\nللاستخدام الآمن: اسأل الصيدلي عن الجرعة والملاءمة، ولا تستخدم دواءً دون تشخيص مناسب.`,
        results: medicines,
        mode: 'inventory-fallback'
      });
    }

    // إرسال السؤال مع نتائج جدول الأدوية كـ Context للذكاء الاصطناعي لصياغة إجابة احترافية
    const r = await fetch(`${base.replace(/\/$/, '')}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${key}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-5-mini',
        messages: [
          {
            role: 'system',
            content: 'أنت مساعد بحث داخل مخزون صيدلية. أجب بالعربية باختصار. اعتمد على النتائج المستخرجة من جدول الأدوية فقط ولا تشخص أو تصف جرعات. اذكر بوضوح إن لم تجد الدواء، وشجع على استشارة الصيدلي.'
          },
          {
            role: 'user',
            content: `نتائج جدول الأدوية:\n${context}\n\nسؤال العميل: ${message}`
          }
        ],
        max_completion_tokens: 500
      })
    });

    const data = await r.json();
    if (!r.ok) throw new Error(data.error?.message || 'LLM error');

    return json(res, {
      reply: data.choices?.[0]?.message?.content || context,
      results: medicines,
      mode: 'ai'
    });

  } catch (e) {
    return json(res, { error: e.message }, 500);
  }
}
