import {useEffect,useState} from 'react';
import {Download,Eye,FileText,Printer,Receipt,Search,Share2} from 'lucide-react';
import {useNavigate, useParams} from 'react-router-dom';
import api from '../lib/ApiService';
import html2pdf from 'html2pdf.js';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import { Capacitor } from '@capacitor/core';

const localInvoices=()=>{try{return JSON.parse(localStorage.getItem('formatech.invoices')||'[]')}catch{return[]}};
export default function Invoices(){const {number}=useParams();const navigate=useNavigate();const [invoices,setInvoices]=useState(localInvoices);const [query,setQuery]=useState('');const selected=number?invoices.find(x=>x.invoice_number===decodeURIComponent(number)):null;useEffect(()=>{api.listSales().then(d=>{if(d.sales?.length)setInvoices(x=>merge(d.sales,x))}).catch(()=>{} )},[]);if(selected)return <InvoiceView invoice={selected} onBack={()=>navigate('/invoices')}/>;const filtered=invoices.filter(x=>`${x.invoice_number} ${x.payment_type}`.toLowerCase().includes(query.toLowerCase()));return <main className="module-page invoices-page"><div className="page-title"><div><div className="eyebrow"><Receipt size={15}/> إدارة الفواتير</div><h1>الفواتير والمبيعات</h1><p>عرض واضح لكل فاتورة مع خيار الطباعة والحفظ PDF.</p></div><button className="primary" onClick={()=>navigate('/pos')}><Receipt size={17}/> فاتورة جديدة</button></div><section className="panel"><div className="table-toolbar"><div><h2>سجل الفواتير</h2><p>{filtered.length} فاتورة</p></div><div className="search-box"><Search size={16}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="ابحث برقم الفاتورة"/></div></div>{filtered.length?<div className="data-table"><div className="table-row invoice-row table-head"><span>رقم الفاتورة</span><span>التاريخ</span><span>الدفع</span><span>الإجمالي</span><span>الحالة</span><span/></div>{filtered.map(x=><div className="table-row invoice-row" key={x.invoice_number}><span><b>{x.invoice_number}</b><small>{x.items?.length||0} أصناف</small></span><span>{formatDate(x.created_at)}</span><span>{paymentLabel(x.payment_type)}</span><span><strong>{money(x.total_amount)} ر.س</strong></span><span><em className="invoice-status">مكتملة</em></span><button className="icon-button" title="عرض الفاتورة" onClick={()=>navigate(`/invoices/${encodeURIComponent(x.invoice_number)}`)}><Eye size={16}/></button></div>)}</div>:<div className="empty-state invoice-empty"><FileText size={34}/><b>لا توجد فواتير بعد</b><span>أنشئ فاتورة من نقطة البيع وستظهر هنا.</span></div>}</section></main>}
export function InvoiceView({invoice,onBack}){
  
  const handleShareOrDownload = async () => {
    // تجهيز عنصر الـ HTML الخاص بالفاتورة لتحويله إلى PDF بدقة عالية
    const paperElement = document.getElementById('invoice-paper-content');
    if (!paperElement) return;

    const fileName = `فاتورة_${invoice.invoice_number}.pdf`;
    const opt = {
      margin: 10,
      filename: fileName,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    // 1. في حالة المتصفح العادي (Web)
    if (!Capacitor.isNativePlatform()) {
      try {
        html2pdf().set(opt).from(paperElement).save();
      } catch (err) {
        console.error('خطأ تحضير PDF للويب:', err);
      }
      return;
    }

    // 2. في حالة التطبيقات الذكية (Android / iOS عبر Capacitor)
    try {
      const pdfBase64 = await html2pdf()
        .set(opt)
        .from(paperElement)
        .outputPdf('datauristring');

      const base64Data = pdfBase64.split(',')[1];

      const savedFile = await Filesystem.writeFile({
        path: fileName,
        data: base64Data,
        directory: Directory.Cache
      });

      await Share.share({
        title: fileName,
        text: `إليك فاتورة المبيعات رقم ${invoice.invoice_number}`,
        url: savedFile.uri,
        dialogTitle: 'مشاركة أو حفظ ملف الفاتورة'
      });
    } catch (error) {
      console.error('حدث خطأ أثناء حفظ أو مشاركة الفاتورة:', error);
      alert('تعذر فتح بوابة المشاركة: ' + (error.message || error));
    }
  };

  return <main className="module-page invoice-view"><div className="invoice-actions no-print"><button className="soft-button" onClick={onBack}>← العودة للفواتير</button><button className="primary" onClick={handleShareOrDownload}><Share2 size={16}/> مشاركة / تحميل الفاتورة</button></div><section className="invoice-paper" id="invoice-paper-content"><header className="invoice-brand"><div><div className="brand-mark">ف</div><h1>فرما تيك</h1><p>نظام إدارة الصيدلية</p></div><div className="invoice-heading"><span>فاتورة بيع</span><strong>{invoice.invoice_number}</strong><small>{formatDate(invoice.created_at,true)}</small></div></header><div className="invoice-meta"><div><span>طريقة الدفع</span><b>{paymentLabel(invoice.payment_type)}</b></div><div><span>عدد الأصناف</span><b>{invoice.items?.length||0}</b></div><div><span>حالة الفاتورة</span><b className="invoice-status">مكتملة</b></div></div><table className="invoice-lines"><thead><tr><th>الصنف</th><th>الكمية</th><th>سعر الوحدة</th><th>الإجمالي</th></tr></thead><tbody>{(invoice.items||[]).map((x,i)=><tr key={x.medicine_id||i}><td>{x.name||x.trade_name||'دواء صيدلي'}</td><td>{x.quantity}</td><td>{money(x.unit_price)} ر.س</td><td>{money(Number(x.unit_price)*Number(x.quantity))} ر.س</td></tr>)}</tbody></table><div className="invoice-total"><span>الإجمالي النهائي</span><strong>{money(invoice.total_amount)} ر.س</strong></div><footer>شكراً لتعاملكم مع فرما تيك — يرجى الاحتفاظ بالفاتورة</footer></section></main>
}
function merge(a,b){const map=new Map([...a,...b].map(x=>[x.invoice_number,x]));return [...map.values()].sort((x,y)=>new Date(y.created_at||0)-new Date(x.created_at||0))}function money(v){return Number(v||0).toFixed(2)}function formatDate(v,full=false){return v?new Date(v).toLocaleString('ar-SA',{dateStyle:'medium',...(full?{timeStyle:'short'}:{})}):'الآن'}function paymentLabel(v){return ({cash:'نقدي',card:'بطاقة',credit:'آجل'})[v]||v||'نقدي'}
