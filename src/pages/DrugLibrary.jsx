import {useEffect,useMemo,useState} from 'react';
import {Barcode,BookOpen,ChevronLeft,ChevronRight,PackagePlus,Search} from 'lucide-react';
import {loadDrugLibrary,searchDrugLibrary} from '../lib/DrugLibrary';
import {useNavigate} from 'react-router-dom';
import DrugImageSearch from '../components/DrugImageSearch';

const PAGE_SIZE=100;
export default function DrugLibrary(){
 const navigate=useNavigate();const [library,setLibrary]=useState([]),[q,setQ]=useState(''),[page,setPage]=useState(0),[loading,setLoading]=useState(true),[error,setError]=useState('');
 useEffect(()=>{loadDrugLibrary().then(setLibrary).catch(e=>setError(e.message)).finally(()=>setLoading(false))},[]);
 useEffect(()=>setPage(0),[q]);
 const results=useMemo(()=>q?searchDrugLibrary(library,q,Infinity):library,[library,q]);
 const totalPages=Math.max(1,Math.ceil(results.length/PAGE_SIZE));const visible=results.slice(page*PAGE_SIZE,(page+1)*PAGE_SIZE);
 function useDrug(drug){navigate('/inventory',{state:{drug,openForm:true}})}
 return <main className="module-page"><div className="page-title"><div><div className="eyebrow"><BookOpen size={15}/> المكتبة الدوائية</div><h1>مكتبة الأدوية المصرية</h1><p>ابحث عن الدواء بالاسم أو الصق الاسم المنسوخ.</p></div><button className="primary" onClick={()=>navigate('/inventory',{state:{openForm:true}})}><PackagePlus size={17}/> إضافة إلى المخزون</button></div>{error&&<div className="api-error">{error}</div>}<section className="panel drug-library-panel"><div className="table-toolbar"><div><h2>كل سجلات المكتبة</h2><p>{loading?'جاري تحميل المكتبة...':`صفحة ${page+1} من ${totalPages} · ${visible.length} صنف معروض`}</p></div><div className="library-search-actions"><div className="search-box library-search"><Search size={16}/><input value={q} onChange={e=>setQ(e.target.value)} placeholder="اسم تجاري أو علمي أو شركة"/></div><DrugImageSearch onText={text=>setQ(text)}/></div></div>{loading?<div className="empty-state">جاري تحميل جميع سجلات المكتبة...</div>:<><div className="data-table"><div className="table-row table-head"><span>الاسم التجاري</span><span>الاسم العلمي / المادة</span><span>الشركة</span><span>التصنيف / الطريق</span><span/></div>{visible.map((d,i)=><div className="table-row" key={`${d.trade_name}-${page}-${i}`}><span><b>{d.trade_name||'—'}</b><small>{d.commercial_name_en||'—'}</small></span><span>{d.scientific_name||d.active_ingredient||'—'}</span><span>{d.manufacturer||'—'}</span><span>{d.drug_class||'—'}{d.route&&<small>{d.route}</small>}</span><button className="text-button" onClick={()=>useDrug(d)}>استخدام <Barcode size={13}/></button></div>)}</div><div className="library-pagination"><button className="outline-button" disabled={page===0} onClick={()=>setPage(x=>x-1)}><ChevronRight size={15}/> السابق</button><span>صفحة {page+1} / {totalPages}</span><button className="outline-button" disabled={page>=totalPages-1} onClick={()=>setPage(x=>x+1)}>التالي <ChevronLeft size={15}/></button></div></>}</section></main>
}
