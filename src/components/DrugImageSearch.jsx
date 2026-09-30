import {useRef,useState} from 'react';
import {Camera,LoaderCircle,ScanText} from 'lucide-react';
import {createWorker} from 'tesseract.js';

export default function DrugImageSearch({onText}){
 const inputRef=useRef(null);const [busy,setBusy]=useState(false);const [status,setStatus]=useState('');
 async function readImage(file){if(!file)return;setBusy(true);setStatus('جاري قراءة اسم الدواء من الصورة...');let worker;
  try{worker=await createWorker('ara+eng',1,{logger:message=>{if(message.status==='recognizing text')setStatus(`جاري قراءة الصورة ${Math.round((message.progress||0)*100)}%...`)}});const result=await worker.recognize(file);const text=(result.data.text||'').replace(/\s+/g,' ').trim();if(!text){setStatus('لم يتم العثور على نص واضح. جرّب صورة أقرب وأوضح.');return}onText(text);setStatus(`تم البحث بالنص: ${text.slice(0,80)}${text.length>80?'…':''}`)}catch(error){setStatus('تعذر قراءة الصورة. استخدم البحث الكتابي أو التقط صورة أوضح.')}finally{if(worker)await worker.terminate();setBusy(false);if(inputRef.current)inputRef.current.value=''}}
 return <div className="drug-image-search"><input ref={inputRef} hidden type="file" accept="image/*" capture="environment" onChange={e=>readImage(e.target.files?.[0])}/><button type="button" className="outline-button" onClick={()=>inputRef.current?.click()} disabled={busy}>{busy?<LoaderCircle className="spin" size={16}/>:<Camera size={16}/>} {busy?'جاري التحليل...':'بحث بصورة الدواء'}</button>{status&&<small><ScanText size={13}/> {status}</small>}</div>
}
