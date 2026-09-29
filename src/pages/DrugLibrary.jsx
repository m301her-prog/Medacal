import {useEffect,useMemo,useState} from 'react';
import {Barcode,BookOpen,PackagePlus,Search} from 'lucide-react';
import {loadDrugLibrary,searchDrugLibrary} from '../lib/DrugLibrary';
import {useNavigate} from 'react-router-dom';

export default function DrugLibrary(){
 const navigate=useNavigate();const [library,setLibrary]=useState([]),[q,setQ]=useState(''),[loading,setLoading]=useState(true),[error,setError]=useState('');
 useEffect(()=>{loadDrugLibrary().then(setLibrary).catch(e=>setError(e.message)).finally(()=>setLoading(false))},[]);
 const results=useMemo(()=>q?searchDrugLibrary(library,q):library.slice(0,60),[library,q]);
 return <main className="module-page"><div className="page-title"><div><div className="eyebrow"><BookOpen size={15}/> المكتبة الدوائية</div><h1>مكتبة الأدوية المصرية</h1><p>{library.length.toLocaleString('ar-EG')} صنف متاح للبحث والتعبئة إلى المخزون.</p></div><button className="primary" onClick={()=>navigate('/inventory')}><PackagePlus size={17}/> إضافة إلى المخزون</button></div>{error&&<div className="api-error">{error}</div>}<section className="panel drug-library-panel"><div className="table-toolbar"><div><h2>البحث في المكتبة</h2><p>{loading?'جاري تحميل المكتبة...':`عرض ${results.length} نتيجة`}</p></div><div className="search-box library-search"><Search size={16}/><input value={q} onChange={e=>setQ(e.target.value)} placeholder="اسم تجاري أو علمي أو شركة"/></div></div>{loading?<div className="empty-state">جاري تحميل 25 ألف صنف...</div>:<div className="data-table"><div className="table-row table-head"><span>الاسم التجاري</span><span>الاسم العلمي / المادة</span><span>الشركة</span><span>التصنيف</span><span/></div>{results.map((d,i)=><div className="table-row" key={`${d.trade_name}-${i}`}><span><b>{d.trade_name||'—'}</b><small>{d.commercial_name_en||''}</small></span><span>{d.scientific_name||d.active_ingredient||'—'}</span><span>{d.manufacturer||'—'}</span><span>{d.drug_class||'—'}</span><button className="text-button" onClick={()=>navigate('/inventory')}>استخدام <Barcode size={13}/></button></div>)}</div>}</section></main>
}
