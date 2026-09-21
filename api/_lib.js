import { neon } from '@neondatabase/serverless';

// تهيئة الاتصال بقاعدة البيانات عبر متغير البيئة DATABASE_URL
export const DATABASE_URL = process.env.DATABASE_URL;
export const sql = DATABASE_URL ? neon(DATABASE_URL) : null;

// دالة إرجاع الاستجابات بصيغة JSON
export function json(res, data, status = 200) { 
    res.status(status).setHeader('Content-Type', 'application/json'); 
    res.end(JSON.stringify(data)); 
}

// دالة التحقق من نوع الطلب (HTTP Method)
export function method(req, res, allowed) { 
    if (!allowed.includes(req.method)) { 
        res.setHeader('Allow', allowed.join(', ')); 
        json(res, { error: 'Method not allowed' }, 405); 
        return false; 
    } 
    return true; 
}

// بيانات تجريبية افتراضية في حال عدم توفر اتصال قاعدة البيانات
export function demoMedicines() { 
    return [
        { id: 'demo-1', trade_name: 'Panadol Extra', scientific_name: 'Paracetamol + Caffeine', active_ingredient: 'باراسيتامول', selling_price: 12.5, stock_quantity: 42, min_stock_alert: 10, expiry_date: '2027-04-20', manufacturer: 'GSK', barcode: '628100000001' },
        { id: 'demo-2', trade_name: 'Augmentin 625', scientific_name: 'Amoxicillin/Clavulanate', active_ingredient: 'أموكسيسيلين', selling_price: 35, stock_quantity: 7, min_stock_alert: 10, expiry_date: '2026-11-15', manufacturer: 'GSK', barcode: '628100000002' },
        { id: 'demo-3', trade_name: 'Vitamin D3', scientific_name: 'Cholecalciferol', active_ingredient: 'فيتامين د', selling_price: 28, stock_quantity: 18, min_stock_alert: 8, expiry_date: '2028-01-08', manufacturer: 'Medacal Labs', barcode: '628100000003' }
    ]; 
}

// دالة البحث في المخزون (تعتمد على قاعدة البيانات أو الداتا التجريبية تلقائياً)
export async function searchInventory(query = '') { 
    if (!sql) {
        return demoMedicines().filter(m => JSON.stringify(m).toLowerCase().includes(query.toLowerCase())); 
    }
    return sql`
        SELECT id, trade_name, scientific_name, active_ingredient, selling_price, stock_quantity, min_stock_alert, expiry_date, manufacturer, barcode 
        FROM medicines 
        WHERE trade_name ILIKE ${'%' + query + '%'} 
           OR scientific_name ILIKE ${'%' + query + '%'} 
           OR active_ingredient ILIKE ${'%' + query + '%'} 
           OR barcode = ${query} 
        ORDER BY trade_name 
        LIMIT 20
    `; 
}

// دالة التكامل مع Zapier
export async function sendZapier(event, payload) { 
    if (!process.env.ZAPIER_WEBHOOK_URL) return { configured: false }; 
    const r = await fetch(process.env.ZAPIER_WEBHOOK_URL, { 
        method: 'POST', 
        headers: { 'content-type': 'application/json' }, 
        body: JSON.stringify({ event, ...payload }) 
    }); 
    return { configured: true, ok: r.ok }; 
}

// دالة توليد روابط الواتساب
export function whatsappLink(phone, text) { 
    return `https://wa.me/${String(phone || '').replace(/[^0-9]/g, '')}?text=${encodeURIComponent(text)}`; 
}
