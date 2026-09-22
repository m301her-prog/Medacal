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
  return <div className="app-shell">
    <InstallPrompt/>
    <aside className={open?'sidebar open':'sidebar'}>
      <div className="brand"><div className="brand-mark">ف</div><div><b>فرما تيك</b><small>PHARMACY OS</small></div></div>
      <div className="workspace"><span className="workspace-dot"/> صيدلية الندى <ChevronLeft size={14}/></div>
      <nav>{['الرئيسية','إدارة الصيدلية','تحليلات النظام'].map(group=><div key={group}><p>{group}</p><div style={{display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '8px'}}>{links.filter(x=>x.group===group).map(x=><NavItem {...x} key={x.to}/>)}</div></div>)}</nav>
      <div className="sidebar-bottom"><NavItem to="/install" icon={Download} label="تثبيت التطبيق" badge="جديد"/><NavItem to="/notifications" icon={Bell} label="التنبيهات" badge="4"/><NavItem to="/settings" icon={Settings} label="الإعدادات"/><div className="connection"><Wifi size={16}/><div><b>الأنظمة متصلة</b><small>Neon · Vercel · Zapier</small></div></div></div>
    </aside>
    <div className="main-area"><header className="topbar"><button className="menu-button" onClick={()=>setOpen(!open)}><Menu size={21}/></button><div className="breadcrumb"><PackageSearch size={17}/> <span>فرما تيك</span><ChevronLeft size={14}/><b>{current?.label|| (location.pathname==='/install'?'تثبيت التطبيق':'الإعدادات')}</b></div><div className="top-actions"><div className="live"><i/> مباشر</div><div className="avatar">س</div></div></header><Routes><Route path="/" element={<Dashboard/>}/><Route path="/chat" element={<CustomerChat/>}/><Route path="/inventory" element={<Inventory/>}/><Route path="/pos" element={<POS/>}/><Route path="/customers" element={<Customers/>}/><Route path="/suppliers" element={<Suppliers/>}/><Route path="/reports" element={<Reports/>}/><Route path="/notifications" element={<Notifications/>}/><Route path="/settings" element={<SettingsPage/>}/><Route path="/install" element={<Install/>}/><Route path="*" element={<Dashboard/>}/></Routes></div>
  </div>
}
function NavItem({to,icon:Icon,label,badge}){return <NavLink to={to} className={({isActive})=>isActive?'nav-item active':'nav-item'}><Icon size={18}/><span>{label}</span>{badge&&<em>{badge}</em>}</NavLink>}
