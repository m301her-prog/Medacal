import {useEffect,useState} from 'react';import {Activity,AlertTriangle,ArrowUpLeft,BarChart3,Bell,Box,CalendarClock,ChevronLeft,MessageCircle,Package,ShoppingCart,Truck,Users} from 'lucide-react';import {Link} from 'react-router-dom';import api from '../lib/ApiService';

const pages=[
  {to:'/inventory',icon:Box,title:'المخزون والأدوية',desc:'الأصناف والكميات والصلاحية',tone:{bg:'#e6f9f5',color:'#00b087'},count:'بيانات مباشرة'},
  {to:'/pos',icon:ShoppingCart,title:'نقطة البيع',desc:'فواتير وسلة بيع سريعة',tone:{bg:'#eef4ff',color:'#2563eb'},count:'متصل بالمبيعات'},
  {to:'/customers',icon:Users,title:'العملاء والديون',desc:'الحسابات وكشوف الديون',tone:{bg:'#f3e8ff',color:'#9333ea'},count:'متصل بالعملاء'},
  {to:'/suppliers',icon:Truck,title:'الموردون والطلبيات',desc:'الموردون وأوامر الشراء',tone:{bg:'#fff7ed',color:'#ea580c'},count:'12 مورد'},
  {to:'/reports',icon:BarChart3,title:'التقارير والتحليلات',desc:'المبيعات والأرباح والأكثر مبيعاً',tone:{bg:'#eef2ff',color:'#4f46e5'},count:'6 تقارير'},
  {to:'/chat',icon:MessageCircle,title:'مساعد العملاء',desc:'بحث ذكي داخل المخزون',tone:{bg:'#f0fdf4',color:'#0d9488'},count:'متصل الآن'},
  {to:'/notifications',icon:Bell,title:'التنبيهات',desc:'مخزون وصلاحية وتكاملات',tone:{bg:'#fff1f2',color:'#e11d48'},count:'4 جديدة'},
  {to:'/settings',icon:Activity,title:'الإعدادات والتكاملات',desc:'Neon وVercel وWhatsApp',tone:{bg:'#f1f5f9',color:'#475569'},count:'5 متصلة'}
];

