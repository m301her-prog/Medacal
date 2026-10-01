import {useState} from 'react';
import {ClipboardPaste,Search} from 'lucide-react';

export default function DrugImageSearch({onText}){
 const [text,setText]=useState(''),[status,setStatus]=useState('');
 async function paste(){try{const value=await navigator.clipboard.readText();setText(value);if(value.trim()){onText(value.trim());setStatus('تم البحث بالنص المنسوخ.')}}catch{setStatus('اضغط داخل الحقل والصق اسم الدواء يدويًا.')}}
 function submit(e){e.preventDefault();if(text.trim()){onText(text.trim());setStatus('تم البحث باسم الدواء.')}}
 return <form className="drug-text-search" onSubmit={submit}><input value={text} onChange={e=>setText(e.target.value)} placeholder="اكتب أو الصق اسم الدواء" aria-label="اسم الدواء للبحث"/><button type="button" className="outline-button" onClick={paste}><ClipboardPaste size={15}/> لصق</button><button type="submit" className="primary"><Search size={15}/> بحث</button>{status&&<small>{status}</small>}</form>
}
