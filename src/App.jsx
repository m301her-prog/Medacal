import {useState} from 'react';
import {NavLink,Routes,Route,useLocation} from 'react-router-dom';
import {Activity,BarChart3,Bell,Box,ChevronLeft,LayoutDashboard,Menu,MessageCircle,PackageSearch,Settings,ShoppingCart,Truck,Users,Wifi,Download} from 'lucide-react';
import Dashboard from './pages/Dashboard';
import CustomerChat from './pages/CustomerChat';
import Inventory from './pages/Inventory';
import POS from './pages/POS';
import Customers from './pages/Customers';
import Suppliers from './pages/Suppliers';
import Reports from './pages/Reports';
import Notifications from './pages/Notifications';
import SettingsPage from './pages/Settings';
import Install from './pages/Install';
import InstallPrompt from './components/InstallPrompt';

const links=[
  {to:'/',icon:LayoutDashboard,label:'نظرة عامة',group:'الرئيسية'},
  {to:'/chat',icon:MessageCircle,label:'مساعد العملاء',badge:'جديد',group:'الرئيسية'},
  {to:'/inventory',icon:Box,label:'المخزون والأدوية',group:'إدارة الصيدلية'},
  {to:'/pos',icon:ShoppingCart,label:'نقطة البيع',group:'إدارة الصيدلية'},
  {to:'/customers',icon:Users,label:'العملاء والديون',group:'إدارة الصيدلية'},
  {to:'/suppliers',icon:Truck,label:'الموردون والطلبيات',group:'إدارة الصيدلية'},
  {to:'/reports',icon:BarChart3,label:'التقارير والتحليلات',group:'تحليلات النظام'}
];

export default function App(){
  const [open,setOpen]=useState(false);
  const location=useLocation();
  const current=links.find(x=>x.to===location.pathname);
  
  return (
    <div className="app-shell">
      <InstallPrompt/>
      <aside className={open?'sidebar open':'sidebar'} style={{overflowY: 'auto'}}>
        <div className="brand">
          <div className="brand-mark">ف</div>
          <div><b>فرما تيك</b><small>PHARMACY OS</small></div>
        </div>
        
        <div className="workspace">
          <span className="workspace-dot"/> صيدلية الندى <ChevronLeft size={14}/>
        </div>
        
        <nav style={{padding: '10px 15px'}}>
          {['الرئيسية','إدارة الصيدلية','تحليلات النظام'].map(group=>(
            <div key={group} style={{marginBottom: '16px'}}>
              <p style={{fontSize: '11px', color: '#94a3b8', marginBottom: '8px', fontWeight: 'bold', textTransform: 'uppercase'}}>{group}</p>
              
              {/* عرض عناصر المجموعة على شكل شبكة مرتبة عمودين */}
              <div style={{display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '8px'}}>
                {links.filter(x=>x.group===group).map(x=><NavItem {...x} key={x.to}/>)}
              </div>
            </div>
          ))}
        </nav>

        <div className="sidebar-bottom" style={{padding: '15px', display: 'flex', flexDirection: 'column', gap: '8px'}}>
          <div style={{display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '8px'}}>
            <NavItem to="/install" icon={Download} label="تثبيت التطبيق" badge="جديد"/>
            <NavItem to="/notifications" icon={Bell} label="التنبيهات" badge="4"/>
          </div>
          <NavItem to="/settings" icon={Settings} label="الإعدادات"/>
          
          <div className="connection" style={{display: 'flex', alignItems: 'center', gap: '8px', marginTop: '5px'}}>
            <Wifi size={16}/>
            <div><b>الأنظمة متصلة</b><small>Neon · Vercel · Zapier</small></div>
          </div>
        </div>
      </aside>

      <div className="main-area">
        <header className="topbar">
          <button className="menu-button" onClick={()=>setOpen(!open)}><Menu size={21}/></button>
          <div className="breadcrumb">
            <PackageSearch size={17}/> 
            <span>فرما تيك</span>
            <ChevronLeft size={14}/>
            <b>{current?.label|| (location.pathname==='/install'?'تثبيت التطبيق':'الإعدادات')}</b>
          </div>
          <div className="top-actions">
            <div className="live"><i/> مباشر</div>
            <div className="avatar">س</div>
          </div>
        </header>

        <Routes>
          <Route path="/" element={<Dashboard/>}/>
          <Route path="/chat" element={<CustomerChat/>}/>
          <Route path="/inventory" element={<Inventory/>}/>
          <Route path="/pos" element={<POS/>}/>
          <Route path="/customers" element={<Customers/>}/>
          <Route path="/suppliers" element={<Suppliers/>}/>
          <Route path="/reports" element={<Reports/>}/>
          <Route path="/notifications" element={<Notifications/>}/>
          <Route path="/settings" element={<SettingsPage/>}/>
          <Route path="/install" element={<Install/>}/>
          <Route path="*" element={<Dashboard/>}/>
        </Routes>
      </div>
    </div>
  );
}

function NavItem({to,icon:Icon,label,badge}){
  return (
    <NavLink 
      to={to} 
      className={({isActive})=>isActive?'nav-item active':'nav-item'}
      style={({isActive}) => ({
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '10px 6px',
        borderRadius: '10px',
        background: isActive ? 'rgba(53, 214, 177, 0.15)' : 'rgba(255, 255, 255, 0.04)',
        border: isActive ? '1px solid #35d6b1' : '1px solid rgba(255, 255, 255, 0.06)',
        textDecoration: 'none',
        position: 'relative',
        minHeight: '65px',
        gap: '4px'
      })}
    >
      <Icon size={20}/>
      <span style={{fontSize: '11px', lineHeight: '1.2'}}>{label}</span>
      {badge && (
        <em style={{
          position: 'absolute',
          top: '4px',
          left: '4px',
          fontSize: '8px',
          padding: '1px 4px',
          background: '#e11d48',
          color: '#fff',
          borderRadius: '4px',
          fontStyle: 'normal'
        }}>
          {badge}
        </em>
      )}
    </NavLink>
  );
}