export default function Dashboard(){
  const [data,setData]=useState(null);
  const [error,setError]=useState('');
  
  useEffect(()=>{
    api.dashboard().then(setData).catch(e=>setError(e.message))
  },[]);

  const s=data?.stats||{salesToday:0,ordersToday:0,lowStock:0,expiringSoon:0};

  return (
    <main className="dashboard">
      <div className="page-title">
        <div>
          <div className="eyebrow"><Activity size={15}/> مركز القيادة</div>
          <h1>صباح الخير، د. سارة</h1>
          <p>الإحصائيات من خادم لوحة التحكم مباشرة.</p>
        </div>
        <Link className="primary" to="/pos"><ShoppingCart size={17}/> فتح نقطة البيع</Link>
      </div>

      {error&&<div className="api-error">{error}</div>}

      <div className="stats-grid">
        <Stat icon={Activity} label="مبيعات اليوم" value={`${Number(s.salesToday).toLocaleString()} ر.س`} trend="من الخادم"/>
        <Stat icon={ShoppingCart} label="طلبات اليوم" value={s.ordersToday} trend="من الخادم"/>
        <Stat icon={AlertTriangle} label="مخزون منخفض" value={s.lowStock} trend="يحتاج متابعة" warn/>
        <Stat icon={CalendarClock} label="صلاحية قريبة" value={s.expiringSoon} trend="خلال 90 يوم" warn/>
      </div>

      <section className="page-launcher">
        <div className="section-heading">
          <div>
            <div className="eyebrow"><Box size={15}/> مساحة العمل</div>
            <h2>كل صفحات النظام</h2>
            <p>واجهة شبكة مرتبة — كل بطاقة تفتح صفحة مستقلة.</p>
          </div>
          <span className="grid-hint">8 وحدات متاحة</span>
        </div>

        {/* عرض الشبكة بتصميم عمودي مطابق لصورة العرض */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
          gap: '20px',
          marginTop: '20px'
        }}>
          {pages.map(({to, icon: Icon, title, desc, tone, count}) => (
            <Link 
              to={to} 
              key={to}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                background: '#ffffff',
                padding: '24px 16px',
                borderRadius: '20px',
                border: '1px solid #eaeaea',
                textDecoration: 'none',
                boxShadow: '0 6px 16px rgba(0, 0, 0, 0.04)',
                position: 'relative',
                overflow: 'hidden',
                transition: 'all 0.3s ease',
                minHeight: '180px',
                justifyContent: 'space-between'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-6px)';
                e.currentTarget.style.boxShadow = '0 12px 30px rgba(0, 0, 0, 0.08)';
                e.currentTarget.style.borderColor = tone.color;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 6px 16px rgba(0, 0, 0, 0.04)';
                e.currentTarget.style.borderColor = '#eaeaea';
              }}
            >
              <div style={{
                width: '60px',
                height: '60px',
                borderRadius: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: tone.bg,
                color: tone.color,
                marginBottom: '14px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
              }}>
                <Icon size={28}/>
              </div>
              
              <div style={{width: '100%'}}>
                <h3 style={{fontSize: '17px', fontWeight: '700', color: '#1e293b', margin: '0 0 6px 0'}}>{title}</h3>
                <p style={{fontSize: '12px', color: '#64748b', margin: '0 0 12px 0', lineHeight: '1.4'}}>{desc}</p>
              </div>

              <span style={{
                fontSize: '11px', 
                fontWeight: '600', 
                padding: '4px 10px', 
                background: '#f8fafc', 
                color: '#475569', 
                borderRadius: '8px',
                border: '1px solid #f1f5f9'
              }}>
                {count}
              </span>
            </Link>
          ))}
        </div>
      </section>

      <div className="dashboard-grid">
        <section className="panel chart-panel">
          <div className="panel-head">
            <div><h2>حركة المبيعات</h2><p>آخر 7 أيام</p></div>
            <button className="soft-button">هذا الأسبوع <ArrowUpLeft size={14}/></button>
          </div>
          <div className="chart">
            <div className="chart-grid"/>
            <svg viewBox="0 0 700 220" preserveAspectRatio="none">
              <path d="M0 180 C70 165 90 120 150 135 S245 175 305 105 S390 125 440 85 S520 110 570 55 S650 85 700 25 L700 220 L0 220Z" fill="url(#area)"/>
              <path d="M0 180 C70 165 90 120 150 135 S245 175 305 105 S390 125 440 85 S520 110 570 55 S650 85 700 25" fill="none" stroke="#35d6b1" strokeWidth="4" strokeLinecap="round"/>
            </svg>
            <div className="chart-labels"><span>السبت</span><span>الأحد</span><span>الإثنين</span><span>الثلاثاء</span><span>الأربعاء</span><span>الخميس</span><span>الجمعة</span></div>
          </div>
        </section>
        <section className="panel quick-panel">
          <div className="panel-head"><div><h2>يحتاج انتباهك</h2><p>تنبيهات المخزون والصلاحية</p></div></div>
          <div className="quick-actions">
            {(data?.lowStock||[]).map(x=>(
              <div className="quick" key={x.trade_name}>
                <div className="quick-icon"><Package size={18}/></div>
                <div><b>{x.trade_name}</b><small>المخزون الحالي {x.stock_quantity} — الحد الأدنى {x.min_stock_alert}</small></div>
                <Link to="/inventory"><ArrowUpLeft size={16}/></Link>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}

function Stat({icon:Icon,label,value,trend,warn}){
  return (
    <div className="stat-card">
      <div className={`stat-icon ${warn?'warn':''}`}><Icon size={19}/></div>
      <span>{label}</span>
      <strong>{value}</strong>
      <small className={warn?'warn-text':''}>{trend}</small>
    </div>
  );
}
