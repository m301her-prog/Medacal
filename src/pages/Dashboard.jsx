import {useEffect,useState} from 'react';import {Activity,AlertTriangle,ArrowUpLeft,BarChart3,Bell,Box,CalendarClock,ChevronLeft,MessageCircle,Package,ShoppingCart,Truck,Users} from 'lucide-react';import {Link} from 'react-router-dom';import api from '../lib/ApiService';
const pages=[{to:'/inventory',icon:Box,title:'المخزون والأدوية',desc:'الأصناف والكميات والصلاحية',tone:'mint',count:'بيانات مباشرة'},{to:'/pos',icon:ShoppingCart,title:'نقطة البيع',desc:'فواتير وسلة بيع سريعة',tone:'blue',count:'متصل بالمبيعات'},{to:'/customers',icon:Users,title:'العملاء والديون',desc:'الحسابات وكشوف الديون',tone:'purple',count:'متصل بالعملاء'},{to:'/suppliers',icon:Truck,title:'الموردون والطلبيات',desc:'الموردون وأوامر الشراء',tone:'orange',count:'12 مورد'},{to:'/reports',icon:BarChart3,title:'التقارير والتحليلات',desc:'المبيعات والأرباح والأكثر مبيعاً',tone:'indigo',count:'6 تقارير'},{to:'/chat',icon:MessageCircle,title:'مساعد العملاء',desc:'بحث ذكي داخل المخزون',tone:'teal',count:'متصل الآن'},{to:'/notifications',icon:Bell,title:'التنبيهات',desc:'مخزون وصلاحية وتكاملات',tone:'rose',count:'4 جديدة'},{to:'/settings',icon:Activity,title:'الإعدادات والتكاملات',desc:'Neon وVercel وWhatsApp',tone:'slate',count:'5 متصلة'}];
export default function Dashboard(){const [data,setData]=useState(null);const [error,setError]=useState('');useEffect(()=>{api.dashboard().then(setData).catch(e=>setError(e.message))},[]);const s=data?.stats||{salesToday:0,ordersToday:0,lowStock:0,expiringSoon:0};return <main className="dashboard"><div className="page-title"><div><div className="eyebrow"><Activity size={15}/> مركز القيادة</div><h1>صباح الخير، د. سارة</h1><p>الإحصائيات من خادم لوحة التحكم مباشرة.</p></div><Link className="primary" to="/pos"><ShoppingCart size={17}/> فتح نقطة البيع</Link></div>{error&&<div className="api-error">{error}</div>}<div className="stats-grid"><Stat icon={Activity} label="مبيعات اليوم" value={`${Number(s.salesToday).toLocaleString()} ر.س`} trend="من الخادم"/><Stat icon={ShoppingCart} label="طلبات اليوم" value={s.ordersToday} trend="من الخادم"/><Stat icon={AlertTriangle} label="مخزون منخفض" value={s.lowStock} trend="يحتاج متابعة" warn/><Stat icon={CalendarClock} label="صلاحية قريبة" value={s.expiringSoon} trend="خلال 90 يوم" warn/></div><section className="page-launcher"><div className="section-heading"><div><div className="eyebrow"><Box size={15}/> مساحة العمل</div><h2>كل صفحات النظام</h2><p>واجهة شبكة مرتبة — كل بطاقة تفتح صفحة مستقلة.</p></div><span className="grid-hint">8 وحدات متاحة</span></div><div className="page-grid">{pages.map(({to,icon:Icon,title,desc,tone,count})=><Link to={to} className="page-card" key={to}><div className={`page-card-icon ${tone}`}><Icon size={23}/></div><div className="page-card-copy"><h3>{title}</h3><p>{desc}</p><span>{count}</span></div><ChevronLeft className="page-card-arrow" size={18}/></Link>)}</div></section><div className="dashboard-grid"><section className="panel chart-panel"><div className="panel-head"><div><h2>حركة المبيعات</h2><p>آخر 7 أيام</p></div><button className="soft-button">هذا الأسبوع <ArrowUpLeft size={14}/></button></div><div className="chart"><div className="chart-grid"/><svg viewBox="0 0 700 220" preserveAspectRatio="none"><path d="M0 180 C70 165 90 120 150 135 S245 175 305 105 S390 125 440 85 S520 110 570 55 S650 85 700 25 L700 220 L0 220Z" fill="url(#area)"/><path d="M0 180 C70 165 90 120 150 135 S245 175 305 105 S390 125 440 85 S520 110 570 55 S650 85 700 25" fill="none" stroke="#35d6b1" strokeWidth="4" strokeLinecap="round"/></svg><div className="chart-labels"><span>السبت</span><span>الأحد</span><span>الإثنين</span><span>الثلاثاء</span><span>الأربعاء</span><span>الخميس</span><span>الجمعة</span></div></div></section><section className="panel quick-panel"><div className="panel-head"><div><h2>يحتاج انتباهك</h2><p>تنبيهات المخزون والصلاحية</p></div></div><div className="quick-actions">{(data?.lowStock||[]).map(x=><div className="quick" key={x.trade_name}><div className="quick-icon"><Package size={18}/></div><div><b>{x.trade_name}</b><small>المخزون الحالي {x.stock_quantity} — الحد الأدنى {x.min_stock_alert}</small></div><Link to="/inventory"><ArrowUpLeft size={16}/></Link></div>)}</div></section></div></main>}
function Stat({icon:Icon,label,value,trend,warn}){return <div className="stat-card"><div className={`stat-icon ${warn?'warn':''}`}><Icon size={19}/></div><span>{label}</span><strong>{value}</strong><small className={warn?'warn-text':''}>{trend}</small></div>}

{/* أضف هذه التنسيقات في ملف الـ CSS الخاص بك (مثل index.css أو App.css) */}
/*
.page-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 20px;
  margin-top: 20px;
}

.page-card {
  display: flex;
  align-items: center;
  gap: 16px;
  background: #ffffff;
  padding: 20px;
  border-radius: 16px;
  border: 1px solid #eaeaea;
  text-decoration: none;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
  position: relative;
  overflow: hidden;
}

.page-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.08);
  border-color: #35d6b1;
}

.page-card-icon {
  width: 50px;
  height: 50px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

/* تلوين الأيقونات حسب الـ tone المبرمج مسبقاً */
.page-card-icon.mint { background: #e6f9f5; color: #00b087; }
.page-card-icon.blue { background: #eef4ff; color: #2563eb; }
.page-card-icon.purple { background: #f3e8ff; color: #9333ea; }
.page-card-icon.orange { background: #fff7ed; color: #ea580c; }
.page-card-icon.indigo { background: #eef2ff; color: #4f46e5; }
.page-card-icon.teal { background: #f0fdf4; color: #0d9488; }
.page-card-icon.rose { background: #fff1f2; color: #e11d48; }
.page-card-icon.slate { background: #f1f5f9; color: #475569; }

.page-card-copy {
  flex-grow: 1;
}

.page-card-copy h3 {
  font-size: 16px;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 4px 0;
}

.page-card-copy p {
  font-size: 13px;
  color: #64748b;
  margin: 0 0 8px 0;
}

.page-card-copy span {
  font-size: 11px;
  font-weight: 600;
  padding: 3px 8px;
  background: #f8fafc;
  color: #475569;
  border-radius: 6px;
}

.page-card-arrow {
  color: #cbd5e1;
  transition: transform 0.2s ease, color 0.2s ease;
}

.page-card:hover .page-card-arrow {
  transform: translateX(-4px);
  color: #35d6b1;
}
*/
