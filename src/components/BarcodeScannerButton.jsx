import {useState} from 'react';
import {Barcode,Camera,X} from 'lucide-react';
import {Capacitor} from '@capacitor/core';
import {BarcodeFormat,BarcodeScanner} from '@capacitor-mlkit/barcode-scanning';

export default function BarcodeScannerButton({onCode,onError}){
  const [open,setOpen]=useState(false);const [manual,setManual]=useState('');const [busy,setBusy]=useState(false);
  async function scan(){
    try{
      if(!Capacitor.isNativePlatform()){setOpen(true);return}
      setBusy(true);
      const support=await BarcodeScanner.isSupported();
      if(!support.supported){onError?.('هذا الجهاز لا يدعم ماسح الكاميرا. استخدم إدخال الباركود يدويًا.');setOpen(true);return}
      const permission=await BarcodeScanner.requestPermissions();
      if(permission.camera!=='granted'){onError?.('تم رفض إذن الكاميرا. افتح معلومات التطبيق ثم اسمح باستخدام الكاميرا.');return}
      const result=await BarcodeScanner.scan({formats:[BarcodeFormat.Ean13,BarcodeFormat.Ean8,BarcodeFormat.Code128,BarcodeFormat.UpcA,BarcodeFormat.UpcE],autoZoom:true});
      const code=result.barcodes?.[0]?.rawValue;
      if(code){onCode(code);setOpen(false)}else onError?.('لم يتم التقاط باركود. حاول توجيه الكاميرا بشكل أوضح.');
    }catch(error){setOpen(true);onError?.('تعذر تشغيل الكاميرا. أدخل الباركود يدويًا أو تحقق من إذن الكاميرا.')}finally{setBusy(false)}
  }
  function submit(e){e.preventDefault();if(manual.trim()){onCode(manual.trim());setManual('');setOpen(false)}}
  return <><button className="barcode-camera-button" type="button" onClick={scan} disabled={busy}>{busy?<span className="camera-loading"/>:<Camera size={16}/>} {busy?'جاري فتح الكاميرا...':'مسح بالكاميرا'}</button>{open&&<div className="scanner-modal"><div className="scanner-card"><button className="scanner-close" onClick={()=>setOpen(false)}><X size={18}/></button><div className="scanner-icon"><Barcode size={32}/></div><h2>مسح باركود الدواء</h2><p>إذا ظهرت رسالة إذن الكاميرا، اختر <b>السماح أثناء استخدام التطبيق</b>.</p><form onSubmit={submit} className="scanner-manual"><input autoFocus value={manual} onChange={e=>setManual(e.target.value)} placeholder="مثال: 628100000001"/><button className="primary" type="submit">بحث</button></form><small>يمكن السماح بالكاميرا من Android: الإعدادات ← التطبيقات ← فرما تيك ← الأذونات ← الكاميرا.</small></div></div>}</>
}
