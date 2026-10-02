import {useMemo,useState} from 'react';
import {loadDrugLibrary,searchDrugLibrary} from '../lib/DrugLibrary';
import {Bot,Search,Send,ShieldCheck,PackageSearch,Sparkles,Stethoscope,WifiOff} from 'lucide-react';
import api from '../lib/ApiService';

const starter=[{role:'assistant',text:'مرحباً! اختر البحث في مخزون الصيدلية أو اسأل المساعد الصيدلي الذكي عن الدواء والاستخدامات والتنبيهات العامة.'}];

export default function CustomerChat(){
  const [mode,setMode]=useState('inventory');
  const [messages,setMessages]=useState(starter);
  const [text,setText]=useState('');
  const [loading,setLoading]=useState(false);
  const [items,setItems]=useState([]);const [libraryItems,setLibraryItems]=useState([]);
  const [offline,setOffline]=useState(false);
  const [error,setError]=useState('');

  const title=mode==='inventory'?'البحث في مخزون الصيدلية':'المساعد الصيدلي الذكي';
  const placeholder=mode==='inventory'?'ابحث باسم الدواء أو المادة الفعالة...':'اكتب سؤالك للمساعد الصيدلي...';
  const latestAssistant=useMemo(()=>messages.filter(m=>m.role==='assistant').at(-1),[messages]);
  function isDrugQuestion(query){return /(دواء|دواء|علاج|مرض|جرعة|جرعات|مضاد|حبوب|شراب|كبسول|مرهم|كريم|قطرة|حقن|صيدل|مادة فعالة|باركود|medicine|drug|medication|pharmacy|dose|dosage|tablet|capsule|syrup|antibiotic|symptom|pain|fever|cold|allergy)/i.test(query)}
  const offTopic='هذا المساعد مخصص للأدوية والصيدلية فقط. اكتب اسم دواء أو اسأل عن استخدامه العام أو جرعته العامة، وللاستشارة الطبية الخاصة راجع الصيدلي أو الطبيب.';

  async function searchInventory(query){
    setError('');setOffline(false);setLoading(true);setText('');
    try{
      const [data,library]=await Promise.all([api.listMedicines(query),loadDrugLibrary().catch(()=>[])]);
      const local=data.items||[];const libraryMatches=searchDrugLibrary(library,query,12).map(x=>({...x,source:'library'}));
      setItems(local);setLibraryItems(libraryMatches.filter(x=>!local.some(y=>String(y.trade_name||y.name).toLowerCase()===String(x.trade_name).toLowerCase())));setOffline(Boolean(data.offline));
    }catch(e){setError(e.message||'تعذر البحث في المخزون.');setItems([])}
    finally{setLoading(false)}
  }

  async function askPharmacist(query){
    if(!isDrugQuestion(query)){setMessages(x=>[...x,{role:'user',text:query},{role:'assistant',text:offTopic}]);setText('');return}
    setError('');setLoading(true);setText('');
    const history=messages.slice(-8).map(({role,text:message})=>({role,content:message}));
    setMessages(x=>[...x,{role:'user',text:query}]);
    try{
      const data=await api.pharmacistChat(query,history);
      const reply=data.reply||data.message||data.answer||data.content||data.data?.reply||'لم تصل إجابة من المساعد الصيدلي.';
      setMessages(x=>[...x,{role:'assistant',text:reply}]);
    }catch(e){setMessages(x=>[...x,{role:'assistant',text:'تعذر الاتصال بالمساعد الصيدلي الآن. تأكد من تشغيل خدمة Raqa أو جرّب مرة أخرى لاحقاً.'}]);setError(e.message||'تعذر الاتصال بخدمة المساعد الصيدلي.');}
    finally{setLoading(false)}
  }

  function submit(e){
    e?.preventDefault();
    const query=text.trim();
    if(!query||loading)return;
    if(mode==='inventory')searchInventory(query);else askPharmacist(query);
  }

  function changeMode(next){
    setMode(next);setError('');setText('');
    if(next==='inventory'){setMessages(starter);setItems([]);setLibraryItems([])}
    else if(!messages.length)setMessages(starter);
  }

  return <main className="chat-page">
    <section className="chat-hero"><img className="assistant-banner" src="/frma.jpeg" alt="واجهة مساعد فرما تيك"/><div><div className="eyebrow"><Sparkles size={15}/> مركز المساعدة الصيدلية</div><h1>ابحث أو اسأل،<br/><em>والقرار يبدأ بمعلومة واضحة.</em></h1><p>ابحث في المخزون أو المكتبة، واسأل عن الأدوية فقط. لا يجيب المساعد عن الموضوعات غير الصيدلية.</p></div><div className="hero-orb"><Stethoscope size={50}/><span>{mode==='inventory'?'بحث المخزون':'مساعد صيدلي'}</span></div></section>
    <section className="chat-card pharmacy-chat-card">
      <div className="assistant-tabs" role="tablist" aria-label="نوع المساعدة"><button className={mode==='inventory'?'selected':''} onClick={()=>changeMode('inventory')} role="tab" aria-selected={mode==='inventory'}><PackageSearch size={17}/> البحث في المخزون</button><button className={mode==='pharmacist'?'selected':''} onClick={()=>changeMode('pharmacist')} role="tab" aria-selected={mode==='pharmacist'}><Stethoscope size={17}/> المساعد الصيدلي الذكي</button></div>
      <div className="chat-head"><div className="bot-avatar">{mode==='inventory'?<PackageSearch size={20}/>:<Bot size={20}/>}</div><div><strong>{title}</strong><small><span className="status-dot"/> {mode==='inventory'?'بيانات الأدوية والمخزون':'متصل عبر Raqa AI'}</small></div><ShieldCheck className="safe" size={20}/></div>
      {mode==='inventory'?<div className="inventory-search-panel"><div className="inventory-search-intro"><Search size={22}/><div><b>ابحث في الأصناف المسجلة</b><small>الاسم التجاري، الاسم العلمي، المادة الفعالة أو الباركود</small></div></div>{offline&&<div className="offline-badge"><WifiOff size={14}/> نتائج محفوظة محلياً — الوضع غير متصل</div>}{loading&&<div className="search-loading">جاري البحث...</div>}{!loading&&!items.length&&<div className="empty-search">اكتب اسم دواء أو مادة فعالة للبدء.</div>}<div className="inventory-results">{items.map(item=><div className="inventory-result" key={item.id||item.trade_name}><div className="result-icon"><PackageSearch size={18}/></div><div><b>{item.trade_name||item.name||'دواء غير مسمى'}</b><small>{item.active_ingredient||item.scientific_name||'منتج صيدلي'}{item.barcode?` · ${item.barcode}`:''}</small></div><strong className={Number(item.stock_quantity??item.stock??0)>0?'available':'unavailable'}>{Number(item.stock_quantity??item.stock??0)>0?`${item.stock_quantity??item.stock} متوفر`:'غير متوفر'}</strong></div>)}</div>{libraryItems.length>0&&<><div className="inventory-search-intro library-result-heading"><PackageSearch size={18}/><div><b>نتائج من مكتبة الأدوية</b><small>هذه الأصناف مرجعية وليست رصيدًا فعليًا بالمخزن</small></div></div><div className="inventory-results">{libraryItems.map(item=><div className="inventory-result library-result" key={`library-${item.trade_name}`}><div className="result-icon"><PackageSearch size={18}/></div><div><b>{item.trade_name||'دواء غير مسمى'}</b><small>{item.active_ingredient||item.scientific_name||'مرجع مكتبة'}</small></div><strong className="unavailable">مرجع مكتبة</strong></div>)}</div></>} </div>:<><div className="messages">{messages.map((m,i)=><div className={`message-row ${m.role}`} key={i}><div className="bubble">{m.text.split('\n').map((line,j)=><div key={j}>{line||<br/>}</div>)}</div></div>)}{loading&&<div className="message-row assistant"><div className="bubble typing">المساعد الصيدلي يكتب <i/> <i/> <i/></div></div>}</div><div className="chat-source"><Stethoscope size={14}/> مدعوم عبر Raqa AI — أرسل سؤالك عن الدواء أو طريقة الاستخدام العامة.</div></>}
      {error&&<div className="chat-error">{error}</div>}
      <form className="composer" onSubmit={submit}><input value={text} onChange={e=>setText(e.target.value)} placeholder={placeholder}/><button aria-label="إرسال" disabled={loading}><Send size={19}/></button></form><div className="chat-note"><ShieldCheck size={14}/> المعلومات عامة ولا تغني عن تشخيص الطبيب أو استشارة الصيدلي، خصوصاً للأطفال والحمل والأمراض المزمنة.</div>
    </section>
  </main>
}
