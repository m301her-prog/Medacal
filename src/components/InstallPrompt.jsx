import {Download, X} from 'lucide-react';
import {useEffect, useState} from 'react';

export default function InstallPrompt(){
  const [event, setEvent] = useState(null);
  const [hidden, setHidden] = useState(false);
  useEffect(()=>{
    const handler = e=>{ e.preventDefault(); window.__deferredInstallPrompt=e; setEvent(e); window.dispatchEvent(new Event('pwa-install-available')); };
    window.addEventListener('beforeinstallprompt', handler);
    return ()=>window.removeEventListener('beforeinstallprompt', handler);
  },[]);
  if(!event || hidden) return null;
  const install = async()=>{ await event.prompt(); await event.userChoice; window.__deferredInstallPrompt=null; setEvent(null); };
  return <div className="install-banner"><div><b>ثبّت فرما تيك</b><small>افتحه كتطبيق مستقل على جهازك</small></div><button onClick={install}><Download size={16}/> تثبيت الآن</button><button className="install-dismiss" onClick={()=>setHidden(true)} aria-label="إغلاق"><X size={16}/></button></div>;
}
